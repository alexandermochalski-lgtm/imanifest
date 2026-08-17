import type { Metadata } from "next";
import { programs } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Programs",
};

export default function ProgramsPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">Catalog</p>
      <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-5xl text-white">Programs</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Six opening tracks for the new iMU campus. Curriculum, assessments, and enrollment will connect to the live
        platform next.
      </p>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {programs.map((program) => (
          <article key={program.slug} className="gold-ring rounded-2xl bg-panel p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">{program.faculty}</p>
                <h2 className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-white">{program.title}</h2>
              </div>
              <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-gold">
                {program.level}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted">{program.summary}</p>
            <p className="mt-6 text-sm text-gold">
              {program.duration} · {program.modules} modules
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
