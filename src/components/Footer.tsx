import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--ink)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 md:flex-row md:justify-between">
        <div>
          <p className="font-[family-name:var(--font-cormorant)] text-xl font-medium tracking-tight text-white">
            iManifest <span className="text-gold">University</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">
            Financial education and wealth creation — rebuilt as a modern campus for operators.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm">
          <div className="flex flex-col gap-2.5 text-[var(--text-soft)]">
            <Link href="/programs" className="hover:text-gold">
              Programs
            </Link>
            <Link href="/#pricing" className="hover:text-gold">
              Get campus
            </Link>
            <Link href="/about" className="hover:text-gold">
              About iMU
            </Link>
            <Link href="/privacy" className="hover:text-gold">
              Privacy
            </Link>
            <Link href="/legal" className="hover:text-gold">
              Legal
            </Link>
            <Link href="/login" className="hover:text-gold">
              Log in
            </Link>
          </div>
          <div className="flex flex-col gap-2.5 text-[var(--text-soft)]">
            <a href="mailto:info@imanifest.money" className="hover:text-gold">
              info@imanifest.money
            </a>
            <Link href="/pages/investor-relations" className="hover:text-gold">
              Investor relations
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
