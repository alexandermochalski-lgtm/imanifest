import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { premiumMembership } from "@/lib/catalog";
import { isCampusUnlocked, isFreeSeat, memberRecord } from "@/lib/membership";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";
import { campusCheckoutUrl } from "@/lib/stripe";

export const metadata: Metadata = { title: "Upgrade campus" };

export default async function GetPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await getSession();
  const state = await getState();
  const free = session ? isFreeSeat(state) : false;

  if (session && (await isCampusUnlocked(session.role, state, session.userId, session.email))) {
    // Paid seats → campus. Free seats stay here to upgrade (do NOT hit Stripe return).
    if (state.membershipPaidAt || session.role === "admin") {
      redirect(session.role === "admin" ? "/admin" : "/campus");
    }
    const row = await memberRecord(session.userId, session.email);
    if (row?.status === "active") redirect("/api/stripe/return");
    // free / unlocking → show upgrade UI below
  }

  const pack = premiumMembership;
  const checkout = session ? campusCheckoutUrl(session.email, session.userId) : "";
  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">{free ? "Upgrade" : "Campus door"}</p>
      <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl text-[#fff8e8]">
        {free ? "Unlock the full campus" : pack.name}
      </h1>
      <p className="mt-3 text-[#d4d4d4]">
        {free
          ? "Your free seat includes Sovereign Mindset and Personal Finance. Full membership opens every desk, stacks, stipend coins, and the operator floor."
          : `$${pack.price.toFixed(2)} per month unlocks the full campus. Or start free with two foundation desks — no card required.`}
      </p>
      <p className="mt-6 font-[family-name:var(--font-cormorant)] text-5xl text-gold">
        ${pack.price.toFixed(2)}
        <span className="text-lg text-muted"> / mo</span>
      </p>
      {pack.listPrice ? <p className="text-sm text-muted line-through">${pack.listPrice.toFixed(2)}</p> : null}
      {error === "canceled" ? (
        <p className="mt-4 text-sm text-red-200">That seat was canceled. Subscribe again to reopen campus.</p>
      ) : null}
      {error === "upgrade" ? (
        <p className="mt-4 text-sm text-gold">That desk needs full membership. Upgrade below to enroll.</p>
      ) : null}
      <ul className="mt-8 space-y-2 text-sm text-muted">
        {pack.features.map((feature) => (
          <li key={feature}>· {feature}</li>
        ))}
      </ul>
      {session ? (
        <div className="mt-10 space-y-4">
          <a href={checkout} className="gold-btn inline-flex w-full rounded-xl px-5 py-3 text-[10px]">
            Upgrade · ${pack.price.toFixed(2)} / mo
          </a>
          {free ? (
            <Link href="/campus" className="ghost-btn inline-flex w-full justify-center rounded-xl px-5 py-3 text-[10px]">
              Back to free campus
            </Link>
          ) : (
            <p className="text-sm text-muted">
              Prefer to start free?{" "}
              <Link href="/register" className="text-gold">
                Create a free seat
              </Link>
              .
            </p>
          )}
          <p className="text-sm text-muted">
            After Stripe, campus opens at full access. If the tab did not bounce back,{" "}
            <Link href="/api/stripe/return" className="text-gold">
              enter campus
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-3">
          <Link href="/register" className="gold-btn inline-flex w-full justify-center rounded-xl px-5 py-2.5 text-xs">
            Start free · $0
          </Link>
          <Link href="/login?next=/get" className="ghost-btn inline-flex w-full justify-center rounded-xl px-5 py-2.5 text-xs">
            Log in to upgrade
          </Link>
        </div>
      )}
    </main>
  );
}
