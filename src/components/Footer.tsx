import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-black/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:justify-between">
        <div>
          <p className="font-[family-name:var(--font-cormorant)] text-2xl text-gold">iManifest University</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
            Financial education, investing discipline, and wealth creation — rebuilt as a modern campus for operators.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm">
          <div className="flex flex-col gap-2 text-muted">
            <Link href="/programs" className="hover:text-gold">
              Programs
            </Link>
            <Link href="/campus" className="hover:text-gold">
              Student campus
            </Link>
            <Link href="/about" className="hover:text-gold">
              About iMU
            </Link>
          </div>
          <div className="flex flex-col gap-2 text-muted">
            <a href="mailto:info@imanifest.money" className="hover:text-gold">
              info@imanifest.money
            </a>
            <p>Investor relations</p>
            <p>Staging build for Vercel testing</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
