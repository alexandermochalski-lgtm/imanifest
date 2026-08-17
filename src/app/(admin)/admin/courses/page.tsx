import { courses } from "@/lib/catalog";

export default function AdminCoursesPage() {
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Courses</h1>
      <p className="mt-2 text-sm text-muted">Create / edit / module destroy stay on the registrar desk. Catalog below is the live seed used by student enroll + quiz.</p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-gold">
            <tr>
              <th className="py-2">Title</th>
              <th>Faculty</th>
              <th>Price</th>
              <th>Modules</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="text-muted">
            {courses.map((course) => (
              <tr key={course.id} className="border-t border-[var(--line)]">
                <td className="py-3 text-white">{course.title}</td>
                <td>{course.faculty}</td>
                <td>{course.price}</td>
                <td>{course.modules.length}</td>
                <td>{course.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
