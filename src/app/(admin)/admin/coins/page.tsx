import { togglePromo } from "@/app/actions/admin";
import { Flash, GoldButton } from "@/components/ui";
import { AdminTable, Kpi, PageHeader, StatusBadge } from "@/components/admin/ui";
import { coinPacks, membershipPackages } from "@/lib/catalog";
import { getDesk } from "@/lib/desk";
import { usd } from "@/lib/ops";

export default async function AdminCoinsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const desk = await getDesk();
  const packSales = coinPacks.map((pack) => {
    const hits = desk.payments.filter((item) => item.sku === pack.id && item.status === "paid");
    return {
      ...pack,
      sales: hits.length,
      revenue: hits.reduce((sum, item) => sum + item.amountUsd, 0),
    };
  });

  return (
    <main>
      <PageHeader
        kicker="Treasury"
        title="Coins & promo"
        description="One campus door at $49.99/mo on Stripe, plus live coin packs after login. Seat stipend is 50 coins each UTC month."
      />
      <Flash map={{ promo: "Promo code updated." }} ok={ok} />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Kpi label="Card revenue" value={usd(desk.kpis.cardRevenue)} />
        <Kpi label="Coin liability" value={desk.kpis.coinsOutstanding.toLocaleString()} />
        <Kpi label="Catalog spend" value={`${desk.kpis.courseGmvCoins.toLocaleString()} coins`} />
      </div>

      <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-white">Campus door</h2>
      <p className="mt-2 text-sm text-muted">Single SKU. Storefront is free. Campus opens after the monthly Stripe seat. Coins stay an inner ledger.</p>
      <div className="mt-4">
        <AdminTable columns={["Pack", "Price", "Was", "Duration"]}>
          {membershipPackages.map((pack) => (
            <tr key={pack.id} className="border-t border-[var(--line)]">
              <td className="px-4 py-3 text-white">{pack.name}</td>
              <td className="px-4 py-3 text-gold">{pack.price === 0 ? "$0" : usd(pack.price)}</td>
              <td className="px-4 py-3">{pack.listPrice ? usd(pack.listPrice) : "—"}</td>
              <td className="px-4 py-3">{pack.duration}</td>
            </tr>
          ))}
        </AdminTable>
      </div>

      <h2 className="mt-10 font-[family-name:var(--font-cormorant)] text-2xl text-white">Campus coin packs</h2>
      <div className="mt-4">
        <AdminTable columns={["Pack", "Coins", "Bonus", "Save", "List price", "Paid sales", "Revenue"]}>
          {packSales.map((pack) => (
            <tr key={pack.id} className="border-t border-[var(--line)]">
              <td className="px-4 py-3 text-white">{pack.name}</td>
              <td className="px-4 py-3">{pack.coins}</td>
              <td className="px-4 py-3">{pack.bonus}</td>
              <td className="px-4 py-3">{pack.savePct ? `${pack.savePct}%` : "—"}</td>
              <td className="px-4 py-3">{usd(pack.price)}</td>
              <td className="px-4 py-3">{pack.sales}</td>
              <td className="px-4 py-3 text-gold">{usd(pack.revenue)}</td>
            </tr>
          ))}
        </AdminTable>
      </div>

      <h2 className="mt-10 font-[family-name:var(--font-cormorant)] text-2xl text-white">Promo codes</h2>
      <div className="mt-4 space-y-3">
        {desk.promos.map((promo) => (
          <article key={promo.code} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--line)] p-5">
            <div>
              <p className="text-white">
                {promo.code} · {promo.discountPct}%
              </p>
              <p className="text-sm text-muted">
                {promo.redemptions} redemptions · leakage {usd(promo.leakageUsd)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={promo.active ? "active" : "closed"} />
              <form action={togglePromo}>
                <input name="code" type="hidden" value={promo.code} />
                <input name="active" type="hidden" value={promo.active ? "0" : "1"} />
                <GoldButton type="submit">{promo.active ? "Disable" : "Enable"}</GoldButton>
              </form>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
