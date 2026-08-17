import Link from "next/link";
import { membershipPackages } from "@/lib/catalog";

export function MembershipPacks({ id = "pricing" }: { id?: string }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24" id={id}>
      <p className="text-center text-xs font-extrabold uppercase tracking-[0.28em] text-gold">Pricing</p>
      <h2 className="mt-3 text-center font-[family-name:var(--font-cormorant)] text-4xl text-[#fff8e8] md:text-5xl">
        What are you waiting for?
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-[#d4d4d4]">
        Same three packs as app.imanifest.money. Premium is the $49.99 start. Campus coins are a separate ledger after login.
      </p>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {membershipPackages.map((pack) => (
          <article
            key={pack.id}
            className={`rounded-2xl border p-6 ${pack.featured ? "border-gold bg-[#14110c]" : "border-[var(--line)] bg-black/40"}`}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">{pack.duration}</p>
            <h3 className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-white">{pack.name}</h3>
            <p className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl text-gold">
              {pack.price === 0 ? "$00.00" : `$${pack.price.toFixed(2)}`}
            </p>
            {pack.listPrice ? <p className="text-sm text-muted line-through">${pack.listPrice.toFixed(2)}</p> : null}
            <ul className="mt-6 space-y-2 text-sm text-muted">
              {pack.features.map((feature) => (
                <li key={feature}>· {feature}</li>
              ))}
            </ul>
            <Link href={pack.href} className="gold-btn mt-8 inline-flex w-full rounded-xl px-5 py-3 text-[10px]">
              Subscribe now
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
