/**
 * Upload one Entrepedia batch folder to private Vercel Blob.
 * Usage:
 *   node scripts/upload_batch_blob.mjs 2
 *   node scripts/upload_batch_blob.mjs wave2 1
 * Expects: %USERPROFILE%/OneDrive/Desktop/iMU-import/[wave2/]batch-N/<slug>/<slug>.zip
 * Uses Python zipfile extract (handles apostrophes) then curl PUT.
 */
import { existsSync, mkdirSync, readdirSync, statSync, rmSync, writeFileSync, readFileSync } from "fs";
import path from "path";
import { execFileSync } from "child_process";

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnvFile(path.join(process.cwd(), ".env.local"));

const TOKEN = (process.env.BLOB_READ_WRITE_TOKEN || "").replace(/\s+/g, "");
if (!TOKEN) {
  console.error("Missing BLOB_READ_WRITE_TOKEN");
  process.exit(1);
}

const args = process.argv.slice(2);
let WAVE = 1;
let BATCH = 2;
const waveMatch = args[0] && String(args[0]).match(/^wave(\d+)$/i);
if (waveMatch) {
  WAVE = Number(waveMatch[1]);
  BATCH = Number(args[1] || "1");
} else {
  BATCH = Number(args[0] || "2");
}
const STAGING =
  WAVE >= 2
    ? path.join(process.env.USERPROFILE || "", "OneDrive", "Desktop", "iMU-import", `wave${WAVE}`, `batch-${BATCH}`)
    : path.join(process.env.USERPROFILE || "", "OneDrive", "Desktop", "iMU-import", `batch-${BATCH}`);
const EXTRACT = path.join(STAGING, "_extract");
const MEDIA_PREFIX = WAVE >= 2 ? `imu/media/w${WAVE}b${BATCH}` : `imu/media/batch${BATCH}`;
const DATA_DIR = path.join(process.cwd(), "data", WAVE >= 2 ? `entrepedia-wave${WAVE}` : "entrepedia-wave1");
const ALLOWED = new Set([".pdf", ".mp3", ".m4a", ".wav", ".aac", ".mp4", ".webm", ".mov", ".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MIME = {
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".aac": "audio/aac",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function listZips(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && !ent.name.startsWith("_")) out.push(...listZips(p));
    else if (ent.isFile() && ent.name.toLowerCase().endsWith(".zip")) out.push(p);
  }
  return out;
}

