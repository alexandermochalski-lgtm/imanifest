import Link from "next/link";
import { programs, stats } from "@/lib/catalog";

export default function Home() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:pt-24">
        <p className="mb-5 text-xs uppercase tracking-[0.32em] text-gold">iManifest University · iMU</p>
        <h1 className="max-w-4xl font-[family-name:var(--font-cormorant)] text-5xl leading-[1.05] text-white md:text-7xl">
          Shape your financial future with institutional-grade education.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
          Investing in financial education is investing in your future. iMU teaches personal finance, investing, and
          wealth creation — including a curriculum of 21+ money-making methods designed to break default paths and
          put you in control of capital.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/programs" className="gold-btn rounded-full px-7 py-3 text-sm font-semibold">
            Browse programs
          </Link>
          <Link
            href="/campus"
            className="rounded-full border border-[var(--line)] px-7 py-3 text-sm text-gold transition hover:bg-white/5"
          >
            Preview campus
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] md:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="bg-panel px-6 py-8">
            <p className="font-[family-name:var(--font-cormorant)] text-4xl text-gold">{item.value}</p>
            <p className="mt-2 text-sm text-muted">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-gold">Faculty tracks</p>
            <h2 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl text-white">
              A campus, not a content dump
            </h2>
          </div>
          <Link href="/programs" className="hidden text-sm text-gold md:inline">
            View catalog →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {programs.slice(0, 3).map((program) => (
            <article key={program.slug} className="gold-ring rounded-2xl bg-panel p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">{program.faculty}</p>
              <h3 className="mt-3 font-[family-name:var(--font-cormorant)] text-2xl text-white">{program.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{program.summary}</p>
              <p className="mt-5 text-xs text-gold">
                {program.duration} · {program.modules} modules · {program.level}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-24 max-w-6xl rounded-3xl border border-[var(--line)] bg-black/40 px-6 py-14 md:px-12">
        <h2 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Shaping your future</h2>
        <p className="mt-5 max-w-3xl leading-8 text-muted">
          Hard work is not a strategy. iManifest University gives you knowledge, skill, and the right mindset — then
          a campus to practice: courses, quizzes, library, forum, and a job board for graduates who want to deploy
          what they learned.
        </p>
        <Link href="/about" className="gold-btn mt-8 inline-block rounded-full px-7 py-3 text-sm font-semibold">
          About the university
        </Link>
      </section>
    </main>
  );
}
