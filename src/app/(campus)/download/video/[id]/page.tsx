import { courses } from "@/lib/catalog";

export default async function DownloadVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = courses.find((item) => item.id === id);
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Video download</h1>
      <p className="mt-4 text-muted">
        Vimeo download for {course?.title ?? id} is not proxied on this staging build. Lessons remain in-module as on the Laravel campus.
      </p>
    </main>
  );
}
