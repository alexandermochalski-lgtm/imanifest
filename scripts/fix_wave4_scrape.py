"""Quick pass: fill credit-score-desk + prune Wave 4 noise titles."""
from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path
from urllib.parse import quote, unquote

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "entrepedia-wave4"
SCRAPE = OUT / "scrape-desks.json"
EMAIL = os.environ.get("ENTREPEDIA_EMAIL", "steve@imanifest.money")
PASSWORD = os.environ.get("ENTREPEDIA_PASSWORD", "Supreme99!")

DROP_TITLE = re.compile(
    r"ai-generated lesson|sop training|struggles into strengths|lesson plans",
    re.I,
)


def guess_format(title: str, zip_url: str) -> str:
    blob = f"{title} {unquote(zip_url)}".lower()
    for needle, fmt in [
        ("mini-course", "Mini-Course"),
        ("prompt", "Prompt Pack"),
        ("toolstack", "Toolstack"),
        ("checklist", "Checklist"),
        ("workbook", "Workbook"),
        ("listicle", "Listicle"),
        ("ebook", "Book"),
        (" book", "Book"),
        ("guide", "Guide"),
    ]:
        if needle in blob:
            return fmt
    return "Guide"


def extract_product(page, product_id: str, fallback_title: str) -> dict | None:
    href = f"https://www.entrepedia.co/library/product/{product_id}"
    page.goto(href, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(1500)
    data = page.evaluate(
        """() => {
      const html = document.documentElement.outerHTML;
      const h = document.querySelector('h1');
      let title = (h && h.innerText || '').trim();
      const zips = [...html.matchAll(/https?:\\/\\/[^"'\\s<>]+entrepedia-products[^"'\\s<>]*\\.zip[^"'\\s<>]*/gi)]
        .map(m => m[0].replace(/&amp;/g, '&'));
      const any = [...html.matchAll(/https?:\\/\\/[^"'\\s<>]+\\.zip[^"'\\s<>]*/gi)]
        .map(m => m[0].replace(/&amp;/g, '&'));
      return { title, zip: zips[0] || any[0] || null };
    }"""
    )
    title = (data.get("title") or fallback_title or "").strip()
    zip_url = data.get("zip")
    if not zip_url or not title:
        return None
    return {
        "id": product_id,
        "href": href,
        "title": title,
        "zip": zip_url,
        "formatGuess": guess_format(title, zip_url),
    }


def main() -> None:
    desks = json.loads(SCRAPE.read_text(encoding="utf-8"))
    used = {p["id"] for d in desks for p in d.get("products") or []}

    # Prune noise
    for d in desks:
        before = len(d.get("products") or [])
        d["products"] = [p for p in d.get("products") or [] if not DROP_TITLE.search(p.get("title") or "")]
        if len(d["products"]) != before:
            print(f"pruned {d['slug']} {before}->{len(d['products'])}")

    # Credit desk fill
    credit = next((d for d in desks if d["slug"] == "credit-score-desk"), None)
    if credit is not None and len(credit.get("products") or []) < 4:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto("https://www.entrepedia.co/sign-in", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.fill('input[type="email"]', EMAIL)
            page.fill('input[type="password"]', PASSWORD)
            page.locator('button[type="submit"]').first.click()
            page.wait_for_timeout(4000)
            page.goto("https://www.entrepedia.co/library/search?q=" + quote("credit score"), wait_until="domcontentloaded")
            page.wait_for_timeout(2500)
            for _ in range(5):
                page.mouse.wheel(0, 2800)
                page.wait_for_timeout(400)
            items = page.evaluate(
                """() => {
              const out=[]; const seen=new Set();
              for (const a of document.querySelectorAll('a[href*="/library/product/"]')) {
                const m=a.href.match(/product\\/([0-9a-f-]{36})/i); if(!m||seen.has(m[1])) continue; seen.add(m[1]);
                let title=''; let el=a;
                for (let i=0;i<8 && el;i++) {
                  const hs=[...el.querySelectorAll('h1,h2,h3,h4')].map(h=>h.innerText.trim()).filter(t=>t && t.toLowerCase()!=='open');
                  if (hs.length){ title=hs[0]; break; } el=el.parentElement;
                }
                out.push({id:m[1], title});
              }
              return out;
            }"""
            )
            # Prefer titles with credit/score/FICO; also debt/finance adjacent if needed
            ranked = []
            for it in items:
                t = (it.get("title") or "").lower()
                if it["id"] in used:
                    continue
                score = 0
                if "credit" in t:
                    score += 5
                if "score" in t or "fico" in t:
                    score += 3
                if "debt" in t:
                    score += 1
                if score:
                    ranked.append((score, it))
            ranked.sort(key=lambda x: -x[0])
            print("credit candidates", [(s, i["title"]) for s, i in ranked[:12]])
            products = []
            for _, it in ranked[:10]:
                if len(products) >= 6:
                    break
                prod = extract_product(page, it["id"], it["title"])
                if not prod:
                    print("skip", it["title"])
                    continue
                print("ok", prod["title"])
                products.append(prod)
                used.add(prod["id"])
                time.sleep(0.25)
            credit["products"] = products
            browser.close()

    SCRAPE.write_text(json.dumps(desks, indent=2), encoding="utf-8")
    total = sum(len(d.get("products") or []) for d in desks)
    print(json.dumps({d["slug"]: len(d.get("products") or []) for d in desks}, indent=2))
    print("TOTAL", total)


if __name__ == "__main__":
    main()
