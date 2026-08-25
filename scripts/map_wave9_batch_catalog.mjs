/**
 * Map Wave 9 Batch N Blob assets into overlay courses + books.
 * Usage: node scripts/map_wave9_batch_catalog.mjs 1
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

const BATCH = Number(process.argv[2] || "1");
const OVERLAY_PATH = "imu/catalog-overlay.json";
const STAGING = path.join(process.env.USERPROFILE || "", "OneDrive", "Desktop", "iMU-import", "wave9", `batch-${BATCH}`);
const REPORT = path.join(STAGING, "UPLOAD_REPORT.json");

const ALL_DESKS = {
  "goal-architecture-desk": {
    id: "c-w9-goalarchitecture",
    bookId: "b-w9-goalarchitecture",
    slug: "goal-architecture-desk",
    title: "Goal Architecture Desk",
    faculty: "Personal Development",
    category: "personal-development",
    summary: "Build goal systems that survive the week \u2014 architecture over motivation theater.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /goal|architecture|desk/i,
  },
  "boundaries-ops-desk": {
    id: "c-w9-boundariesops",
    bookId: "b-w9-boundariesops",
    slug: "boundaries-ops-desk",
    title: "Boundaries Ops Desk",
    faculty: "Personal Development",
    category: "personal-development",
    summary: "Protect focus and surplus with boundaries that work at work \u2014 not guilt scripts.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /boundaries|ops|desk/i,
  },
  "empathy-skills-desk": {
    id: "c-w9-empathyskills",
    bookId: "b-w9-empathyskills",
    slug: "empathy-skills-desk",
    title: "Empathy Skills Desk",
    faculty: "Personal Development",
    category: "personal-development",
    summary: "Read rooms and lead people without soft-skill fluff \u2014 empathy as an operating skill.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /empathy|skills|desk/i,
  },
  "chatbot-ops-desk": {
    id: "c-w9-chatbotops",
    bookId: "b-w9-chatbotops",
    slug: "chatbot-ops-desk",
    title: "Chatbot Ops Desk",
    faculty: "E-Commerce",
    category: "e-commerce",
    summary: "Ship chatbots that qualify and convert \u2014 implementation without endless bot theater.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /chatbot|ops|desk/i,
  },
  "case-study-sales-desk": {
    id: "c-w9-casestudysales",
    bookId: "b-w9-casestudysales",
    slug: "case-study-sales-desk",
    title: "Case Study Sales Desk",
    faculty: "Marketing",
    category: "marketing",
    summary: "Turn proof into close \u2014 case study frameworks that sell B2B without hype decks.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /case|study|sales|desk/i,
  },
  "atomic-execution-desk": {
    id: "c-w9-atomicexecution",
    bookId: "b-w9-atomicexecution",
    slug: "atomic-execution-desk",
    title: "Atomic Execution Desk",
    faculty: "Personal Development",
    category: "personal-development",
    summary: "Break overwhelm into shippable units \u2014 execution systems for operators under load.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /atomic|execution|desk/i,
  },
  "digital-presence-desk": {
    id: "c-w9-digitalpresence",
    bookId: "b-w9-digitalpresence",
    slug: "digital-presence-desk",
    title: "Digital Presence Desk",
    faculty: "Marketing",
    category: "marketing",
    summary: "Own how you show up online \u2014 presence systems that attract surplus, not noise.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /digital|presence|desk/i,
  },
  "workshop-revenue-desk": {
    id: "c-w9-workshoprevenue",
    bookId: "b-w9-workshoprevenue",
    slug: "workshop-revenue-desk",
    title: "Workshop Revenue Desk",
    faculty: "Wealth Creation",
    category: "wealth-creation",
    summary: "Run workshops that print consistent revenue \u2014 format, delivery, and monetization.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /workshop|revenue|desk/i,
  },
  "ecommerce-automation-desk": {
    id: "c-w9-ecommerceautomat",
    bookId: "b-w9-ecommerceautomat",
    slug: "ecommerce-automation-desk",
    title: "E-Commerce Automation Desk",
    faculty: "E-Commerce",
    category: "e-commerce",
    summary: "Automate store ops so SKUs and cashflow run without babysitting every order.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /e|commerce|automation|desk/i,
  },
  "investor-readiness-desk": {
    id: "c-w9-investorreadines",
    bookId: "b-w9-investorreadines",
    slug: "investor-readiness-desk",
    title: "Investor Readiness Desk",
    faculty: "Investing",
    category: "investing",
    summary: "Pass the checks investors run \u2014 business model, capital, and readiness without theater.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /investor|readiness|desk/i,
  },
};

const DESKS = Object.fromEntries(
  Object.entries(ALL_DESKS).filter(([slug]) => {
    try {
      const inv = JSON.parse(readFileSync(path.join(process.cwd(), "data", "entrepedia-wave9", "inventory.json"), "utf8"));
      const desk = inv.desks.find((d) => d.slug === slug);
      return desk && Number(desk.download_batch) === BATCH;
    } catch {
      return true;
    }
  }),
);

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
    .replace(/\.(pdf|m4a|mp3|mp4|wav|aac|webm|mov)$/i, "")
    .replace(/\s+-\s+(Ebook|Book|Mini-Course|Guide|Listicle|Checklist|Prompts|Promps|Workbook|Toolstack)$/i, "")
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
      id: `m-w9b${BATCH}-${Math.random().toString(36).slice(2, 8)}`,
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

  const waveIds = new Set();
  for (const [prefix] of groups) {
    const desk = DESKS[prefix];
    if (!desk) continue;
    waveIds.add(desk.id);
    if (desk.bookId) waveIds.add(desk.bookId);
  }
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
    const videos = assets.filter((a) => a.kind === "video").sort((a, b) => fileFromTitle(a.title).localeCompare(fileFromTitle(b.title)));
    const pdfs = assets
      .filter((a) => a.kind === "pdf")
      .filter((a) => !/how to use email mini-course/i.test(fileFromTitle(a.title)))
      .sort((a, b) => fileFromTitle(a.title).localeCompare(fileFromTitle(b.title)));
    const cover = pickCover(assets);
    const flagship = (desk.flagshipPdf ? pdfs.find((a) => desk.flagshipPdf.test(fileFromTitle(a.title))) : null) || pdfs[0] || null;
    const modules = [];
    if (audios.length) {
      modules.push({
        id: `${desk.id}-m-audio`,
        title: "Audio desk",
        lessons: audios.map((a, i) => toLesson(desk.id, "audio", i, a)),
        quiz: defaultQuiz(`${desk.id}-audio`, desk.title),
      });
    }
    if (videos.length) {
      modules.push({
        id: `${desk.id}-m-video`,
        title: "Video desk",
        lessons: videos.map((a, i) => toLesson(desk.id, "video", i, a)),
        quiz: defaultQuiz(`${desk.id}-video`, desk.title),
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

    mapped.push({ prefix, course: desk.title, audio: audios.length, video: videos.length, pdfs: pdfs.length, book: Boolean(desk.bookId && flagship) });
  }

  const prunedCourses = pruneEmptyCourses(overlay);
  const prunedBooks = pruneEmptyBooks(overlay);
  const written = putOverlay(overlay);
  const outDir = path.join(process.cwd(), "data", "entrepedia-wave9");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    path.join(outDir, `batch${BATCH}-catalog.json`),
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
