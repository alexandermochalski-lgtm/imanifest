import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">iManifest University</p>
      <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-5xl font-medium tracking-tight text-white md:text-6xl">
        Built for operators,
        <span className="block text-gold">not spectators.</span>
      </h1>

      <div className="mt-10 space-y-6 text-base leading-7 text-[var(--text-soft)] md:text-lg md:leading-8">
        <p>
          iManifest University exists for people who treat money as a skill — not a personality, not a lottery ticket,
          not a feed to scroll. We teach live money methods across finance, investing, e-commerce, marketing, and
          personal development. Then we give you a campus to run them.
        </p>
        <p>
          Most platforms sell content. iMU sells a <span className="text-white">surplus process</span>: enroll in a
          method, sit the quiz, journal what you shipped, show up on the daily desk, and compound. Without surplus,
          every course is entertainment. With a desk, it becomes income.
        </p>
        <p>
          Inside campus you get the full catalog, library, journals, forum, job board, messenger, and coin ledger — one
          membership, one place to operate. Browse the catalog free. Run the campus when you are ready to execute.
        </p>
      </div>

      <section className="imu-section mt-12 rounded-2xl p-6 md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">What we believe</p>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-soft)] md:text-base">
          <li>
            <span className="text-gold">·</span> Two methods run fully beat eleven half-built funnels.
          </li>
          <li>
            <span className="text-gold">·</span> The journal is the desk — document process, not performance.
          </li>
          <li>
            <span className="text-gold">·</span> Jobs are mandates. Applications without a campus trail do not pass.
          </li>
          <li>
            <span className="text-gold">·</span> Wealth is built on repetition, not inspiration.
          </li>
        </ul>
      </section>

      <div className="mt-12 border-t border-[var(--line)] pt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Support</p>
        <p className="mt-3 text-base leading-7 text-[var(--text-soft)]">
          Enrollment, billing, or access questions — reach the desk at{" "}
          <a className="text-gold transition hover:text-white" href="mailto:info@imanifest.money">
            info@imanifest.money
          </a>
          .
        </p>
        <Link href="/get" className="gold-btn mt-6 inline-flex rounded-lg px-7 py-3.5">
          Start on campus
        </Link>
      </div>
    </main>
  );
}
