import type { Metadata } from "next";
import Link from "next/link";
import { premiumMembership } from "@/lib/catalog";

export const metadata: Metadata = { title: "Get started" };

export default function GetStartedPage() {
  const price = premiumMembership.price.toFixed(2);
  return (
    <main className="mx-auto max-w-2xl px-5 py-20">
      <h1 className="font-[family-name:var(--font-cormorant)] text-5xl text-white">Get started</h1>
      <ol className="mt-8 list-decimal space-y-4 pl-5 text-muted">
        <li>Browse programs on the public site. No payment required.</li>
        <li>Log in, then subscribe ${price} / month on Stripe. That is the only membership.</li>
        <li>Sovereign Mindset is enrolled at zero coins. Buy coins for paid tracks.</li>
        <li>Close the daily desk for the streak. Coins inside campus are a ledger, not a second pack.</li>
      </ol>
      <Link href="/get" className="gold-btn mt-10 inline-block rounded-full px-7 py-3 text-sm font-semibold">
        Get campus · ${price}/mo
      </Link>
    </main>
  );
}
