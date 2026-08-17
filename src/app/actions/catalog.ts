"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { categories } from "@/lib/catalog";
import { defaultQuiz, getLiveBookById, getLiveCourseById, getLiveCourses, slugify } from "@/lib/live-catalog";
import { getSession } from "@/lib/session";
import { hasBlobToken, kindFromContentType, mutateOverlay, readOverlay } from "@/lib/storage";
import type { Book, CategorySlug, Course, LessonKind, MediaAsset } from "@/lib/types";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/access-denied");
  return session;
}

function revalidateCatalog() {
  revalidatePath("/admin");
  revalidatePath("/admin/media");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/books");
  revalidatePath("/courses");
  revalidatePath("/library");
  revalidatePath("/programs");
  revalidatePath("/campus");
}

const levels: Course["level"][] = ["Foundation", "Practitioner", "Mastery"];

function upsert<T extends { id: string }>(list: T[], item: T) {
  return list.some((row) => row.id === item.id) ? list.map((row) => (row.id === item.id ? item : row)) : [item, ...list];
}

export async function registerMedia(input: {
  title: string;
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}) {
  await requireAdmin();
  const asset: MediaAsset = {
    id: `m-${Date.now()}`,
    title: input.title || input.pathname.split("/").pop() || "Upload",
    kind: kindFromContentType(input.contentType, input.pathname),
    contentType: input.contentType,
    size: input.size,
    url: input.url,
    pathname: input.pathname,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  await mutateOverlay((overlay) => ({ ...overlay, media: [asset, ...overlay.media] }));
  revalidateCatalog();
  return asset;
}

export async function deleteMedia(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const overlay = await readOverlay();
  const asset = overlay.media.find((item) => item.id === id);
  if (asset && hasBlobToken() && !asset.pathname.startsWith("local/")) {
    try {
      const { del } = await import("@vercel/blob");
      await del(asset.url);
    } catch {
      // Keep the desk row gone even if Blob delete fails.
    }
  }
  await mutateOverlay((current) => ({
    ...current,
    media: current.media.filter((item) => item.id !== id),
  }));
  revalidateCatalog();
  redirect("/admin/media?ok=deleted");
}

export async function createCourse(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const faculty = String(formData.get("faculty") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const duration = String(formData.get("duration") ?? "").trim() || "4 weeks";
  const category = String(formData.get("category") ?? "wealth-creation") as CategorySlug;
  const level = levels.includes(String(formData.get("level")) as Course["level"])
    ? (String(formData.get("level")) as Course["level"])
    : "Foundation";
  const price = Number(formData.get("price") ?? 0);
  const lessonTitle = String(formData.get("lessonTitle") ?? "").trim() || "Opening lesson";
  const lessonKind = (String(formData.get("lessonKind") ?? "video") as LessonKind) || "video";
  const mediaUrl = String(formData.get("mediaUrl") ?? "").trim() || undefined;
  const mediaId = String(formData.get("mediaId") ?? "").trim() || undefined;
  if (!title || !faculty || !summary) redirect("/admin/courses/new?error=invalid");
  if (!categories.some((item) => item.slug === category)) redirect("/admin/courses/new?error=invalid");

  const id = `c-${Date.now().toString(36)}`;
  const live = await getLiveCourses();
  let slug = slugify(title);
  if (live.some((item) => item.slug === slug)) slug = `${slug}-${id.slice(-4)}`;
  const course: Course = {
    id,
    slug,
    title,
    faculty,
    category,
    duration,
    level,
    price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0,
    summary,
    status: "active",
    modules: [
      {
        id: `${id}-m1`,
        title: "Opening",
        lessons: [
          {
            id: `${id}-m1-l1`,
            title: lessonTitle,
            kind: lessonKind,
            duration: "12 min",
            body: summary,
            mediaUrl,
            mediaId,
          },
        ],
        quiz: defaultQuiz(`${id}-m1`, title),
      },
    ],
  };

  await mutateOverlay((overlay) => {
    const fromLibrary = overlay.media.find((item) => item.id === mediaId);
    if (fromLibrary) {
      const lesson = course.modules[0]?.lessons[0];
      if (lesson) {
        lesson.mediaUrl = fromLibrary.url;
        lesson.mediaId = fromLibrary.id;
        if (fromLibrary.kind === "audio" || fromLibrary.kind === "video" || fromLibrary.kind === "pdf") {
          lesson.kind = fromLibrary.kind;
        }
      }
    }
    return { ...overlay, courses: [course, ...overlay.courses] };
  });
  revalidateCatalog();
  redirect(`/admin/courses/${course.id}?ok=created`);
}

export async function attachLessonMedia(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  const mediaId = String(formData.get("mediaId") ?? "").trim();
  const mediaUrl = String(formData.get("mediaUrl") ?? "").trim();
  const kind = String(formData.get("kind") ?? "") as LessonKind;
  const course = await getLiveCourseById(courseId);
  if (!course) redirect("/admin/courses?error=missing");

  await mutateOverlay((current) => {
    const library = current.media.find((item) => item.id === mediaId);
    const url = library?.url || mediaUrl || undefined;
    const nextKind =
      library?.kind === "audio" || library?.kind === "video" || library?.kind === "pdf"
        ? library.kind
        : kind || "video";
    const patched: Course = {
      ...course,
      modules: course.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, mediaUrl: url, mediaId: library?.id, kind: nextKind } : lesson,
        ),
      })),
    };
    return { ...current, courses: upsert(current.courses, patched) };
  });
  revalidateCatalog();
  redirect(`/admin/courses/${courseId}?ok=media`);
}

