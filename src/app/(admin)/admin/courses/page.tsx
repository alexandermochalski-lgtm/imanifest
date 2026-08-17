import Link from "next/link";
import { AdminTable, PageHeader, StatusBadge } from "@/components/admin/ui";
import { getDesk } from "@/lib/desk";
import { getLiveCourses } from "@/lib/live-catalog";

export default async function AdminCoursesPage() {
  const [desk, courses] = await Promise.all([getDesk(), getLiveCourses()]);
  const byCourse = new Map<string, { enrollments: number; done: number }>();
  for (const row of desk.enrollments) {
    const current = byCourse.get(row.courseId) ?? { enrollments: 0, done: 0 };
    current.enrollments += 1;
    if (row.progress >= 100) current.done += 1;
    byCourse.set(row.courseId, current);
  }

  return (
    <main>
      <PageHeader
        kicker="Catalog"
        title="Courses"
        description="Seed catalog plus courses you publish. Upload MP4/MP3 under Media, then attach on the course."
        action={
          <Link className="gold-btn rounded-xl px-4 py-2 text-[10px]" href="/admin/courses/new">
            New course
          </Link>
        }
      />
      <AdminTable columns={["Title", "Faculty", "Price", "Modules", "Enrolled", "Completion", "Status"]}>
        {courses.map((course) => {
          const stats = byCourse.get(course.id);
          const enrolled = stats?.enrollments ?? 0;
          const completion = !stats || stats.enrollments === 0 ? 0 : Math.round((stats.done / stats.enrollments) * 100);
          return (
            <tr key={course.id} className="border-t border-[var(--line)]">
              <td className="px-4 py-3">
                <Link className="text-white hover:text-gold" href={`/admin/courses/${course.id}`}>
                  {course.title}
                </Link>
                <p className="text-xs text-muted">{course.category}</p>
              </td>
              <td className="px-4 py-3">{course.faculty}</td>
              <td className="px-4 py-3 text-gold">{course.price === 0 ? "free" : `${course.price} coins`}</td>
              <td className="px-4 py-3">{course.modules.length}</td>
              <td className="px-4 py-3">
                <Link className="text-gold" href={`/admin/enrollments?course=${course.id}`}>
                  {enrolled}
                </Link>
              </td>
              <td className="px-4 py-3">{enrolled ? `${completion}%` : "—"}</td>
              <td className="px-4 py-3">
                <StatusBadge status={course.status} />
              </td>
            </tr>
          );
        })}
      </AdminTable>
    </main>
  );
}
