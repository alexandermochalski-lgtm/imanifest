import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteBundle, updateBundle } from "@/app/actions/catalog";
import { ConfirmGoldButton } from "@/components/admin/ConfirmGoldButton";
import { PageHeader } from "@/components/admin/ui";
import { Flash, GoldButton } from "@/components/ui";
import {
  getDeliverableBooks,
  getDeliverableCourses,
  getLiveBookById,
  getLiveBundleById,
  getLiveCourseById,
} from "@/lib/live-catalog";

export default async function AdminBundleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const { ok, error } = await searchParams;
  const bundle = await getLiveBundleById(id);
  if (!bundle) redirect("/admin/bundles?error=missing");

  const [courses, books] = await Promise.all([getDeliverableCourses(), getDeliverableBooks()]);
  const courseMap = new Map(courses.map((course) => [course.id, course]));
  const bookMap = new Map(books.map((book) => [book.id, book]));
  await Promise.all(
    bundle.courseIds.map(async (courseId) => {
      if (courseMap.has(courseId)) return;
      const course = await getLiveCourseById(courseId);
      if (course) courseMap.set(course.id, course);
    }),
  );
  await Promise.all(
    bundle.bookIds.map(async (bookId) => {
      if (bookMap.has(bookId)) return;
      const book = await getLiveBookById(bookId);
      if (book) bookMap.set(book.id, book);
    }),
  );
  const sortedCourses = [...courseMap.values()].sort((a, b) => a.title.localeCompare(b.title));
  const sortedBooks = [...bookMap.values()].sort((a, b) => a.title.localeCompare(b.title));
  const selectedCourses = new Set(bundle.courseIds);
  const selectedBooks = new Set(bundle.bookIds);

  return (
    <main>
      <PageHeader
        kicker="Catalog"
        title={bundle.title}
        description={`${bundle.courseIds.length} courses · ${bundle.bookIds.length} books · ${bundle.price === 0 ? "free" : `${bundle.price} coins`}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link className="ghost-btn rounded-lg px-5 py-2.5 text-[11px]" href={`/bundles/${bundle.slug}`}>
              View as student
            </Link>
            <Link className="ghost-btn rounded-lg px-5 py-2.5 text-[11px]" href="/admin/bundles">
              All bundles
            </Link>
          </div>
        }
      />
      <Flash
        error={error}
        map={{
          updated: "Bundle saved.",
          invalid: "Title and summary are required.",
          empty: "Select at least one course or book.",
        }}
        ok={ok}
      />

      <form action={updateBundle} className="grid max-w-3xl gap-5">
        <input name="bundleId" type="hidden" value={bundle.id} />
        <label className="text-xs text-muted">
          Title
          <input className="mt-1 w-full px-3 py-2" defaultValue={bundle.title} name="title" required />
        </label>
        <label className="text-xs text-muted">
          Price (coins)
          <input className="mt-1 w-full px-3 py-2" defaultValue={bundle.price} min={0} name="price" type="number" />
        </label>
        <label className="text-xs text-muted">
          Summary
          <textarea className="mt-1 min-h-28 w-full px-3 py-2" defaultValue={bundle.summary} name="summary" required />
        </label>

        <fieldset className="rounded-2xl border border-[var(--line)] p-4">
          <legend className="px-1 text-sm text-white">Courses</legend>
          <div className="mt-2 max-h-72 space-y-2 overflow-y-auto pr-1">
            {sortedCourses.map((course) => (
              <label key={course.id} className="flex items-start gap-2 text-sm text-muted">
                <input
                  className="mt-1"
                  defaultChecked={selectedCourses.has(course.id)}
                  name="courseIds"
                  type="checkbox"
                  value={course.id}
                />
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
          <div className="mt-2 max-h-56 space-y-2 overflow-y-auto pr-1">
            {sortedBooks.map((book) => (
              <label key={book.id} className="flex items-start gap-2 text-sm text-muted">
                <input
                  className="mt-1"
                  defaultChecked={selectedBooks.has(book.id)}
                  name="bookIds"
                  type="checkbox"
                  value={book.id}
                />
                <span>
                  <span className="text-white">{book.title}</span>
                  <span className="mt-0.5 block text-[11px] text-muted">{book.author}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <GoldButton pendingLabel="Saving…" type="submit">
          Save bundle
        </GoldButton>
      </form>

      <form action={deleteBundle} className="mt-8">
        <input name="bundleId" type="hidden" value={bundle.id} />
        <ConfirmGoldButton
          className="!bg-transparent !text-red-200 border border-red-400/40"
          confirmMessage={`Delete “${bundle.title}”? This cannot be undone.`}
          pendingLabel="Deleting…"
        >
          Delete bundle
        </ConfirmGoldButton>
      </form>
    </main>
  );
}
