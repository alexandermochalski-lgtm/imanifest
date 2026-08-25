"""Scrape Entrepedia Wave 10 desks — clear 100+ courses.

Usage:
  python scripts/scrape_wave10_desks.py
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
OUT = ROOT / "data" / "entrepedia-wave10"
EMAIL = os.environ.get("ENTREPEDIA_EMAIL", "steve@imanifest.money")
PASSWORD = os.environ.get("ENTREPEDIA_PASSWORD", "Supreme99!")

DESKS = [
    {
        "slug": "coaching-ops-desk",
        "title": "Coaching Ops Desk",
        "summary": "Self-coaching and client coaching systems that create surplus without guru theater.",
        "category": "personal-development",
        "batch": 1,
        "q": "coaching",
        "queries": ["self coaching", "become your own coach", "coaching business", "coaching skills", "client coaching"],
        "title_any": ["coach", "coaching", "best coach"],
        "title_none": ["tiktok", "instagram", "dating", "love", "sports coach"],
        "max": 8,
    },
    {
        "slug": "offer-builder-desk",
        "title": "Offer Builder Desk",
        "summary": "Build offers that sell — packaging, proof, and structure before you scale ads.",
        "category": "wealth-creation",
        "batch": 1,
        "q": "build offers",
        "queries": ["build offers that sell", "offer creation", "build what sells", "irresistible offer", "offer packaging"],
        "title_any": ["offer", "build what sells", "product that sells", "package"],
        "title_none": ["tiktok", "instagram", "meta ads", "pricing strategies"],
        "max": 8,
    },
    {
        "slug": "change-management-desk",
        "title": "Change Management Desk",
        "summary": "Ship org change without revolt — adoption, resistance, and AI-ready change ops.",
        "category": "personal-development",
        "batch": 1,
        "q": "change management",
        "queries": ["change management", "ai change management", "overcome resistance", "organizational change", "adoption"],
        "title_any": ["change management", "resistance", "adoption", "transformation work", "ai-ready change"],
        "title_none": ["tiktok", "instagram", "dating"],
        "max": 8,
    },
    {
        "slug": "conversion-triggers-desk",
        "title": "Conversion Triggers Desk",
        "summary": "Psychological triggers that turn browsers into buyers — ethics optional, surplus required.",
        "category": "marketing",
        "batch": 1,
        "q": "psychological triggers",
        "queries": ["psychological triggers", "conversion psychology", "turn visitors into buyers", "buyers psychology"],
        "title_any": ["trigger", "psychological", "browsers into", "visitors into", "buyers"],
        "title_none": ["tiktok shop", "dating", "love life"],
        "max": 8,
    },
    {
        "slug": "sop-systems-desk",
        "title": "SOP Systems Desk",
        "summary": "Document and automate SOPs so the business runs when you step away.",
        "category": "wealth-creation",
        "batch": 1,
        "q": "sop",
        "queries": ["sop", "standard operating procedure", "prepare sops", "business systems documentation", "process documentation"],
        "title_any": ["sop", "standard operating", "process doc", "systems documentation", "automate your first"],
        "title_none": ["tiktok", "instagram", "dating"],
        "max": 7,
    },
    {
        "slug": "journaling-ops-desk",
        "title": "Journaling Ops Desk",
        "summary": "Operator journaling that compounds clarity — surplus logs, not gratitude theater.",
        "category": "personal-development",
        "batch": 2,
        "q": "journaling",
        "queries": ["journaling", "journal for entrepreneurs", "reflective journaling", "daily journal system"],
        "title_any": ["journal", "journaling", "reflect"],
        "title_none": ["tiktok", "instagram", "dating", "love"],
        "max": 7,
    },
    {
        "slug": "money-psychology-desk",
        "title": "Money Psychology Desk",
        "summary": "Rewrite money scripts that block surplus — psychology that shows up in the P&L.",
        "category": "wealth-creation",
        "batch": 2,
        "q": "money mindset",
        "queries": ["money mindset", "money psychology", "wealth mindset", "relationship with money", "financial psychology"],
        "title_any": ["money mind", "money psycho", "wealth mind", "financial psycho", "relationship with money", "scarcity"],
        "title_none": ["tiktok", "instagram", "dating", "crypto trading"],
        "max": 8,
    },
    {
        "slug": "authentic-marketing-desk",
        "title": "Authentic Marketing Desk",
        "summary": "Market without losing credibility — authenticity systems that still close.",
        "category": "marketing",
        "batch": 2,
        "q": "authentic marketing",
        "queries": ["authentic marketing", "sell without losing credibility", "marketing authenticity", "honest marketing"],
        "title_any": ["authentic marketing", "credibility", "without losing", "honest marketing", "8 days to authentic"],
        "title_none": ["tiktok shop", "meta ads", "youtube ads"],
        "max": 7,
    },
    {
        "slug": "ai-profit-desk",
        "title": "AI Profit Desk",
        "summary": "AI levers that pay off for small operators — profit, not prompt tourism.",
        "category": "wealth-creation",
        "batch": 2,
        "q": "ai profit",
        "queries": ["ai profit", "ai for small business", "ai that pays", "ai powered small business", "hidden ai profit"],
        "title_any": ["ai profit", "ai that pays", "ai-powered", "ai for small", "ai mastery", "profit lever"],
        "title_none": ["tiktok", "instagram", "classroom", "educator", "teaching"],
        "max": 8,
    },
    {
        "slug": "lead-generation-desk",
        "title": "Lead Generation Desk",
        "summary": "Fill the pipe without paid-media addiction — B2B and organic lead systems.",
        "category": "marketing",
        "batch": 2,
        "q": "lead generation",
        "queries": ["lead generation", "b2b lead generation", "generate leads", "inbound leads", "lead system"],
        "title_any": ["lead generation", "leads", "b2b lead", "prospect"],
        "title_none": ["linkedin ads", "meta ads", "youtube ads", "tiktok"],
        "max": 8,
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
    for w in range(1, 10):
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
