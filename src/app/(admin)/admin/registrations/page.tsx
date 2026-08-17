import Link from "next/link";
import { AdminTable, EmptyRow, Field, FilterBar, PageHeader, SelectField, StatusBadge } from "@/components/admin/ui";
import { getDesk } from "@/lib/desk";
import { formatDate } from "@/lib/ops";

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; source?: string }>;
}) {
  const { q = "", status = "all", source = "all" } = await searchParams;
  const desk = await getDesk();
  const query = q.trim().toLowerCase();
  const rows = desk.registrations
    .filter((item) => {
      const hay = `${item.name} ${item.email}`.toLowerCase();
      if (query && !hay.includes(query)) return false;
      if (status !== "all" && item.status !== status) return false;
      if (source !== "all" && item.source !== source) return false;
      return true;
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const completed = desk.registrations.filter((item) => item.status !== "abandoned").length;
  const abandoned = desk.registrations.length - completed;

  return (
    <main>
      <PageHeader
        kicker="Acquisition"
        title="Registrations"
        description="Completed seats versus abandoned sign-ups. Conversion is completed ÷ all attempts."
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="imu-card rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">Attempts</p>
          <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-gold">{desk.registrations.length}</p>
        </div>
        <div className="imu-card rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">Completed</p>
          <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-gold">{completed}</p>
        </div>
        <div className="imu-card rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">Abandoned</p>
          <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-gold">{abandoned}</p>
        </div>
      </div>
      <FilterBar action="/admin/registrations">
        <Field defaultValue={q} label="Search" name="q" placeholder="Name or email" />
        <SelectField
          defaultValue={status}
          label="Status"
          name="status"
          options={[
            { value: "all", label: "All" },
            { value: "verified", label: "Verified" },
            { value: "completed", label: "Completed" },
            { value: "abandoned", label: "Abandoned" },
          ]}
        />
        <SelectField
          defaultValue={source}
          label="Source"
          name="source"
          options={[
            { value: "all", label: "All sources" },
            { value: "organic", label: "Organic" },
            { value: "direct", label: "Direct" },
            { value: "promo", label: "Promo" },
            { value: "referral", label: "Referral" },
            { value: "job-board", label: "Job board" },
          ]}
        />
      </FilterBar>
      <AdminTable columns={["When", "Name", "Email", "Source", "Status", "Seat"]}>
        {rows.length === 0 ? (
          <EmptyRow cols={6}>No registrations match.</EmptyRow>
        ) : (
          rows.map((item) => (
            <tr key={item.id} className="border-t border-[var(--line)]">
              <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
              <td className="px-4 py-3 text-white">{item.name}</td>
              <td className="px-4 py-3">{item.email}</td>
              <td className="px-4 py-3">{item.source}</td>
              <td className="px-4 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-4 py-3">
                {item.userId ? (
                  <Link className="text-gold" href={`/admin/users/${item.userId}`}>
                    Open
                  </Link>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </main>
  );
}
