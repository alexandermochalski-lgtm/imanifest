import Link from "next/link";
import { CourseCard } from "@/components/CourseCard";
import { MembershipPacks } from "@/components/MembershipPacks";
import { getDeliverableCourses } from "@/lib/live-catalog";

export default async function Home() {
  const courses = await getDeliverableCourses();
  const liveCount = String(courses.length);
  const homeStats = [
    { value: liveCount, label: "Money-making methods" },
    { value: liveCount, label: "Campus courses live" },
    { value: "Faculty", label: "Professors on board" },
    { value: "Global", label: "Graduates worldwide" },
  ];
  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 text-center md:pt-24">
        <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.32em] text-gold">iManifest University · iMU</p>
        <h1 className="mx-auto max-w-4xl font-[family-name:var(--font-cormorant)] text-5xl leading-[1.08] text-[#fff8e8] md:text-7xl">
          Shape your financial future with institutional-grade education.
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#d4d4d4]">
          iMU’s curriculum of money-making methods — personal finance, investing, e-commerce, marketing, health, and
          social distribution — rebuilt from the original Laravel campus.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/programs" className="gold-btn rounded-xl px-8 py-3.5 text-xs">
            Browse all courses
          </Link>
          <Link href="/#pricing" className="ghost-btn rounded-xl px-8 py-3.5 text-xs">
            Get campus · $49.99/mo
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-2 overflow-hidden rounded-2xl border border-[var(--line)] imu-panel md:grid-cols-4">
        {homeStats.map((item) => (
          <div key={item.label} className="border-[var(--line)] px-6 py-8 transition hover:bg-white/[0.03] md:border-r md:last:border-r-0">
            <p className="font-[family-name:var(--font-cormorant)] text-4xl text-gold">{item.value}</p>
            <p className="mt-2 text-sm text-[#d8d8d8]">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-gold">Live campus catalog</p>
            <h2 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl text-[#fff8e8]">
              {courses.length} iMU courses
            </h2>
          </div>
          <Link href="/programs" className="hidden text-sm font-semibold text-gold md:inline">
            View full catalog →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {courses.slice(0, 6).map((course) => (
            <CourseCard key={course.slug} course={course} href={`/programs#${course.slug}`} />
          ))}
        </div>
      </section>

      <section className="mx-auto mb-24 max-w-6xl rounded-3xl border border-[var(--line)] imu-panel px-6 py-14 md:px-12">
        <h2 className="font-[family-name:var(--font-cormorant)] text-4xl text-[#fff8e8]">Shaping your future</h2>
        <p className="mt-5 max-w-3xl leading-8 text-[#d4d4d4]">
          Guaranteed money-makers from the original iManifest University: chain-breaking methods across personal
          development, fitness, e-commerce, health, marketing, and social media — then a campus to practice.
        </p>
        <Link href="/about" className="gold-btn mt-8 inline-flex rounded-xl px-8 py-3.5 text-xs">
          About the university
        </Link>
      </section>

      <MembershipPacks />
    </main>
  );
}
