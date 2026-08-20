/**
 * Map Batch 1 Blob assets into overlay courses + library books.
 * Run: node scripts/map_batch1_catalog.mjs
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { tmpdir } from "os";

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

const OVERLAY_PATH = "imu/catalog-overlay.json";
const STAGING = process.env.IMU_STAGING || path.join(process.env.USERPROFILE || "", "OneDrive", "Desktop", "iMU-import", "batch-1");
const REPORT = path.join(STAGING, "UPLOAD_REPORT.json");

const SKIP_PDF = /how to use email mini-course/i;

const DESKS = {
  "the-cash-flow-system-for-small-businesses": {
    id: "c-w1-cash-flow",
    bookId: "b-w1-cash-flow",
    slug: "cash-flow-desk-for-operators",
    title: "Cash Flow Desk for Operators",
    faculty: "Wealth Creation",
    category: "wealth-creation",
    summary: "Track, forecast, and stabilize business cash so growth does not starve the desk.",
    duration: "Self-paced",
    level: "Foundation",
    flagshipPdf: /cash flow system for small businesses - ebook/i,
  },
  "the-first-time-entrepreneur-launchpad": {
    id: "c-w1-launchpad",
    bookId: "b-w1-launchpad",
    slug: "first-seat-launchpad",
    title: "First Seat Launchpad",
    faculty: "Wealth Creation",
    category: "wealth-creation",
    summary: "Lean offer, pricing, and first-customer path for founders opening their first desk.",
    duration: "Self-paced",
    level: "Foundation",
    flagshipPdf: /first-time entrepreneur launchpad - book/i,
  },
  "package-what-you-know-into-a-high-ticket-offer": {
    id: "c-w1-high-ticket",
    bookId: "b-w1-high-ticket",
    slug: "high-ticket-offer-packaging",
    title: "High-Ticket Offer Packaging",
    faculty: "Marketing",
    category: "marketing",
    summary: "Turn expertise into a premium, deliverable offer with value-based pricing.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /package what you know into a high-ticket offer - ebook/i,
  },
  "beyond-side-hustle": {
    id: "c-w1-side-hustle",
    bookId: "b-w1-passive-stream",
    slug: "beyond-the-side-hustle",
    title: "Beyond the Side Hustle",
    faculty: "Wealth Creation",
    category: "wealth-creation",
    summary: "Score income models before you sink capital into the wrong passive bet.",
    duration: "Self-paced",
    level: "Foundation",
    flagshipPdf: /pick your passive income stream - ebook/i,
  },
  "cost-control-that-compounds": {
    id: "c-w1-cost-control",
    bookId: null,
    slug: "cost-control-that-compounds",
    title: "Cost Control That Compounds",
    faculty: "Wealth Creation",
    category: "wealth-creation",
    summary: "Cut costs without cutting the revenue engine.",
    duration: "Self-paced",
    level: "Foundation",
    flagshipPdf: null,
  },
  "the-freelancers-cash-bridge": {
    id: "c-w1-freelancer",
    bookId: "b-w1-freelancer",
    slug: "freelancer-cash-bridge",
    title: "Freelancer Cash Bridge",
    faculty: "Wealth Creation",
    category: "wealth-creation",
    summary: "Bridge Net-30 gaps with productized offers and marketplace-ready listings.",
    duration: "Self-paced",
    level: "Foundation",
    flagshipPdf: /cash bridge - book/i,
  },
};

function storeIdFromToken(token) {
  const m = token.match(/^vercel_blob_rw_([^_]+)_/);
  return m ? m[1] : "";
}

function readOverlay() {
  const storeId = storeIdFromToken(TOKEN);
  const url = `https://${storeId}.private.blob.vercel-storage.com/${OVERLAY_PATH}`;
  try {
    const out = execFileSync(
      "curl.exe",
      ["-sS", "--fail-with-body", "--max-time", "30", "-H", `Authorization: Bearer ${TOKEN}`, url],
      { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
    );
    return { courses: [], books: [], media: [], members: {}, ...JSON.parse(out) };
  } catch {
    return { courses: [], books: [], media: [], members: {} };
  }
}

function putOverlay(overlay) {
  const tmp = path.join(tmpdir(), "imu-catalog-overlay.json");
  writeFileSync(tmp, JSON.stringify(overlay, null, 2), "utf8");
  const api = `https://vercel.com/api/blob?pathname=${encodeURIComponent(OVERLAY_PATH)}`;
  const out = execFileSync(
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
  return JSON.parse(out);
}

function prefixFromTitle(title) {
  const i = title.indexOf(" — ");
  return i >= 0 ? title.slice(0, i) : "";
}

function fileFromTitle(title) {
  const i = title.indexOf(" — ");
  return i >= 0 ? title.slice(i + 3) : title;
}

function lessonKind(asset) {
  if (asset.kind === "audio" || asset.kind === "video" || asset.kind === "pdf") return asset.kind;
  return "reading";
}

function durationFor(asset) {
  if (asset.kind === "audio") {
    const min = Math.max(8, Math.round(asset.size / 1024 / 1024));
    return `${min} min`;
  }
  if (asset.kind === "pdf") return "12 min";
  return "8 min";
}

function cleanLessonTitle(filename) {
  return filename
    .replace(/\.(pdf|m4a|mp3|mp4)$/i, "")
    .replace(/\s+-\s+(Ebook|Book|Mini-Course|Guide|Listicle|Checklist|Prompts|Promps)$/i, "")
    .replace(/^Ep\.\s*/i, "Episode ")
    .trim();
}

