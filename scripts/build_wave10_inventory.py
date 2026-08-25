"""Build Entrepedia Wave 10 inventory from scrape-desks.json."""

from __future__ import annotations

import csv
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "entrepedia-wave10"
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
    desks = [d for d in json.loads(SCRAPE.read_text(encoding="utf-8")) if d.get("products")]
    rows = []
    for desk in desks:
        for p in desk.get("products") or []:
            fmt = p.get("formatGuess") or "Guide"
            zip_url = (p.get("zip") or "").replace("\\", "/").rstrip("/\\")
            rows.append(
                {
                    "wave": 10,
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
                    "download_url": zip_url,
                    "imu_type": FORMAT_TO_IMU.get(fmt, "guide"),
                    "imu_category": desk["category"],
                    "imu_title": p.get("title") or desk["title"],
                    "imu_summary": f"Part of {desk['title']}: {p.get('title') or desk['title']}.",
                    "status": "queued",
                    "staging_hint": f"iMU-import\\\\wave10\\\\batch-{desk['batch']}\\\\{desk['slug']}",
                }
            )

    fields = list(rows[0].keys())
    with (OUT / "inventory.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    payload = {
        "wave": 10,
        "generated_by": "scripts/build_wave10_inventory.py",
        "note": "Wave 10 gap desks for 100+ campus courses.",
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
    print(
        json.dumps(
            {
                "products": len(rows),
                "desks": len(desks),
                "batches": payload["by_download_batch"],
                "categories": payload["by_imu_category"],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
