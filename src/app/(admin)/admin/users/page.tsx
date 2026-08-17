import Link from "next/link";
import { AdminTable, EmptyRow, Field, FilterBar, PageHeader, SelectField, StatusBadge } from "@/components/admin/ui";
import { getDesk } from "@/lib/desk";
import { formatDate } from "@/lib/ops";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; status?: string }>;
}) {
  const { q = "", role = "all", status = "all" } = await searchParams;
  const desk = await getDesk();
  const query = q.trim().toLowerCase();
  const rows = desk.users.filter((user) => {
    const hay = `${user.name} ${user.email} ${user.username} ${user.country}`.toLowerCase();
    if (query && !hay.includes(query)) return false;
    if (role !== "all" && user.role !== role) return false;
    if (status !== "all" && user.status !== status) return false;
    return true;
  });

  return (
    <main>
      <PageHeader
        kicker="People"
        title="Users"
        description="Roster, roles, coin balances, and last seen. Open a seat for enrollments, payments, and notes."
      />
      <FilterBar action="/admin/users">
        <Field defaultValue={q} label="Search" name="q" placeholder="Name, email, country" />
        <SelectField
          defaultValue={role}
          label="Role"
          name="role"
          options={[
            { value: "all", label: "All roles" },
            { value: "student", label: "Student" },
            { value: "admin", label: "Admin" },
          ]}
        />
        <SelectField
          defaultValue={status}
          label="Status"
          name="status"
          options={[
            { value: "all", label: "All status" },
            { value: "active", label: "Active" },
            { value: "pending", label: "Pending" },
            { value: "suspended", label: "Suspended" },
          ]}
        />
      </FilterBar>
      <p className="mb-3 text-xs text-muted">{rows.length} of {desk.users.length} seats</p>
      <AdminTable columns={["Name", "Role", "Status", "Coins", "Courses", "Registered", "Last seen"]}>
        {rows.length === 0 ? (
          <EmptyRow cols={7}>No users match that filter.</EmptyRow>
        ) : (
          rows.map((user) => (
            <tr key={user.id} className="border-t border-[var(--line)]">
              <td className="px-4 py-3">
                <Link className="text-white hover:text-gold" href={`/admin/users/${user.id}`}>
                  {user.name}
                </Link>
                <p className="text-xs text-muted">{user.email}</p>
              </td>
              <td className="px-4 py-3">{user.role}</td>
              <td className="px-4 py-3">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3 text-gold">{user.coins}</td>
              <td className="px-4 py-3">{user.courseIds.length}</td>
              <td className="px-4 py-3">{formatDate(user.registeredAt)}</td>
              <td className="px-4 py-3">{formatDate(user.lastSeenAt)}</td>
            </tr>
          ))
        )}
      </AdminTable>
    </main>
  );
}
