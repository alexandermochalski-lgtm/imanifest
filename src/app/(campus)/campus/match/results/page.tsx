import Link from "next/link";
import { notFound } from "next/navigation";
import { readMatchResult } from "@/app/actions/matching";
import { getLiveBookById, getLiveBundleById, getLiveCourseById } from "@/lib/live-catalog";
import { getState } from "@/lib/state";

export default async function CampusMatchResultsPage() {
  const cookieResult = await readMatchResult();
  const state = await getState();
  const fallback = state.lastMatch
    ? {
        pathLabel: state.lastMatch.pathLabel,
        courseIds: state.lastMatch.courseIds,
        bookIds: state.lastMatch.bookIds,
        bundleIds: state.lastMatch.bundleIds,
      }
    : null;
  const result = cookieResult ?? fallback;
  if (!result) notFound();

  const courses = (
    await Promise.all(result.courseIds.map(async (id) => getLiveCourseById(id)))
  ).filter(Boolean);
  const books = (await Promise.all(result.bookIds.map(async (id) => getLiveBookById(id)))).filter(Boolean);
  const bundles = (
    await Promise.all(result.bundleIds.map(async (id) => getLiveBundleById(id)))
  ).filter(Boolean);

  return (
    <main>
      <p className="text-xs uppercase tracking-[0.28em] text-gold">AI Matching</p>
      <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl text-white">
        Path: <span className="text-gold">{result.pathLabel}</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted">Enroll what fits. Retake anytime — new desks are included automatically.</p>

      {courses.length ? (
        <section className="mt-10">
          <h2 className="text-xl text-white">Courses</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {courses.map((course) =>
              course ? (
                <Link
                  key={course.id}
                  className="rounded-2xl border border-[var(--line)] bg-panel p-5"
                  href={`/courses/${course.slug}`}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-gold">{course.faculty}</p>
                  <p className="mt-2 text-white">{course.title}</p>
                  <p className="mt-2 text-sm text-muted line-clamp-2">{course.summary}</p>
                </Link>
              ) : null,
            )}
          </div>
        </section>
      ) : null}

      {books.length ? (
        <section className="mt-10">
          <h2 className="text-xl text-white">Books</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {books.map((book) =>
              book ? (
                <li key={book.id}>
                  <Link className="text-gold" href={`/library/${book.slug}`}>
                    {book.title}
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        </section>
      ) : null}

      {bundles.length ? (
        <section className="mt-10">
          <h2 className="text-xl text-white">Bundles</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {bundles.map((bundle) =>
              bundle ? (
                <li key={bundle.id}>
                  <Link className="text-gold" href={`/bundles/${bundle.slug}`}>
                    {bundle.title}
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        </section>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link className="gold-btn rounded-lg px-6 py-3 text-[11px]" href="/campus/match">
          Retake Matching
        </Link>
        <Link className="ghost-btn rounded-lg px-6 py-3 text-[11px]" href="/campus">
          Dashboard
        </Link>
      </div>
    </main>
  );
}