function defaultQuiz(prefix, title) {
  return {
    id: `${prefix}-quiz`,
    title: `${title} exam`,
    passMark: 70,
    questions: [
      { id: `${prefix}-q1`, prompt: "This iMU method is for…", options: ["Entertainment", "Making money with a process", "Likes", "Hope"], answerIndex: 1, marks: 25 },
      { id: `${prefix}-q2`, prompt: "A hobby is…", options: ["A business", "Unpriced time", "Alpha", "A coin pack"], answerIndex: 1, marks: 25 },
      { id: `${prefix}-q3`, prompt: "Journal the…", options: ["Vibe", "Surplus", "Hashtags", "Luck"], answerIndex: 1, marks: 25 },
      { id: `${prefix}-q4`, prompt: "Kill anything that is still…", options: ["Priced", "A hobby", "Documented", "Enrolled"], answerIndex: 1, marks: 25 },
    ],
  };
}

function pickCover(assets) {
  const book = assets.find((a) => a.kind === "image" && /book cover/i.test(fileFromTitle(a.title)));
  const artPng = assets.find((a) => a.kind === "image" && /artwork\.png$/i.test(fileFromTitle(a.title)));
  const art = assets.find((a) => a.kind === "image" && /artwork\.(jpg|jpeg|png)$/i.test(fileFromTitle(a.title)));
  return book || artPng || art || null;
}

function toLesson(courseId, moduleKey, index, asset) {
  const name = fileFromTitle(asset.title);
  return {
    id: `${courseId}-${moduleKey}-l${index + 1}`,
    title: cleanLessonTitle(name),
    kind: lessonKind(asset),
    duration: durationFor(asset),
    body: "Included with an active campus seat. Enroll to open the file.",
    mediaUrl: asset.url,
    mediaId: asset.id,
  };
}

