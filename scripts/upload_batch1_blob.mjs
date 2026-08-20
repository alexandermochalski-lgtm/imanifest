/**
 * Upload Entrepedia Batch 1 media to Vercel Blob + register in catalog overlay.
 *
 * Requires: BLOB_READ_WRITE_TOKEN in env or .env.local
 * Run: node --env-file=.env.local scripts/upload_batch1_blob.mjs
 *
 * Uploads only: pdf, mp3/m4a/wav, mp4/webm, jpg/png/webp/gif
 * Skips: docx, macosx junk, duplicate covers when PDF present (still uploads covers)
 */
import { existsSync, mkdirSync, readdirSync, statSync, rmSync, writeFileSync, readFileSync } from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { tmpdir } from "os";
// Load .env.local if present (no dependency on dotenv)
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
loadEnvFile(path.join(process.cwd(), ".env.vercel.tmp"));

const TOKEN = (process.env.BLOB_READ_WRITE_TOKEN || "").replace(/\s+/g, "");
if (!TOKEN) {
  console.error("Missing BLOB_READ_WRITE_TOKEN. Add it to .env.local or run: npx vercel env pull .env.local");
  process.exit(1);
}
console.log(`Token ok (${TOKEN.length} chars)`);

const STAGING = process.env.IMU_STAGING || path.join(process.env.USERPROFILE || "", "OneDrive", "Desktop", "iMU-import", "batch-1");
const EXTRACT = path.join(STAGING, "_extract");
const OVERLAY_PATH = "imu/catalog-overlay.json";
const ALLOWED_EXT = new Set([".pdf", ".mp3", ".m4a", ".wav", ".aac", ".mp4", ".webm", ".mov", ".jpg", ".jpeg", ".png", ".webp", ".gif"]);
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

function emptyOverlay() {
  return { courses: [], books: [], media: [], members: {} };
}

function kindFrom(name, type) {
  if (type.startsWith("video/") || /\.(mp4|mov|webm)$/i.test(name)) return "video";
  if (type.startsWith("audio/") || /\.(mp3|wav|m4a|aac)$/i.test(name)) return "audio";
  if (type === "application/pdf" || /\.pdf$/i.test(name)) return "pdf";
  if (type.startsWith("image/")) return "image";
  return "other";
}

function listZips(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && !ent.name.startsWith("_") && ent.name !== "node_modules") {
      out.push(...listZips(p));
    } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".zip")) {
      out.push(p);
    }
  }
  return out;
}

function walkFiles(dir, acc = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.name === "__MACOSX" || ent.name.startsWith("._")) continue;
    if (ent.isDirectory()) walkFiles(p, acc);
    else acc.push(p);
  }
  return acc;
}

function expandZip(zipPath, dest) {
  mkdirSync(dest, { recursive: true });
  // Prefer PowerShell Expand-Archive on Windows
  if (process.platform === "win32") {
    execFileSync(
      "powershell.exe",
      ["-NoProfile", "-Command", `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${dest.replace(/'/g, "''")}' -Force`],
      { stdio: "inherit" },
    );
    return;
  }
  execFileSync("unzip", ["-o", zipPath, "-d", dest], { stdio: "inherit" });
}

function safeName(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
}

function storeIdFromToken(token) {
  const m = token.match(/^vercel_blob_rw_([^_]+)_/);
  return m ? m[1] : "";
}

function putBlob(filePath, pathname, { contentType, addRandomSuffix, allowOverwrite }) {
  const api = `https://vercel.com/api/blob?pathname=${encodeURIComponent(pathname)}`;
  const args = [
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
    `x-add-random-suffix: ${addRandomSuffix ? "1" : "0"}`,
    "-H",
    `x-allow-overwrite: ${allowOverwrite ? "1" : "0"}`,
    "-H",
    `x-content-type: ${contentType}`,
    "-T",
    filePath,
  ];
  const out = execFileSync("curl.exe", args, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  return JSON.parse(out);
}

async function readOverlay() {
  const storeId = storeIdFromToken(TOKEN);
  if (!storeId) return emptyOverlay();
  const url = `https://${storeId}.private.blob.vercel-storage.com/${OVERLAY_PATH}`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) return emptyOverlay();
    return { ...emptyOverlay(), ...(await res.json()) };
  } catch {
    return emptyOverlay();
  }
}

