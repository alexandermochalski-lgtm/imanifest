import Link from "next/link";
import { Flash } from "@/components/ui";
import { coinPacks } from "@/lib/catalog";
import { formatCoins } from "@/lib/daily-desk";
import { getState } from "@/lib/state";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const params = await searchParams;
  const state = await getState();
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Purchase coins</h1>
      <p className="mt-3 text-muted">Ledger balance: {formatCoins(state.coins)}. Promo codes IMU10 and FOUNDERS. Card capture is simulated on this staging build.</p>
      <Flash
        ok={params.ok}
        error={params.error}
        map={{ purchase: "Coins credited.", coins: "Not enough coins for that enroll/unlock.", promo: "Promo rejected." }}
      />
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {coinPacks.map((pack) => (
          <article key={pack.id} className="gold-ring rounded-2xl bg-panel p-6">
            <h2 className="text-2xl text-white">{pack.name}</h2>
            <p className="mt-2 text-gold">
              {pack.coins} coins {pack.bonus ? `+ ${pack.bonus} bonus` : ""}
            </p>
            <p className="mt-1 text-muted">
              ${pack.price}
              {pack.savePct ? <span> (Save {pack.savePct}%)</span> : null}
            </p>
            <Link href={`/pricing/${pack.id}`} className="gold-btn mt-5 inline-block rounded-full px-5 py-2 text-sm">
              Place order
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