export async function setCourseStatus(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  const status = String(formData.get("status") ?? "") === "hidden" ? "hidden" : "active";
  const course = await getLiveCourseById(courseId);
  if (!course) redirect("/admin/courses?error=missing");
  await mutateOverlay((current) => ({
    ...current,
    courses: upsert(current.courses, { ...course, status }),
  }));
  revalidateCatalog();
  redirect(`/admin/courses/${courseId}?ok=status`);
}

export async function createBook(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const category = String(formData.get("category") ?? "wealth-creation") as CategorySlug;
  const pages = Number(formData.get("pages") ?? 0);
  const price = Number(formData.get("price") ?? 0);
  const fileUrl = String(formData.get("fileUrl") ?? "").trim() || undefined;
  const mediaId = String(formData.get("mediaId") ?? "").trim();
  if (!title || !author || !summary) redirect("/admin/books/new?error=invalid");

  const id = `b-${Date.now().toString(36)}`;
  await mutateOverlay((overlay) => {
    const fromLibrary = overlay.media.find((item) => item.id === mediaId);
    const book: Book = {
      id,
      slug: slugify(title),
      title,
      author,
      category,
      pages: Number.isFinite(pages) ? Math.max(1, Math.round(pages)) : 1,
      summary,
      price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0,
      fileUrl: fromLibrary?.url || fileUrl,
    };
    if (overlay.books.some((item) => item.slug === book.slug)) book.slug = `${book.slug}-${id.slice(-4)}`;
    return { ...overlay, books: [book, ...overlay.books] };
  });
  revalidateCatalog();
  redirect("/admin/books?ok=created");
}

export async function attachBookFile(formData: FormData) {
  await requireAdmin();
  const bookId = String(formData.get("bookId") ?? "");
  const mediaId = String(formData.get("mediaId") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();
  const book = await getLiveBookById(bookId);
  if (!book) redirect("/admin/books?error=missing");
  await mutateOverlay((current) => {
    const fromLibrary = current.media.find((item) => item.id === mediaId);
    return {
      ...current,
      books: upsert(current.books, { ...book, fileUrl: fromLibrary?.url || fileUrl || book.fileUrl }),
    };
  });
  revalidateCatalog();
  redirect(`/admin/books/${bookId}?ok=file`);
}
