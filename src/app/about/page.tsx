import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">The university</p>
      <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-5xl text-white">About iManifest</h1>
      <div className="mt-8 space-y-6 text-lg leading-8 text-muted">
        <p>
          iManifest University exists for people who refuse to treat money as folklore. The original campus taught
          personal finance, investing, and wealth creation — including 21 money-making methods — alongside books,
          journals, a forum, and a job board.
        </p>
        <p>
          This repository is the new product line: a Next.js campus designed for Vercel, so we can iterate the
          student experience without being locked to the old cPanel / Laravel stack.
        </p>
        <p>
          Brand, curriculum intent, and domain remain iManifest. The engineering surface is new. Contact{" "}
          <a className="text-gold underline-offset-4 hover:underline" href="mailto:info@imanifest.money">
            info@imanifest.money
          </a>
          .
        </p>
      </div>
    </main>
  );
}