function walk(dir, acc = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.name === "__MACOSX" || ent.name.startsWith("._")) continue;
    if (ent.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function expandZip(zipPath, dest) {
  mkdirSync(dest, { recursive: true });
  const py = `
import zipfile, pathlib, sys
src, dest = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
dest.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(src) as z:
    z.extractall(dest)
`;
  const script = path.join(STAGING, "_unzip.py");
  writeFileSync(script, py, "utf8");
  execFileSync("python", [script, zipPath, dest], { stdio: "inherit" });
}

function safeName(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
}

function kindFrom(name, type) {
  if (type.startsWith("video/") || /\.(mp4|mov|webm)$/i.test(name)) return "video";
  if (type.startsWith("audio/") || /\.(mp3|wav|m4a|aac)$/i.test(name)) return "audio";
  if (type === "application/pdf" || /\.pdf$/i.test(name)) return "pdf";
  if (type.startsWith("image/")) return "image";
  return "other";
}

function putBlob(filePath, pathname, contentType) {
  const api = `https://vercel.com/api/blob?pathname=${encodeURIComponent(pathname)}`;
  const out = execFileSync(
    "curl.exe",
    [
      "-sS",
      "--fail-with-body",
      "--max-time",
      "600",
      "-X",
      "PUT",
      api,
      "-H",
      `Authorization: Bearer ${TOKEN}`,
      "-H",
      "x-api-version: 12",
      "-H",
      "x-vercel-blob-access: private",
      "-H",
      "x-add-random-suffix: 1",
      "-H",
      "x-allow-overwrite: 0",
      "-H",
      `x-content-type: ${contentType}`,
      "-T",
      filePath,
    ],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  );
  return JSON.parse(out);
}

function storeIdFromToken(token) {
  const m = token.match(/^vercel_blob_rw_([^_]+)_/);
  return m ? m[1] : "";
}

function readOverlay() {
  const storeId = storeIdFromToken(TOKEN);
  const url = `https://${storeId}.private.blob.vercel-storage.com/imu/catalog-overlay.json`;
  try {
    const out = execFileSync("curl.exe", ["-sS", "--fail-with-body", "--max-time", "60", "-H", `Authorization: Bearer ${TOKEN}`, url], {
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    });
    return { courses: [], books: [], media: [], members: {}, ...JSON.parse(out) };
  } catch {
    return { courses: [], books: [], media: [], members: {} };
  }
}

function writeOverlay(overlay) {
  const tmp = path.join(STAGING, "_overlay.json");
  writeFileSync(tmp, JSON.stringify(overlay, null, 2), "utf8");
  const api = `https://vercel.com/api/blob?pathname=${encodeURIComponent("imu/catalog-overlay.json")}`;
  execFileSync(
    "curl.exe",
    [
      "-sS",
      "--fail-with-body",
      "--max-time",
      "60",
      "-X",
      "PUT",
      api,
      "-H",
      `Authorization: Bearer ${TOKEN}`,
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
      tmp,
    ],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  );
}

function main() {
  if (!existsSync(STAGING)) {
    console.error("Missing staging", STAGING);
    process.exit(1);
  }
  console.log(`Token ok · wave ${WAVE} · batch ${BATCH} · ${STAGING}`);
  const zips = listZips(STAGING);
  console.log(`Found ${zips.length} ZIPs`);
  const uploaded = [];
  const log = [];

  for (const zip of zips) {
    const titlePrefix = path.basename(path.dirname(zip));
    const rel = path.relative(STAGING, zip);
    console.log(`\n== ${rel}`);
    if (existsSync(EXTRACT)) rmSync(EXTRACT, { recursive: true, force: true });
    try {
      expandZip(zip, EXTRACT);
    } catch (e) {
      console.error("Expand failed", e.message);
      log.push({ zip: rel, error: String(e.message || e) });
      continue;
    }
    const files = walk(EXTRACT).filter((f) => ALLOWED.has(path.extname(f).toLowerCase()));
    console.log(`  ${files.length} uploadable`);
    for (const f of files) {
      try {
        const ext = path.extname(f).toLowerCase();
        const base = path.basename(f);
        const contentType = MIME[ext] || "application/octet-stream";
        const size = statSync(f).size;
        if (size > 500 * 1024 * 1024) {
          console.warn("SKIP large", base);
          continue;
        }
        const pathname = `${MEDIA_PREFIX}/${safeName(`${titlePrefix}-${base}`)}`;
        console.log(`  PUT ${base} (${(size / 1048576).toFixed(2)} MB)`);
        const blob = putBlob(f, pathname, contentType);
        const asset = {
          id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: `${titlePrefix} — ${base}`,
          kind: kindFrom(base, contentType),
          contentType,
          size,
          url: blob.url,
          pathname: blob.pathname,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        uploaded.push(asset);
        log.push({ zip: rel, file: base, url: asset.url, ok: true });
      } catch (e) {
        console.error("  FAIL", path.basename(f), e.message);
        log.push({ zip: rel, file: path.basename(f), error: String(e.message || e) });
      }
    }
    rmSync(EXTRACT, { recursive: true, force: true });
  }

  console.log(`\nRegistering ${uploaded.length} media…`);
  const overlay = readOverlay();
  const existing = new Set(overlay.media.map((m) => m.url));
  const fresh = uploaded.filter((a) => !existing.has(a.url));
  overlay.media = [...fresh, ...overlay.media];
  writeOverlay(overlay);

  const report = {
    wave: WAVE,
    batch: BATCH,
    at: new Date().toISOString(),
    uploaded: uploaded.length,
    registered: fresh.length,
    assets: uploaded.map(({ title, kind, url, size }) => ({ title, kind, url, size })),
    log,
  };
  writeFileSync(path.join(STAGING, "UPLOAD_REPORT.json"), JSON.stringify(report, null, 2));
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(path.join(DATA_DIR, `batch${BATCH}-manifest.json`), JSON.stringify(report, null, 2));
  console.log("Done.", path.join(STAGING, "UPLOAD_REPORT.json"));
}

main();
