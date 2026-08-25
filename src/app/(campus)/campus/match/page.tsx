import Link from "next/link";
import { MatchWizard } from "@/components/match/MatchWizard";
import { Flash } from "@/components/ui";
import { getState } from "@/lib/state";

export default async function CampusMatchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const state = await getState();

  return (
    <main>
      <p className="text-xs uppercase tracking-[0.28em] text-gold">AI Matching</p>
      <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl text-white">Find your next desk</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Answer six operator questions. We score the live catalog — including every new course that lands — and hand
        you a path.
      </p>
      {state.lastMatch ? (
        <p className="mt-4 text-sm text-muted">
          Last path: <span className="text-gold">{state.lastMatch.pathLabel}</span> ·{" "}
          <Link className="text-gold" href="/campus/match/results">
            Open results
          </Link>
        </p>
      ) : null}
      <div className="mt-6">
        <Flash error={error} map={{ incomplete: "Finish the questions to unlock your path." }} />
      </div>
      <div className="mt-8 max-w-3xl">
        <MatchWizard source="campus" />
      </div>
    </main>
  );
}
