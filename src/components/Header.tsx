import Image from "next/image";
import Link from "next/link";
import { MarketingMobileNav } from "@/components/MarketingMobileNav";
import { hasCampusAccess } from "@/lib/membership";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";

const nav = [
  { href: "/match", label: "AI Matching" },
  { href: "/programs", label: "Programs" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/about", label: "University" },
];

export async function Header() {
  const session = await getSession();
  const state = session ? await getState() : null;
  const inCampus = Boolean(session && state && hasCampusAccess(session.role, state));
  const ctaHref = inCampus ? "/campus" : session ? "/get" : "/login";
  const ctaLabel = inCampus ? "Enter campus" : session ? "Get campus" : "Log in";
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[#050505]/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-5 sm:py-3.5">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image src="/logo.svg" alt="iManifest" width={32} height={39} priority />
          <span className="truncate font-[family-name:var(--font-cormorant)] text-base font-medium tracking-tight text-white sm:text-lg">
            iManifest <span className="text-gold">University</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link href={ctaHref} className="gold-btn hidden rounded-lg px-5 py-2.5 md:inline-flex">
            {ctaLabel}
          </Link>
          <Link href={ctaHref} className="gold-btn rounded-lg px-3 py-2 text-[10px] md:hidden">
            {inCampus ? "Campus" : session ? "Get" : "Log in"}
          </Link>
          <MarketingMobileNav ctaHref={ctaHref} ctaLabel={ctaLabel} />
        </div>
      </div>
    </header>
  );
}
