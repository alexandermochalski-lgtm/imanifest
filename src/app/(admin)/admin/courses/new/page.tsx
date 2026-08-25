import Link from "next/link";
import { createCourse } from "@/app/actions/catalog";
import { CourseCoverField } from "@/components/admin/CourseCoverField";
import { LessonMediaField } from "@/components/admin/LessonMediaField";
import { PageHeader } from "@/components/admin/ui";
import { Flash, GoldButton } from "@/components/ui";
import { categories } from "@/lib/catalog";
import { getMediaLibrary } from "@/lib/live-catalog";
import { storageMode } from "@/lib/storage";

export default async function NewCoursePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const media = await getMediaLibrary();
  const images = media
    .filter((asset) => asset.kind === "image" || asset.contentType.startsWith("image/"))
    .map((asset) => ({ id: asset.id, title: asset.title }));
  const lessonFiles = media
    .filter((asset) => asset.kind === "video" || asset.kind === "audio" || asset.kind === "pdf")
    .map((asset) => ({ id: asset.id, title: asset.title, kind: asset.kind, url: asset.url }));
  const mode = storageMode();
  return (
    <main>
      <PageHeader
        kicker="Catalog"
        title="New course"
        description="One form: details, cover, and opening lesson. Add more modules after publish."
        action={
          <Link className="ghost-btn rounded-lg px-5 py-2.5 text-[11px]" href="/admin/courses">
            Back
          </Link>
        }
      />
      <Flash error={error} map={{ invalid: "Title, faculty, and summary are required." }} />
      <form action={createCourse} className="grid max-w-3xl gap-6">
        <section className="imu-section grid gap-4 rounded-2xl p-5 md:p-6">
          <h2 className="text-lg text-white">Details</h2>
          <label className="text-xs text-muted">
            Title
            <input className="mt-1 w-full px-3 py-2" name="title" required />
          </label>
          <label className="text-xs text-muted">
            Faculty
            <input className="mt-1 w-full px-3 py-2" name="faculty" placeholder="Wealth desk" required />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-xs text-muted">
              Category
              <select className="mt-1 w-full px-3 py-2" name="category">
                {categories.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted">
              Level
              <select className="mt-1 w-full px-3 py-2" name="level">
                <option>Foundation</option>
                <option>Practitioner</option>
                <option>Mastery</option>
              </select>
            </label>
            <label className="text-xs text-muted">
              Price (coins)
              <input className="mt-1 w-full px-3 py-2" defaultValue={0} min={0} name="price" type="number" />
            </label>
          </div>
          <label className="text-xs text-muted">
            Duration
            <input className="mt-1 w-full px-3 py-2" defaultValue="4 weeks" name="duration" />
          </label>
          <label className="text-xs text-muted">
            Summary
            <textarea className="mt-1 min-h-28 w-full px-3 py-2" name="summary" required />
          </label>
        </section>

        <section className="imu-section grid gap-4 rounded-2xl p-5 md:p-6">
          <h2 className="text-lg text-white">Cover</h2>
          <CourseCoverField library={images.slice(0, 80)} mode={mode} />
        </section>

        <section className="imu-section grid gap-4 rounded-2xl p-5 md:p-6">
          <h2 className="text-lg text-white">Opening lesson</h2>
          <label className="text-xs text-muted">
            Title
            <input className="mt-1 w-full px-3 py-2" defaultValue="Opening lesson" name="lessonTitle" />
          </label>
          <label className="text-xs text-muted">
            Type
            <select className="mt-1 w-full px-3 py-2" name="lessonKind">
              <option value="video">Video (MP4)</option>
              <option value="audio">Audio (MP3)</option>
              <option value="pdf">PDF</option>
              <option value="reading">Reading</option>
            </select>
          </label>
          <LessonMediaField library={lessonFiles.slice(0, 80)} mode={mode} />
        </section>

        <GoldButton pendingLabel="Publishing…" type="submit">
          Publish course
        </GoldButton>
      </form>
    </main>
  );
}
