import type { Metadata } from "next";
import Link from "next/link";
import { CourseCard } from "@/components/CourseCard";
import { categories } from "@/lib/catalog";
import { getLiveCourses } from "@/lib/live-catalog";

export const metadata: Metadata = { title: "All Courses" };

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const courses = (await getLiveCourses()).filter((course) => course.status === "active");
  const filtered = courses.filter((course) => !category || course.category === category);
  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-gold">iMU catalog · from the Laravel campus</p>
      <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-5xl text-[#fff8e8]">All Courses</h1>
      <p className="mt-4 max-w-2xl text-[#d4d4d4]">
        {courses.length} methods across the original iMU faculties. Log in to enroll, sit quizzes, and complete modules.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/programs" className="ghost-btn rounded-full px-4 py-1.5 text-[11px]">
          All
        </Link>
        {categories.map((item) => (
          <Link
            key={item.slug}
            href={`/programs?category=${item.slug}`}
            className="ghost-btn rounded-full px-4 py-1.5 text-[11px]"
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => (
          <div key={course.slug} id={course.slug}>
            <CourseCard course={course} href="/login" />
          </div>
        ))}
      </div>
    </main>
  );
}
