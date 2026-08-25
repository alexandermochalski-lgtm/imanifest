import Link from "next/link";
import { CourseCard } from "@/components/CourseCard";
import { MembershipPacks } from "@/components/MembershipPacks";
import { getDeliverableCourses } from "@/lib/live-catalog";

export default async function Home() {
  const courses = await getDeliverableCourses();
  const liveCount = String(courses.length);
  const homeStats = [
    { value: liveCount, label: "Live methods" },
    { value: liveCount, label: "Campus courses" },
    { value: "Faculty", label: "Professors" },
    { value: "Global", label: "Operators" },
  ];
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-5 sm:pb-16 sm:pt-20 md:pb-24 md:pt-28">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">iManifest University</p>
        <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-cormorant)] text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-5xl md:text-7xl">
          For operators,
          <span className="block text-gold">not spectators.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-[var(--text-soft)] md:text-lg md:leading-8">
          {courses.length} live money methods. Start free with two foundation desks — then unlock the full campus when
          you&apos;re ready. Free forever, or $49.99/mo for everything.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
          <Link href="/register" className="gold-btn w-full rounded-lg px-7 py-3.5 sm:w-auto">
            Start free · $0
          </Link>
          <Link href="/match" className="ghost-btn w-full rounded-lg px-7 py-3.5 sm:w-auto">
            Find your desk
          </Link>
          <Link href="/#pricing" className="ghost-btn w-full rounded-lg px-7 py-3.5 sm:w-auto">
            See pricing
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-5">
        <div className="rounded-2xl border border-gold/35 bg-gold/5 px-6 py-8 md:flex md:items-center md:justify-between md:gap-10 md:px-10">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Free campus seat</p>
            <h2 className="mt-3 font-[family-name:var(--font-cormorant)] text-3xl font-medium text-white md:text-4xl">
              $0 to log in. Two desks to ship.
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
              Create an account, open campus, and study Sovereign Mindset plus Personal Finance — no card. Upgrade when
              you want the full catalog, stipend coins, and every operator stack.
            </p>
          </div>
          <Link href="/register" className="gold-btn mt-6 inline-flex shrink-0 rounded-lg px-7 py-3.5 md:mt-0">
            Create free account
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-6">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-6 py-8 md:flex md:items-center md:justify-between md:gap-10 md:px-10">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">AI Matching</p>
            <h2 className="mt-3 font-[family-name:var(--font-cormorant)] text-3xl font-medium text-white md:text-4xl">
              Six questions. One operator path.
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
              Matching scores the live campus catalog — courses, books, and stacks — against what you need to ship.
              New desks are included automatically.
            </p>
          </div>
          <Link href="/match" className="gold-btn mt-6 inline-flex rounded-lg px-7 py-3.5 md:mt-0">
            Run AI Matching
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-6 pt-2">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-6 py-8 md:px-10">
          <div className="md:flex md:items-start md:justify-between md:gap-12">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Campus profiles</p>
              <h2 className="mt-3 font-[family-name:var(--font-cormorant)] text-3xl font-medium text-white md:text-4xl">
                Your desk has a name. Own it.
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
                Claim an @handle, set banner and avatar, post to campus, follow operators you respect, and message the
                ones you want to work with. Profiles, posts, and follows — built for the floor, not the feed.
              </p>
            </div>
            <Link href="/register" className="gold-btn mt-6 inline-flex shrink-0 rounded-lg px-7 py-3.5 md:mt-1">
              Claim your seat
            </Link>
          </div>
          <ul className="mt-8 grid gap-4 border-t border-[var(--line)] pt-8 sm:grid-cols-3">
            <li>
              <p className="text-sm text-white">@handle + profile chrome</p>
              <p className="mt-1 text-sm leading-6 text-muted">Banner, avatar, bio, location, site — your operator card.</p>
            </li>
            <li>
              <p className="text-sm text-white">Posts · replies · media</p>
              <p className="mt-1 text-sm leading-6 text-muted">Short posts, likes, pins, and a media tab for field photos.</p>
            </li>
            <li>
              <p className="text-sm text-white">Follow &amp; message</p>
              <p className="mt-1 text-sm leading-6 text-muted">Build a graph of seats worth watching — then open a thread.</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-2 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] md:grid-cols-4">
        {homeStats.map((item) => (
          <div
            key={item.label}
            className="border-[var(--line)] px-6 py-7 transition hover:bg-white/[0.02] md:border-r md:last:border-r-0"
          >
            <p className="font-[family-name:var(--font-cormorant)] text-3xl font-medium tracking-tight text-gold md:text-4xl">
              {item.value}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Catalog</p>
            <h2 className="mt-3 font-[family-name:var(--font-cormorant)] text-3xl font-medium tracking-tight text-white md:text-4xl">
              {courses.length} courses live
            </h2>
          </div>
          <Link href="/programs" className="hidden text-sm text-gold transition hover:text-white md:inline">
            Full catalog →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {courses.slice(0, 6).map((course) => (
            <CourseCard key={course.slug} course={course} href={`/programs#${course.slug}`} />
          ))}
        </div>
      </section>

      <MembershipPacks courseCount={courses.length} />
    </main>
  );
}
