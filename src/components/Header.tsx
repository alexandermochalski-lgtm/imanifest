import Image from "next/image";
import Link from "next/link";

const nav = [
  { href: "/programs", label: "Programs" },
  { href: "/campus", label: "Campus" },
  { href: "/about", label: "University" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[#070707]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="iManifest" width={36} height={43} priority />
          <span className="font-[family-name:var(--font-cormorant)] text-xl tracking-wide text-gold">
            iManifest <span className="text-white/70">University</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-gold">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/campus"
          className="gold-btn rounded-full px-5 py-2 text-sm font-semibold tracking-wide"
        >
          Enter campus
        </Link>
      </div>
    </header>
  );
}
