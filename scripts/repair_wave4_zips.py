"""Probe and repair Wave 4 zip URLs (strip junk; re-fetch from product pages if dead)."""
from __future__ import annotations

import json
import os
import re
import subprocess
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SCRAPE = ROOT / "data" / "entrepedia-wave4" / "scrape-desks.json"
EMAIL = os.environ.get("ENTREPEDIA_EMAIL", "steve@imanifest.money")
PASSWORD = os.environ.get("ENTREPEDIA_PASSWORD", "Supreme99!")


def clean(z: str) -> str:
    if not z:
        return z
    z = z.replace("\\", "/").rstrip("/\\")
    z = z.replace("&amp;", "&")
    return z


def http_ok(url: str) -> bool:
    r = subprocess.run(
        ["curl.exe", "-sS", "-o", "NUL", "-w", "%{http_code}", "-L", "--max-time", "20", "-r", "0-0", url],
        capture_output=True,
        text=True,
    )
    return r.stdout.strip() in {"200", "206"}


def extract_zips(page) -> list[str]:
    raw = page.evaluate(
        """() => {
      const html = document.documentElement.outerHTML;
      return [...html.matchAll(/https?:\\/\\/[^"'\\s<>]+\\.zip[^"'\\s<>]*/gi)]
        .map(m => m[0].replace(/&amp;/g, '&').replace(/\\\\+$/,''));
    }"""
    )
    out = []
    for z in raw:
        z = clean(z)
        if z and z not in out:
            out.append(z)
    return out


def main() -> None:
    desks = json.loads(SCRAPE.read_text(encoding="utf-8"))
    for d in desks:
        for p in d.get("products") or []:
            p["zip"] = clean(p.get("zip") or "")

    bad = []
    for d in desks:
        for p in d.get("products") or []:
            if not p.get("zip") or not http_ok(p["zip"]):
                bad.append(p)
                print("BAD", p.get("title"), (p.get("zip") or "")[:110])

    print("bad_count", len(bad))
    if bad:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto("https://www.entrepedia.co/sign-in", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.fill('input[type="email"]', EMAIL)
            page.fill('input[type="password"]', PASSWORD)
            page.locator('button[type="submit"]').first.click()
            page.wait_for_timeout(4000)
            for p in bad:
                page.goto(p["href"], wait_until="domcontentloaded", timeout=60000)
                page.wait_for_timeout(1800)
                for pat in ["Download", "Get files", "Get Files"]:
                    btn = page.get_by_role("button", name=re.compile(pat, re.I))
                    if btn.count():
                        try:
                            btn.first.click()
                            page.wait_for_timeout(2000)
                        except Exception:
                            pass
                        break
                zips = extract_zips(page)
                pref = next((z for z in zips if "entrepedia-products.com" in z), None) or (zips[0] if zips else None)
                print("RE", p["title"], "->", (pref or "")[:120])
                if pref and http_ok(pref):
                    p["zip"] = pref
                elif pref:
                    p["zip"] = pref
                time.sleep(0.25)
            browser.close()

    SCRAPE.write_text(json.dumps(desks, indent=2), encoding="utf-8")
    still = 0
    for d in desks:
        for p in d.get("products") or []:
            if not http_ok(p.get("zip") or ""):
                still += 1
                print("STILL_BAD", p["title"], p.get("zip"))
    print("still_bad", still)


if __name__ == "__main__":
    main()
