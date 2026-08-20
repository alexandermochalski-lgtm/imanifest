import Link from "next/link";
import { notFound } from "next/navigation";
import { attachBookFile } from "@/app/actions/catalog";
import { PageHeader } from "@/components/admin/ui";
import { Flash, GoldButton } from "@/components/ui";
import { campusMediaHref } from "@/lib/blob-access";
import { getLiveBookById, getMediaLibrary } from "@/lib/live-catalog";

export default async function AdminBookDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { id } = await params;
  const { ok } = await searchParams;
  const book = await getLiveBookById(id);
  if (!book) notFound();
  const pdfs = (await getMediaLibrary()).filter((item) => item.kind === "pdf");

  return (
    <main>
      <PageHeader
        kicker="Library"
        title={book.title}
        description={`${book.author} · ${book.pages} pages · ${book.price === 0 ? "free" : `${book.price} coins`}`}
        action={
          <Link className="ghost-btn rounded-xl px-4 py-2 text-[10px]" href="/admin/books">
            All books
          </Link>
        }
      />
      <Flash map={{ file: "PDF attached." }} ok={ok} />
      {book.fileUrl ? (
        <p className="mb-6 text-sm">
          Current file:{" "}
          <a className="text-gold" href={campusMediaHref(book.fileUrl) ?? book.fileUrl} rel="noreferrer" target="_blank">
            Open PDF
          </a>
        </p>
      ) : (
        <p className="mb-6 text-sm text-muted">No PDF attached.</p>
      )}
      <form action={attachBookFile} className="grid max-w-3xl gap-4">
        <input name="bookId" type="hidden" value={book.id} />
        <label className="text-xs text-muted">
          PDF from library
          <select className="mt-1 w-full px-3 py-2" name="mediaId">
            <option value="">Choose file</option>
            {pdfs.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted">
          Or URL
          <input className="mt-1 w-full px-3 py-2" defaultValue={book.fileUrl ?? ""} name="fileUrl" />
        </label>
        <GoldButton type="submit">Save file</GoldButton>
      </form>
    </main>
  );
}
