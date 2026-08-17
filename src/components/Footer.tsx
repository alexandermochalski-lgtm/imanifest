import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-black/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:justify-between">
        <div>
          <p className="font-[family-name:var(--font-cormorant)] text-2xl text-gold">iManifest University</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#d4d4d4]">
            Financial education, investing discipline, and wealth creation — rebuilt as a modern campus for operators.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm">
          <div className="flex flex-col gap-2 text-[#d4d4d4]">
            <Link href="/programs" className="hover:text-gold">
              Programs
            </Link>
            <Link href="/#pricing" className="hover:text-gold">
              Get campus
            </Link>
            <Link href="/about" className="hover:text-gold">
              About iMU
            </Link>
            <Link href="/login" className="hover:text-gold">
              Log in
            </Link>
            <Link href="/pages/privacy" className="hover:text-gold">
              Privacy
            </Link>
          </div>
          <div className="flex flex-col gap-2 text-[#d4d4d4]">
            <a href="mailto:info@imanifest.money" className="hover:text-gold">
              info@imanifest.money
            </a>
            <Link href="/pages/investor-relations" className="hover:text-gold">
              Investor relations
            </Link>
            <p>Staging build for Vercel testing</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
