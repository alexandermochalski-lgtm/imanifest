import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Get started" };

export default function GetStartedPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-20">
      <h1 className="font-[family-name:var(--font-cormorant)] text-5xl text-white">Get started</h1>
      <ol className="mt-8 list-decimal space-y-4 pl-5 text-muted">
        <li>Log in with a demo seat.</li>
        <li>Sovereign Mindset is already enrolled (free).</li>
        <li>Buy coins, enroll paid tracks, pass quizzes at 70%.</li>
        <li>Use library, journals, forum, job board, bundles, and messages exactly as the legacy campus did.</li>
      </ol>
      <Link href="/login" className="gold-btn mt-10 inline-block rounded-full px-7 py-3 text-sm font-semibold">
        Log in
      </Link>
    </main>
  );
}
