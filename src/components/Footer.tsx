import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--ink)]">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="imu-section rounded-2xl p-8 md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Support</p>
              <h2 className="mt-2 font-[family-name:var(--font-cormorant)] text-2xl font-medium tracking-tight text-white md:text-3xl">
                Questions about campus or billing?
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[var(--text-soft)]">
                Our desk answers enrollment, payments, and access. Operators first — we reply in plain English.
              </p>
            </div>
            <a
              href="mailto:info@imanifest.money"
              className="gold-btn inline-flex shrink-0 rounded-lg px-7 py-3.5 text-[11px]"
            >
              info@imanifest.money
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-[var(--line)] pt-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-[family-name:var(--font-cormorant)] text-xl font-medium tracking-tight text-white">
              iManifest <span className="text-gold">University</span>
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
              Institutional education for operators who build wealth — not spectators who collect courses.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-[var(--text-soft)]">
            <Link href="/about" className="transition hover:text-gold">
              About
            </Link>
            <Link href="/privacy" className="transition hover:text-gold">
              Privacy
            </Link>
            <Link href="/legal" className="transition hover:text-gold">
              Legal
            </Link>
            <a href="mailto:info@imanifest.money" className="transition hover:text-gold">
              Support
            </a>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[var(--muted)] md:text-left">
          © {new Date().getFullYear()} iManifest University. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
