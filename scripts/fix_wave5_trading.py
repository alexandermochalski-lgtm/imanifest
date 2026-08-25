"""Fill empty trading desk + prune Wave 5 scrape noise."""
from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path
from urllib.parse import quote, unquote

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SCRAPE = ROOT / "data" / "entrepedia-wave5" / "scrape-desks.json"
EMAIL = os.environ.get("ENTREPEDIA_EMAIL", "steve@imanifest.money")
PASSWORD = os.environ.get("ENTREPEDIA_PASSWORD", "Supreme99!")

WANT = re.compile(
    r"trad|forex|fx |option|gold|commodit|futures|chart|candlestick|technical analys|risk manag|position siz|scalp|swing",
    re.I,
)
DENY = re.compile(
    r"tiktok|instagram|meta ads|funnel|email market|real estate|crypto|bitcoin|blockchain",
    re.I,
)


def clean(z: str | None) -> str | None:
    if not z:
        return None
    return z.replace("\\", "/").rstrip("/\\").replace("&amp;", "&") or None


def guess(title: str, z: str) -> str:
    b = f"{title} {unquote(z)}".lower()
    for n, f in [
        ("mini-course", "Mini-Course"),
        ("prompt", "Prompt Pack"),
        ("checklist", "Checklist"),
        ("workbook", "Workbook"),
        ("listicle", "Listicle"),
        ("podcast", "Audio"),
        ("ebook", "Book"),
        ("guide", "Guide"),
    ]:
        if n in b:
            return f
    return "Guide"


def extract(page, pid: str, title0: str) -> dict | None:
    page.goto(f"https://www.entrepedia.co/library/product/{pid}", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(1400)
    data = page.evaluate(
        """() => {
      const html = document.documentElement.outerHTML;
      const h = document.querySelector('h1');
      const title = (h && h.innerText || '').trim();
      const zips = [...html.matchAll(/https?:\\/\\/[^"'\\s<>]+entrepedia-products[^"'\\s<>]*\\.zip[^"'\\s<>]*/gi)]
        .map(m => m[0].replace(/&amp;/g, '&'));
      const any = [...html.matchAll(/https?:\\/\\/[^"'\\s<>]+\\.zip[^"'\\s<>]*/gi)]
        .map(m => m[0].replace(/&amp;/g, '&'));
      return { title, zip: zips[0] || any[0] || null };
    }"""
    )
    title = (data.get("title") or title0 or "").strip()
    z = clean(data.get("zip"))
    if not title or not z:
        return None
    return {
        "id": pid,
        "href": f"https://www.entrepedia.co/library/product/{pid}",
        "title": title,
        "zip": z,
        "formatGuess": guess(title, z),
    }


def search(page, q: str) -> list[dict]:
    page.goto("https://www.entrepedia.co/library/search?q=" + quote(q), wait_until="domcontentloaded")
    page.wait_for_timeout(2200)
    for _ in range(5):
        page.mouse.wheel(0, 2800)
        page.wait_for_timeout(350)
    return page.evaluate(
        """() => {
      const out = [];
      const seen = new Set();
      for (const a of document.querySelectorAll('a[href*="/library/product/"]')) {
        const m = a.href.match(/product\\/([0-9a-f-]{36})/i);
        if (!m || seen.has(m[1])) continue;
        seen.add(m[1]);
        let title = '';
        let el = a;
        for (let i = 0; i < 8 && el; i++) {
          const hs = [...el.querySelectorAll('h1,h2,h3,h4')].map(h => h.innerText.trim()).filter(t => t && t.toLowerCase() !== 'open');
          if (hs.length) { title = hs[0]; break; }
          el = el.parentElement;
        }
        out.push({ id: m[1], title });
      }
      return out;
    }"""
    )


def main() -> None:
    desks = json.loads(SCRAPE.read_text(encoding="utf-8"))
    used = {p["id"] for d in desks for p in d.get("products") or []}
    for w in (1, 2, 3, 4):
        invp = ROOT / "data" / f"entrepedia-wave{w}" / "inventory.json"
        if not invp.exists():
            continue
        for i in json.loads(invp.read_text(encoding="utf-8")).get("items", []):
            if i.get("product_id"):
                used.add(i["product_id"])

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("https://www.entrepedia.co/sign-in", wait_until="domcontentloaded")
        page.wait_for_timeout(1500)
        page.fill('input[type="email"]', EMAIL)
        page.fill('input[type="password"]', PASSWORD)
        page.locator('button[type="submit"]').first.click()
        page.wait_for_timeout(4000)

        cands: list[dict] = []
        for q in [
            "trading",
            "forex",
            "day trading",
            "options",
            "technical analysis",
            "risk management trading",
            "swing trading",
        ]:
            for it in search(page, q):
                if it["id"] in used:
                    continue
                t = it.get("title") or ""
                if DENY.search(t):
                    continue
                if WANT.search(t) and it["id"] not in {c["id"] for c in cands}:
                    cands.append(it)
        print("trading cands", len(cands), flush=True)
        for c in cands[:20]:
            print(" ", c["title"], flush=True)

        trading = next(d for d in desks if d["slug"] == "trading-desk")
        for it in cands:
            if len(trading["products"]) >= 8:
                break
            prod = extract(page, it["id"], it["title"])
            if not prod or DENY.search(prod["title"]):
                continue
            print("keep", prod["title"], flush=True)
            trading["products"].append(prod)
            used.add(prod["id"])
            time.sleep(0.2)

        career = next(d for d in desks if d["slug"] == "career-ops-desk")
        career["products"] = [p for p in career["products"] if "customer research" not in p["title"].lower()]

        offer = next(d for d in desks if d["slug"] == "offer-pricing-desk")
        seen_t: set[str] = set()
        keep = []
        for p in offer["products"]:
            k = p["title"].lower()
            if k in seen_t:
                continue
            seen_t.add(k)
            keep.append(p)
        offer["products"] = keep

        browser.close()

    SCRAPE.write_text(json.dumps(desks, indent=2), encoding="utf-8")
    print({d["slug"]: len(d["products"]) for d in desks}, flush=True)
    print("TOTAL", sum(len(d["products"]) for d in desks), flush=True)


if __name__ == "__main__":
    main()
