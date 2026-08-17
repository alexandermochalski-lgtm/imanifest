import Link from "next/link";
import { premiumMembership } from "@/lib/catalog";

export function MembershipPacks({ id = "pricing" }: { id?: string }) {
  const pack = premiumMembership;
  return (
    <section className="mx-auto max-w-6xl px-5 py-24" id={id}>
      <p className="text-center text-xs font-extrabold uppercase tracking-[0.28em] text-gold">Pricing</p>
      <h2 className="mt-3 text-center font-[family-name:var(--font-cormorant)] text-4xl text-[#fff8e8] md:text-5xl">
        One door. Then campus.
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-[#d4d4d4]">
        The catalog is free to browse. Campus is ${pack.price.toFixed(2)} / month on Stripe. Coins are a separate ledger after you are in — not a second membership.
      </p>
      <article className="mx-auto mt-12 max-w-md rounded-2xl border border-gold bg-[#14110c] p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">{pack.duration}</p>
        <h3 className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-white">{pack.name}</h3>
        <p className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl text-gold">
          ${pack.price.toFixed(2)}
          <span className="text-lg text-muted"> / mo</span>
        </p>
        {pack.listPrice ? <p className="text-sm text-muted line-through">${pack.listPrice.toFixed(2)}</p> : null}
        <ul className="mt-6 space-y-2 text-sm text-muted">
          {pack.features.map((feature) => (
            <li key={feature}>· {feature}</li>
          ))}
        </ul>
        <Link href={pack.href} className="gold-btn mt-8 inline-flex w-full rounded-xl px-5 py-3 text-[10px]">
          Get campus · ${pack.price.toFixed(2)}/mo
        </Link>
      </article>
    </section>
  );
}
