"""Build Entrepedia Wave 2 inventory CSV/JSON for iMU import.

Sources product lists from a CDP scrape dump when provided, else regenerates
from the baked WAVE2_META + optional scrape JSON.

Run:
  python scripts/build_wave2_inventory.py [optional-cdp-json]
Outputs: data/entrepedia-wave2/inventory.json + inventory.csv
"""

from __future__ import annotations

import csv
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "entrepedia-wave2"

FORMAT_TO_IMU = {
    "Book": "book",
    "Guide": "guide",
    "Mini-Course": "course",
    "Audio": "audio",
    "Workbook": "guide",
    "Checklist": "guide",
    "Listicle": "guide",
    "Template": "guide",
    "Notion Template": "guide",
    "Prompt Pack": "guide",
    "Toolstack": "guide",
    "Podcast": "audio",
}

# slug -> (imu_category, download_batch, imu_title, imu_summary)
WAVE2_META: dict[str, tuple[str, int, str, str]] = {
    "the-backlink-blueprint": (
        "marketing",
        1,
        "Backlink Blueprint Desk",
        "Earn authority links with modern reclamation and outreach systems.",
    ),
    "hire-right-keep-them-longer": (
        "personal-development",
        1,
        "Hire & Retain Desk",
        "Interview, onboard, and keep operators who actually stay.",
    ),
    "sales-automation-chatbots": (
        "marketing",
        1,
        "Sales Chatbot Automation",
        "Automate qualification and follow-up without losing the close.",
    ),
    "humanize-your-ai-copy": (
        "marketing",
        1,
        "Humanize AI Copy Desk",
        "Ship AI-assisted copy that still reads like an operator wrote it.",
    ),
    "ai-prompt-engineering-ebook": (
        "marketing",
        1,
        "AI Prompt Engineering Desk",
        "Prompt systems for research, offers, and production leverage.",
    ),
    "swot-analysis-simplified": (
        "wealth-creation",
        1,
        "SWOT Decision Desk",
        "Run fast SWOT so strategy stays priced and killable.",
    ),
    "the-athlete-brand-blueprint": (
        "social-media",
        2,
        "Athlete Brand Desk",
        "Package athletic proof into sponsorships and personal brand cashflow.",
    ),
    "the-telegram-monetization-playbook": (
        "social-media",
        2,
        "Telegram Monetization Desk",
        "Turn Telegram attention into paid communities and product sales.",
    ),
    "the-brand-evolution-system-for-modern-creators": (
        "social-media",
        2,
        "Creator Brand Evolution",
        "Evolve creator identity without resetting audience trust.",
    ),
    "how-to-build-a-consistent-visual-identity": (
        "marketing",
        2,
        "Visual Identity System",
        "Consistent brand visuals that make offers look premium.",
    ),
    "home-deal-negotiation-ebook": (
        "wealth-creation",
        2,
        "Home Deal Negotiation",
        "Negotiate residential deals with process instead of emotion.",
    ),
    "the-modern-estate-manager": (
        "wealth-creation",
        2,
        "Modern Estate Manager",
        "Operate property and estate cashflow like a desk, not a hobby.",
    ),
    "self-care-without-the-guilt": (
        "fitness-nutrition",
        3,
        "Self-Care Without Guilt",
        "Recovery systems operators can keep without abandoning the desk.",
    ),
    "the-neuroinclusive-managers-playbook": (
        "personal-development",
        3,
        "Neuroinclusive Manager Desk",
        "Lead mixed cognition teams without burning trust or output.",
    ),
    "the-connection-code": (
        "personal-development",
        3,
        "Connection Code Desk",
        "Build high-trust network capital that opens deals and mandates.",
    ),
    "digital-detox-for-founders": (
        "personal-development",
        3,
        "Founder Digital Detox",
        "Cut attention leaks so founders reclaim deep work and surplus.",
    ),
}


