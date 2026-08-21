import Link from "next/link";
import { createCourse } from "@/app/actions/catalog";
import { CourseCoverField } from "@/components/admin/CourseCoverField";
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
  const images = media.filter((asset) => asset.kind === "image" || asset.contentType.startsWith("image/"));
  const mode = storageMode();
  return (
    <main>
      <PageHeader
        kicker="Catalog"
        title="New course"
        description="Creates a live campus course with one opening module. Add a cover image, then attach MP4/MP3 from the library or paste a URL."
        action={
          <Link className="ghost-btn rounded-xl px-4 py-2 text-[10px]" href="/admin/courses">
            Back
          </Link>
        }
      />
      <Flash error={error} map={{ invalid: "Title, faculty, and summary are required." }} />
      <form action={createCourse} className="grid max-w-3xl gap-4">
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
        <CourseCoverField mode={mode} />
        <label className="text-xs text-muted">
          Or pick cover from library
          <select className="mt-1 w-full px-3 py-2" name="coverMediaId">
            <option value="">None</option>
            {images.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted">
          Opening lesson title
          <input className="mt-1 w-full px-3 py-2" defaultValue="Opening lesson" name="lessonTitle" />
        </label>
        <label className="text-xs text-muted">
          Lesson type
          <select className="mt-1 w-full px-3 py-2" name="lessonKind">
            <option value="video">Video (MP4)</option>
            <option value="audio">Audio (MP3)</option>
            <option value="pdf">PDF</option>
            <option value="reading">Reading</option>
          </select>
        </label>
        <label className="text-xs text-muted">
          Attach from library
          <select className="mt-1 w-full px-3 py-2" name="mediaId">
            <option value="">None yet — upload under Media first</option>
            {media.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.title} ({asset.kind})
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted">
          Or paste a media URL
          <input className="mt-1 w-full px-3 py-2" name="mediaUrl" placeholder="https://…" />
        </label>
        <GoldButton type="submit">Publish course</GoldButton>
      </form>
    </main>
  );
}
