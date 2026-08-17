import { startCoinCheckout } from "@/app/actions/campus";
import { Flash, GoldButton } from "@/components/ui";
import { coinPacks } from "@/lib/catalog";
import { formatCoins } from "@/lib/daily-desk";
import { MEMBERSHIP_STIPEND } from "@/lib/membership";
import { PEER_MESSAGE_COST } from "@/lib/messenger";
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
      <p className="mt-3 text-muted">
        Ledger {formatCoins(state.coins)} coins. Your seat adds {MEMBERSHIP_STIPEND} coins each UTC month. Peer notes are{" "}
        {PEER_MESSAGE_COST} coin. Checkout is Stripe.
      </p>
      <Flash
        ok={params.ok}
        error={params.error}
        map={{
          purchase: "Coins credited.",
          coins: "Not enough coins for that enroll/unlock.",
          promo: "Promo rejected.",
          return: "Finish checkout from this page so the pack can be credited.",
        }}
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
            <form action={startCoinCheckout} className="mt-5">
              <input type="hidden" name="packId" value={pack.id} />
              <GoldButton type="submit">Pay ${pack.price} with Stripe</GoldButton>
            </form>
          </article>
        ))}
      </div>
    </main>
  );
}
