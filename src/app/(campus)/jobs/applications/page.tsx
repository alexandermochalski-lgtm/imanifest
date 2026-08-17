import Link from "next/link";
import { Flash } from "@/components/ui";
import { jobs } from "@/lib/catalog";
import { getState } from "@/lib/state";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const state = await getState();
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">My applications</h1>
      <Flash ok={ok} map={{ "1": "Application submitted." }} />
      <div className="mt-8 space-y-4">
        {state.applications.length === 0 ? <p className="text-muted">None yet.</p> : null}
        {state.applications.map((application) => {
          const job = jobs.find((item) => item.id === application.jobId);
          return (
            <article key={application.id} className="rounded-2xl border border-[var(--line)] bg-panel p-5">
              <Link href={job ? `/jobs/${job.slug}` : "/jobs"} className="text-white">
                {job?.title ?? application.jobId}
              </Link>
              <p className="mt-1 text-sm text-gold">
                {application.status} · {application.createdAt}
              </p>
              <p className="mt-3 text-sm text-muted">{application.note}</p>
            </article>
          );
        })}
      </div>
    </main>
  );
}
