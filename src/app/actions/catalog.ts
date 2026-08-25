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

function revalidateCatalog(extra: string[] = []) {
  revalidatePath("/admin");
  revalidatePath("/admin/media");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/books");
  revalidatePath("/courses");
  revalidatePath("/library");
  revalidatePath("/programs");
  revalidatePath("/campus");
  for (const path of extra) revalidatePath(path);
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
  const coverMediaId = String(formData.get("coverMediaId") ?? "").trim() || undefined;
  const coverUrl = String(formData.get("coverUrl") ?? "").trim() || undefined;
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
    coverUrl,
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
    const coverAsset = overlay.media.find((item) => item.id === coverMediaId);
    if (coverAsset?.kind === "image" || coverAsset?.contentType.startsWith("image/")) {
      course.coverUrl = coverAsset.url;
    }
    return { ...overlay, courses: [course, ...overlay.courses] };
  });
  // Land on the list — soft-nav to the new detail page often raced Blob reads and showed a blank notFound.
  revalidateCatalog([`/admin/courses/${course.id}`, `/courses/${course.slug}`]);
  redirect("/admin/courses?ok=created");
}

export async function updateCourse(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  const course = await getLiveCourseById(courseId);
  if (!course) redirect("/admin/courses?error=missing");

  const title = String(formData.get("title") ?? "").trim();
  const faculty = String(formData.get("faculty") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const duration = String(formData.get("duration") ?? "").trim() || course.duration;
  const category = String(formData.get("category") ?? course.category) as CategorySlug;
  const level = levels.includes(String(formData.get("level")) as Course["level"])
    ? (String(formData.get("level")) as Course["level"])
    : course.level;
  const price = Number(formData.get("price") ?? course.price);
  if (!title || !faculty || !summary) redirect(`/admin/courses/${courseId}?error=invalid`);
  if (!categories.some((item) => item.slug === category)) redirect(`/admin/courses/${courseId}?error=invalid`);

  let slug = slugify(title);
  const live = await getLiveCourses();
  if (live.some((item) => item.slug === slug && item.id !== courseId)) slug = `${slug}-${courseId.slice(-4)}`;

  await mutateOverlay((current) => ({
    ...current,
    courses: upsert(current.courses, {
      ...course,
      title,
      faculty,
      summary,
      duration,
      category,
      level,
      slug,
      price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : course.price,
    }),
  }));
  revalidateCatalog([`/admin/courses/${courseId}`, `/courses/${slug}`]);
  redirect(`/admin/courses/${courseId}?ok=updated`);
}

export async function deleteCourse(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  const course = await getLiveCourseById(courseId);
  if (!course) redirect("/admin/courses?error=missing");
  await mutateOverlay((current) => ({
    ...current,
    courses: current.courses.filter((item) => item.id !== courseId),
  }));
  revalidateCatalog([`/admin/courses/${courseId}`, `/courses/${course.slug}`]);
  redirect("/admin/courses?ok=deleted");
}

export async function addModule(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim() || "New module";
  const course = await getLiveCourseById(courseId);
  if (!course) redirect("/admin/courses?error=missing");
  const moduleId = `${courseId}-m${Date.now().toString(36)}`;
  const lessonId = `${moduleId}-l1`;
  await mutateOverlay((current) => ({
    ...current,
    courses: upsert(current.courses, {
      ...course,
      modules: [
        ...course.modules,
        {
          id: moduleId,
          title,
          lessons: [
            {
              id: lessonId,
              title: "Opening lesson",
              kind: "video" as LessonKind,
              duration: "12 min",
              body: "",
            },
          ],
          quiz: defaultQuiz(moduleId, title),
        },
      ],
    }),
  }));
  revalidateCatalog([`/admin/courses/${courseId}`]);
  redirect(`/admin/courses/${courseId}?ok=module`);
}

export async function updateModule(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const course = await getLiveCourseById(courseId);
  if (!course || !title) redirect(`/admin/courses/${courseId}?error=invalid`);
  await mutateOverlay((current) => ({
    ...current,
    courses: upsert(current.courses, {
      ...course,
      modules: course.modules.map((module) => (module.id === moduleId ? { ...module, title } : module)),
    }),
  }));
  revalidateCatalog([`/admin/courses/${courseId}`]);
  redirect(`/admin/courses/${courseId}?ok=module`);
}

export async function deleteModule(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "");
  const course = await getLiveCourseById(courseId);
  if (!course) redirect("/admin/courses?error=missing");
  if (course.modules.length <= 1) redirect(`/admin/courses/${courseId}?error=lastmodule`);
  await mutateOverlay((current) => ({
    ...current,
    courses: upsert(current.courses, {
      ...course,
      modules: course.modules.filter((module) => module.id !== moduleId),
    }),
  }));
  revalidateCatalog([`/admin/courses/${courseId}`]);
  redirect(`/admin/courses/${courseId}?ok=module`);
}

