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
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-20 md:pb-24 md:pt-28">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">iManifest University</p>
        <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-cormorant)] text-5xl font-medium leading-[1.05] tracking-tight text-white md:text-7xl">
          For operators,
          <span className="block text-gold">not spectators.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-[var(--text-soft)] md:text-lg md:leading-8">
          {courses.length} live money methods — finance, investing, e-commerce, marketing, and more. One campus to
          enroll, practice, and compound. From $49.99/mo.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/get" className="gold-btn rounded-lg px-7 py-3.5">
            Start on campus
          </Link>
          <Link href="/programs" className="ghost-btn rounded-lg px-7 py-3.5">
            Browse {courses.length} courses
          </Link>
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

      <section className="mx-auto mb-20 max-w-6xl rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-6 py-12 md:px-12 md:py-14">
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-medium tracking-tight text-white md:text-4xl">
          Not a course library — a campus to run it.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-soft)]">
          Enroll in methods, sit quizzes, open the daily desk, and compound — across personal development, fitness,
          e-commerce, marketing, and social.
        </p>
        <Link href="/about" className="gold-btn mt-8 inline-flex rounded-lg px-7 py-3.5">
          About the university
        </Link>
      </section>

      <MembershipPacks />
    </main>
  );
}
