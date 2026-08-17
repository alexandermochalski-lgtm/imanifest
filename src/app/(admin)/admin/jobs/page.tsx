import Link from "next/link";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { jobs } from "@/lib/catalog";
import { getDesk } from "@/lib/desk";

export default async function AdminJobsPage() {
  const desk = await getDesk();
  return (
    <main>
      <PageHeader
        kicker="Hiring"
        title="Jobs"
        description="Open roles and inbound volume. Pipeline lives under Applications."
        action={
          <Link className="ghost-btn rounded-xl px-4 py-2 text-[10px]" href="/admin/applications">
            Pipeline
          </Link>
        }
      />
      <div className="space-y-4">
        {jobs.map((job) => {
          const apps = desk.applications.filter((item) => item.jobId === job.id);
          const hired = apps.filter((item) => item.status === "hired").length;
          const open = apps.filter((item) => item.status === "submitted" || item.status === "reviewing").length;
          return (
            <article key={job.id} className="imu-card rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg text-white">{job.title}</p>
                  <p className="text-sm text-gold">
                    {job.company} · {job.location} · {job.salary}
                  </p>
                </div>
                <StatusBadge status={job.status} />
              </div>
              <p className="mt-3 text-sm text-muted">{job.summary}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-gold-deep">
                {apps.length} applications · {open} in review · {hired} hired
              </p>
              <p className="mt-2 text-sm text-muted">{job.facilities.join(" · ")}</p>
            </article>
          );
        })}
      </div>
    </main>
  );
}
