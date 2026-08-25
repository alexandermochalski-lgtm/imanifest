"""Scrape Entrepedia Wave 4 desks (investing / health / wealth gaps) via Playwright.

Usage:
  python scripts/scrape_wave4_desks.py

Env: ENTREPEDIA_EMAIL, ENTREPEDIA_PASSWORD
Writes: data/entrepedia-wave4/scrape-desks.json
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
OUT = ROOT / "data" / "entrepedia-wave4"
EMAIL = os.environ.get("ENTREPEDIA_EMAIL", "steve@imanifest.money")
PASSWORD = os.environ.get("ENTREPEDIA_PASSWORD", "Supreme99!")

DESKS = [
    {
        "slug": "stock-investing-desk",
        "title": "Stock Investing Desk",
        "summary": "Operator frameworks for equity selection, portfolio construction, and risk.",
        "category": "investing",
        "batch": 1,
        "q": "stocks",
        "queries": ["stocks", "stock market", "dividend investing", "portfolio investing", "investing"],
        "title_any": [
            "stock",
            "equity",
            "share",
            "portfolio",
            "dividend",
            "index fund",
            "etf",
            "investing",
            "investment",
            "wealth strateg",
        ],
        "title_none": ["tiktok", "instagram", "meta ads", "funnel", "email", "real estate", "crypto", "bitcoin", "property", "brrrr", "rental"],
        "max": 8,
    },
    {
        "slug": "real-estate-investing-desk",
        "title": "Real Estate Investing Desk",
        "summary": "Acquire, underwrite, and operate income property without spectator theory.",
        "category": "investing",
        "batch": 1,
        "q": "real estate",
        "queries": ["real estate", "BRRRR", "rental property", "investment property"],
        "title_any": ["real estate", "rental", "property", "landlord", "reit", "brrrr", "mortgage", "house hack"],
        "title_none": ["digital product", "course creation", "tiktok"],
        "max": 8,
    },
    {
        "slug": "crypto-assets-desk",
        "title": "Crypto Assets Desk",
        "summary": "Position sizing, custody, and operator discipline around digital assets.",
        "category": "investing",
        "batch": 1,
        "q": "crypto",
        "queries": ["crypto", "bitcoin", "cryptocurrency"],
        "title_any": ["crypto", "bitcoin", "blockchain", "web3", "defi", "nft", "ethereum"],
        "title_none": [],
        "max": 7,
    },
    {
        "slug": "credit-score-desk",
        "title": "Credit Score Desk",
        "summary": "Rebuild and weaponize personal credit as a capital access system.",
        "category": "wealth-creation",
        "batch": 1,
        "q": "credit",
        "queries": ["credit score", "credit repair", "build credit"],
        "title_any": ["credit"],
        "title_none": ["letter of credit", "carbon credit"],
        "max": 7,
    },
    {
        "slug": "personal-finance-ops-desk",
        "title": "Personal Finance Ops Desk",
        "summary": "Budget, surplus allocation, and household cash control for operators.",
        "category": "wealth-creation",
        "batch": 2,
        "q": "personal finance",
        "queries": ["personal finance", "budgeting", "debt payoff", "emergency fund"],
        "title_any": ["finance", "budget", "money", "debt", "savings", "wealth", "financial", "net worth", "cashflow", "cash flow"],
        "title_none": ["ads", "funnel", "instagram", "tiktok", "youtube ads", "real estate", "crypto"],
        "max": 8,
    },
    {
        "slug": "health-habits-desk",
        "title": "Health Habits Desk",
        "summary": "Sustainable health operating systems for high-output operators.",
        "category": "health-wellness",
        "batch": 2,
        "q": "health",
        "queries": ["health habits", "wellness", "longevity", "immune"],
        "title_any": ["health", "wellness", "longevity", "immune", "stress", "vitality", "habit"],
        "title_none": ["fitness offer", "gym marketing", "coach sales", "ads"],
        "max": 8,
    },
    {
        "slug": "sleep-recovery-desk",
        "title": "Sleep & Recovery Desk",
        "summary": "Sleep architecture and recovery protocols that protect decision quality.",
        "category": "health-wellness",
        "batch": 2,
        "q": "sleep",
        "queries": ["sleep", "insomnia", "recovery sleep"],
        "title_any": ["sleep", "insomnia", "circadian", "rest"],
        "title_none": [],
        "max": 7,
    },
    {
        "slug": "nutrition-engine-desk",
        "title": "Nutrition Engine Desk",
        "summary": "Fuel systems, meal architecture, and nutrition without hype diets.",
        "category": "fitness-nutrition",
        "batch": 3,
        "q": "nutrition",
        "queries": ["nutrition", "meal plan", "macros", "diet"],
        "title_any": ["nutrition", "meal", "diet", "macro", "food", "eating", "protein"],
        "title_none": ["ads", "funnel", "instagram"],
        "max": 8,
    },
    {
        "slug": "strength-training-desk",
        "title": "Strength Training Desk",
        "summary": "Progressive strength and body composition systems for busy operators.",
        "category": "fitness-nutrition",
        "batch": 3,
        "q": "strength training",
        "queries": ["strength training", "workout", "hypertrophy", "weight training"],
        "title_any": ["strength", "workout", "training", "fitness", "muscle", "gym", "lift"],
        "title_none": ["offer", "coach sales", "high-ticket", "marketing"],
        "max": 8,
    },
    {
        "slug": "mindfulness-focus-desk",
        "title": "Mindfulness & Focus Desk",
        "summary": "Attention training and nervous-system tools that compound execution.",
        "category": "health-wellness",
        "batch": 3,
        "q": "meditation",
        "queries": ["meditation", "mindfulness", "breathwork"],
        "title_any": ["meditat", "mindful", "breath", "calm", "anxiety", "nervous system"],
        "title_none": ["ads", "funnel"],
        "max": 7,
    },
]


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
    # Bounce to library to confirm session
    page.goto("https://www.entrepedia.co/library", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(2000)
    print("login_url", page.url, flush=True)


def search_products(page, query: str) -> list[dict]:
    """Use /library/search?q= — ?search= does not filter."""
    url = f"https://www.entrepedia.co/library/search?q={quote(query)}"
    page.goto(url, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(2800)
    for _ in range(6):
        page.mouse.wheel(0, 2800)
        page.wait_for_timeout(450)
    items = page.evaluate(
        """() => {
      const out = [];
      const seen = new Set();
      const cards = [...document.querySelectorAll('a[href*="/library/product/"]')];
      for (const a of cards) {
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
    return items


def extract_product(page, product_id: str) -> dict | None:
    href = f"https://www.entrepedia.co/library/product/{product_id}"
    page.goto(href, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(1600)
    data = page.evaluate(
        """() => {
      const html = document.documentElement.outerHTML;
      const h = document.querySelector('h1');
      let title = (h && h.innerText || '').trim();
      if (!title || title.length < 3) {
        title = (document.title || '').split('|')[0].trim();
      }
      const zips = [...html.matchAll(/https?:\\/\\/[^"'\\s<>]+entrepedia-products[^"'\\s<>]*\\.zip[^"'\\s<>]*/gi)]
        .map(m => m[0].replace(/&amp;/g, '&'));
      const any = [...html.matchAll(/https?:\\/\\/[^"'\\s<>]+\\.zip[^"'\\s<>]*/gi)]
        .map(m => m[0].replace(/&amp;/g, '&'));
      return { title, zip: zips[0] || any[0] || null };
    }"""
    )
    title = (data.get("title") or "").strip()
    zip_url = data.get("zip")
    if not zip_url:
        # Click download and watch network
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
            link = page.get_by_role("link", name=re.compile(pattern, re.I))
            if link.count():
                href2 = link.first.get_attribute("href")
                if href2 and ".zip" in href2:
                    found["url"] = href2
                else:
                    try:
                        link.first.click()
                        page.wait_for_timeout(2000)
                    except Exception:
                        pass
                break
        page.remove_listener("response", on_response)
        zip_url = found["url"] or page.evaluate(
            """() => {
          const html = document.documentElement.outerHTML;
          const zips = [...html.matchAll(/https?:\\/\\/[^"'\\s<>]+\\.zip[^"'\\s<>]*/gi)].map(m => m[0].replace(/&amp;/g,'&'));
          return zips[0] || null;
            }"""
        )
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
    for w in (1, 2, 3):
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
            # Rank candidates by title match from search results first
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
                        # Prefer page title if richer; keep search title as fallback
                        if not prod.get("title") or len(prod["title"]) < 3:
                            prod["title"] = p["title"]
                        product_cache[pid] = prod
                        print(f"  ok {prod['title'][:70]}", flush=True)
                    else:
                        print(f"  skip {pid[:8]} ({p['title'][:50]})", flush=True)
                    time.sleep(0.25)
                if not prod:
                    continue
                if prod["id"] in used:
                    continue
                # Re-check with final title
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
