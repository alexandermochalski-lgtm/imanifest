import { notFound } from "next/navigation";
import { startCoinCheckout } from "@/app/actions/campus";
import { GoldButton } from "@/components/ui";
import { coinPacks } from "@/lib/catalog";

export default async function PlaceOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pack = coinPacks.find((item) => item.id === id);
  if (!pack) notFound();
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">{pack.name}</h1>
      <p className="mt-3 text-muted">
        {pack.coins + pack.bonus} coins for ${pack.price}
        {pack.savePct ? ` (Save ${pack.savePct}%)` : ""}. Card capture is on Stripe.
      </p>
      <form action={startCoinCheckout} className="mt-8 max-w-md">
        <input type="hidden" name="packId" value={pack.id} />
        <GoldButton type="submit">Pay ${pack.price} with Stripe</GoldButton>
      </form>
    </main>
  );
}
