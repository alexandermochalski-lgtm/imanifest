"""Scrape Entrepedia Wave 9 desks — push campus past 100 courses.

Usage:
  python scripts/scrape_wave9_desks.py
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
OUT = ROOT / "data" / "entrepedia-wave9"
EMAIL = os.environ.get("ENTREPEDIA_EMAIL", "steve@imanifest.money")
PASSWORD = os.environ.get("ENTREPEDIA_PASSWORD", "Supreme99!")

DESKS = [
    {
        "slug": "goal-architecture-desk",
        "title": "Goal Architecture Desk",
        "summary": "Build goal systems that survive the week — architecture over motivation theater.",
        "category": "personal-development",
        "batch": 1,
        "q": "goal setting",
        "queries": ["goal architecture", "goal setting", "goal system", "okrs", "quarterly goals"],
        "title_any": ["goal", "okr", "objective", "ambition", "target setting"],
        "title_none": ["tiktok", "instagram", "meta ads", "dating", "love"],
        "max": 8,
    },
    {
        "slug": "boundaries-ops-desk",
        "title": "Boundaries Ops Desk",
        "summary": "Protect focus and surplus with boundaries that work at work — not guilt scripts.",
        "category": "personal-development",
        "batch": 1,
        "q": "boundaries",
        "queries": ["boundaries at work", "personal boundaries", "set boundaries", "boundaries that work"],
        "title_any": ["boundar", "saying no", "protect your time", "work-life"],
        "title_none": ["tiktok", "instagram", "dating", "love life"],
        "max": 7,
    },
    {
        "slug": "empathy-skills-desk",
        "title": "Empathy Skills Desk",
        "summary": "Read rooms and lead people without soft-skill fluff — empathy as an operating skill.",
        "category": "personal-development",
        "batch": 1,
        "q": "empathy",
        "queries": ["empathy skills", "emotional empathy", "empathetic leadership", "building empathy"],
        "title_any": ["empathy", "empathetic", "compassion at work", "listen"],
        "title_none": ["tiktok", "instagram", "meta ads", "dating"],
        "max": 7,
    },
    {
        "slug": "chatbot-ops-desk",
        "title": "Chatbot Ops Desk",
        "summary": "Ship chatbots that qualify and convert — implementation without endless bot theater.",
        "category": "e-commerce",
        "batch": 1,
        "q": "chatbot",
        "queries": ["chatbot", "website chatbot", "chatbot implementation", "business chatbot", "chatbot adoption"],
        "title_any": ["chatbot", "chat bot", "conversational ai", "bot-savvy", "bot "],
        "title_none": ["tiktok", "instagram", "dating", "love"],
        "max": 8,
    },
    {
        "slug": "case-study-sales-desk",
        "title": "Case Study Sales Desk",
        "summary": "Turn proof into close — case study frameworks that sell B2B without hype decks.",
        "category": "marketing",
        "batch": 1,
        "q": "case study",
        "queries": ["case study", "case studies that sell", "b2b case study", "customer case study", "deal closing case"],
        "title_any": ["case study", "case studies", "proof", "social proof story"],
        "title_none": ["tiktok", "instagram", "meta ads", "youtube ads"],
        "max": 7,
    },
    {
        "slug": "atomic-execution-desk",
        "title": "Atomic Execution Desk",
        "summary": "Break overwhelm into shippable units — execution systems for operators under load.",
        "category": "personal-development",
        "batch": 2,
        "q": "execution",
        "queries": ["atomic execution", "break down projects", "execution system", "get things done", "project overwhelm"],
        "title_any": ["execution", "atomic", "overwhelm", "break down", "get things done", "ship"],
        "title_none": ["tiktok", "instagram", "dating", "crypto"],
        "max": 7,
    },
    {
        "slug": "digital-presence-desk",
        "title": "Digital Presence Desk",
        "summary": "Own how you show up online — presence systems that attract surplus, not noise.",
        "category": "marketing",
        "batch": 2,
        "q": "digital presence",
        "queries": ["digital presence", "positive digital presence", "online presence", "personal digital brand"],
        "title_any": ["digital presence", "online presence", "positive digital", "how others see you"],
        "title_none": ["tiktok shop", "meta ads", "youtube ads", "dating"],
        "max": 8,
    },
    {
        "slug": "workshop-revenue-desk",
        "title": "Workshop Revenue Desk",
        "summary": "Run workshops that print consistent revenue — format, delivery, and monetization.",
        "category": "wealth-creation",
        "batch": 2,
        "q": "workshop",
        "queries": ["workshop revenue", "run a workshop", "workshop secrets", "workshop business", "paid workshop"],
        "title_any": ["workshop", "masterclass delivery", "live training"],
        "title_none": ["tiktok", "instagram", "meta ads", "dating"],
        "max": 8,
    },
    {
        "slug": "ecommerce-automation-desk",
        "title": "E-Commerce Automation Desk",
        "summary": "Automate store ops so SKUs and cashflow run without babysitting every order.",
        "category": "e-commerce",
        "batch": 2,
        "q": "ecommerce automation",
        "queries": ["automate ecommerce", "ecommerce automation", "automate store", "ecommerce operations automation"],
        "title_any": ["automat", "ecommerce operation", "e-commerce operation", "store ops", "first 5 systems"],
        "title_none": ["tiktok shop", "dating", "yoga"],
        "max": 8,
    },
    {
        "slug": "investor-readiness-desk",
        "title": "Investor Readiness Desk",
        "summary": "Pass the checks investors run — business model, capital, and readiness without theater.",
        "category": "investing",
        "batch": 2,
        "q": "investor",
        "queries": ["investor readiness", "business model investors", "pitch investors", "raise capital checklist", "investor due diligence"],
        "title_any": ["investor", "raise capital", "due diligence", "business model check", "commit capital"],
        "title_none": ["tiktok", "instagram", "dating", "crypto trading"],
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
    for w in range(1, 9):
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
