import Link from "next/link";
import { CoverMedia } from "@/components/CoverMedia";
import type { Course } from "@/lib/types";

export function CourseCard({
  course,
  href,
}: {
  course: Course;
  href: string;
}) {
  return (
    <Link href={href} className="imu-card group block overflow-hidden rounded-2xl">
      <CoverMedia alt="" ratio="landscape" url={course.coverUrl} />
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold">{course.faculty}</p>
          <span className="rounded-md border border-[var(--line)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
            {course.level}
          </span>
        </div>
        <h3 className="mt-3 font-[family-name:var(--font-cormorant)] text-xl font-medium tracking-tight text-white transition group-hover:text-gold md:text-2xl">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{course.summary}</p>
        <p className="mt-4 text-sm text-gold">
          {course.duration} · {course.modules.length} modules · {course.price === 0 ? "Free" : `${course.price} coins`}
        </p>
      </div>
    </Link>
  );
}
