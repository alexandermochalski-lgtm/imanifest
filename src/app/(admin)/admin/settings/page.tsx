import { PageHeader } from "@/components/admin/ui";
import { catalogCounts } from "@/lib/desk";

export default function AdminSettingsPage() {
  return (
    <main>
      <PageHeader
        kicker="Ops"
        title="Settings"
        description="What is live on this staging desk, and what still needs production rails."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--line)] p-5">
          <h2 className="text-lg text-gold">Ledger</h2>
          <p className="mt-2 text-sm text-muted">
            Command numbers are a seeded campus ledger plus this browser&apos;s live coin checkouts, enrollments, and job
            applications. Account status, hiring moves, promo toggles, and internal notes persist in an admin cookie.
          </p>
          <p className="mt-3 text-sm text-muted">
            Catalog now: {catalogCounts.courses} courses · {catalogCounts.books} books · {catalogCounts.bundles} bundles ·{" "}
            {catalogCounts.jobs} jobs.
          </p>
        </section>
        <section className="rounded-2xl border border-[var(--line)] p-5">
          <h2 className="text-lg text-gold">Stripe / cards</h2>
          <p className="mt-2 text-sm text-muted">
            Coin checkout is simulated. Wire <code className="text-gold">STRIPE_SECRET</code> and webhook signing when this
            campus leaves staging so Payments becomes a real settlement book.
          </p>
        </section>
        <section className="rounded-2xl border border-[var(--line)] p-5">
          <h2 className="text-lg text-gold">Mail &amp; auth</h2>
          <p className="mt-2 text-sm text-muted">
            Demo seats: <span className="text-white">admin@imanifest.money</span> and{" "}
            <span className="text-white">student@imanifest.money</span> / <span className="text-white">imanifest</span>.
            Production needs SMTP, password reset, and a user table — register is demo-only until then.
          </p>
        </section>
        <section className="rounded-2xl border border-[var(--line)] p-5">
          <h2 className="text-lg text-gold">Media storage</h2>
          <p className="mt-2 text-sm text-muted">
            Course video/audio and book PDFs are not saved inside the Next.js app. On Vercel the filesystem is
            ephemeral. Production files go to <span className="text-white">Vercel Blob</span> (object storage): browser
            uploads the bytes; this desk stores the URL on the course/book.
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
            <li>Vercel dashboard → project → Storage → Create Blob store → Connect to this project.</li>
            <li>
              Locally: <code className="text-gold">npx vercel env pull</code> so{" "}
              <code className="text-gold">BLOB_READ_WRITE_TOKEN</code> exists.
            </li>
            <li>
              Upload under <span className="text-white">/admin/media</span>, then attach on a course lesson or book.
            </li>
          </ol>
          <p className="mt-3 text-sm text-muted">
            MP4 in Blob is fine for operator-length lessons. Full-semester 4K should move to Mux or Cloudflare Stream
            (HLS) later — same attach-URL pattern.
          </p>
        </section>
      </div>
    </main>
  );
}
