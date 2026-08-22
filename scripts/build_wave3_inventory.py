"""Build Entrepedia Wave 3 inventory from curated product desks scrape.

Run: python scripts/build_wave3_inventory.py
Input: data/entrepedia-wave3/scrape-desks.json
Output: inventory.json + inventory.csv
"""

from __future__ import annotations

import csv
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "entrepedia-wave3"
SCRAPE = OUT / "scrape-desks.json"

FORMAT_TO_IMU = {
    "Book": "book",
    "Guide": "guide",
    "Mini-Course": "course",
    "Audio": "audio",
    "Workbook": "guide",
    "Checklist": "guide",
    "Listicle": "guide",
    "Template": "guide",
    "Prompt Pack": "guide",
    "Toolstack": "guide",
}


def main() -> None:
    desks = json.loads(SCRAPE.read_text(encoding="utf-8"))
    rows = []
    for desk in desks:
        for p in desk.get("products") or []:
            fmt = p.get("formatGuess") or "Guide"
            rows.append(
                {
                    "wave": 3,
                    "download_batch": desk["batch"],
                    "source_type": "product_series",
                    "desk_slug": desk["slug"],
                    "desk_title": desk["title"],
                    "desk_summary": desk["summary"],
                    "bundle_slug": desk["slug"],
                    "bundle_title": desk["title"],
                    "bundle_url": f"https://www.entrepedia.co/library/search?q={desk['q']}",
                    "product_id": p.get("id", ""),
                    "entrepedia_title": p.get("title", ""),
                    "entrepedia_url": p.get("href", ""),
                    "entrepedia_format": fmt,
                    "download_url": p.get("zip", ""),
                    "imu_type": FORMAT_TO_IMU.get(fmt, "guide"),
                    "imu_category": desk["category"],
                    "imu_title": p.get("title") or desk["title"],
                    "imu_summary": f"Part of {desk['title']}: {p.get('title') or desk['title']}.",
                    "status": "queued",
                    "staging_hint": f"iMU-import\\\\wave3\\\\batch-{desk['batch']}\\\\{desk['slug']}",
                }
            )

    fields = list(rows[0].keys())
    with (OUT / "inventory.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    payload = {
        "wave": 3,
        "generated_by": "scripts/build_wave3_inventory.py",
        "note": "Product-series desks (bundles exhausted after Wave 1+2). Download via download_url fields.",
        "product_count": len(rows),
        "desk_count": len(desks),
        "by_download_batch": dict(sorted(Counter(int(r["download_batch"]) for r in rows).items())),
        "by_imu_category": dict(Counter(r["imu_category"] for r in rows)),
        "desks": [
            {
                "slug": d["slug"],
                "title": d["title"],
                "category": d["category"],
                "download_batch": d["batch"],
                "summary": d["summary"],
                "product_count": len(d.get("products") or []),
            }
            for d in desks
        ],
        "items": rows,
    }
    (OUT / "inventory.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps({"products": len(rows), "desks": len(desks), "batches": payload["by_download_batch"]}, indent=2))


if __name__ == "__main__":
    main()
