"""Rebuild Wave 4 Batch 1 courses from overlay.media if courses were wiped."""
from __future__ import annotations

import json
import re
import subprocess
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_token() -> str:
    for line in (ROOT / ".env.local").read_text(encoding="utf-8").splitlines():
        if line.startswith("BLOB_READ_WRITE_TOKEN="):
            return line.split("=", 1)[1].strip().strip('"').strip("'").replace(" ", "")
    raise SystemExit("missing token")


def store_id(token: str) -> str:
    m = re.match(r"vercel_blob_rw_([^_]+)_", token)
    if not m:
        raise SystemExit("bad token")
    return m.group(1)


def read_overlay(token: str) -> dict:
    store = store_id(token)
    url = f"https://{store}.private.blob.vercel-storage.com/imu/catalog-overlay.json"
    out = subprocess.check_output(
        ["curl.exe", "-sS", "--fail", "-H", f"Authorization: Bearer {token}", url],
    )
    return json.loads(out)


def put_overlay(token: str, overlay: dict) -> None:
    tmp = ROOT / "data" / "entrepedia-wave4" / "_overlay_tmp.json"
    tmp.write_text(json.dumps(overlay, indent=2), encoding="utf-8")
    api = "https://vercel.com/api/blob?pathname=imu%2Fcatalog-overlay.json"
    subprocess.check_call(
        [
            "curl.exe",
            "-sS",
            "--fail",
            "-X",
            "PUT",
            api,
            "-H",
            f"Authorization: Bearer {token}",
            "-H",
            "x-api-version: 12",
            "-H",
            "x-vercel-blob-access: private",
            "-H",
            "x-add-random-suffix: 0",
            "-H",
            "x-allow-overwrite: 1",
            "-H",
            "x-content-type: application/json",
            "-T",
            str(tmp),
        ]
    )


DESKS = {
    "stock-investing-desk": {
        "id": "c-w4-stocks",
        "bookId": "b-w4-stocks",
        "slug": "stock-investing-desk",
        "title": "Stock Investing Desk",
        "faculty": "Investing",
        "category": "investing",
        "summary": "Operator frameworks for equity selection, portfolio construction, and risk.",
    },
    "real-estate-investing-desk": {
        "id": "c-w4-realestate",
        "bookId": "b-w4-realestate",
        "slug": "real-estate-investing-desk",
        "title": "Real Estate Investing Desk",
        "faculty": "Investing",
        "category": "investing",
        "summary": "Acquire, underwrite, and operate income property without spectator theory.",
    },
    "crypto-assets-desk": {
        "id": "c-w4-crypto",
        "bookId": "b-w4-crypto",
        "slug": "crypto-assets-desk",
        "title": "Crypto Assets Desk",
        "faculty": "Investing",
        "category": "investing",
        "summary": "Position sizing, custody, and operator discipline around digital assets.",
    },
    "credit-score-desk": {
        "id": "c-w4-credit",
        "bookId": "b-w4-credit",
        "slug": "credit-debt-desk",
        "title": "Credit & Debt Desk",
        "faculty": "Wealth Creation",
        "category": "wealth-creation",
        "summary": "Eliminate debt drag and rebuild capital access like an operator.",
    },
}


def file_from_title(title: str) -> str:
    i = title.find(" — ")
    return title[i + 3 :] if i >= 0 else title


def kind(asset: dict) -> str:
    k = asset.get("kind")
    if k in {"audio", "video", "pdf"}:
        return k
    return "reading"


