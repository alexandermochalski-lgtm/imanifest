import Link from "next/link";
import { createBundle } from "@/app/actions/catalog";
import { PageHeader } from "@/components/admin/ui";
import { Flash, GoldButton } from "@/components/ui";
import { getDeliverableBooks, getDeliverableCourses } from "@/lib/live-catalog";

export default async function NewBundlePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [courses, books] = await Promise.all([getDeliverableCourses(), getDeliverableBooks()]);
  const sortedCourses = [...courses].sort((a, b) => a.title.localeCompare(b.title));
  const sortedBooks = [...books].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <main>
      <PageHeader
        kicker="Catalog"
        title="New bundle"
        description="Pick courses and/or books, set a coin price, publish to campus /bundles."
        action={
          <Link className="ghost-btn rounded-lg px-5 py-2.5 text-[11px]" href="/admin/bundles">
            Back
          </Link>
        }
      />
      <Flash
        error={error}
        map={{
          invalid: "Title and summary are required.",
          empty: "Select at least one course or book.",
        }}
      />
      <form action={createBundle} className="grid max-w-3xl gap-5">
        <label className="text-xs text-muted">
          Title
          <input className="mt-1 w-full px-3 py-2" name="title" required />
        </label>
        <label className="text-xs text-muted">
          Price (coins)
          <input className="mt-1 w-full px-3 py-2" defaultValue={0} min={0} name="price" type="number" />
        </label>
        <label className="text-xs text-muted">
          Summary
          <textarea className="mt-1 min-h-28 w-full px-3 py-2" name="summary" required />
        </label>

        <fieldset className="rounded-2xl border border-[var(--line)] p-4">
          <legend className="px-1 text-sm text-white">Courses</legend>
          <p className="mb-3 text-xs text-muted">Active courses with playable media.</p>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {sortedCourses.map((course) => (
              <label key={course.id} className="flex items-start gap-2 text-sm text-muted">
                <input className="mt-1" name="courseIds" type="checkbox" value={course.id} />
                <span>
                  <span className="text-white">{course.title}</span>
                  <span className="mt-0.5 block text-[11px] uppercase tracking-wide text-muted">
                    {course.faculty} · {course.category}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-[var(--line)] p-4">
          <legend className="px-1 text-sm text-white">Books</legend>
          <p className="mb-3 text-xs text-muted">Library titles with an attached file.</p>
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {sortedBooks.map((book) => (
              <label key={book.id} className="flex items-start gap-2 text-sm text-muted">
                <input className="mt-1" name="bookIds" type="checkbox" value={book.id} />
                <span>
                  <span className="text-white">{book.title}</span>
                  <span className="mt-0.5 block text-[11px] text-muted">{book.author}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <GoldButton pendingLabel="Publishing…" type="submit">
          Publish bundle
        </GoldButton>
      </form>
    </main>
  );
}
