import Link from "next/link";
import { premiumMembership } from "@/lib/catalog";

export function MembershipPacks({
  id = "pricing",
  courseCount,
}: {
  id?: string;
  courseCount?: number;
}) {
  const pack = premiumMembership;
  const methods = courseCount ? `${courseCount}+` : "100+";
  const features = pack.features.map((feature) => feature.replace("49+", methods));

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-20 md:py-24" id={id}>
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Pricing</p>
      <h2 className="mt-3 text-center font-[family-name:var(--font-cormorant)] text-3xl font-medium tracking-tight text-white md:text-5xl">
        Start free. Upgrade when you&apos;re ready.
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-7 text-[var(--text-soft)]">
        Claim a free campus seat with two foundation desks. Full membership unlocks {methods} methods, stipend coins,
        and the entire operator floor.
      </p>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">Freemium</p>
          <h3 className="mt-2 font-[family-name:var(--font-cormorant)] text-2xl font-medium text-white">Free seat</h3>
          <p className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl font-medium text-gold">
            $0
            <span className="text-base text-[var(--muted)]"> forever</span>
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-[var(--text-soft)]">
            <li className="flex gap-2">
              <span className="text-gold">·</span>
              <span>Campus login — feed, profile, directory</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gold">·</span>
              <span>Sovereign Mindset — full desk, no card</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gold">·</span>
              <span>Personal Finance Operating System</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gold">·</span>
              <span>AI Matching to find your next path</span>
            </li>
          </ul>
          <Link href="/register" className="ghost-btn mt-8 inline-flex w-full justify-center rounded-lg px-5 py-3">
            Create free account
          </Link>
        </article>

        <article className="imu-card rounded-2xl p-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">{pack.duration}</p>
          <h3 className="mt-2 font-[family-name:var(--font-cormorant)] text-2xl font-medium text-white">{pack.name}</h3>
          <p className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl font-medium text-gold">
            ${pack.price.toFixed(2)}
            <span className="text-base text-[var(--muted)]"> / month</span>
          </p>
          {pack.listPrice ? (
            <p className="mt-1 text-sm text-[var(--muted)]">
              {pack.listPriceLabel ? `${pack.listPriceLabel} · ` : ""}
              <span className="line-through">${pack.listPrice.toFixed(2)}</span>
            </p>
          ) : null}
          <ul className="mt-6 space-y-2.5 text-sm text-[var(--text-soft)]">
            {features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span className="text-gold">·</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-5 text-[var(--muted)]">
            Includes 50 coins / month. Coin packs stay optional top-ups after you&apos;re in.
          </p>
          <Link href={pack.href} className="gold-btn mt-8 inline-flex w-full justify-center rounded-lg px-5 py-3">
            Unlock full campus · ${pack.price.toFixed(2)}/mo
          </Link>
        </article>
      </div>
    </section>
  );
}
