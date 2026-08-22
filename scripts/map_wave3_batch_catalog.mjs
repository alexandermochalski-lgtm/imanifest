/**
 * Map Wave 3 Batch N Blob assets into overlay courses + books.
 * Usage: node scripts/map_wave3_batch_catalog.mjs 1
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
const STAGING = path.join(process.env.USERPROFILE || "", "OneDrive", "Desktop", "iMU-import", "wave3", `batch-${BATCH}`);
const REPORT = path.join(STAGING, "UPLOAD_REPORT.json");
const SKIP_PDF = /how to use email mini-course/i;

const ALL_DESKS = {
  "youtube-ads-desk": {
    id: "c-w3-youtube",
    bookId: "b-w3-youtube",
    slug: "youtube-ads-desk",
    title: "YouTube Ads Desk",
    faculty: "Social Media",
    category: "social-media",
    summary: "Setup, optimize, and scale YouTube campaigns that buy attention profitably.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /youtube|5-second|accelerator/i,
  },
  "google-ads-desk": {
    id: "c-w3-google",
    bookId: "b-w3-google",
    slug: "google-ads-desk",
    title: "Google Ads Desk",
    faculty: "Marketing",
    category: "marketing",
    summary: "Search, Performance Max, and local Google growth without burning CAC.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /google search ads unlocked - ebook|google search ads unlocked(?!.*-)/i,
  },
  "meta-ads-desk": {
    id: "c-w3-meta",
    bookId: "b-w3-meta",
    slug: "meta-ads-desk",
    title: "Meta Ads Desk",
    faculty: "Marketing",
    category: "marketing",
    summary: "Affordable Meta ads systems for testing, creative, and paid traffic.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /meta ads made affordable - ebook|meta ads made affordable(?!.*-)/i,
  },
  "pinterest-profit-desk": {
    id: "c-w3-pinterest",
    bookId: "b-w3-pinterest",
    slug: "pinterest-profit-desk",
    title: "Pinterest Profit Desk",
    faculty: "Social Media",
    category: "social-media",
    summary: "Evergreen pin systems that turn search traffic into leads and sales.",
    duration: "Self-paced",
    level: "Foundation",
    flagshipPdf: /pinterest for profit/i,
  },
  "tiktok-shop-desk": {
    id: "c-w3-tiktok",
    bookId: "b-w3-tiktok",
    slug: "tiktok-shop-desk",
    title: "TikTok Shop Desk",
    faculty: "E-Commerce",
    category: "e-commerce",
    summary: "TikTok Shop content and seller systems for converting short-form attention.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /tiktok shop mastery|power of tiktok/i,
  },
  "funnel-desk": {
    id: "c-w3-funnel",
    bookId: "b-w3-funnel",
    slug: "funnel-that-sells",
    title: "Funnel That Sells Desk",
    faculty: "Marketing",
    category: "marketing",
    summary: "Map and run funnels that convert clicks into cashflow.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /funnel that sells|funnel mapping/i,
  },
  "affiliate-desk": {
    id: "c-w3-affiliate",
    bookId: "b-w3-affiliate",
    slug: "high-ticket-affiliate-desk",
    title: "High-Ticket Affiliate Desk",
    faculty: "Marketing",
    category: "marketing",
    summary: "High-ticket affiliate systems, offers, and promotion stacks.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /high-ticket affiliate|affiliate marketing - guide|affiliate marketing - ebook/i,
  },
  "cold-email-desk": {
    id: "c-w3-cold-email",
    bookId: "b-w3-cold-email",
    slug: "cold-email-desk",
    title: "Cold Email Desk",
    faculty: "Marketing",
    category: "marketing",
    summary: "Cold email sequences that open conversations without spam theater.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /cold email marketing - ebook|cold email marketing - guide/i,
  },
  "lifecycle-email-desk": {
    id: "c-w3-lifecycle",
    bookId: "b-w3-lifecycle",
    slug: "lifecycle-email-desk",
    title: "Lifecycle Email Desk",
    faculty: "Marketing",
    category: "marketing",
    summary: "Lifecycle and inbox systems that keep buyers moving after the first sale.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /lifecycle email marketing - ebook|beyond the inbox - ebook/i,
  },
  "linkedin-ads-desk": {
    id: "c-w3-linkedin",
    bookId: "b-w3-linkedin",
    slug: "linkedin-ads-desk",
    title: "LinkedIn Ads Desk",
    faculty: "Marketing",
    category: "marketing",
    summary: "B2B LinkedIn ads for leads, forms, and creative tests.",
    duration: "Self-paced",
    level: "Practitioner",
    flagshipPdf: /linkedin|b2b leads/i,
  },
  "podcast-desk": {
    id: "c-w3-podcast",
    bookId: "b-w3-podcast",
    slug: "podcast-launch-desk",
    title: "Podcast Launch Desk",
    faculty: "Social Media",
    category: "social-media",
    summary: "Launch and grow a podcast that compounds authority and distribution.",
    duration: "Self-paced",
    level: "Foundation",
    flagshipPdf: /podcaster|podcast launch|podcast creation/i,
  },
  "website-desk": {
    id: "c-w3-website",
    bookId: "b-w3-website",
    slug: "website-builder-desk",
    title: "Website Builder Desk",
    faculty: "E-Commerce",
    category: "e-commerce",
    summary: "Ship business websites that convert instead of decorating.",
    duration: "Self-paced",
    level: "Foundation",
    flagshipPdf: /business websites mastery - ebook|how to build a website/i,
  },
};

const DESKS = Object.fromEntries(
  Object.entries(ALL_DESKS).filter(([slug]) => {
    // filter by inventory batch if available
    try {
      const inv = JSON.parse(readFileSync(path.join(process.cwd(), "data", "entrepedia-wave3", "inventory.json"), "utf8"));
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
    .replace(/\.(pdf|m4a|mp3|mp4)$/i, "")
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
      id: `m-w3b${BATCH}-${Math.random().toString(36).slice(2, 8)}`,
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
    const videos = assets.filter((a) => a.kind === "video").sort((a, b) => fileFromTitle(a.title).localeCompare(fileFromTitle(b.title)));
    const pdfs = assets
      .filter((a) => a.kind === "pdf" && !SKIP_PDF.test(fileFromTitle(a.title)))
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
  const outDir = path.join(process.cwd(), "data", "entrepedia-wave3");
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
