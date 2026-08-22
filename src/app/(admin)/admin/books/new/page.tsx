import Link from "next/link";
import { createBook } from "@/app/actions/catalog";
import { CourseCoverField } from "@/components/admin/CourseCoverField";
import { PageHeader } from "@/components/admin/ui";
import { Flash, GoldButton } from "@/components/ui";
import { categories } from "@/lib/catalog";
import { getMediaLibrary } from "@/lib/live-catalog";
import { storageMode } from "@/lib/storage";

export default async function NewBookPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const media = await getMediaLibrary();
  const pdfs = media.filter((item) => item.kind === "pdf");
  const images = media.filter((item) => item.kind === "image" || item.contentType.startsWith("image/"));
  const mode = storageMode();
  return (
    <main>
      <PageHeader
        kicker="Catalog"
        title="New book"
        description="Adds a library title with cover preview and one or more category tags."
        action={
          <Link className="ghost-btn rounded-xl px-4 py-2 text-[10px]" href="/admin/books">
            Back
          </Link>
        }
      />
      <Flash error={error} map={{ invalid: "Title, author, and summary are required." }} />
      <form action={createBook} className="grid max-w-3xl gap-4">
        <label className="text-xs text-muted">
          Title
          <input className="mt-1 w-full px-3 py-2" name="title" required />
        </label>
        <label className="text-xs text-muted">
          Author
          <input className="mt-1 w-full px-3 py-2" name="author" required />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-xs text-muted">
            Primary category
            <select className="mt-1 w-full px-3 py-2" name="category">
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted">
            Pages
            <input className="mt-1 w-full px-3 py-2" defaultValue={120} min={1} name="pages" type="number" />
          </label>
          <label className="text-xs text-muted">
            Price (coins)
            <input className="mt-1 w-full px-3 py-2" defaultValue={0} min={0} name="price" type="number" />
          </label>
        </div>
        <fieldset className="rounded-xl border border-[var(--line)] p-4">
          <legend className="px-1 text-xs text-muted">Extra tags (multi-select)</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {categories.map((item) => (
              <label key={item.slug} className="flex items-center gap-2 text-sm text-muted">
                <input name="tags" type="checkbox" value={item.slug} />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="text-xs text-muted">
          Summary
          <textarea className="mt-1 min-h-28 w-full px-3 py-2" name="summary" required />
        </label>
        <CourseCoverField mode={mode} />
        <label className="text-xs text-muted">
          Or cover from library
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
          PDF from library
          <select className="mt-1 w-full px-3 py-2" name="mediaId">
            <option value="">None</option>
            {pdfs.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted">
          Or PDF URL
          <input className="mt-1 w-full px-3 py-2" name="fileUrl" placeholder="https://…" />
        </label>
        <GoldButton pendingLabel="Publishing…" type="submit">
          Publish book
        </GoldButton>
      </form>
    </main>
  );
}
