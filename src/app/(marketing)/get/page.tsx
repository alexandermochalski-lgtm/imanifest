import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { premiumMembership } from "@/lib/catalog";
import { isCampusUnlocked } from "@/lib/membership";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";
import { campusCheckoutUrl } from "@/lib/stripe";

export const metadata: Metadata = { title: "Get campus" };

export default async function GetPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await getSession();
  const state = await getState();
  if (session && (await isCampusUnlocked(session.role, state, session.userId, session.email))) {
    if (!state.membershipPaidAt && session.role !== "admin") redirect("/api/stripe/return");
    redirect(session.role === "admin" ? "/admin" : "/campus");
  }
  const pack = premiumMembership;
  const checkout = session ? campusCheckoutUrl(session.email, session.userId) : "";
  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">Campus door</p>
      <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl text-[#fff8e8]">{pack.name}</h1>
      <p className="mt-3 text-[#d4d4d4]">
        ${pack.price.toFixed(2)} per month unlocks campus. The public catalog stays free. Checkout is Stripe — monthly until you cancel.
      </p>
      <p className="mt-6 font-[family-name:var(--font-cormorant)] text-5xl text-gold">
        ${pack.price.toFixed(2)}
        <span className="text-lg text-muted"> / mo</span>
      </p>
      {pack.listPrice ? <p className="text-sm text-muted line-through">${pack.listPrice.toFixed(2)}</p> : null}
      {error === "canceled" ? (
        <p className="mt-4 text-sm text-red-200">That seat was canceled. Subscribe again to reopen campus.</p>
      ) : null}
      <ul className="mt-8 space-y-2 text-sm text-muted">
        {pack.features.map((feature) => (
          <li key={feature}>· {feature}</li>
        ))}
      </ul>
      {session ? (
        <div className="mt-10 space-y-4">
          <a href={checkout} className="gold-btn inline-flex w-full rounded-xl px-5 py-3 text-[10px]">
            Pay ${pack.price.toFixed(2)} / mo with Stripe
          </a>
          <p className="text-sm text-muted">
            After Stripe, you return here and campus opens. If the tab did not bounce back,{" "}
            <Link href="/api/stripe/return" className="text-gold">
              enter campus
            </Link>
            .
          </p>
        </div>
      ) : (
        <p className="mt-10">
          <Link href="/login?next=/get" className="gold-btn inline-flex rounded-xl px-5 py-2.5 text-xs">
            Log in to pay
          </Link>
        </p>
      )}
    </main>
  );
}
