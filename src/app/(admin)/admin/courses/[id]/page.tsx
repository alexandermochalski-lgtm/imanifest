import Link from "next/link";
import { redirect } from "next/navigation";
import {
  addLesson,
  addModule,
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
import { categories } from "@/lib/catalog";
import { getLiveCourseById, getMediaLibrary } from "@/lib/live-catalog";
import { storageMode } from "@/lib/storage";

function relatedLessonFiles(
  files: { id: string; title: string; kind: string; url: string }[],
  slug: string,
) {
  const needle = slug.toLowerCase();
  const related = files.filter((asset) => asset.title.toLowerCase().includes(needle));
  return related.length ? related : files.slice(0, 80);
}

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
  const images = media
    .filter((asset) => asset.kind === "image" || asset.contentType.startsWith("image/"))
    .map((asset) => ({ id: asset.id, title: asset.title }));
  const lessonFiles = media
    .filter((asset) => asset.kind === "video" || asset.kind === "audio" || asset.kind === "pdf")
    .map((asset) => ({ id: asset.id, title: asset.title, kind: asset.kind, url: asset.url }));
  const courseFiles = relatedLessonFiles(lessonFiles, course.slug);
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
        <h2 className="text-lg text-white">Course details</h2>
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
        <h2 className="text-lg text-white">Cover</h2>
        <form action={setCourseCover} className="mt-4 grid max-w-3xl gap-4">
          <input name="courseId" type="hidden" value={course.id} />
          <CourseCoverField
            initialUrl={course.coverUrl}
            library={(() => {
              const related = images.filter((asset) =>
                asset.title.toLowerCase().includes(course.slug.toLowerCase()),
              );
              return related.length ? related : images.slice(0, 60);
            })()}
            mode={mode}
          />
          <GoldButton pendingLabel="Saving…" type="submit">
            Save cover
          </GoldButton>
        </form>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg text-white">Curriculum</h2>
            <p className="mt-1 text-sm text-muted">
              One save per lesson updates title, type, duration, and file.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {course.modules.map((module, moduleIndex) => (
            <section key={module.id} className="imu-section rounded-2xl p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <form action={updateModule} className="flex min-w-[16rem] flex-1 flex-wrap items-end gap-3">
                  <input name="courseId" type="hidden" value={course.id} />
                  <input name="moduleId" type="hidden" value={module.id} />
                  <label className="min-w-[14rem] flex-1 text-xs text-muted">
                    Module {moduleIndex + 1}
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

              <ul className="mt-5 space-y-4">
                {module.lessons.map((lesson, lessonIndex) => (
                  <li key={lesson.id} className="rounded-xl border border-[var(--line)] bg-black/15 p-4">
                    <form action={updateLesson} className="grid gap-3">
                      <input name="courseId" type="hidden" value={course.id} />
                      <input name="lessonId" type="hidden" value={lesson.id} />
                      <div className="grid gap-3 md:grid-cols-12 md:items-end">
                        <label className="text-xs text-muted md:col-span-6">
                          Lesson {lessonIndex + 1}
                          <input
                            className="mt-1 w-full px-3 py-2"
                            defaultValue={lesson.title}
                            name="title"
                            required
                          />
                        </label>
                        <label className="text-xs text-muted md:col-span-2">
                          Kind
                          <select className="mt-1 w-full px-3 py-2" defaultValue={lesson.kind} name="kind">
                            <option value="video">Video</option>
                            <option value="audio">Audio</option>
                            <option value="pdf">PDF</option>
                            <option value="reading">Reading</option>
                          </select>
                        </label>
                        <label className="text-xs text-muted md:col-span-2">
                          Duration
                          <input className="mt-1 w-full px-3 py-2" defaultValue={lesson.duration} name="duration" />
                        </label>
                        <div className="flex flex-wrap gap-2 md:col-span-2 md:justify-end">
                          <GoldButton pendingLabel="Saving…" type="submit">
                            Save
                          </GoldButton>
                        </div>
                      </div>
                      <LessonMediaField
                        compact
                        initialMediaId={lesson.mediaId}
                        initialUrl={lesson.mediaUrl}
                        library={courseFiles}
                        mode={mode}
                      />
                    </form>
                    <form action={deleteLesson} className="mt-3">
                      <input name="courseId" type="hidden" value={course.id} />
                      <input name="moduleId" type="hidden" value={module.id} />
                      <input name="lessonId" type="hidden" value={lesson.id} />
                      <ConfirmGoldButton
                        className="!bg-transparent !px-3 !py-1.5 !text-[11px] !text-red-200 border border-red-400/40"
                        confirmMessage={`Delete lesson “${lesson.title}”?`}
                        pendingLabel="Deleting…"
                      >
                        Delete lesson
                      </ConfirmGoldButton>
                    </form>
                  </li>
                ))}
              </ul>

              <form
                action={addLesson}
                className="mt-5 flex max-w-3xl flex-wrap items-end gap-3 border-t border-[var(--line)] pt-4"
              >
                <input name="courseId" type="hidden" value={course.id} />
                <input name="moduleId" type="hidden" value={module.id} />
                <label className="min-w-[12rem] flex-1 text-xs text-muted">
                  New lesson
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

        <form action={addModule} className="mt-6 flex max-w-3xl flex-wrap items-end gap-3 rounded-2xl border border-dashed border-[var(--line)] p-5">
          <input name="courseId" type="hidden" value={course.id} />
          <label className="min-w-[14rem] flex-1 text-xs text-muted">
            New module
            <input className="mt-1 w-full px-3 py-2" name="title" placeholder="Module title" />
          </label>
          <GoldButton pendingLabel="Adding…" type="submit">
            Add module
          </GoldButton>
        </form>
      </section>
    </main>
  );
}
