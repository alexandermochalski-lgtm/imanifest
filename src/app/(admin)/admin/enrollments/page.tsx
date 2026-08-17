import Link from "next/link";
import { AdminTable, EmptyRow, FilterBar, PageHeader, SelectField } from "@/components/admin/ui";
import { courses } from "@/lib/catalog";
import { getDesk } from "@/lib/desk";
import { courseTitle, formatDate, opsUserById } from "@/lib/ops";

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const { course = "all" } = await searchParams;
  const desk = await getDesk();
  const rows = desk.enrollments
    .filter((item) => course === "all" || item.courseId === course)
    .sort((a, b) => (a.enrolledAt < b.enrolledAt ? 1 : -1));
  const complete = rows.filter((item) => item.progress >= 100).length;

  return (
    <main>
      <PageHeader
        kicker="Campus"
        title="Enrollments"
        description="Who is in which course, progress, and coins taken from the student ledger."
      />
      <p className="mb-6 text-sm text-muted">
        {rows.length} seats · {complete} completed · {desk.kpis.enrollments30d} new in 30 days
      </p>
      <FilterBar action="/admin/enrollments">
        <SelectField
          defaultValue={course}
          label="Course"
          name="course"
          options={[
            { value: "all", label: "All courses" },
            ...courses.map((item) => ({ value: item.id, label: item.title })),
          ]}
        />
      </FilterBar>
      <AdminTable columns={["Student", "Course", "Enrolled", "Progress", "Coins"]}>
        {rows.length === 0 ? (
          <EmptyRow cols={5}>No enrollments.</EmptyRow>
        ) : (
          rows.map((row) => {
            const user = opsUserById(row.userId);
            return (
              <tr key={row.id} className="border-t border-[var(--line)]">
                <td className="px-4 py-3">
                  {user ? (
                    <Link className="text-white hover:text-gold" href={`/admin/users/${user.id}`}>
                      {user.name}
                    </Link>
                  ) : (
                    row.userId
                  )}
                </td>
                <td className="px-4 py-3 text-white">{courseTitle(row.courseId)}</td>
                <td className="px-4 py-3">{formatDate(row.enrolledAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full bg-gold" style={{ width: `${row.progress}%` }} />
                    </div>
                    <span>{row.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gold">{row.coinsSpent}</td>
              </tr>
            );
          })
        )}
      </AdminTable>
    </main>
  );
}
