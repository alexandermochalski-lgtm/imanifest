import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Access denied" };

export default function AccessDeniedPage() {
  return (
    <main className="mx-auto max-w-xl px-5 py-24">
      <h1 className="font-[family-name:var(--font-cormorant)] text-5xl text-white">Access denied</h1>
      <p className="mt-4 text-muted">That desk is reserved for registrar / faculty roles. Use admin@imanifest.money to open the admin console.</p>
      <Link href="/campus" className="gold-btn mt-8 inline-block rounded-full px-7 py-3 text-sm font-semibold">
        Back to campus
      </Link>
    </main>
  );
}