def main() -> None:
    token = load_token()
    overlay = read_overlay(token)
    existing = {c["id"] for c in overlay.get("courses", [])}
    print("existing w4", sorted(i for i in existing if i.startswith("c-w4-")))

    groups: dict[str, list] = defaultdict(list)
    for media in overlay.get("media", []):
        title = media.get("title") or ""
        if " — " not in title:
            continue
        prefix = title.split(" — ", 1)[0]
        if prefix in DESKS:
            groups[prefix].append(media)

    for prefix, assets in groups.items():
        desk = DESKS[prefix]
        if desk["id"] in existing and prefix != "crypto-assets-desk":
            # keep existing unless missing batch1 desks
            pass
        audios = sorted([a for a in assets if a.get("kind") == "audio"], key=lambda a: file_from_title(a["title"]))
        videos = sorted([a for a in assets if a.get("kind") == "video"], key=lambda a: file_from_title(a["title"]))
        pdfs = sorted([a for a in assets if a.get("kind") == "pdf"], key=lambda a: file_from_title(a["title"]))
        cover = next((a for a in assets if a.get("kind") == "image" and re.search(r"book cover|artwork", file_from_title(a["title"]), re.I)), None)
        modules = []
        if audios:
            modules.append(
                {
                    "id": f"{desk['id']}-m-audio",
                    "title": "Audio desk",
                    "lessons": [
                        {
                            "id": f"{desk['id']}-audio-l{i+1}",
                            "title": re.sub(r"\.(m4a|mp3|wav)$", "", file_from_title(a["title"]), flags=re.I),
                            "kind": "audio",
                            "duration": f"{max(8, round(a.get('size',0)/1024/1024))} min",
                            "body": "Included with an active campus seat. Enroll to open the file.",
                            "mediaUrl": a["url"],
                            "mediaId": a.get("id"),
                        }
                        for i, a in enumerate(audios)
                    ],
                }
            )
        if videos:
            modules.append(
                {
                    "id": f"{desk['id']}-m-video",
                    "title": "Video desk",
                    "lessons": [
                        {
                            "id": f"{desk['id']}-video-l{i+1}",
                            "title": re.sub(r"\.(mp4|mov|webm)$", "", file_from_title(a["title"]), flags=re.I),
                            "kind": "video",
                            "duration": "12 min",
                            "body": "Included with an active campus seat. Enroll to open the file.",
                            "mediaUrl": a["url"],
                            "mediaId": a.get("id"),
                        }
                        for i, a in enumerate(videos)
                    ],
                }
            )
        if pdfs:
            modules.append(
                {
                    "id": f"{desk['id']}-m-playbooks",
                    "title": "Playbooks",
                    "lessons": [
                        {
                            "id": f"{desk['id']}-pdf-l{i+1}",
                            "title": re.sub(r"\.pdf$", "", file_from_title(a["title"]), flags=re.I),
                            "kind": "pdf",
                            "duration": "12 min",
                            "body": "Included with an active campus seat. Enroll to open the file.",
                            "mediaUrl": a["url"],
                            "mediaId": a.get("id"),
                        }
                        for i, a in enumerate(pdfs)
                    ],
                }
            )
        if not modules:
            print("skip empty", prefix)
            continue
        # replace course
        overlay["courses"] = [c for c in overlay["courses"] if c["id"] != desk["id"]]
        overlay["courses"].insert(
            0,
            {
                "id": desk["id"],
                "slug": desk["slug"],
                "title": desk["title"],
                "faculty": desk["faculty"],
                "category": desk["category"],
                "duration": "Self-paced",
                "level": "Practitioner",
                "price": 0,
                "summary": desk["summary"],
                "status": "active",
                "coverUrl": cover["url"] if cover else None,
                "modules": modules,
            },
        )
        flagship = pdfs[0] if pdfs else None
        if desk.get("bookId") and flagship:
            overlay["books"] = [b for b in overlay["books"] if b["id"] != desk["bookId"]]
            overlay["books"].insert(
                0,
                {
                    "id": desk["bookId"],
                    "slug": f"{desk['slug']}-book",
                    "title": desk["title"],
                    "author": "iManifest University",
                    "category": desk["category"],
                    "pages": max(40, round(flagship.get("size", 0) / 8000)),
                    "summary": desk["summary"],
                    "price": 0,
                    "fileUrl": flagship["url"],
                    "coverUrl": cover["url"] if cover else None,
                },
            )
        print(
            "restored",
            prefix,
            "audio",
            len(audios),
            "video",
            len(videos),
            "pdf",
            len(pdfs),
        )

    put_overlay(token, overlay)
    ids = sorted(c["id"] for c in overlay["courses"] if c["id"].startswith("c-w4-"))
    print("final w4", ids)
    print("deliverable-ish", sum(1 for c in overlay["courses"] if c.get("status") == "active"))


if __name__ == "__main__":
    main()
