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
            Campus door is the live Payment Link at $49.99 / month. After payment, Stripe must send the student back to{" "}
            <code className="text-gold">https://imanifest.vercel.app/get/thanks</code> (Payment Link → After payment →
            redirect). Webhook endpoint: <code className="text-gold">https://imanifest.vercel.app/api/stripe/webhook</code>{" "}
            for <code className="text-gold">checkout.session.completed</code>, <code className="text-gold">invoice.paid</code>,{" "}
            <code className="text-gold">customer.subscription.deleted</code>. Set{" "}
            <code className="text-gold">STRIPE_WEBHOOK_SECRET</code> in Vercel env.
          </p>
          <p className="mt-3 text-sm text-muted">
            Coin packs are live Payment Links: Starter $12, Operator $39, Desk $89. After payment, each link must send the student back to{" "}
            <code className="text-gold">https://imanifest.vercel.app/pricing/thanks?pack=coin-starter</code> (or{" "}
            <code className="text-gold">coin-operator</code> / <code className="text-gold">coin-desk</code>). The $49.99
            seat credits 50 coins each UTC month. Peer DMs cost 1 coin.
          </p>
        </section>
        <section className="rounded-2xl border border-[var(--line)] p-5">
          <h2 className="text-lg text-gold">Mail &amp; auth</h2>
          <p className="mt-2 text-sm text-muted">
            Demo seats still work: <span className="text-white">admin@imanifest.money</span> and{" "}
            <span className="text-white">student@imanifest.money</span> / <span className="text-white">imanifest</span>.
            New students register into Supabase Auth. Confirm emails if the project has confirmations on.
          </p>
        </section>
        <section className="rounded-2xl border border-[var(--line)] p-5">
          <h2 className="text-lg text-gold">Supabase</h2>
          <p className="mt-2 text-sm text-muted">
            Project <code className="text-gold">xjeapgcecjpjuigokarq</code>. Publishable key lives in env, not in git.
            Paste <code className="text-gold">supabase/migrations/001_memberships.sql</code>,{" "}
            <code className="text-gold">002_campus_messages.sql</code>, then{" "}
            <code className="text-gold">003_profiles.sql</code> in the SQL editor so paid seats, messenger
            threads, and the student directory persist. Vercel env: <code className="text-gold">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
            <code className="text-gold">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>,{" "}
            <code className="text-gold">NEXT_PUBLIC_SITE_URL=https://imanifest.vercel.app</code>. Webhook writes need{" "}
            <code className="text-gold">SUPABASE_SECRET_KEY</code> (sb_secret_…).
          </p>
          <p className="mt-3 text-sm text-muted">
            Auth → URL Configuration: add <code className="text-gold">http://localhost:3000/**</code> and{" "}
            <code className="text-gold">https://imanifest.vercel.app/**</code>.
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
