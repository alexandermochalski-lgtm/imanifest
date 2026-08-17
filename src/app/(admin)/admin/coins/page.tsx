import { coinPacks, promoCodes } from "@/lib/catalog";

export default function AdminCoinsPage() {
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Coins & promo</h1>
      <h2 className="mt-8 text-xl text-gold">Packs</h2>
      <ul className="mt-3 space-y-2 text-muted">
        {coinPacks.map((pack) => (
          <li key={pack.id}>
            {pack.name}: {pack.coins}+{pack.bonus} for ${pack.price}
          </li>
        ))}
      </ul>
      <h2 className="mt-8 text-xl text-gold">Promo codes</h2>
      <ul className="mt-3 space-y-2 text-muted">
        {promoCodes.map((code) => (
          <li key={code.code}>
            {code.code} · {code.discountPct}% · {code.active ? "active" : "off"}
          </li>
        ))}
      </ul>
    </main>
  );
}
