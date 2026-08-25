import { books as seedBooks, bundles as seedBundles, courses as seedCourses } from "@/lib/catalog";
import { readOverlay } from "@/lib/storage";
import type { Book, Bundle, CategorySlug, Course, Lesson, MediaAsset, Quiz } from "@/lib/types";

export function defaultQuiz(prefix: string, title: string): Quiz {
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

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "item"
  );
}

function mergeById<T extends { id: string }>(seed: T[], extra: T[]): T[] {
  const map = new Map(seed.map((item) => [item.id, item]));
  for (const item of extra) map.set(item.id, item);
  return [...map.values()];
}

/** True when at least one lesson has attached Blob/local media. */
export function courseHasPlayableMedia(course: Course): boolean {
  return course.modules.some((module) => module.lessons.some((lesson) => Boolean(lesson.mediaUrl)));
}

export function bookHasFile(book: Book): boolean {
  return Boolean(book.fileUrl);
}

export function lessonIsPlayable(lesson: Lesson): boolean {
  return Boolean(lesson.mediaUrl);
}

/** Strip file extensions left on imported lesson titles. */
export function cleanLessonTitle(title: string) {
  return title.replace(/\.(wav|m4a|mp3|mp4|pdf|mov|webm|aac)$/i, "").trim();
}

function polishCourse(course: Course): Course {
  return {
    ...course,
    modules: course.modules.map((module) => ({
      ...module,
      lessons: module.lessons
        .filter((lesson) => !/^how to use email mini-course$/i.test(cleanLessonTitle(lesson.title)))
        .map((lesson) => ({ ...lesson, title: cleanLessonTitle(lesson.title) })),
    })),
  };
}

/**
 * Live course catalog.
 * Once Blob overlay has Wave courses, seed placeholders are dropped entirely
 * so menus/admin match what is actually deliverable in storage.
 */
export async function getLiveCourses(): Promise<Course[]> {
  const overlay = await readOverlay();
  if (overlay.courses.length > 0) {
    return overlay.courses.map(polishCourse);
  }
  return mergeById(seedCourses, overlay.courses).map(polishCourse);
}

/** Campus + marketing menu: only active courses that actually have media. */
export async function getDeliverableCourses(): Promise<Course[]> {
  return (await getLiveCourses()).filter((course) => course.status === "active" && courseHasPlayableMedia(course));
}

export async function getLiveBooks(): Promise<Book[]> {
  const overlay = await readOverlay();
  if (overlay.books.length > 0) {
    return [...overlay.books];
  }
  return mergeById(seedBooks, overlay.books);
}

/** Library menu: only books with an attached PDF/file. */
export async function getDeliverableBooks(): Promise<Book[]> {
  return (await getLiveBooks()).filter(bookHasFile);
}

export async function getLiveCourseBySlug(slug: string) {
  return (await getLiveCourses()).find((course) => course.slug === slug);
}

export async function getLiveCourseById(id: string) {
  return (await getLiveCourses()).find((course) => course.id === id);
}

export async function getLiveBookBySlug(slug: string) {
  return (await getLiveBooks()).find((book) => book.slug === slug);
}

export async function getLiveBookById(id: string) {
  return (await getLiveBooks()).find((book) => book.id === id);
}

/** Seed bundles plus any admin-created overlay bundles (overlay wins on id). */
export async function getLiveBundles(): Promise<Bundle[]> {
  const overlay = await readOverlay();
  const deleted = new Set(overlay.deletedBundleIds ?? []);
  return mergeById(seedBundles, overlay.bundles ?? []).filter((bundle) => !deleted.has(bundle.id));
}

export async function getLiveBundleBySlug(slug: string) {
  return (await getLiveBundles()).find((bundle) => bundle.slug === slug);
}

export async function getLiveBundleById(id: string) {
  return (await getLiveBundles()).find((bundle) => bundle.id === id);
}

export async function getMediaLibrary(): Promise<MediaAsset[]> {
  const overlay = await readOverlay();
  return [...overlay.media].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function bookCategories(book: Book): CategorySlug[] {
  const tags = book.tags ?? [];
  return [...new Set([book.category, ...tags])];
}

export function bookMatchesCategory(book: Book, category?: string) {
  if (!category) return true;
  return bookCategories(book).includes(category as CategorySlug);
}

export async function getLiveGuides() {
  const { guides: seedGuides } = await import("@/lib/catalog");
  const overlay = await readOverlay();
  if (overlay.guides && overlay.guides.length > 0) {
    const map = new Map(seedGuides.map((item) => [item.id, item]));
    for (const item of overlay.guides) map.set(item.id, item);
    return [...map.values()];
  }
  return seedGuides;
}

export async function getLiveGuideBySlug(slug: string) {
  return (await getLiveGuides()).find((guide) => guide.slug === slug);
}

export function guideTags(guide: { tag: string; tags?: string[] }) {
  return [...new Set([guide.tag, ...(guide.tags ?? [])])];
}

export function guideMatchesTag(guide: { tag: string; tags?: string[] }, tag?: string) {
  if (!tag) return true;
  return guideTags(guide).includes(tag);
}

export async function getDeskContent() {
  const overlay = await readOverlay();
  return {
    pin: overlay.desk?.pin,
    founderNotes: overlay.desk?.founderNotes ?? [],
  };
}
