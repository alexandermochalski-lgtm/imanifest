import Link from "next/link";
import { notFound } from "next/navigation";
import { readMatchResult } from "@/app/actions/matching";
import { Flash } from "@/components/ui";
import { getLiveBookById, getLiveBundleById, getLiveCourseById } from "@/lib/live-catalog";

export default async function MatchResultsPage() {
  const result = await readMatchResult();
  if (!result) notFound();

  const courses = (
    await Promise.all(result.courseIds.map(async (id) => getLiveCourseById(id)))
  ).filter(Boolean);
  const books = (await Promise.all(result.bookIds.map(async (id) => getLiveBookById(id)))).filter(Boolean);
  const bundles = (
    await Promise.all(result.bundleIds.map(async (id) => getLiveBundleById(id)))
  ).filter(Boolean);

  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-16 md:pt-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">AI Matching</p>
      <h1 className="mt-4 font-[family-name:var(--font-cormorant)] text-4xl font-medium text-white md:text-5xl">
        Your path: <span className="text-gold">{result.pathLabel}</span>
      </h1>
      <p className="mt-4 text-[var(--text-soft)]">
        Built from the live campus catalog — as new desks land, Matching re-scores them for the next operator.
      </p>
      <div className="mt-6">
        <Flash ok="1" map={{ "1": "Path ready. Start on campus when you are." }} />
      </div>

      {courses.length ? (
        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-white">Courses to open</h2>
          <ul className="mt-4 space-y-3">
            {courses.map((course) =>
              course ? (
                <li key={course.id} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-gold">{course.faculty}</p>
                  <p className="mt-2 text-lg text-white">{course.title}</p>
                  <p className="mt-2 text-sm text-muted line-clamp-2">{course.summary}</p>
                  <Link className="mt-3 inline-block text-sm text-gold" href={`/programs#${course.slug}`}>
                    View in catalog →
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        </section>
      ) : null}

      {books.length ? (
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-white">Books & playbooks</h2>
          <ul className="mt-4 space-y-3">
            {books.map((book) =>
              book ? (
                <li key={book.id} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
                  <p className="text-white">{book.title}</p>
                  <p className="mt-1 text-sm text-muted">{book.author}</p>
                  <Link className="mt-3 inline-block text-sm text-gold" href="/library">
                    Open library →
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        </section>
      ) : null}

      {bundles.length ? (
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-white">Stacks</h2>
          <ul className="mt-4 space-y-3">
            {bundles.map((bundle) =>
              bundle ? (
                <li key={bundle.id} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
                  <p className="text-white">{bundle.title}</p>
                  <p className="mt-2 text-sm text-muted">{bundle.summary}</p>
                  <p className="mt-2 text-sm text-gold">
                    {bundle.price === 0 ? "Free unlock" : `${bundle.price} coins`}
                  </p>
                  <Link className="mt-3 inline-block text-sm text-gold" href="/bundles">
                    View stacks →
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        </section>
      ) : null}

      <div className="mt-12 flex flex-wrap gap-3">
        <Link className="gold-btn rounded-lg px-7 py-3.5" href="/get">
          Start on campus
        </Link>
        <Link className="ghost-btn rounded-lg px-7 py-3.5" href="/match">
          Retake Matching
        </Link>
      </div>
    </main>
  );
}
