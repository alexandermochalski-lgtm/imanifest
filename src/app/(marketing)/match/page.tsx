import Link from "next/link";
import { MatchWizard } from "@/components/match/MatchWizard";
import { Flash } from "@/components/ui";
import { getDeliverableCourses } from "@/lib/live-catalog";

export default async function MatchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const courses = await getDeliverableCourses();

  return (
    <main>
      <section className="mx-auto max-w-3xl px-5 pb-10 pt-16 md:pt-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">AI Matching</p>
        <h1 className="mt-4 font-[family-name:var(--font-cormorant)] text-4xl font-medium tracking-tight text-white md:text-6xl">
          Find your desk
          <span className="block text-gold">in under a minute.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-soft)]">
          Six questions. We map you onto the live campus catalog — {courses.length} courses, plus books and stacks —
          so you start where surplus actually compounds. No guesswork. No scroll fatigue.
        </p>
        <div className="mt-6">
          <Flash error={error} map={{ incomplete: "Answer the questions to get your path." }} />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-20">
        <MatchWizard source="marketing" />
        <p className="mt-6 text-center text-xs text-muted">
          Prefer to browse?{" "}
          <Link className="text-gold hover:text-white" href="/programs">
            Open the full catalog
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
