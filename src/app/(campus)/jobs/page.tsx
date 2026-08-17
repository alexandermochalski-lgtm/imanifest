import Link from "next/link";
import { toggleFavorite } from "@/app/actions/campus";
import { Flash, GoldButton } from "@/components/ui";
import { jobs } from "@/lib/catalog";
import { getState } from "@/lib/state";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string }>;
}) {
  const params = await searchParams;
  const state = await getState();
  const query = (params.q ?? "").toLowerCase();
  const filtered = jobs.filter(
    (job) =>
      job.status === "open" &&
      (!query || job.title.toLowerCase().includes(query) || job.company.toLowerCase().includes(query)),
  );
  return (
    <main>
      <div className="flex items-end justify-between">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Job Board</h1>
        <Link href="/jobs/applications" className="text-sm text-gold">
          My applications
        </Link>
      </div>
      <Flash error={params.error} map={{ apply: "Application needs a mapped note." }} />
      <form className="mt-6 flex gap-3">
        <input name="q" defaultValue={params.q} placeholder="Search jobs" className="rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2 text-sm" />
        <GoldButton type="submit">Search</GoldButton>
      </form>
      <div className="mt-8 space-y-4">
        {filtered.map((job) => (
          <article key={job.id} className="rounded-2xl border border-[var(--line)] bg-panel p-6">
            <Link href={`/jobs/${job.slug}`} className="text-2xl text-white">
              {job.title}
            </Link>
            <p className="mt-1 text-sm text-gold">
              {job.company} · {job.location} · {job.salary}
            </p>
            <p className="mt-3 text-sm text-muted">{job.summary}</p>
            <form action={toggleFavorite.bind(null, "job", job.id)} className="mt-3">
              <button className="text-sm text-gold" type="submit">
                {state.favoriteJobs.includes(job.id) ? "Unfavorite" : "Favorite"}
              </button>
            </form>
          </article>
        ))}
      </div>
    </main>
  );
}
