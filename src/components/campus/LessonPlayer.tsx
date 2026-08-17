import type { Lesson } from "@/lib/types";

export function LessonPlayer({ lesson, enrolled }: { lesson: Lesson; enrolled: boolean }) {
  if (!lesson.mediaUrl) return null;
  if (!enrolled) {
    return <p className="mt-2 text-sm text-gold">Enroll to play this lesson.</p>;
  }
  if (lesson.kind === "video") {
    return (
      <video className="mt-3 w-full rounded-xl border border-[var(--line)] bg-black" controls preload="metadata" src={lesson.mediaUrl}>
        <a href={lesson.mediaUrl}>Download video</a>
      </video>
    );
  }
  if (lesson.kind === "audio") {
    return <audio className="mt-3 w-full" controls preload="metadata" src={lesson.mediaUrl} />;
  }
  if (lesson.kind === "pdf") {
    return (
      <a className="mt-3 inline-block text-sm text-gold" href={lesson.mediaUrl} rel="noreferrer" target="_blank">
        Open PDF
      </a>
    );
  }
  return null;
}
