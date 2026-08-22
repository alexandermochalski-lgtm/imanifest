import Link from "next/link";
import { deleteCourse } from "@/app/actions/catalog";
import { ConfirmGoldButton } from "@/components/admin/ConfirmGoldButton";
import { AdminTable, PageHeader, StatusBadge } from "@/components/admin/ui";
import { Flash } from "@/components/ui";
import { getDesk } from "@/lib/desk";
import { getLiveCourses } from "@/lib/live-catalog";

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
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
        description="Publish courses with cover + lesson uploads, then edit modules and lessons on each course."
        action={
          <Link className="gold-btn rounded-lg px-5 py-2.5 text-[11px]" href="/admin/courses/new">
            New course
          </Link>
        }
      />
      <Flash
        error={error}
        map={{
          created: "Course published. Open it to edit modules, lessons, and media.",
          deleted: "Course removed from the catalog.",
          missing: "That course could not be found. Try again from this list.",
        }}
        ok={ok}
      />
      <AdminTable columns={["Title", "Faculty", "Price", "Modules", "Enrolled", "Status", ""]}>
        {courses.map((course) => {
          const stats = byCourse.get(course.id);
          const enrolled = stats?.enrollments ?? 0;
          return (
            <tr key={course.id}>
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
              <td className="px-4 py-3">
                <StatusBadge status={course.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Link className="text-sm text-gold" href={`/admin/courses/${course.id}`}>
                    Edit
                  </Link>
                  <form action={deleteCourse}>
                    <input name="courseId" type="hidden" value={course.id} />
                    <ConfirmGoldButton
                      className="!bg-transparent !px-0 !py-0 !text-red-200"
                      confirmMessage={`Delete “${course.title}”? This cannot be undone.`}
                      pendingLabel="Deleting…"
                    >
                      Delete
                    </ConfirmGoldButton>
                  </form>
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>
    </main>
  );
}
