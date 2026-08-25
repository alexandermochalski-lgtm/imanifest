import Link from "next/link";
import { AdminTable, Kpi, PageHeader } from "@/components/admin/ui";
import { emptyMatchingAnalytics, MATCH_QUESTIONS } from "@/lib/matching";
import { readOverlay } from "@/lib/storage";

export default async function AdminMatchingPage() {
  const overlay = await readOverlay();
  const matching = { ...emptyMatchingAnalytics(), ...(overlay.matching ?? {}) };
  const goalLabels = new Map(
    MATCH_QUESTIONS[0]?.options.map((option) => [option.id, option.label]) ?? [],
  );
  const formatLabels = new Map(
    MATCH_QUESTIONS.find((q) => q.id === "format")?.options.map((option) => [option.id, option.label]) ?? [],
  );

  return (
    <main>
      <PageHeader
        kicker="Campus"
        title="AI Matching"
        description="Guided desk matching — completions from marketing and campus. Recommendations always score the live catalog."
        action={
          <Link className="ghost-btn rounded-lg px-5 py-2.5 text-[11px]" href="/match">
            Open Matching
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Completions" value={String(matching.completions)} hint={matching.lastAt ? `Last ${matching.lastAt}` : "No completions yet"} />
        <Kpi label="Starts" value={String(matching.starts)} hint="First answer clicked" />
        <Kpi
          label="Finish rate"
          value={matching.starts ? `${Math.round((matching.completions / matching.starts) * 100)}%` : "—"}
          hint="Completions / starts"
        />
        <Kpi
          label="Recent samples"
          value={String(matching.recent.length)}
          hint="Last 40 stored in overlay"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="imu-section rounded-2xl p-5 md:p-6">
          <h2 className="text-lg text-white">By goal</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {Object.entries(matching.byGoal).length ? (
              Object.entries(matching.byGoal)
                .sort((a, b) => b[1] - a[1])
                .map(([id, count]) => (
                  <li key={id} className="flex justify-between gap-3">
                    <span>{goalLabels.get(id) ?? id}</span>
                    <span className="text-gold">{count}</span>
                  </li>
                ))
            ) : (
              <li>No data yet.</li>
            )}
          </ul>
        </section>
        <section className="imu-section rounded-2xl p-5 md:p-6">
          <h2 className="text-lg text-white">By study format</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {Object.entries(matching.byFormat).length ? (
              Object.entries(matching.byFormat)
                .sort((a, b) => b[1] - a[1])
                .map(([id, count]) => (
                  <li key={id} className="flex justify-between gap-3">
                    <span>{formatLabels.get(id) ?? id}</span>
                    <span className="text-gold">{count}</span>
                  </li>
                ))
            ) : (
              <li>No data yet.</li>
            )}
          </ul>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg text-white">Recent completions</h2>
        <AdminTable columns={["Date", "Path", "Goal", "Format", "Source", "Top courses"]}>
          {matching.recent.length ? (
            matching.recent.map((row, index) => (
              <tr key={`${row.at}-${index}`} className="border-t border-[var(--line)]">
                <td className="px-4 py-3">{row.at}</td>
                <td className="px-4 py-3 text-white">{row.pathLabel}</td>
                <td className="px-4 py-3">{goalLabels.get(row.goal ?? "") ?? row.goal ?? "—"}</td>
                <td className="px-4 py-3">{formatLabels.get(row.format ?? "") ?? row.format ?? "—"}</td>
                <td className="px-4 py-3">{row.source}</td>
                <td className="px-4 py-3 text-xs text-muted">{row.topCourseIds.slice(0, 2).join(", ") || "—"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-6 text-muted" colSpan={6}>
                No Matching completions yet.
              </td>
            </tr>
          )}
        </AdminTable>
      </section>
    </main>
  );
}
