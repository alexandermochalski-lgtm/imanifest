"""One-off: inspect Entrepedia search result DOM for title extraction."""
from __future__ import annotations

import json
import os
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parents[1] / "data" / "entrepedia-wave4"
EMAIL = os.environ.get("ENTREPEDIA_EMAIL", "steve@imanifest.money")
PASSWORD = os.environ.get("ENTREPEDIA_PASSWORD", "Supreme99!")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("https://www.entrepedia.co/sign-in", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(1500)
        page.fill('input[type="email"], input[name="email"]', EMAIL)
        page.fill('input[type="password"]', PASSWORD)
        page.locator('button[type="submit"]').first.click()
        page.wait_for_timeout(4000)
        print("url", page.url)

        responses: list[dict] = []

        def on_response(resp):
            try:
                ct = (resp.headers.get("content-type") or "").lower()
                u = resp.url
                if "json" in ct or "rsc" in ct or "text/x-component" in ct or "/api/" in u:
                    if resp.status == 200 and ("product" in u.lower() or "library" in u.lower() or "search" in u.lower()):
                        responses.append({"url": u, "ct": ct, "status": resp.status})
            except Exception:
                pass

        page.on("response", on_response)
        page.goto("https://www.entrepedia.co/library?search=investing", wait_until="networkidle", timeout=90000)
        page.wait_for_timeout(3000)
        for _ in range(3):
            page.mouse.wheel(0, 2000)
            page.wait_for_timeout(500)

        info = page.evaluate(
            """() => {
          const sample = [];
          const as = [...document.querySelectorAll('a[href*="/library/product/"]')].slice(0, 10);
          for (const a of as) {
            let el = a;
            let best = '';
            for (let i = 0; i < 6 && el; i++) {
              const t = (el.innerText || '').trim();
              if (t && t.length > best.length && t.length < 400) best = t;
              el = el.parentElement;
            }
            const lines = best.split('\\n').map(s => s.trim()).filter(Boolean);
            sample.push({
              href: a.href,
              aText: (a.innerText || '').slice(0, 80),
              lines: lines.slice(0, 8),
            });
          }
          return { n: document.querySelectorAll('a[href*="/library/product/"]').length, sample };
        }"""
        )
        print(json.dumps(info, indent=2)[:6000])
        print("api_hits", json.dumps(responses[:20], indent=2))

        html = page.content()
        (OUT / "debug-search.html").write_text(html, encoding="utf-8")
        titles = re.findall(r'"title"\s*:\s*"([^"]{5,160})"', html)
        print("titles_json", len(titles))
        for t in titles[:30]:
            print(" ", t)
        # Look for flight/rsc payloads
        product_ids = re.findall(r"/library/product/([0-9a-f-]{36})", html)
        print("ids_in_html", len(set(product_ids)))
        browser.close()


if __name__ == "__main__":
    main()
