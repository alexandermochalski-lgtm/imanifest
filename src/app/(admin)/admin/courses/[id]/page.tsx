import Link from "next/link";
import { notFound } from "next/navigation";
import { attachLessonMedia, setCourseStatus } from "@/app/actions/catalog";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { Flash, GoldButton } from "@/components/ui";
import { campusMediaHref } from "@/lib/blob-access";
import { getLiveCourseById, getMediaLibrary } from "@/lib/live-catalog";

export default async function AdminCourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { id } = await params;
  const { ok } = await searchParams;
  const course = await getLiveCourseById(id);
  if (!course) notFound();
  const media = await getMediaLibrary();

  return (
    <main>
      <PageHeader
        kicker={course.faculty}
        title={course.title}
        description={`${course.category} · ${course.price === 0 ? "free" : `${course.price} coins`} · ${course.modules.length} modules`}
        action={
          <Link className="ghost-btn rounded-xl px-4 py-2 text-[10px]" href="/admin/courses">
            Catalog
          </Link>
        }
      />
      <Flash
        map={{ created: "Course is live on campus.", media: "Lesson media attached.", status: "Visibility updated." }}
        ok={ok}
      />
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <StatusBadge status={course.status} />
        <form action={setCourseStatus} className="flex items-center gap-2">
          <input name="courseId" type="hidden" value={course.id} />
          <input name="status" type="hidden" value={course.status === "active" ? "hidden" : "active"} />
          <GoldButton type="submit">{course.status === "active" ? "Hide from campus" : "Publish"}</GoldButton>
        </form>
        <Link className="text-sm text-gold" href={`/courses/${course.slug}`}>
          View as student
        </Link>
      </div>
      <div className="space-y-6">
        {course.modules.map((module) => (
          <section key={module.id} className="rounded-2xl border border-[var(--line)] p-5">
            <h2 className="text-lg text-white">{module.title}</h2>
            <ul className="mt-4 space-y-5">
              {module.lessons.map((lesson) => (
                <li key={lesson.id} className="border-t border-[var(--line)] pt-4">
                  <p className="text-white">
                    {lesson.title} · {lesson.kind}
                  </p>
                  {lesson.mediaUrl ? (
                    <a className="text-xs text-gold" href={campusMediaHref(lesson.mediaUrl) ?? lesson.mediaUrl} rel="noreferrer" target="_blank">
                      Current file
                    </a>
                  ) : (
                    <p className="text-xs text-muted">No file attached</p>
                  )}
                  <form action={attachLessonMedia} className="mt-3 grid gap-3 md:grid-cols-4">
                    <input name="courseId" type="hidden" value={course.id} />
                    <input name="lessonId" type="hidden" value={lesson.id} />
                    <label className="text-xs text-muted">
                      Library
                      <select className="mt-1 w-full px-3 py-2" name="mediaId">
                        <option value="">Choose file</option>
                        {media.map((asset) => (
                          <option key={asset.id} value={asset.id}>
                            {asset.title} ({asset.kind})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs text-muted md:col-span-2">
                      Or URL
                      <input className="mt-1 w-full px-3 py-2" defaultValue={lesson.mediaUrl ?? ""} name="mediaUrl" />
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
                    <div className="md:col-span-4">
                      <GoldButton type="submit">Save lesson media</GoldButton>
                    </div>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
