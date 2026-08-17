import { jobs } from "@/lib/catalog";
import { getState } from "@/lib/state";

export default async function AdminJobsPage() {
  const state = await getState();
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Job posts</h1>
      <div className="mt-8 space-y-4">
        {jobs.map((job) => (
          <article key={job.id} className="rounded-xl border border-[var(--line)] p-5">
            <p className="text-white">{job.title}</p>
            <p className="text-sm text-gold">
              {job.company} · {job.status} · {state.applications.filter((item) => item.jobId === job.id).length} applications
            </p>
            <p className="mt-2 text-sm text-muted">{job.facilities.join(" · ")}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
