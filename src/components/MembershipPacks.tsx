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
  const methods = courseCount ? `${courseCount}+` : "49+";
  const features = pack.features.map((feature) =>
    feature.replace("49+", methods),
  );

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 md:py-24" id={id}>
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Pricing</p>
      <h2 className="mt-3 text-center font-[family-name:var(--font-cormorant)] text-3xl font-medium tracking-tight text-white md:text-5xl">
        $49.99/mo. One campus.
        <span className="block text-gold">Everything else runs inside it.</span>
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-7 text-[var(--text-soft)]">
        Browse {methods} courses free. Subscribe to enroll, practice on the daily desk, and access the full operator
        campus. Coin packs are optional top-ups — not a second membership.
      </p>
      <article className="imu-card mx-auto mt-12 max-w-md rounded-2xl p-8">
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
          Coins = campus currency. Your membership includes 50/month. Need more? Buy packs after you&apos;re in —
          optional, not required.
        </p>
        <Link href={pack.href} className="gold-btn mt-8 inline-flex w-full justify-center rounded-lg px-5 py-3">
          Start on campus · ${pack.price.toFixed(2)}/mo
        </Link>
      </article>
    </section>
  );
}
