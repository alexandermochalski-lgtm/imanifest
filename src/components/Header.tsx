import Image from "next/image";
import Link from "next/link";
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
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[#050505]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3.5">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="iManifest" width={36} height={44} priority />
          <span className="font-[family-name:var(--font-cormorant)] text-lg font-medium tracking-tight text-white">
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
        <Link href={ctaHref} className="gold-btn rounded-lg px-5 py-2.5">
          {ctaLabel}
        </Link>
      </div>
    </header>
  );
}
