import { notFound } from "next/navigation";
import { buyCoins } from "@/app/actions/campus";
import { Flash, GoldButton } from "@/components/ui";
import { coinPacks } from "@/lib/catalog";

export default async function PlaceOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const pack = coinPacks.find((item) => item.id === id);
  if (!pack) notFound();
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Place order</h1>
      <p className="mt-3 text-muted">
        {pack.name}: {pack.coins + pack.bonus} coins for ${pack.price}
        {pack.savePct ? ` (Save ${pack.savePct}%)` : ""}
      </p>
      <Flash error={error} map={{ promo: "Promo code inactive or unknown." }} />
      <form action={buyCoins} className="mt-8 max-w-md space-y-4">
        <input type="hidden" name="packId" value={pack.id} />
        <input name="promo" placeholder="Promo code (optional)" className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2" />
        <input name="card" placeholder="Card number (simulated)" defaultValue="4242 4242 4242 4242" className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2" />
        <GoldButton type="submit">Pay and credit coins</GoldButton>
      </form>
    </main>
  );
}
