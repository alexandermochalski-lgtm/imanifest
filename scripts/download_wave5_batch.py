"""Download Wave 5 batch product ZIPs from inventory download_url fields."""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
BATCH = int(sys.argv[1] if len(sys.argv) > 1 else "1")
inv = json.loads((ROOT / "data/entrepedia-wave5/inventory.json").read_text(encoding="utf-8"))
base = Path(os.environ["USERPROFILE"]) / "OneDrive" / "Desktop" / "iMU-import" / "wave5" / f"batch-{BATCH}"
items = [i for i in inv["items"] if int(i["download_batch"]) == BATCH]
print(f"batch{BATCH} products", len(items), flush=True)
for i, item in enumerate(items, 1):
    desk = item["desk_slug"]
    dest_dir = base / desk
    dest_dir.mkdir(parents=True, exist_ok=True)
    url = (item["download_url"] or "").replace("\\", "/").rstrip("/\\")
    name = unquote(url.split("/")[-1].split("?")[0])
    out = dest_dir / name
    if out.exists() and out.stat().st_size > 10000:
        print(f"SKIP {desk}/{name}", flush=True)
        continue
    print(f"DL {i}/{len(items)} {desk}/{name}", flush=True)
    r = subprocess.run(
        ["curl.exe", "-L", "--fail", "--retry", "3", "--connect-timeout", "30", "--max-time", "600", "-o", str(out), url]
    )
    if r.returncode != 0 or not out.exists() or out.stat().st_size < 10000:
        print("FAIL", name, r.returncode, flush=True)
        if out.exists():
            out.unlink(missing_ok=True)
    else:
        print(f"OK {out.stat().st_size/1048576:.1f} MB", flush=True)
