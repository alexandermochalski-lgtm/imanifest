import { books, courses } from "@/lib/catalog";

export default async function DownloadPdfPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = books.find((item) => item.id === id);
  const course = courses.find((item) => item.id === id);
  const title = book?.title ?? course?.title ?? id;
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Download</h1>
      <p className="mt-4 text-muted">
        PDF for {title} is queued. On the legacy stack this streamed a stored file; staging logs the request and keeps you on campus.
      </p>
    </main>
  );
}
