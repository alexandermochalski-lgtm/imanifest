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
    <Link href={href} className="imu-card block overflow-hidden rounded-2xl">
      <CoverMedia alt="" ratio="landscape" url={course.coverUrl} />
      <div className="relative p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">{course.faculty}</p>
          <span className="rounded-full border border-[var(--line)] bg-black/30 px-3 py-1 text-[11px] uppercase tracking-wide text-[#f6f1e4]">
            {course.level}
          </span>
        </div>
        <h3 className="mt-3 font-[family-name:var(--font-cormorant)] text-2xl text-[#fff8e8]">{course.title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#d8d8d8]">{course.summary}</p>
        <p className="mt-5 text-sm font-semibold text-gold">
          {course.duration} · {course.modules.length} modules · {course.price === 0 ? "Free" : `${course.price} coins`}
        </p>
      </div>
    </Link>
  );
}