export async function addLesson(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "");
  const title = String(formData.get("title") ?? "").trim() || "New lesson";
  const kind = (String(formData.get("kind") ?? "video") as LessonKind) || "video";
  const course = await getLiveCourseById(courseId);
  if (!course) redirect("/admin/courses?error=missing");
  const lessonId = `${moduleId}-l${Date.now().toString(36)}`;
  await mutateOverlay((current) => ({
    ...current,
    courses: upsert(current.courses, {
      ...course,
      modules: course.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: [
                ...module.lessons,
                { id: lessonId, title, kind, duration: "12 min", body: "" },
              ],
            }
          : module,
      ),
    }),
  }));
  revalidateCatalog([`/admin/courses/${courseId}`]);
  redirect(`/admin/courses/${courseId}?ok=lesson`);
}

export async function updateLesson(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  const title = String(formData.get("title") ?? "")
    .trim()
    .replace(/\.(wav|m4a|mp3|mp4|pdf|mov|webm)$/i, "");
  const kind = (String(formData.get("kind") ?? "video") as LessonKind) || "video";
  const duration = String(formData.get("duration") ?? "").trim() || "12 min";
  const mediaId = String(formData.get("mediaId") ?? "").trim();
  const mediaUrl = String(formData.get("mediaUrl") ?? "").trim();
  const course = await getLiveCourseById(courseId);
  if (!course || !title) redirect(`/admin/courses/${courseId}?error=invalid`);
  await mutateOverlay((current) => {
    const library = mediaId ? current.media.find((item) => item.id === mediaId) : undefined;
    const url = library?.url || mediaUrl || undefined;
    const nextKind =
      library?.kind === "audio" || library?.kind === "video" || library?.kind === "pdf"
        ? library.kind
        : kind || "video";
    return {
      ...current,
      courses: upsert(current.courses, {
        ...course,
        modules: course.modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) =>
            lesson.id === lessonId
              ? {
                  ...lesson,
                  title,
                  kind: nextKind,
                  duration,
                  ...(url
                    ? { mediaUrl: url, mediaId: library?.id ?? lesson.mediaId }
                    : mediaId === "" && mediaUrl === ""
                      ? {}
                      : { mediaUrl: undefined, mediaId: undefined }),
                }
              : lesson,
          ),
        })),
      }),
    };
  });
  revalidateCatalog([`/admin/courses/${courseId}`]);
  redirect(`/admin/courses/${courseId}?ok=lesson`);
}

export async function deleteLesson(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  const course = await getLiveCourseById(courseId);
  if (!course) redirect("/admin/courses?error=missing");
  const target = course.modules.find((module) => module.id === moduleId);
  if (!target || target.lessons.length <= 1) redirect(`/admin/courses/${courseId}?error=lastlesson`);
  await mutateOverlay((current) => ({
    ...current,
    courses: upsert(current.courses, {
      ...course,
      modules: course.modules.map((module) =>
        module.id === moduleId
          ? { ...module, lessons: module.lessons.filter((lesson) => lesson.id !== lessonId) }
          : module,
      ),
    }),
  }));
  revalidateCatalog([`/admin/courses/${courseId}`]);
  redirect(`/admin/courses/${courseId}?ok=lesson`);
}

export async function setCourseCover(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  const coverMediaId = String(formData.get("coverMediaId") ?? "").trim();
  const coverUrl = String(formData.get("coverUrl") ?? "").trim();
  const course = await getLiveCourseById(courseId);
  if (!course) redirect("/admin/courses?error=missing");

  await mutateOverlay((current) => {
    const fromLibrary = current.media.find((item) => item.id === coverMediaId);
    const nextCover =
      fromLibrary && (fromLibrary.kind === "image" || fromLibrary.contentType.startsWith("image/"))
        ? fromLibrary.url
        : coverUrl || undefined;
    return {
      ...current,
      courses: upsert(current.courses, { ...course, coverUrl: nextCover || undefined }),
    };
  });
  revalidateCatalog();
  redirect(`/admin/courses/${courseId}?ok=cover`);
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
  const tagValues = formData
    .getAll("tags")
    .map((value) => String(value))
    .filter((value): value is CategorySlug => categories.some((item) => item.slug === value));
  const tags = [...new Set(tagValues.filter((value) => value !== category))];
  const pages = Number(formData.get("pages") ?? 0);
  const price = Number(formData.get("price") ?? 0);
  const fileUrl = String(formData.get("fileUrl") ?? "").trim() || undefined;
  const mediaId = String(formData.get("mediaId") ?? "").trim();
  const coverMediaId = String(formData.get("coverMediaId") ?? "").trim();
  const coverUrl = String(formData.get("coverUrl") ?? "").trim() || undefined;
  if (!title || !author || !summary) redirect("/admin/books/new?error=invalid");
  if (!categories.some((item) => item.slug === category)) redirect("/admin/books/new?error=invalid");

  const id = `b-${Date.now().toString(36)}`;
  await mutateOverlay((overlay) => {
    const fromLibrary = overlay.media.find((item) => item.id === mediaId);
    const coverAsset = overlay.media.find((item) => item.id === coverMediaId);
    const book: Book = {
      id,
      slug: slugify(title),
      title,
      author,
      category,
      tags: tags.length ? tags : undefined,
      pages: Number.isFinite(pages) ? Math.max(1, Math.round(pages)) : 1,
      summary,
      price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0,
      fileUrl: fromLibrary?.url || fileUrl,
      coverUrl:
        coverAsset && (coverAsset.kind === "image" || coverAsset.contentType.startsWith("image/"))
          ? coverAsset.url
          : coverUrl,
    };
    if (overlay.books.some((item) => item.slug === book.slug)) book.slug = `${book.slug}-${id.slice(-4)}`;
    return { ...overlay, books: [book, ...overlay.books] };
  });
  revalidateCatalog();
  redirect("/admin/books?ok=created");
}

