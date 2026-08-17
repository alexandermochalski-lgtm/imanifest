import Link from "next/link";
import { insights } from "@/lib/catalog";

export default function InsightsPage() {
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Insights</h1>
      <div className="mt-8 space-y-5">
        {insights.map((insight) => (
          <article key={insight.id} className="rounded-2xl border border-[var(--line)] bg-panel p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">{insight.kicker}</p>
            <h2 className="mt-2 text-2xl text-white">{insight.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{insight.body}</p>
            <Link href={`/insights#${insight.slug}`} className="mt-3 inline-block text-xs text-gold">
              #{insight.slug}
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
