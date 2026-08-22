import Link from "next/link";
import { notFound } from "next/navigation";
import { attachBookFile, updateBook } from "@/app/actions/catalog";
import { CourseCoverField } from "@/components/admin/CourseCoverField";
import { PageHeader } from "@/components/admin/ui";
import { Flash, GoldButton } from "@/components/ui";
import { campusMediaHref } from "@/lib/blob-access";
import { categories } from "@/lib/catalog";
import { bookCategories, getLiveBookById, getMediaLibrary } from "@/lib/live-catalog";
import { storageMode } from "@/lib/storage";

export default async function AdminBookDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const { ok, error } = await searchParams;
  const book = await getLiveBookById(id);
  if (!book) notFound();
  const media = await getMediaLibrary();
  const pdfs = media.filter((item) => item.kind === "pdf");
  const images = media.filter((item) => item.kind === "image" || item.contentType.startsWith("image/"));
  const mode = storageMode();
  const selected = new Set(bookCategories(book));

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
      <Flash
        error={error}
        map={{ file: "PDF attached.", updated: "Book saved.", invalid: "Title, author, and summary are required." }}
        ok={ok}
      />
      <form action={updateBook} className="mb-10 grid max-w-3xl gap-4">
        <input name="bookId" type="hidden" value={book.id} />
        <label className="text-xs text-muted">
          Title
          <input className="mt-1 w-full px-3 py-2" defaultValue={book.title} name="title" required />
        </label>
        <label className="text-xs text-muted">
          Author
          <input className="mt-1 w-full px-3 py-2" defaultValue={book.author} name="author" required />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-xs text-muted">
            Primary category
            <select className="mt-1 w-full px-3 py-2" defaultValue={book.category} name="category">
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted">
            Pages
            <input className="mt-1 w-full px-3 py-2" defaultValue={book.pages} min={1} name="pages" type="number" />
          </label>
          <label className="text-xs text-muted">
            Price (coins)
            <input className="mt-1 w-full px-3 py-2" defaultValue={book.price} min={0} name="price" type="number" />
          </label>
        </div>
        <fieldset className="rounded-xl border border-[var(--line)] p-4">
          <legend className="px-1 text-xs text-muted">Tags (multi-select)</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {categories.map((item) => (
              <label key={item.slug} className="flex items-center gap-2 text-sm text-muted">
                <input defaultChecked={selected.has(item.slug)} name="tags" type="checkbox" value={item.slug} />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="text-xs text-muted">
          Summary
          <textarea className="mt-1 min-h-28 w-full px-3 py-2" defaultValue={book.summary} name="summary" required />
        </label>
        <CourseCoverField initialUrl={book.coverUrl} mode={mode} />
        <label className="text-xs text-muted">
          Or cover from library
          <select className="mt-1 w-full px-3 py-2" name="coverMediaId">
            <option value="">Keep upload / URL above</option>
            {images.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.title}
              </option>
            ))}
          </select>
        </label>
        <GoldButton pendingLabel="Saving…" type="submit">
          Save book
        </GoldButton>
      </form>

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
        <GoldButton pendingLabel="Saving…" type="submit">
          Save file
        </GoldButton>
      </form>
    </main>
  );
}