export async function updateBook(formData: FormData) {
  await requireAdmin();
  const bookId = String(formData.get("bookId") ?? "");
  const book = await getLiveBookById(bookId);
  if (!book) redirect("/admin/books?error=missing");
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const category = String(formData.get("category") ?? book.category) as CategorySlug;
  const tagValues = formData
    .getAll("tags")
    .map((value) => String(value))
    .filter((value): value is CategorySlug => categories.some((item) => item.slug === value));
  const tags = [...new Set(tagValues.filter((value) => value !== category))];
  const pages = Number(formData.get("pages") ?? book.pages);
  const price = Number(formData.get("price") ?? book.price);
  const coverMediaId = String(formData.get("coverMediaId") ?? "").trim();
  const coverUrl = String(formData.get("coverUrl") ?? "").trim();
  if (!title || !author || !summary) redirect(`/admin/books/${bookId}?error=invalid`);

  await mutateOverlay((current) => {
    const coverAsset = current.media.find((item) => item.id === coverMediaId);
    const nextCover =
      coverAsset && (coverAsset.kind === "image" || coverAsset.contentType.startsWith("image/"))
        ? coverAsset.url
        : coverUrl || book.coverUrl;
    let slug = slugify(title);
    if (current.books.some((item) => item.slug === slug && item.id !== bookId)) {
      slug = `${slug}-${bookId.slice(-4)}`;
    }
    return {
      ...current,
      books: upsert(current.books, {
        ...book,
        title,
        author,
        summary,
        slug,
        category,
        tags: tags.length ? tags : undefined,
        pages: Number.isFinite(pages) ? Math.max(1, Math.round(pages)) : book.pages,
        price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : book.price,
        coverUrl: nextCover || undefined,
      }),
    };
  });
  revalidateCatalog([`/admin/books/${bookId}`, "/library"]);
  redirect(`/admin/books/${bookId}?ok=updated`);
}

export async function setBookCover(formData: FormData) {
  await requireAdmin();
  const bookId = String(formData.get("bookId") ?? "");
  const coverMediaId = String(formData.get("coverMediaId") ?? "").trim();
  const coverUrl = String(formData.get("coverUrl") ?? "").trim();
  const book = await getLiveBookById(bookId);
  if (!book) redirect("/admin/books?error=missing");

  await mutateOverlay((current) => {
    const fromLibrary = current.media.find((item) => item.id === coverMediaId);
    const nextCover =
      fromLibrary && (fromLibrary.kind === "image" || fromLibrary.contentType.startsWith("image/"))
        ? fromLibrary.url
        : coverUrl || undefined;
    return {
      ...current,
      books: upsert(current.books, { ...book, coverUrl: nextCover || undefined }),
    };
  });
  revalidateCatalog([`/admin/books/${bookId}`, "/library"]);
  redirect(`/admin/books/${bookId}?ok=cover`);
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

export async function saveDeskContent(formData: FormData) {
  await requireAdmin();
  const pinTitle = String(formData.get("pinTitle") ?? "").trim();
  const pinBody = String(formData.get("pinBody") ?? "").trim();
  const pinAttribution = String(formData.get("pinAttribution") ?? "").trim();
  const noteTitle = String(formData.get("noteTitle") ?? "").trim();
  const noteBody = String(formData.get("noteBody") ?? "").trim();
  if (!pinTitle || !pinBody) redirect("/admin/content?error=missing");

  await mutateOverlay((current) => {
    const existingNotes = current.desk?.founderNotes ?? [];
    const noteImage = String(formData.get("noteImageUrl") ?? "").trim() || undefined;
    const founderNotes =
      noteTitle && noteBody
        ? [
            {
              id: `fn-${Date.now().toString(36)}`,
              title: noteTitle,
              body: noteBody,
              imageUrl: noteImage,
            },
            ...existingNotes,
          ].slice(0, 60)
        : existingNotes;
    return {
      ...current,
      desk: {
        pin: { title: pinTitle, body: pinBody, attribution: pinAttribution || undefined },
        founderNotes,
      },
    };
  });
  revalidateCatalog(["/campus", "/admin/content"]);
  redirect("/admin/content?ok=desk");
}
