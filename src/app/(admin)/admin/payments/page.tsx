import Link from "next/link";
import { AdminTable, EmptyRow, Field, FilterBar, Kpi, PageHeader, SelectField, StatusBadge } from "@/components/admin/ui";
import { getDesk } from "@/lib/desk";
import { formatDate, opsUserById, usd } from "@/lib/ops";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kind?: string; status?: string }>;
}) {
  const { q = "", kind = "all", status = "all" } = await searchParams;
  const desk = await getDesk();
  const query = q.trim().toLowerCase();
  const rows = desk.payments.filter((item) => {
    const user = opsUserById(item.userId);
    const hay = `${item.label} ${item.sku} ${item.promo ?? ""} ${user?.name ?? ""} ${user?.email ?? ""}`.toLowerCase();
    if (query && !hay.includes(query)) return false;
    if (kind !== "all" && item.kind !== kind) return false;
    if (status !== "all" && item.status !== status) return false;
    return true;
  });

  return (
    <main>
      <PageHeader
        kicker="Revenue"
        title="Payments"
        description="Card captures on coin packs (real USD) and campus coin movements on courses and bundles."
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Card revenue" value={usd(desk.kpis.cardRevenue)} hint={`${usd(desk.kpis.cardRevenue30d)} in 30d`} />
        <Kpi label="Refunds" value={usd(desk.kpis.refunds)} />
        <Kpi label="Failed captures" value={String(desk.kpis.failed)} />
        <Kpi label="Catalog GMV" value={`${desk.kpis.courseGmvCoins.toLocaleString()} coins`} hint="Courses + bundles spent" />
      </div>
      <FilterBar action="/admin/payments">
        <Field defaultValue={q} label="Search" name="q" placeholder="Student, SKU, promo" />
        <SelectField
          defaultValue={kind}
          label="Kind"
          name="kind"
          options={[
            { value: "all", label: "All kinds" },
            { value: "coins", label: "Coin packs" },
            { value: "course", label: "Courses" },
            { value: "bundle", label: "Bundles" },
          ]}
        />
        <SelectField
          defaultValue={status}
          label="Status"
          name="status"
          options={[
            { value: "all", label: "All status" },
            { value: "paid", label: "Paid" },
            { value: "pending", label: "Pending" },
            { value: "refunded", label: "Refunded" },
            { value: "failed", label: "Failed" },
          ]}
        />
      </FilterBar>
      <p className="mb-3 text-xs text-muted">{rows.length} rows</p>
      <AdminTable columns={["When", "Student", "Item", "Kind", "USD", "Coins", "Promo", "Status"]}>
        {rows.length === 0 ? (
          <EmptyRow cols={8}>No payments match.</EmptyRow>
        ) : (
          rows.map((payment) => {
            const user = opsUserById(payment.userId);
            return (
              <tr key={payment.id} className="border-t border-[var(--line)]">
                <td className="px-4 py-3">{formatDate(payment.createdAt)}</td>
                <td className="px-4 py-3">
                  {user ? (
                    <Link className="text-white hover:text-gold" href={`/admin/users/${user.id}`}>
                      {user.name}
                    </Link>
                  ) : (
                    payment.userId
                  )}
                </td>
                <td className="px-4 py-3 text-white">{payment.label}</td>
                <td className="px-4 py-3">{payment.kind}</td>
                <td className="px-4 py-3">{payment.kind === "coins" ? usd(payment.amountUsd) : "—"}</td>
                <td className="px-4 py-3">{payment.coins > 0 ? `+${payment.coins}` : payment.coins}</td>
                <td className="px-4 py-3">{payment.promo ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={payment.status} />
                </td>
              </tr>
            );
          })
        )}
      </AdminTable>
    </main>
  );
}
