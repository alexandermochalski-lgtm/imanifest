import { redirect } from "next/navigation";
import { getLiveBookById, getLiveCourseById } from "@/lib/live-catalog";

export default async function DownloadPdfPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getLiveBookById(id);
  if (book?.fileUrl) redirect(book.fileUrl);
  const course = await getLiveCourseById(id);
  const lesson = course?.modules.flatMap((module) => module.lessons).find((item) => item.kind === "pdf" && item.mediaUrl);
  if (lesson?.mediaUrl) redirect(lesson.mediaUrl);
  const title = book?.title ?? course?.title ?? id;
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Download</h1>
      <p className="mt-4 text-muted">No PDF is attached for {title} yet. Registrar can upload one under Admin → Media.</p>
    </main>
  );
}
