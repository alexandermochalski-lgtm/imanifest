export default function AdminSettingsPage() {
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Settings</h1>
      <div className="mt-8 space-y-6 text-muted">
        <section>
          <h2 className="text-gold">Home content</h2>
          <p className="mt-2 text-sm">Hero, future copy, and 21-methods positioning are in the Next.js marketing pages — no cPanel blade.</p>
        </section>
        <section>
          <h2 className="text-gold">Stripe / Pusher / Mail</h2>
          <p className="mt-2 text-sm">
            Coin checkout is simulated. Wire STRIPE_SECRET, Pusher, and SMTP when this campus leaves staging. Chatify is replaced by /messages.
          </p>
        </section>
        <section>
          <h2 className="text-gold">Social</h2>
          <p className="mt-2 text-sm">info@imanifest.money remains the public desk.</p>
        </section>
      </div>
    </main>
  );
}
