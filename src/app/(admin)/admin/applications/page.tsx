import Link from "next/link";
import { setApplicationStatus } from "@/app/actions/admin";
import { Flash, GoldButton } from "@/components/ui";
import { FilterBar, PageHeader, SelectField, StatusBadge } from "@/components/admin/ui";
import { getDesk } from "@/lib/desk";
import { formatDate, jobTitle, opsUserById } from "@/lib/ops";
import type { JobApplication } from "@/lib/types";

const columns: JobApplication["status"][] = ["submitted", "reviewing", "hired", "rejected"];

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; ok?: string }>;
}) {
  const { status = "all", ok } = await searchParams;
  const desk = await getDesk();
  const rows = desk.applications.filter((item) => status === "all" || item.status === status);

  return (
    <main>
      <PageHeader
        kicker="Hiring"
        title="Applications"
        description="Move candidates through submitted → reviewing → hired / rejected. Notes stay with the application."
      />
      <Flash map={{ status: "Application status updated." }} ok={ok} />
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {columns.map((column) => (
          <div key={column} className="imu-card rounded-2xl p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">{column}</p>
            <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-gold">
              {desk.applications.filter((item) => item.status === column).length}
            </p>
          </div>
        ))}
      </div>
      <FilterBar action="/admin/applications">
        <SelectField
          defaultValue={status}
          label="Status"
          name="status"
          options={[
            { value: "all", label: "All" },
            ...columns.map((item) => ({ value: item, label: item })),
          ]}
        />
      </FilterBar>
      <div className="space-y-3">
        {rows.map((item) => {
          const user = opsUserById(item.userId);
          return (
            <article key={item.id} className="imu-section rounded-2xl p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-white">{jobTitle(item.jobId)}</p>
                  <p className="text-sm text-muted">
                    {user ? (
                      <Link className="text-gold" href={`/admin/users/${user.id}`}>
                        {user.name}
                      </Link>
                    ) : (
                      item.userId
                    )}{" "}
                    · {formatDate(item.createdAt)}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <p className="mt-3 text-sm text-[var(--text-soft)]">{item.note}</p>
              <form action={setApplicationStatus} className="mt-4 flex flex-wrap items-end gap-3">
                <input name="applicationId" type="hidden" value={item.id} />
                <label className="text-xs text-muted">
                  Move to
                  <select className="mt-1 block px-3 py-2 text-sm" defaultValue={item.status} name="status">
                    {columns.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <GoldButton type="submit">Update</GoldButton>
              </form>
            </article>
          );
        })}
      </div>
    </main>
  );
}
