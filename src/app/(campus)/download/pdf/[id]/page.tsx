import { redirect } from "next/navigation";
import { campusMediaHref } from "@/lib/blob-access";
import { getLiveBookById, getLiveCourseById } from "@/lib/live-catalog";

export default async function DownloadPdfPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getLiveBookById(id);
  const bookHref = campusMediaHref(book?.fileUrl);
  if (bookHref) redirect(bookHref);
  const course = await getLiveCourseById(id);
  const lesson = course?.modules.flatMap((module) => module.lessons).find((item) => item.kind === "pdf" && item.mediaUrl);
  const lessonHref = campusMediaHref(lesson?.mediaUrl);
  if (lessonHref) redirect(lessonHref);
  const title = book?.title ?? course?.title ?? id;
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Download</h1>
      <p className="mt-4 text-muted">No PDF is attached for {title} yet. Registrar can upload one under Admin → Media.</p>
    </main>
  );
}
