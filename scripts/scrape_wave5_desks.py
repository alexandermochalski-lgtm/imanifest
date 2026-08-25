"""Scrape Entrepedia Wave 5 desks (trading / time / negotiation / wealth / ecom / EQ).

Usage:
  python scripts/scrape_wave5_desks.py
"""

from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path
from urllib.parse import quote, unquote

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "entrepedia-wave5"
EMAIL = os.environ.get("ENTREPEDIA_EMAIL", "steve@imanifest.money")
PASSWORD = os.environ.get("ENTREPEDIA_PASSWORD", "Supreme99!")

DESKS = [
    {
        "slug": "trading-desk",
        "title": "Trading Desk",
        "summary": "Process, risk, and execution for operators who trade for surplus — not entertainment.",
        "category": "investing",
        "batch": 1,
        "q": "trading",
        "queries": ["trading", "forex", "day trading", "options trading", "gold trading", "commodities"],
        "title_any": ["trad", "forex", "fx", "option", "gold", "xau", "commodit", "futures", "chart", "technical analys"],
        "title_none": ["tiktok", "instagram", "meta ads", "funnel", "email marketing"],
        "max": 8,
    },
    {
        "slug": "time-ops-desk",
        "title": "Time Ops Desk",
        "summary": "Buy back hours and run a calendar like a P&L — execution without the busy-theater.",
        "category": "personal-development",
        "batch": 1,
        "q": "time management",
        "queries": ["time management", "eisenhower", "buy back your time", "prioritize", "productivity system"],
        "title_any": ["time", "eisenhower", "priorit", "calendar", "focus block", "deep work", "execution"],
        "title_none": ["ads", "funnel", "tiktok", "instagram", "sleep", "meditation"],
        "max": 8,
    },
    {
        "slug": "negotiation-desk",
        "title": "Negotiation Desk",
        "summary": "Deal structure, leverage, and close mechanics for operators who price outcomes.",
        "category": "wealth-creation",
        "batch": 1,
        "q": "negotiation",
        "queries": ["negotiation", "negotiate", "deal making", "objection handling"],
        "title_any": ["negotiat", "deal", "leverage", "objection", "close the", "win-win"],
        "title_none": ["tiktok", "instagram", "meta ads", "real estate", "property"],
        "max": 7,
    },
    {
        "slug": "wealth-stacking-desk",
        "title": "Wealth Stacking Desk",
        "summary": "Surplus allocation and compounding systems that turn cashflow into assets.",
        "category": "wealth-creation",
        "batch": 2,
        "q": "wealth",
        "queries": ["stacking wealth", "wealth building", "passive income", "compounding", "financial independence"],
        "title_any": ["wealth", "passive", "compound", "asset", "net worth", "financial independence", "stack"],
        "title_none": ["ads", "funnel", "tiktok", "crypto", "bitcoin", "real estate", "blockchain"],
        "max": 8,
    },
    {
        "slug": "ecommerce-numbers-desk",
        "title": "E-Commerce Numbers Desk",
        "summary": "Unit economics, pricing, and store P&L — numbers that keep a shop solvent.",
        "category": "e-commerce",
        "batch": 2,
        "q": "ecommerce profit",
        "queries": ["ecommerce profit", "store pricing", "unit economics", "product research profit", "cfo ecommerce"],
        "title_any": ["e-commerce", "ecommerce", "store", "sku", "unit econom", "profit", "pricing", "cfo", "merch"],
        "title_none": ["tiktok shop", "meta ads", "funnel", "instagram"],
        "max": 8,
    },
    {
        "slug": "offer-pricing-desk",
        "title": "Offer Pricing Desk",
        "summary": "Price, package, and ship micro-offers without guessing.",
        "category": "wealth-creation",
        "batch": 2,
        "q": "pricing",
        "queries": ["pricing strategies", "micro products", "packaging offer", "value based pricing"],
        "title_any": ["pric", "package", "micro product", "offer design", "value-based"],
        "title_none": ["ads", "funnel", "tiktok", "instagram", "real estate"],
        "max": 7,
    },
    {
        "slug": "eq-ops-desk",
        "title": "EQ Ops Desk",
        "summary": "Emotional control and presence as an operating skill, not a mood.",
        "category": "personal-development",
        "batch": 3,
        "q": "emotional intelligence",
        "queries": ["emotional intelligence", "confidence", "self coaching", "eq"],
        "title_any": ["emotional", "eq", "confidence", "self-coach", "self coach", "presence"],
        "title_none": ["ads", "funnel", "tiktok", "meditation", "mindful", "sleep"],
        "max": 8,
    },
    {
        "slug": "stress-system-desk",
        "title": "Stress System Desk",
        "summary": "Down-regulate cortisol and anxiety so decision quality survives the session.",
        "category": "health-wellness",
        "batch": 3,
        "q": "stress relief",
        "queries": ["stress relief", "cortisol", "anxiety", "burnout"],
        "title_any": ["stress", "cortisol", "anxiety", "burnout", "nervous"],
        "title_none": ["sleep", "mindful", "meditat", "ads", "funnel"],
        "max": 7,
    },
    {
        "slug": "career-ops-desk",
        "title": "Career Ops Desk",
        "summary": "Interviews, skill sprints, and professional positioning for operators changing lanes.",
        "category": "personal-development",
        "batch": 3,
        "q": "interview",
        "queries": ["interview success", "career", "professional skill", "personal branding"],
        "title_any": ["interview", "career", "professional skill", "resume", "personal brand"],
        "title_none": ["ads", "funnel", "tiktok", "instagram"],
        "max": 7,
    },
]


