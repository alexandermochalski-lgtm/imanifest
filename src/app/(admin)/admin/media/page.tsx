import Link from "next/link";
import { deleteMedia } from "@/app/actions/catalog";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { AdminTable, EmptyRow, PageHeader, StatusBadge } from "@/components/admin/ui";
import { Flash, GoldButton } from "@/components/ui";
import { campusMediaHref } from "@/lib/blob-access";
import { getMediaLibrary } from "@/lib/live-catalog";
import { storageMode } from "@/lib/storage";

function bytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const mode = storageMode();
  const media = await getMediaLibrary();

  return (
    <main>
      <PageHeader
        kicker="Catalog"
        title="Media library"
        description="MP4 lectures, MP3 audio, PDFs, and covers. Files go to Vercel Blob in production — never the Next.js server disk."
      />
      <Flash map={{ deleted: "Asset removed from the library." }} ok={ok} />
      <div className="mb-8 imu-section rounded-2xl p-5 md:p-6 text-sm text-muted">
        Storage: <span className="text-gold">{mode === "blob" ? "Vercel Blob" : mode === "local" ? "local .data (dev only)" : "not connected"}</span>
        {mode === "blob"
          ? " · private Blob store; paid seats stream through /api/campus/media."
          : mode === "local"
            ? " · next dev writes under .data/uploads. Connect Blob before production."
            : " · Vercel cannot keep files on the function filesystem."}
      </div>
      <MediaUploader mode={mode} />
      <div className="mt-8">
        <AdminTable columns={["File", "Kind", "Size", "Added", ""]}>
          {media.length === 0 ? (
            <EmptyRow cols={5}>No uploads yet.</EmptyRow>
          ) : (
            media.map((asset) => (
              <tr key={asset.id} className="border-t border-[var(--line)]">
                <td className="px-4 py-3">
                  <p className="text-white">{asset.title}</p>
                  <a className="text-xs text-gold" href={campusMediaHref(asset.url) ?? asset.url} rel="noreferrer" target="_blank">
                    Open
                  </a>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={asset.kind} />
                </td>
                <td className="px-4 py-3">{bytes(asset.size)}</td>
                <td className="px-4 py-3">{asset.createdAt}</td>
                <td className="px-4 py-3">
                  <form action={deleteMedia}>
                    <input name="id" type="hidden" value={asset.id} />
                    <GoldButton type="submit">Delete</GoldButton>
                  </form>
                </td>
              </tr>
            ))
          )}
        </AdminTable>
      </div>
      <p className="mt-4 text-xs text-muted">
        Attach files on a <Link className="text-gold" href="/admin/courses">course</Link> or{" "}
        <Link className="text-gold" href="/admin/books">book</Link> after upload.
      </p>
    </main>
  );
}
