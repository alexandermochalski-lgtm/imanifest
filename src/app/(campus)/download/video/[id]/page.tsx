import { redirect } from "next/navigation";
import { campusMediaHref } from "@/lib/blob-access";
import { getLiveCourseById } from "@/lib/live-catalog";

export default async function DownloadVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getLiveCourseById(id);
  const lesson = course?.modules.flatMap((module) => module.lessons).find((item) => item.kind === "video" && item.mediaUrl);
  const lessonHref = campusMediaHref(lesson?.mediaUrl);
  if (lessonHref) redirect(lessonHref);
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Video download</h1>
      <p className="mt-4 text-muted">
        No MP4 is attached for {course?.title ?? id} yet. Upload under Admin → Media, then attach it on the course.
      </p>
    </main>
  );
}
