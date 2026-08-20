"use client";

import Link from "next/link";

export default function CampusError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Campus</p>
      <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl text-white">Desk stalled</h1>
      <p className="mt-3 text-sm text-muted">
        The dashboard hit a server error. Reload, or go back to the public site and enter again.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <button type="button" onClick={reset} className="gold-btn rounded-xl px-5 py-2.5 text-xs">
          Reload campus
        </button>
        <Link href="/" className="text-sm text-gold">
          Home
        </Link>
      </div>
    </main>
  );
}
