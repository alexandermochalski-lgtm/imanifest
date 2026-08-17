import type { Metadata } from "next";
import { campusTools, programs } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Campus",
};

export default function CampusPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">Student workspace</p>
      <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-5xl text-white">Campus preview</h1>
      <p className="mt-4 max-w-2xl text-muted">
        This is the working shell of the new campus. Auth, purchases, quizzes, and the job board plug in here as we
        migrate off the legacy Laravel stack.
      </p>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {campusTools.map((tool) => (
          <article key={tool.title} className="rounded-2xl border border-[var(--line)] bg-panel p-6">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-gold">{tool.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{tool.copy}</p>
          </article>
        ))}
      </div>

      <section className="mt-14 rounded-2xl border border-[var(--line)] bg-black/40 p-6">
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-white">Enrolled tracks (demo)</h2>
        <ul className="mt-6 divide-y divide-[var(--line)]">
          {programs.slice(0, 4).map((program, index) => (
            <li key={program.slug} className="flex items-center justify-between py-4 text-sm">
              <span className="text-white">{program.title}</span>
              <span className="text-gold">{[18, 42, 67, 9][index]}% complete</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
