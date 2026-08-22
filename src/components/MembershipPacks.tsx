import Link from "next/link";
import { premiumMembership } from "@/lib/catalog";

export function MembershipPacks({ id = "pricing" }: { id?: string }) {
  const pack = premiumMembership;
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 md:py-24" id={id}>
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Pricing</p>
      <h2 className="mt-3 text-center font-[family-name:var(--font-cormorant)] text-3xl font-medium tracking-tight text-white md:text-5xl">
        One door. Then campus.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-[var(--text-soft)]">
        Browse free. Campus is ${pack.price.toFixed(2)}/mo. Coins are a separate ledger after you are in.
      </p>
      <article className="imu-card mx-auto mt-12 max-w-md rounded-2xl p-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">{pack.duration}</p>
        <h3 className="mt-2 font-[family-name:var(--font-cormorant)] text-2xl font-medium text-white">{pack.name}</h3>
        <p className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl font-medium text-gold">
          ${pack.price.toFixed(2)}
          <span className="text-base text-[var(--muted)]"> / mo</span>
        </p>
        {pack.listPrice ? <p className="text-sm text-[var(--muted)] line-through">${pack.listPrice.toFixed(2)}</p> : null}
        <ul className="mt-6 space-y-2.5 text-sm text-[var(--text-soft)]">
          {pack.features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span className="text-gold">·</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Link href={pack.href} className="gold-btn mt-8 inline-flex w-full rounded-lg px-5 py-3">
          Get campus · ${pack.price.toFixed(2)}/mo
        </Link>
      </article>
    </section>
  );
}
