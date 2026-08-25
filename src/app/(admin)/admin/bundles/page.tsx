import Link from "next/link";
import { deleteBundle } from "@/app/actions/catalog";
import { ConfirmGoldButton } from "@/components/admin/ConfirmGoldButton";
import { AdminTable, PageHeader } from "@/components/admin/ui";
import { Flash } from "@/components/ui";
import { getLiveBooks, getLiveBundles, getLiveCourses } from "@/lib/live-catalog";

export default async function AdminBundlesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const [bundles, courses, books] = await Promise.all([getLiveBundles(), getLiveCourses(), getLiveBooks()]);
  const courseTitle = new Map(courses.map((course) => [course.id, course.title]));
  const bookTitle = new Map(books.map((book) => [book.id, book.title]));

  return (
    <main>
      <PageHeader
        kicker="Catalog"
        title="Bundles"
        description="Package courses and books into one coin unlock on campus."
        action={
          <Link className="gold-btn rounded-lg px-5 py-2.5 text-[11px]" href="/admin/bundles/new">
            New bundle
          </Link>
        }
      />
      <Flash
        map={{
          created: "Bundle published to campus.",
          deleted: "Bundle removed.",
          missing: "Bundle not found.",
        }}
        ok={ok}
        error={error}
      />
      <AdminTable columns={["Title", "Courses", "Books", "Price", ""]}>
        {bundles.map((bundle) => (
          <tr key={bundle.id} className="border-t border-[var(--line)]">
            <td className="px-4 py-3">
              <Link className="text-white hover:text-gold" href={`/admin/bundles/${bundle.id}`}>
                {bundle.title}
              </Link>
              <p className="mt-1 max-w-md text-xs text-muted line-clamp-2">{bundle.summary}</p>
            </td>
            <td className="px-4 py-3 text-xs text-muted">
              {bundle.courseIds.length
                ? bundle.courseIds.map((id) => courseTitle.get(id) || id).join(", ")
                : "—"}
            </td>
            <td className="px-4 py-3 text-xs text-muted">
              {bundle.bookIds.length ? bundle.bookIds.map((id) => bookTitle.get(id) || id).join(", ") : "—"}
            </td>
            <td className="px-4 py-3 text-gold">{bundle.price === 0 ? "free" : `${bundle.price} coins`}</td>
            <td className="px-4 py-3">
              <form action={deleteBundle}>
                <input name="bundleId" type="hidden" value={bundle.id} />
                <ConfirmGoldButton
                  className="!bg-transparent !px-3 !py-1.5 !text-[11px] !text-red-200 border border-red-400/40"
                  confirmMessage={`Delete “${bundle.title}”?`}
                  pendingLabel="Deleting…"
                >
                  Delete
                </ConfirmGoldButton>
              </form>
            </td>
          </tr>
        ))}
      </AdminTable>
    </main>
  );
}
