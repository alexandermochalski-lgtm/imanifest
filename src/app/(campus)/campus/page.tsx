import { DailyDesk } from "@/components/campus/DailyDesk";
import { jobs, moduleProgress, seedJournals } from "@/lib/catalog";
import {
  buildDailyDesk,
  DEFAULT_DESK_PIN,
  DEFAULT_FOUNDER_NOTES,
  campusDayHint,
  deskClosedToday,
  formatCampusDay,
  formatCoins,
  liveStreak,
  utcToday,
} from "@/lib/daily-desk";
import { getDeliverableBooks, getDeliverableCourses } from "@/lib/live-catalog";
import { loginStreakLive } from "@/lib/login-bonus";
import { rankHint, studentRank } from "@/lib/ranks";
import { getState } from "@/lib/state";
import { readOverlay } from "@/lib/storage";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const query = await searchParams;
  const state = await getState();
  const [courses, books, overlay] = await Promise.all([
    getDeliverableCourses(),
    getDeliverableBooks(),
    readOverlay(),
  ]);
  const enrolled = courses.filter((course) => state.enrollments.includes(course.id));
  const streak = liveStreak(state);
  const loginStreak = loginStreakLive(state);
  const closed = deskClosedToday(state);
  const rank = studentRank(state);
  const desk = buildDailyDesk(
    utcToday(),
    courses,
    state.enrollments,
    state.forumPosts,
    overlay.desk?.pin ?? DEFAULT_DESK_PIN,
    overlay.desk?.founderNotes?.length ? overlay.desk.founderNotes : DEFAULT_FOUNDER_NOTES,
  );

  return (
    <main>
      <p className="text-xs uppercase tracking-[0.28em] text-gold">Student workspace</p>
      <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl text-white">Dashboard</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Run methods, close the desk, and climb the operator ladder — Observer → Architect.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-[var(--line)] bg-panel p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Rank</p>
          <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-gold">{rank}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">{rankHint(state)}</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-panel p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Coins</p>
          <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-gold">{formatCoins(state.coins)}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">+1 coin daily login · bonuses at 7 / 14 / 21 / 30</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-panel p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Desk streak</p>
          <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-gold">{formatCampusDay(streak)}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">{campusDayHint(streak, closed)}</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-panel p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Login streak</p>
          <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-gold">{formatCampusDay(loginStreak)}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">UTC days opening campus</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-panel p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Enrolled</p>
          <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-gold">{enrolled.length}</p>
        </div>
      </div>

      <Link
        href="/campus/match"
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-5 transition hover:border-gold/50 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">AI Matching</p>
          <p className="mt-2 font-[family-name:var(--font-cormorant)] text-2xl text-white">
            {state.lastMatch ? `Continue your ${state.lastMatch.pathLabel}` : "Find your next desk"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {state.lastMatch
              ? "Retake anytime — new courses are scored automatically."
              : "Six questions. A live path across courses, books, and stacks."}
          </p>
        </div>
        <span className="gold-btn rounded-lg px-5 py-2.5 text-center text-[11px]">
          {state.lastMatch ? "Open Matching" : "Run Matching"}
        </span>
      </Link>
      <DailyDesk desk={desk} streak={streak} closed={closed} ok={query.ok} error={query.error} />
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-white">My courses</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {enrolled.map((course) => (
            <Link key={course.id} href={`/courses/${course.slug}`} className="rounded-2xl border border-[var(--line)] bg-panel p-5">
              <p className="text-white">{course.title}</p>
              <p className="mt-2 text-sm text-gold">{moduleProgress(course, state.completedModules)}% complete</p>
            </Link>
          ))}
        </div>
      </section>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-gold">Latest books</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {books.slice(0, 4).map((book) => (
              <li key={book.id}>
                <Link href={`/library/${book.slug}`}>{book.title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-gold">Journals</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {seedJournals.filter((item) => item.type === "public").slice(0, 4).map((journal) => (
              <li key={journal.id}>
                <Link href={`/journals/${journal.slug}`}>{journal.title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-gold">Jobs</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