def load_scrape(path: Path) -> list[dict]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    # CDP tool wrappers
    if isinstance(raw, dict):
        if "result" in raw and isinstance(raw["result"], dict):
            inner = raw["result"]
            if "result" in inner and isinstance(inner["result"], dict) and "value" in inner["result"]:
                return inner["result"]["value"]
            if "value" in inner:
                return inner["value"]
        if "value" in raw:
            return raw["value"]
    if isinstance(raw, list):
        return raw
    raise SystemExit(f"Unrecognized scrape JSON shape: {path}")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    scrape_path = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    if not scrape_path:
        # default latest browser log if present
        logs = sorted(Path.home().joinpath(".cursor", "browser-logs").glob("cdp-response-Runtime.evaluate-*.json"))
        scrape_path = logs[-1] if logs else None
    if not scrape_path or not scrape_path.exists():
        raise SystemExit("Provide a CDP scrape JSON path as argv[1]")

    bundles = load_scrape(scrape_path)
    by_slug = {b["slug"]: b for b in bundles if isinstance(b, dict) and b.get("slug")}

    rows: list[dict] = []
    for slug, meta in WAVE2_META.items():
        category, batch, imu_title, imu_summary = meta
        scraped = by_slug.get(slug) or {}
        bundle_title = scraped.get("title") or slug.replace("-", " ").title()
        products = scraped.get("products") or []
        if not products:
            # placeholder row so the desk still appears in inventory
            products = [
                {
                    "product_id": f"pending-{slug}",
                    "entrepedia_title": bundle_title,
                    "entrepedia_url": f"https://www.entrepedia.co/library/bundles/{slug}",
                    "entrepedia_format": "Book",
                }
            ]
        for p in products:
            fmt = p.get("entrepedia_format") or "Guide"
            rows.append(
                {
                    "wave": 2,
                    "download_batch": batch,
                    "source_type": "bundle_product",
                    "bundle_slug": slug,
                    "bundle_title": bundle_title,
                    "bundle_url": f"https://www.entrepedia.co/library/bundles/{slug}",
                    "product_id": p.get("product_id", ""),
                    "entrepedia_title": p.get("entrepedia_title", ""),
                    "entrepedia_url": p.get("entrepedia_url", ""),
                    "entrepedia_format": fmt,
                    "imu_type": FORMAT_TO_IMU.get(fmt, "guide"),
                    "imu_category": category,
                    "imu_title": p.get("entrepedia_title") or imu_title,
                    "imu_summary": f"Part of {imu_title}: {p.get('entrepedia_title') or imu_title}.",
                    "status": "queued",
                    "staging_hint": f"iMU-import\\wave2\\batch-{batch}\\{slug}",
                    "desk_title": imu_title,
                    "desk_summary": imu_summary,
                }
            )

    fields = list(rows[0].keys())
    csv_path = OUT / "inventory.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    payload = {
        "wave": 2,
        "generated_by": "scripts/build_wave2_inventory.py",
        "product_count": len(rows),
        "bundle_count": len(WAVE2_META),
        "by_download_batch": dict(sorted(Counter(int(r["download_batch"]) for r in rows).items())),
        "by_imu_category": dict(Counter(r["imu_category"] for r in rows)),
        "batch1_download_note": (
            "Download only download_batch==1 first. Stage under OneDrive iMU-import\\wave2\\batch-1\\, "
            "keep staging under ~2GB, upload via scripts/upload_batch_blob.mjs wave2 1, then delete local ZIPs."
        ),
        "desks": [
            {
                "slug": slug,
                "category": meta[0],
                "download_batch": meta[1],
                "title": meta[2],
                "summary": meta[3],
            }
            for slug, meta in WAVE2_META.items()
        ],
        "items": rows,
    }
    (OUT / "inventory.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps({"products": len(rows), "bundles": len(WAVE2_META), "batches": payload["by_download_batch"]}, indent=2))


if __name__ == "__main__":
    main()
