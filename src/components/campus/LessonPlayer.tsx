import { campusMediaHref } from "@/lib/blob-access";
import type { Lesson } from "@/lib/types";

export function LessonPlayer({ lesson, enrolled }: { lesson: Lesson; enrolled: boolean }) {
  const mediaHref = campusMediaHref(lesson.mediaUrl);
  if (!mediaHref) return null;
  if (!enrolled) {
    return <p className="mt-2 text-sm text-gold">Enroll to play this lesson.</p>;
  }
  if (lesson.kind === "video") {
    return (
      <video className="mt-3 w-full rounded-xl border border-[var(--line)] bg-black" controls preload="metadata" src={mediaHref}>
        <a href={mediaHref}>Download video</a>
      </video>
    );
  }
  if (lesson.kind === "audio") {
    return <audio className="mt-3 w-full" controls preload="metadata" src={mediaHref} />;
  }
  if (lesson.kind === "pdf") {
    return (
      <a className="mt-3 inline-block text-sm text-gold" href={mediaHref} rel="noreferrer" target="_blank">
        Open PDF
      </a>
    );
  }
  return null;
}
