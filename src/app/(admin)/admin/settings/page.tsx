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
          <h2 className="text-lg text-gold">Desk contact</h2>
          <p className="mt-2 text-sm text-muted">
            Public desk remains info@imanifest.money. Chatify is replaced by campus /messages.
          </p>
        </section>
      </div>
    </main>
  );
}
