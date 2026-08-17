import { notFound } from "next/navigation";
import { applyToJob, toggleFavorite } from "@/app/actions/campus";
import { GoldButton } from "@/components/ui";
import { jobBySlug } from "@/lib/catalog";
import { getState } from "@/lib/state";

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = jobBySlug(slug);
  if (!job) notFound();
  const state = await getState();
  const applied = state.applications.some((application) => application.jobId === job.id);
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">{job.title}</h1>
      <p className="mt-2 text-gold">
        {job.company} · {job.type} · {job.salary}
      </p>
      <p className="mt-6 max-w-2xl text-muted">{job.body}</p>
      <ul className="mt-4 list-disc pl-5 text-sm text-muted">
        {job.facilities.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <form action={toggleFavorite.bind(null, "job", job.id)} className="mt-4">
        <button className="text-sm text-gold" type="submit">
          {state.favoriteJobs.includes(job.id) ? "Unfavorite" : "Favorite"}
        </button>
      </form>
      {applied ? (
        <p className="mt-8 text-gold">Application already on file.</p>
      ) : (
        <form action={applyToJob} className="mt-8 max-w-xl space-y-3">
          <input type="hidden" name="jobId" value={job.id} />
          <textarea
            name="note"
            rows={5}
            required
            placeholder="Map completed modules to this mandate..."
            className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2"
          />
          <GoldButton type="submit">Apply</GoldButton>
        </form>
      )}
    </main>
  );
}
