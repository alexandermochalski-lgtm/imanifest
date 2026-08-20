/**
 * Upload the Python-extracted Freelancer Cash Bridge files and append UPLOAD_REPORT.json
 */
import { existsSync, readdirSync, statSync, readFileSync, writeFileSync } from "fs";
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
  console.error("Missing token");
  process.exit(1);
}

const PREFIX = "the-freelancers-cash-bridge";
const ROOT = path.join(process.env.USERPROFILE || "", "OneDrive", "Desktop", "iMU-import", "batch-1", "_extract-freelancer");
const REPORT = path.join(process.env.USERPROFILE || "", "OneDrive", "Desktop", "iMU-import", "batch-1", "UPLOAD_REPORT.json");
const ALLOWED = new Set([".pdf", ".mp3", ".m4a", ".wav", ".aac", ".mp4", ".webm", ".mov", ".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MIME = {
  ".pdf": "application/pdf",
  ".m4a": "audio/mp4",
  ".mp3": "audio/mpeg",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

function walk(dir, acc = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.name === "__MACOSX" || ent.name.startsWith("._")) continue;
    if (ent.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function safeName(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
}

function kindFrom(name, type) {
  if (type.startsWith("audio/") || /\.(mp3|m4a)$/i.test(name)) return "audio";
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

const files = walk(ROOT).filter((f) => ALLOWED.has(path.extname(f).toLowerCase()));
console.log("uploadable", files.length);
const uploaded = [];
for (const f of files) {
  const ext = path.extname(f).toLowerCase();
  const base = path.basename(f);
  const contentType = MIME[ext] || "application/octet-stream";
  const size = statSync(f).size;
  const pathname = `imu/media/batch1/${safeName(`${PREFIX}-${base}`)}`;
  console.log(`PUT ${base} (${(size / 1048576).toFixed(2)} MB)`);
  const blob = putBlob(f, pathname, contentType);
  uploaded.push({
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `${PREFIX} — ${base}`,
    kind: kindFrom(base, contentType),
    contentType,
    size,
    url: blob.url,
    pathname: blob.pathname,
    createdAt: new Date().toISOString().slice(0, 10),
  });
}

const report = JSON.parse(readFileSync(REPORT, "utf8"));
report.assets.push(...uploaded.map(({ id, contentType, pathname, createdAt, ...rest }) => rest));
report.uploaded = report.assets.length;
report.log.push(...uploaded.map((a) => ({ zip: PREFIX, file: a.title, url: a.url, ok: true })));
writeFileSync(REPORT, JSON.stringify(report, null, 2));
console.log("added", uploaded.length, "total", report.uploaded);
