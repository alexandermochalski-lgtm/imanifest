import { books as seedBooks, courses as seedCourses } from "@/lib/catalog";
import { readOverlay } from "@/lib/storage";
import type { Book, Course, Lesson, MediaAsset, Quiz } from "@/lib/types";

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

/**
 * Live course catalog.
 * Once Blob overlay has Wave courses, seed placeholders are dropped entirely
 * so menus/admin match what is actually deliverable in storage.
 */
export async function getLiveCourses(): Promise<Course[]> {
  const overlay = await readOverlay();
  if (overlay.courses.length > 0) {
    return [...overlay.courses];
  }
  return mergeById(seedCourses, overlay.courses);
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

export async function getMediaLibrary(): Promise<MediaAsset[]> {
  const overlay = await readOverlay();
  return [...overlay.media].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
