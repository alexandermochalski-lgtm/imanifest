/**
 * Map Wave 2 Batch 3 Blob assets into overlay courses + library books.
 * Run after: node scripts/upload_batch_blob.mjs wave2 3
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
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
const STAGING = path.join(process.env.USERPROFILE || "", "OneDrive", "Desktop", "iMU-import", "wave2", "batch-3");
const REPORT = path.join(STAGING, "UPLOAD_REPORT.json");
const SKIP_PDF = /how to use email mini-course/i;

const DESKS = {
  "self-care-without-the-guilt": {
    id: "c-w2-selfcare",
    bookId: "b-w2-selfcare",
    slug: "self-care-without-guilt",
    title: "Self-Care Without Guilt",
    faculty: "Fitness & Nutrition",
    category: "fitness-nutrition",
    summary: "Recovery systems operators can keep without abandoning the desk.",
    duration: "Self-paced",
    level: "Foundation",
    flagshipPdf: /self-care without|self care without/i,
  },
  "the-neuroinclusive-managers-playbook": {
    id: "c-w2-neuroinclusive",
    bookId: "b-w2-neuroinclusive",
    slug: "neuroinclusive-manager-desk",
    title: "Neuroinclusive Manager Desk",
    faculty: "Personal Development",
    category: "personal-development",
    summary: "Lead mixed cognition teams without burning trust or output.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /neuroinclusive/i,
  },
  "the-connection-code": {
    id: "c-w2-connection",
    bookId: "b-w2-connection",
    slug: "connection-code-desk",
    title: "Connection Code Desk",
    faculty: "Personal Development",
    category: "personal-development",
    summary: "Build high-trust network capital that opens deals and mandates.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /connection code/i,
  },
  "digital-detox-for-founders": {
    id: "c-w2-detox",
    bookId: "b-w2-detox",
    slug: "founder-digital-detox",
    title: "Founder Digital Detox",
    faculty: "Personal Development",
    category: "personal-development",
    summary: "Cut attention leaks so founders reclaim deep work and surplus.",
    duration: "Self-paced",
    level: "Foundation",
    flagshipPdf: /digital detox/i,
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
    const out = execFileSync("curl.exe", ["-sS", "--fail-with-body", "--max-time", "60", "-H", `Authorization: Bearer ${TOKEN}`, url], {
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    });
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
  if (asset.kind === "audio") return `${Math.max(8, Math.round(asset.size / 1024 / 1024))} min`;
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
  return {
    id: `${courseId}-${moduleKey}-l${index + 1}`,
    title: cleanLessonTitle(fileFromTitle(asset.title)),
    kind: lessonKind(asset),
    duration: durationFor(asset),
    body: "Included with an active campus seat. Enroll to open the file.",
    mediaUrl: asset.url,
    mediaId: asset.id,
  };
}

function pruneEmptyCourses(overlay) {
  const before = overlay.courses.length;
  overlay.courses = overlay.courses.filter((course) =>
    course.modules?.some((m) => m.lessons?.some((l) => Boolean(l.mediaUrl))),
  );
  return { removed: before - overlay.courses.length, kept: overlay.courses.length };
}

function pruneEmptyBooks(overlay) {
  const before = overlay.books.length;
  overlay.books = overlay.books.filter((book) => Boolean(book.fileUrl));
  return { removed: before - overlay.books.length, kept: overlay.books.length };
}

function main() {
  if (!existsSync(REPORT)) {
    console.error("Missing", REPORT);
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
      id: `m-w2b3-${Math.random().toString(36).slice(2, 8)}`,
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
    const audios = assets.filter((a) => a.kind === "audio").sort((a, b) => fileFromTitle(a.title).localeCompare(fileFromTitle(b.title)));
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

    mapped.push({ prefix, course: desk.title, audio: audios.length, pdfs: pdfs.length, book: Boolean(desk.bookId && flagship) });
  }

  const prunedCourses = pruneEmptyCourses(overlay);
  const prunedBooks = pruneEmptyBooks(overlay);
  const written = putOverlay(overlay);
  const outDir = path.join(process.cwd(), "data", "entrepedia-wave2");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    path.join(outDir, "batch3-catalog.json"),
    JSON.stringify({ at: new Date().toISOString(), mapped, prunedCourses, prunedBooks, blob: written.pathname }, null, 2),
  );
  console.log(JSON.stringify({ mapped, courses: mapped.length, prunedCourses, prunedBooks }, null, 2));
  console.log("Wrote overlay", written.pathname);
}

try {
  main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
