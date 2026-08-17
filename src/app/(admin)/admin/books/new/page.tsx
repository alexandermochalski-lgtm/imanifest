import Link from "next/link";
import { createBook } from "@/app/actions/catalog";
import { PageHeader } from "@/components/admin/ui";
import { Flash, GoldButton } from "@/components/ui";
import { categories } from "@/lib/catalog";
import { getMediaLibrary } from "@/lib/live-catalog";

export default async function NewBookPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const pdfs = (await getMediaLibrary()).filter((item) => item.kind === "pdf");
  return (
    <main>
      <PageHeader
        kicker="Catalog"
        title="New book"
        description="Adds a library title. Attach a PDF from the media library or paste a file URL."
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
            Category
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
        <label className="text-xs text-muted">
          Summary
          <textarea className="mt-1 min-h-28 w-full px-3 py-2" name="summary" required />
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
        <GoldButton type="submit">Publish book</GoldButton>
      </form>
    </main>
  );
}