def clean_zip(z: str | None) -> str | None:
    if not z:
        return None
    z = z.replace("\\", "/").rstrip("/\\").replace("&amp;", "&")
    return z or None


def guess_format(title: str, zip_url: str) -> str:
    blob = f"{title} {unquote(zip_url)}".lower()
    rules = [
        ("mini-course", "Mini-Course"),
        ("mini course", "Mini-Course"),
        ("prompt", "Prompt Pack"),
        ("toolstack", "Toolstack"),
        ("checklist", "Checklist"),
        ("workbook", "Workbook"),
        ("listicle", "Listicle"),
        ("template", "Template"),
        ("audio", "Audio"),
        ("podcast", "Audio"),
        ("ebook", "Book"),
        (" book", "Book"),
        ("-book", "Book"),
        ("guide", "Guide"),
    ]
    for needle, fmt in rules:
        if needle in blob:
            return fmt
    return "Guide"


def login(page) -> None:
    page.goto("https://www.entrepedia.co/sign-in", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(2000)
    email_sel = 'input[type="email"], input[name="email"]'
    page.wait_for_selector(email_sel, timeout=30000)
    page.fill(email_sel, EMAIL)
    page.fill('input[type="password"]', PASSWORD)
    page.locator('button[type="submit"]').first.click()
    try:
        page.wait_for_url(re.compile(r"entrepedia\.co/(?!sign-in)"), timeout=45000)
    except Exception:
        page.wait_for_timeout(5000)
    page.goto("https://www.entrepedia.co/library", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(2000)
    print("login_url", page.url, flush=True)


def search_products(page, query: str) -> list[dict]:
    url = f"https://www.entrepedia.co/library/search?q={quote(query)}"
    page.goto(url, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(2800)
    for _ in range(6):
        page.mouse.wheel(0, 2800)
        page.wait_for_timeout(450)
    return page.evaluate(
        """() => {
      const out = [];
      const seen = new Set();
      for (const a of document.querySelectorAll('a[href*="/library/product/"]')) {
        const m = a.href.match(/\\/library\\/product\\/([0-9a-f-]{36})/i);
        if (!m || seen.has(m[1])) continue;
        seen.add(m[1]);
        let title = '';
        let el = a;
        for (let i = 0; i < 8 && el; i++) {
          const hs = [...el.querySelectorAll('h1,h2,h3,h4')]
            .map(h => (h.innerText || '').trim())
            .filter(t => t && t.toLowerCase() !== 'open' && t.length > 2);
          if (hs.length) { title = hs[0]; break; }
          el = el.parentElement;
        }
        if (!title) {
          const lines = (a.closest('div')?.innerText || '').split('\\n').map(s => s.trim()).filter(s => s && s !== 'Open');
          title = lines[0] || '';
        }
        if (title) out.push({ id: m[1], href: a.href.split('?')[0], title });
      }
      return out;
    }"""
    )


def extract_product(page, product_id: str) -> dict | None:
    href = f"https://www.entrepedia.co/library/product/{product_id}"
    page.goto(href, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(1600)
    data = page.evaluate(
        """() => {
      const html = document.documentElement.outerHTML;
      const h = document.querySelector('h1');
      let title = (h && h.innerText || '').trim();
      if (!title || title.length < 3) title = (document.title || '').split('|')[0].trim();
      const zips = [...html.matchAll(/https?:\\/\\/[^"'\\s<>]+entrepedia-products[^"'\\s<>]*\\.zip[^"'\\s<>]*/gi)]
        .map(m => m[0].replace(/&amp;/g, '&'));
      const any = [...html.matchAll(/https?:\\/\\/[^"'\\s<>]+\\.zip[^"'\\s<>]*/gi)]
        .map(m => m[0].replace(/&amp;/g, '&'));
      const pref = zips.find(z => z.includes('entrepedia-products.com')) || zips[0] || any[0] || null;
      return { title, zip: pref };
    }"""
    )
    title = (data.get("title") or "").strip()
    zip_url = clean_zip(data.get("zip"))
    if not zip_url:
        found = {"url": None}

        def on_response(resp):
            u = resp.url
            if ".zip" in u.lower():
                found["url"] = u

        page.on("response", on_response)
        for pattern in [r"Download", r"Get files", r"Get Files"]:
            btn = page.get_by_role("button", name=re.compile(pattern, re.I))
            if btn.count():
                try:
                    btn.first.click()
                    page.wait_for_timeout(2500)
                except Exception:
                    pass
                break
        page.remove_listener("response", on_response)
        zip_url = clean_zip(found["url"])
    if not title or title.lower() in {"open", "library", "entrepedia"}:
        return None
    if not zip_url:
        return None
    return {
        "id": product_id,
        "href": href,
        "title": title,
        "zip": zip_url,
        "formatGuess": guess_format(title, zip_url),
    }


def title_matches(title: str, any_words: list[str], none_words: list[str]) -> bool:
    t = title.lower()
    if none_words and any(n.lower() in t for n in none_words):
        return False
    if not any_words:
        return True
    return any(w.lower() in t for w in any_words)


def load_already() -> set[str]:
    already: set[str] = set()
    for w in (1, 2, 3, 4):
        invp = ROOT / "data" / f"entrepedia-wave{w}" / "inventory.json"
        if not invp.exists():
            continue
        inv = json.loads(invp.read_text(encoding="utf-8"))
        for item in inv.get("items", []):
            pid = item.get("product_id") or ""
            if pid:
                already.add(pid)
    return already


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    already = load_already()
    print(f"already_imported={len(already)}", flush=True)

    queries: list[str] = []
    for d in DESKS:
        for q in d["queries"]:
            if q not in queries:
                queries.append(q)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        login(page)

        raw_by_query: dict[str, list[dict]] = {}
        for q in queries:
            print("search", q, flush=True)
            try:
                items = search_products(page, q)
            except Exception as e:
                print("search_fail", q, e, flush=True)
                items = []
            print(f"  hits {len(items)}", flush=True)
            raw_by_query[q] = items
            time.sleep(0.3)

        (OUT / "raw-search.json").write_text(json.dumps(raw_by_query, indent=2), encoding="utf-8")

        product_cache: dict[str, dict] = {}
        scrape: list[dict] = []
        used: set[str] = set(already)

        for desk in DESKS:
            cand: list[dict] = []
            seen = set()
            for q in desk["queries"]:
                for p in raw_by_query.get(q, []):
                    if p["id"] in seen or p["id"] in used:
                        continue
                    if not title_matches(p["title"], desk["title_any"], desk["title_none"]):
                        continue
                    seen.add(p["id"])
                    cand.append(p)
            to_try = cand[: max(desk["max"] * 2, desk["max"] + 4)]
            print(f"desk {desk['slug']} candidates={len(cand)} try={len(to_try)}", flush=True)
            matched: list[dict] = []
            for p in to_try:
                if len(matched) >= desk["max"]:
                    break
                pid = p["id"]
                if pid in product_cache:
                    prod = product_cache[pid]
                else:
                    try:
                        prod = extract_product(page, pid)
                    except Exception as e:
                        print(f"  fail {pid[:8]} {e}", flush=True)
                        prod = None
                    if prod:
                        if not prod.get("title") or len(prod["title"]) < 3:
                            prod["title"] = p["title"]
                        product_cache[pid] = prod
                        print(f"  ok {prod['title'][:70]}", flush=True)
                    else:
                        print(f"  skip {pid[:8]} ({p['title'][:50]})", flush=True)
                    time.sleep(0.25)
                if not prod or prod["id"] in used:
                    continue
                if not title_matches(prod["title"], desk["title_any"], desk["title_none"]):
                    continue
                matched.append(prod)
                used.add(prod["id"])
            scrape.append(
                {
                    "batch": desk["batch"],
                    "category": desk["category"],
                    "match": {},
                    "products": matched,
                    "q": desk["q"],
                    "slug": desk["slug"],
                    "summary": desk["summary"],
                    "title": desk["title"],
                }
            )
            print(f"  kept {len(matched)}", flush=True)

        browser.close()

    out_path = OUT / "scrape-desks.json"
    out_path.write_text(json.dumps(scrape, indent=2), encoding="utf-8")
    (OUT / "product-cache.json").write_text(json.dumps(product_cache, indent=2), encoding="utf-8")
    total = sum(len(d["products"]) for d in scrape)
    print(json.dumps({"desks": len(scrape), "products_with_zip": total, "out": str(out_path)}, indent=2), flush=True)


if __name__ == "__main__":
    main()
