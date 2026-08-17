import Link from "next/link";
import { enrollCourse } from "@/app/actions/campus";
import { Flash, GoldButton } from "@/components/ui";
import { categories, moduleProgress } from "@/lib/catalog";
import { formatCoins } from "@/lib/daily-desk";
import { getLiveCourses } from "@/lib/live-catalog";
import { getState } from "@/lib/state";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; error?: string }>;
}) {
  const params = await searchParams;
  const state = await getState();
  const courses = await getLiveCourses();
  const query = (params.q ?? "").toLowerCase();
  const filtered = courses.filter((course) => {
    const byCat = !params.category || course.category === params.category;
    const byQ = !query || course.title.toLowerCase().includes(query) || course.summary.toLowerCase().includes(query);
    return byCat && byQ && course.status === "active";
  });
  const mine = courses.filter((course) => state.enrollments.includes(course.id));
  const completed = mine.filter((course) => moduleProgress(course, state.completedModules) === 100);

  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Courses</h1>
      <Flash error={params.error} map={{ missing: "Course missing.", coins: "Not enough coins." }} />
      <form className="mt-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search courses"
          className="rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2 text-sm"
        />
        <GoldButton type="submit">Search</GoldButton>
      </form>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Link href="/courses" className="rounded-full border border-[var(--line)] px-3 py-1 text-gold">
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/courses?category=${category.slug}`}
            className="rounded-full border border-[var(--line)] px-3 py-1 text-muted hover:text-gold"
          >
            {category.label}
          </Link>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">
        Enrolled {mine.length} · Completed {completed.length} · Balance {formatCoins(state.coins)} coins
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {filtered.map((course) => {
          const enrolled = state.enrollments.includes(course.id);
          return (
            <article key={course.id} className="imu-card rounded-2xl p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">{course.faculty}</p>
              <h2 className="mt-2 font-[family-name:var(--font-cormorant)] text-2xl text-white">{course.title}</h2>
              <p className="mt-3 text-sm text-muted">{course.summary}</p>
              <p className="mt-4 text-sm text-gold">
                {course.price === 0 ? "Free" : `${course.price} coins`} · {course.modules.length} modules
                {enrolled ? ` · ${moduleProgress(course, state.completedModules)}%` : ""}
              </p>
              <div className="mt-5 flex gap-3">
                <Link href={`/courses/${course.slug}`} className="text-sm text-gold">
                  Details
                </Link>
                {enrolled ? null : (
                  <form action={enrollCourse.bind(null, course.id, true)}>
                    <button className="text-sm text-gold" type="submit">
                      Enroll
                    </button>
                  </form>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
