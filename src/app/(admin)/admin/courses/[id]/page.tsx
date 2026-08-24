import Link from "next/link";
import { redirect } from "next/navigation";
import {
  addLesson,
  addModule,
  attachLessonMedia,
  deleteCourse,
  deleteLesson,
  deleteModule,
  setCourseCover,
  setCourseStatus,
  updateCourse,
  updateLesson,
  updateModule,
} from "@/app/actions/catalog";
import { CourseCoverField } from "@/components/admin/CourseCoverField";
import { ConfirmGoldButton } from "@/components/admin/ConfirmGoldButton";
import { LessonMediaField } from "@/components/admin/LessonMediaField";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { Flash, GoldButton } from "@/components/ui";
import { campusMediaHref } from "@/lib/blob-access";
import { categories } from "@/lib/catalog";
import { getLiveCourseById, getMediaLibrary } from "@/lib/live-catalog";
import { storageMode } from "@/lib/storage";

export default async function AdminCourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const { ok, error } = await searchParams;
  const course = await getLiveCourseById(id);
  if (!course) redirect("/admin/courses?error=missing");
  const media = await getMediaLibrary();
  const images = media.filter((asset) => asset.kind === "image" || asset.contentType.startsWith("image/"));
  const lessonFiles = media.filter(
    (asset) => asset.kind === "video" || asset.kind === "audio" || asset.kind === "pdf",
  );
  const mode = storageMode();

  return (
    <main>
      <PageHeader
        kicker={course.faculty}
        title={course.title}
        description={`${course.category} · ${course.price === 0 ? "free" : `${course.price} coins`} · ${course.modules.length} modules`}
        action={
          <Link className="ghost-btn rounded-lg px-5 py-2.5 text-[11px]" href="/admin/courses">
            Catalog
          </Link>
        }
      />
      <Flash
        error={error}
        map={{
          created: "Course is live on campus.",
          media: "Lesson media attached.",
          status: "Visibility updated.",
          cover: "Course cover saved.",
          updated: "Course details saved.",
          module: "Module updated.",
          lesson: "Lesson updated.",
          invalid: "Title, faculty, and summary are required.",
          lastmodule: "Keep at least one module.",
          lastlesson: "Keep at least one lesson in each module.",
          missing: "Course not found.",
        }}
        ok={ok}
      />
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <StatusBadge status={course.status} />
        <form action={setCourseStatus} className="flex items-center gap-2">
          <input name="courseId" type="hidden" value={course.id} />
          <input name="status" type="hidden" value={course.status === "active" ? "hidden" : "active"} />
          <GoldButton pendingLabel="Saving…" type="submit">
            {course.status === "active" ? "Hide from campus" : "Publish"}
          </GoldButton>
        </form>
        <Link className="text-sm text-gold" href={`/courses/${course.slug}`}>
          View as student
        </Link>
        <form action={deleteCourse}>
          <input name="courseId" type="hidden" value={course.id} />
          <ConfirmGoldButton
            className="!bg-transparent !text-red-200 border border-red-400/40"
            confirmMessage={`Delete “${course.title}”? This cannot be undone.`}
            pendingLabel="Deleting…"
          >
            Delete course
          </ConfirmGoldButton>
        </form>
      </div>

      <section className="mb-8 imu-section rounded-2xl p-5 md:p-6">
        <h2 className="text-lg text-white">Edit course</h2>
        <form action={updateCourse} className="mt-4 grid max-w-3xl gap-4">
          <input name="courseId" type="hidden" value={course.id} />
          <label className="text-xs text-muted">
            Title
            <input className="mt-1 w-full px-3 py-2" defaultValue={course.title} name="title" required />
          </label>
          <label className="text-xs text-muted">
            Faculty
            <input className="mt-1 w-full px-3 py-2" defaultValue={course.faculty} name="faculty" required />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-xs text-muted">
              Category
              <select className="mt-1 w-full px-3 py-2" defaultValue={course.category} name="category">
                {categories.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted">
              Level
              <select className="mt-1 w-full px-3 py-2" defaultValue={course.level} name="level">
                <option>Foundation</option>
                <option>Practitioner</option>
                <option>Mastery</option>
              </select>
            </label>
            <label className="text-xs text-muted">
              Price (coins)
              <input className="mt-1 w-full px-3 py-2" defaultValue={course.price} min={0} name="price" type="number" />
            </label>
          </div>
          <label className="text-xs text-muted">
            Duration
            <input className="mt-1 w-full px-3 py-2" defaultValue={course.duration} name="duration" />
          </label>
          <label className="text-xs text-muted">
            Summary
            <span className="mt-0.5 block font-normal text-[10px] text-[var(--muted)]">
              Blank lines become paragraphs on campus.
            </span>
            <textarea className="mt-1 min-h-36 w-full px-3 py-2" defaultValue={course.summary} name="summary" required />
          </label>
          <GoldButton pendingLabel="Saving…" type="submit">
            Save details
          </GoldButton>
        </form>
      </section>

      <section className="mb-8 imu-section rounded-2xl p-5 md:p-6">
        <h2 className="text-lg text-white">Cover image</h2>
        <p className="mt-1 text-sm text-muted">Shown on campus course cards. Upload, paste a URL, or pick from the media library.</p>
        <form action={setCourseCover} className="mt-4 grid max-w-3xl gap-4">
          <input name="courseId" type="hidden" value={course.id} />
          <CourseCoverField initialUrl={course.coverUrl} mode={mode} />
          <label className="text-xs text-muted">
            Or pick from library
            <select className="mt-1 w-full px-3 py-2" name="coverMediaId">
              <option value="">Keep upload / URL above</option>
              {images.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.title}
                </option>
              ))}
            </select>
          </label>
          <GoldButton pendingLabel="Saving…" type="submit">
            Save cover
          </GoldButton>
        </form>
      </section>

      <section className="mb-8 imu-section rounded-2xl p-5 md:p-6">
        <h2 className="text-lg text-white">Add module</h2>
        <form action={addModule} className="mt-4 flex max-w-3xl flex-wrap items-end gap-3">
          <input name="courseId" type="hidden" value={course.id} />
          <label className="min-w-[14rem] flex-1 text-xs text-muted">
            Module title
            <input className="mt-1 w-full px-3 py-2" name="title" placeholder="Module 2" />
          </label>
          <GoldButton pendingLabel="Adding…" type="submit">
            Add module
          </GoldButton>
        </form>
      </section>

      <div className="space-y-6">
        {course.modules.map((module) => (
          <section key={module.id} className="imu-section rounded-2xl p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <form action={updateModule} className="flex min-w-[16rem] flex-1 flex-wrap items-end gap-3">
                <input name="courseId" type="hidden" value={course.id} />
                <input name="moduleId" type="hidden" value={module.id} />
                <label className="min-w-[14rem] flex-1 text-xs text-muted">
                  Module title
                  <input className="mt-1 w-full px-3 py-2" defaultValue={module.title} name="title" required />
                </label>
                <GoldButton pendingLabel="Saving…" type="submit">
                  Rename
                </GoldButton>
              </form>
              <form action={deleteModule}>
                <input name="courseId" type="hidden" value={course.id} />
                <input name="moduleId" type="hidden" value={module.id} />
                <ConfirmGoldButton
                  className="!bg-transparent !text-red-200 border border-red-400/40"
                  confirmMessage={`Delete module “${module.title}” and its lessons?`}
                  pendingLabel="Deleting…"
                >
                  Delete module
                </ConfirmGoldButton>
              </form>
            </div>

            <ul className="mt-4 space-y-5">
              {module.lessons.map((lesson) => (
                <li key={lesson.id} className="border-t border-[var(--line)] pt-4">
                  <form action={updateLesson} className="mb-4 grid max-w-3xl gap-3 md:grid-cols-4">
                    <input name="courseId" type="hidden" value={course.id} />
                    <input name="lessonId" type="hidden" value={lesson.id} />
                    <label className="text-xs text-muted md:col-span-2">
                      Lesson title
                      <input className="mt-1 w-full px-3 py-2" defaultValue={lesson.title} name="title" required />
                    </label>
                    <label className="text-xs text-muted">
                      Kind
                      <select className="mt-1 w-full px-3 py-2" defaultValue={lesson.kind} name="kind">
                        <option value="video">Video</option>
                        <option value="audio">Audio</option>
                        <option value="pdf">PDF</option>
                        <option value="reading">Reading</option>
                      </select>
                    </label>
                    <label className="text-xs text-muted">
                      Duration
                      <input className="mt-1 w-full px-3 py-2" defaultValue={lesson.duration} name="duration" />
                    </label>
                    <div className="flex flex-wrap gap-2 md:col-span-4">
                      <GoldButton pendingLabel="Saving…" type="submit">
                        Save lesson
                      </GoldButton>
                    </div>
                  </form>
                  <form action={deleteLesson} className="mb-4">
                    <input name="courseId" type="hidden" value={course.id} />
                    <input name="moduleId" type="hidden" value={module.id} />
                    <input name="lessonId" type="hidden" value={lesson.id} />
                    <ConfirmGoldButton
                      className="!bg-transparent !text-red-200 border border-red-400/40"
                      confirmMessage={`Delete lesson “${lesson.title}”?`}
                      pendingLabel="Deleting…"
                    >
                      Delete lesson
                    </ConfirmGoldButton>
                  </form>
                  {lesson.mediaUrl ? (
                    <a className="text-xs text-gold" href={campusMediaHref(lesson.mediaUrl) ?? lesson.mediaUrl} rel="noreferrer" target="_blank">
                      Current file
                    </a>
                  ) : (
                    <p className="text-xs text-muted">No file attached</p>
                  )}
                  <form action={attachLessonMedia} className="mt-3 grid max-w-3xl gap-4">
                    <input name="courseId" type="hidden" value={course.id} />
                    <input name="lessonId" type="hidden" value={lesson.id} />
                    <LessonMediaField
                      initialMediaId={lesson.mediaId}
                      initialUrl={lesson.mediaUrl}
                      library={lessonFiles.map((asset) => ({
                        id: asset.id,
                        title: asset.title,
                        kind: asset.kind,
                        url: asset.url,
                      }))}
                      mode={mode}
                    />
                    <input name="kind" type="hidden" value={lesson.kind} />
                    <GoldButton pendingLabel="Saving…" type="submit">
                      Save lesson media
                    </GoldButton>
                  </form>
                </li>
              ))}
            </ul>

            <form action={addLesson} className="mt-5 flex max-w-3xl flex-wrap items-end gap-3 border-t border-[var(--line)] pt-4">
              <input name="courseId" type="hidden" value={course.id} />
              <input name="moduleId" type="hidden" value={module.id} />
              <label className="min-w-[12rem] flex-1 text-xs text-muted">
                New lesson title
                <input className="mt-1 w-full px-3 py-2" name="title" placeholder="Lesson title" />
              </label>
              <label className="text-xs text-muted">
                Kind
                <select className="mt-1 w-full px-3 py-2" defaultValue="video" name="kind">
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="pdf">PDF</option>
                  <option value="reading">Reading</option>
                </select>
              </label>
              <GoldButton pendingLabel="Adding…" type="submit">
                Add lesson
              </GoldButton>
            </form>
          </section>
        ))}
      </div>
    </main>
  );
}
