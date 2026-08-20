import Image from "next/image";
import Link from "next/link";
import { isCampusUnlocked } from "@/lib/membership";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";

const nav = [
  { href: "/programs", label: "Programs" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/about", label: "University" },
  { href: "/pages/investor-relations", label: "Investors" },
];

export async function Header() {
  const session = await getSession();
  const state = session ? await getState() : null;
  const inCampus = Boolean(
    session && state && (await isCampusUnlocked(session.role, state, session.userId, session.email)),
  );
  const ctaHref = inCampus ? "/campus" : session ? "/get" : "/login";
  const ctaLabel = inCampus ? "Enter campus" : session ? "Get campus" : "Log in";
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[#070707]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="iManifest" width={42} height={50} priority />
          <span className="font-[family-name:var(--font-cormorant)] text-xl tracking-wide text-gold">
            iManifest <span className="text-[#f6f1e4]">University</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href={ctaHref} className="gold-btn rounded-xl px-5 py-2.5 text-xs">
          {ctaLabel}
        </Link>
      </div>
    </header>
  );
}