function main() {
  if (!existsSync(REPORT)) {
    console.error("Missing upload report:", REPORT);
    process.exit(1);
  }
  const report = JSON.parse(readFileSync(REPORT, "utf8"));
  const overlay = readOverlay();
  const byUrl = new Map(overlay.media.map((m) => [m.url, m]));

  const groups = new Map();
  for (const raw of report.assets) {
    const prefix = prefixFromTitle(raw.title);
    if (!prefix) continue;
    const live = byUrl.get(raw.url) || {
      id: `m-w1-${Math.random().toString(36).slice(2, 8)}`,
      title: raw.title,
      kind: raw.kind,
      contentType: raw.kind === "pdf" ? "application/pdf" : raw.kind === "audio" ? "audio/mp4" : "image/jpeg",
      size: raw.size,
      url: raw.url,
      pathname: new URL(raw.url).pathname.replace(/^\//, ""),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    if (!byUrl.has(raw.url)) overlay.media.unshift(live);
    if (!groups.has(prefix)) groups.set(prefix, []);
    groups.get(prefix).push(live);
  }

  const waveIds = new Set(Object.values(DESKS).flatMap((d) => [d.id, d.bookId].filter(Boolean)));
  overlay.courses = overlay.courses.filter((c) => !waveIds.has(c.id));
  overlay.books = overlay.books.filter((b) => !waveIds.has(b.id));

  const mapped = [];

  for (const [prefix, assets] of groups) {
    const desk = DESKS[prefix];
    if (!desk) {
      console.warn("Unmapped prefix", prefix);
      continue;
    }
    const audios = assets
      .filter((a) => a.kind === "audio")
      .sort((a, b) => fileFromTitle(a.title).localeCompare(fileFromTitle(b.title)));
    const pdfs = assets
      .filter((a) => a.kind === "pdf" && !SKIP_PDF.test(fileFromTitle(a.title)))
      .sort((a, b) => fileFromTitle(a.title).localeCompare(fileFromTitle(b.title)));
    const cover = pickCover(assets);
    const flagship = desk.flagshipPdf ? pdfs.find((a) => desk.flagshipPdf.test(fileFromTitle(a.title))) : null;

    const modules = [];
    if (audios.length) {
      modules.push({
        id: `${desk.id}-m-audio`,
        title: "Audio desk",
        lessons: audios.map((a, i) => toLesson(desk.id, "audio", i, a)),
        quiz: defaultQuiz(`${desk.id}-audio`, desk.title),
      });
    }
    if (pdfs.length) {
      modules.push({
        id: `${desk.id}-m-playbooks`,
        title: "Playbooks",
        lessons: pdfs.map((a, i) => toLesson(desk.id, "pdf", i, a)),
        quiz: defaultQuiz(`${desk.id}-pdf`, desk.title),
      });
    }
    if (!modules.length) continue;

    overlay.courses.unshift({
      id: desk.id,
      slug: desk.slug,
      title: desk.title,
      faculty: desk.faculty,
      category: desk.category,
      duration: desk.duration,
      level: desk.level,
      price: 0,
      summary: desk.summary,
      status: "active",
      coverUrl: cover?.url,
      modules,
    });

    if (desk.bookId && flagship) {
      overlay.books.unshift({
        id: desk.bookId,
        slug: `${desk.slug}-book`,
        title: desk.title,
        author: "iManifest University",
        category: desk.category,
        pages: Math.max(40, Math.round(flagship.size / 8000)),
        summary: desk.summary,
        price: 0,
        fileUrl: flagship.url,
        coverUrl: cover?.url,
      });
    }

    mapped.push({
      prefix,
      course: desk.title,
      audio: audios.length,
      pdfs: pdfs.length,
      book: Boolean(desk.bookId && flagship),
    });
  }

  const written = putOverlay(overlay);
  const out = path.join(process.cwd(), "data", "entrepedia-wave1", "batch1-catalog.json");
  writeFileSync(out, JSON.stringify({ at: new Date().toISOString(), mapped, blob: written.pathname }, null, 2));
  console.log(JSON.stringify({ mapped, courses: overlay.courses.filter((c) => String(c.id).startsWith("c-w1")).length, books: overlay.books.filter((b) => String(b.id).startsWith("b-w1")).length }, null, 2));
  console.log("Wrote overlay", written.pathname);
}

try {
  main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
