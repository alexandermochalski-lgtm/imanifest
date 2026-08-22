import Link from "next/link";
import { notFound } from "next/navigation";
import { saveUserNote, setUserStatus } from "@/app/actions/admin";
import { Flash, GoldButton } from "@/components/ui";
import { AdminTable, PageHeader, StatusBadge } from "@/components/admin/ui";
import { getDesk } from "@/lib/desk";
import { courseTitle, formatDate, jobTitle, usd } from "@/lib/ops";

export default async function AdminUserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { id } = await params;
  const { ok } = await searchParams;
  const desk = await getDesk();
  const user = desk.users.find((item) => item.id === id);
  if (!user) notFound();

  const payments = desk.payments.filter((item) => item.userId === id);
  const enrollments = desk.enrollments.filter((item) => item.userId === id);
  const applications = desk.applications.filter((item) => item.userId === id);
  const registration = desk.registrations.find((item) => item.userId === id);
  const card = payments
    .filter((item) => (item.kind === "coins" || item.kind === "membership") && item.status === "paid")
    .reduce((sum, item) => sum + item.amountUsd, 0);
  const note = desk.notes[id] ?? "";

  return (
    <main>
      <PageHeader
        kicker="Seat"
        title={user.name}
        description={`${user.email} · ${user.country} · ${user.source}`}
        action={
          <Link className="ghost-btn rounded-lg px-5 py-2.5 text-[11px]" href="/admin/users">
            All users
          </Link>
        }
      />
      <Flash map={{ status: "Account status updated.", note: "Internal note saved." }} ok={ok} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="imu-card rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">Status</p>
          <div className="mt-2">
            <StatusBadge status={user.status} />
          </div>
          <p className="mt-2 text-sm text-muted">{user.role}</p>
        </div>
        <div className="imu-card rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">Coins</p>
          <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-gold">{user.coins}</p>
        </div>
        <div className="imu-card rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">Card spent</p>
          <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-gold">{usd(card)}</p>
        </div>
        <div className="imu-card rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">Last seen</p>
          <p className="mt-2 text-white">{formatDate(user.lastSeenAt)}</p>
          <p className="text-xs text-muted">Joined {formatDate(user.registeredAt)}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="imu-section rounded-2xl p-5 md:p-6">
          <h2 className="text-lg text-white">Account controls</h2>
          <p className="mt-1 text-sm text-muted">{user.phone} · @{user.username}</p>
          <p className="mt-3 text-sm text-muted">{user.bio}</p>
          {registration ? (
            <p className="mt-3 text-xs text-muted">
              Registration {registration.status} via {registration.source}
            </p>
          ) : null}
          <form action={setUserStatus} className="mt-5 flex flex-wrap items-end gap-3">
            <input name="userId" type="hidden" value={user.id} />
            <label className="text-xs text-muted">
              Status
              <select className="mt-1 block px-3 py-2 text-sm" defaultValue={user.status} name="status">
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </label>
            <GoldButton type="submit">Update</GoldButton>
          </form>
        </section>
        <section className="imu-section rounded-2xl p-5 md:p-6">
          <h2 className="text-lg text-white">Internal note</h2>
          <p className="mt-1 text-sm text-muted">Visible only on this desk. Not shown to the student.</p>
          <form action={saveUserNote} className="mt-4 space-y-3">
            <input name="userId" type="hidden" value={user.id} />
            <textarea className="min-h-28 w-full px-3 py-2 text-sm" defaultValue={note} name="note" placeholder="Billing, support, hiring context…" />
            <GoldButton type="submit">Save note</GoldButton>
          </form>
        </section>
      </div>

      <h2 className="mt-10 font-[family-name:var(--font-cormorant)] text-2xl text-white">Enrollments</h2>
      <div className="mt-4">
        <AdminTable columns={["Course", "Enrolled", "Progress", "Coins"]}>
          {enrollments.length === 0 ? (
            <tr>
              <td className="px-4 py-6" colSpan={4}>
                No enrollments.
              </td>
            </tr>
          ) : (
            enrollments.map((row) => (
              <tr key={row.id} className="border-t border-[var(--line)]">
                <td className="px-4 py-3 text-white">{courseTitle(row.courseId)}</td>
                <td className="px-4 py-3">{formatDate(row.enrolledAt)}</td>
                <td className="px-4 py-3">{row.progress}%</td>
                <td className="px-4 py-3 text-gold">{row.coinsSpent}</td>
              </tr>
            ))
          )}
        </AdminTable>
      </div>

      <h2 className="mt-10 font-[family-name:var(--font-cormorant)] text-2xl text-white">Payments</h2>
      <div className="mt-4">
        <AdminTable columns={["When", "Item", "Kind", "USD", "Coins", "Status"]}>
          {payments.length === 0 ? (
            <tr>
              <td className="px-4 py-6" colSpan={6}>
                No payments.
              </td>
            </tr>
          ) : (
            payments.map((payment) => (
              <tr key={payment.id} className="border-t border-[var(--line)]">
                <td className="px-4 py-3">{formatDate(payment.createdAt)}</td>
                <td className="px-4 py-3 text-white">{payment.label}</td>
                <td className="px-4 py-3">{payment.kind}</td>
                <td className="px-4 py-3">{payment.amountUsd ? usd(payment.amountUsd) : "—"}</td>
                <td className="px-4 py-3">{payment.coins}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={payment.status} />
                </td>
              </tr>
            ))
          )}
        </AdminTable>
      </div>

      {applications.length > 0 ? (
        <>
          <h2 className="mt-10 font-[family-name:var(--font-cormorant)] text-2xl text-white">Job applications</h2>
          <ul className="mt-4 space-y-2">
            {applications.map((item) => (
              <li key={item.id} className="rounded-xl border border-[var(--line)] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-white">{jobTitle(item.jobId)}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-1 text-sm text-muted">{item.note}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </main>
  );
}