async function writeOverlay(overlay) {
  const tmp = path.join(tmpdir(), "imu-catalog-overlay.json");
  writeFileSync(tmp, JSON.stringify(overlay, null, 2), "utf8");
  putBlob(tmp, OVERLAY_PATH, {
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function uploadFile(filePath, titlePrefix) {
  const ext = path.extname(filePath).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) return null;
  const base = path.basename(filePath);
  const contentType = MIME[ext] || "application/octet-stream";
  const size = statSync(filePath).size;
  if (size > 500 * 1024 * 1024) {
    console.warn("SKIP too large", base, size);
    return null;
  }
  const pathname = `imu/media/batch1/${safeName(titlePrefix + "-" + base)}`;
  console.log(`  PUT ${base} (${(size / 1024 / 1024).toFixed(2)} MB)`);
  const blob = putBlob(filePath, pathname, {
    contentType,
    addRandomSuffix: true,
    allowOverwrite: false,
  });
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `${titlePrefix} — ${base}`,
    kind: kindFrom(base, contentType),
    contentType,
    size,
    url: blob.url,
    pathname: blob.pathname,
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

async function main() {
  if (!existsSync(STAGING)) {
    console.error("Staging not found:", STAGING);
    process.exit(1);
  }
  const zips = listZips(STAGING);
  console.log(`Found ${zips.length} ZIPs under ${STAGING}`);
  const uploaded = [];
  const log = [];

  for (const zip of zips) {
    const rel = path.relative(STAGING, zip);
    const titlePrefix = path.basename(path.dirname(zip));
    console.log(`\n== ${rel}`);
    if (existsSync(EXTRACT)) rmSync(EXTRACT, { recursive: true, force: true });
    mkdirSync(EXTRACT, { recursive: true });
    try {
      expandZip(zip, EXTRACT);
    } catch (e) {
      console.error("Expand failed", zip, e.message);
      log.push({ zip: rel, error: String(e.message || e) });
      continue;
    }
    const files = walkFiles(EXTRACT).filter((f) => ALLOWED_EXT.has(path.extname(f).toLowerCase()));
    console.log(`  ${files.length} uploadable files`);
    for (const f of files) {
      try {
        const asset = await uploadFile(f, titlePrefix);
        if (asset) {
          uploaded.push(asset);
          log.push({ zip: rel, file: path.basename(f), url: asset.url, ok: true });
        }
      } catch (e) {
        console.error("  FAIL", path.basename(f), e.message);
        log.push({ zip: rel, file: path.basename(f), error: String(e.message || e) });
      }
    }
    rmSync(EXTRACT, { recursive: true, force: true });
  }

  console.log(`\nRegistering ${uploaded.length} assets in overlay…`);
  const overlay = await readOverlay();
  // Dedupe by pathname prefix title
  const existingTitles = new Set(overlay.media.map((m) => m.title));
  const fresh = uploaded.filter((a) => !existingTitles.has(a.title));
  overlay.media = [...fresh, ...overlay.media];
  await writeOverlay(overlay);

  const reportPath = path.join(STAGING, "UPLOAD_REPORT.json");
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        uploaded: uploaded.length,
        registered: fresh.length,
        assets: uploaded.map((a) => ({ title: a.title, kind: a.kind, url: a.url, size: a.size })),
        log,
      },
      null,
      2,
    ),
  );
  console.log("Done. Report:", reportPath);
  console.log(`Uploaded ${uploaded.length}, newly registered ${fresh.length}. Open /admin/media to attach.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
