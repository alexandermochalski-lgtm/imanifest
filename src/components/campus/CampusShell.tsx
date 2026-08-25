import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/actions/auth";
import { CampusMobileNav } from "@/components/campus/CampusMobileNav";
import type { AuthSession } from "@/lib/session";
import { formatCoins } from "@/lib/daily-desk";

export function CampusShell({
  session,
  coins,
  streak,
  unread,
  profileHref = "/profile",
  children,
}: {
  session: AuthSession;
  coins: number;
  streak: number;
  unread: number;
  profileHref?: string;
  children: ReactNode;
}) {
  const links = [
    { href: "/campus", label: "Dashboard" },
    { href: "/campus/feed", label: "Feed" },
    { href: "/campus/match", label: "AI Matching" },
    { href: "/campus#desk", label: "Daily desk" },
    { href: "/courses", label: "Courses" },
    { href: "/library", label: "Books" },
    { href: "/guides", label: "Guides" },
    { href: "/journals", label: "Journals" },
    { href: "/forum", label: "Forum" },
    { href: "/directory", label: "Directory" },
    { href: "/jobs", label: "Job Board" },
    { href: "/bundles", label: "Bundles" },
    { href: "/insights", label: "Insights" },
    { href: "/pricing", label: "Purchase Coins" },
    { href: profileHref, label: "Profile" },
    { href: "/messages", label: "Messages" },
    { href: "/notifications", label: "Notifications" },
  ];

  return (
    <div className="flex min-h-full">
      <aside className="hidden w-64 shrink-0 border-r border-[var(--line)] bg-[var(--panel)] md:flex md:flex-col">
        <Link href="/" className="flex items-center gap-3 border-b border-[var(--line)] px-5 py-4">
          <Image src="/logo.svg" alt="iManifest" width={28} height={34} />
          <span className="font-[family-name:var(--font-cormorant)] text-lg font-medium tracking-tight text-white">
            iMU <span className="text-gold">Campus</span>
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 text-sm">
          {links.map((link) => (
            <Link
              key={`${link.label}-${link.href}`}
              href={link.href}
              className="rounded-lg px-3 py-2 text-[var(--text-soft)] transition hover:bg-white/[0.04] hover:text-gold"
            >
              {link.label}
              {link.href === "/notifications" && unread > 0 ? (
                <span className="ml-2 text-xs text-gold">({unread})</span>
              ) : null}
            </Link>
          ))}
          {session.role === "admin" ? (
            <Link href="/admin" className="rounded-lg px-3 py-2 text-gold hover:bg-white/[0.04]">
              Admin desk
            </Link>
          ) : null}
        </nav>
        <form action={logoutAction} className="border-t border-[var(--line)] p-4">
          <button className="text-sm text-[var(--muted)] hover:text-gold" type="submit">
            Log out
          </button>
        </form>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--ink)]/90 px-3 py-2.5 backdrop-blur-xl pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-5 md:static md:gap-3 md:py-3">
          <CampusMobileNav
            links={links}
            unread={unread}
            isAdmin={session.role === "admin"}
            profileHref={profileHref}
          />
          <p className="min-w-0 flex-1 truncate text-center text-sm text-[var(--muted)] md:text-left">
            <Link href={profileHref} className="hidden hover:text-gold sm:inline">
              {session.name}
            </Link>
            <span className="sm:hidden text-gold">{formatCoins(coins)}</span>
            {streak > 0 ? (
              <span className="hidden sm:inline">
                {session.name ? " · " : ""}Day {streak}
              </span>
            ) : (
              <Link href="/campus#desk" className="hidden text-gold hover:text-white sm:inline">
                {session.name ? " · " : ""}Start desk
              </Link>
            )}
            <span className="hidden sm:inline">
              {" "}
              · <span className="text-gold">{formatCoins(coins)} coins</span>
            </span>
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <Link href="/pricing" className="text-sm text-gold hover:text-white">
              <span className="sm:hidden">Coins</span>
              <span className="hidden sm:inline">Top up</span>
            </Link>
            <form action={logoutAction} className="hidden md:block">
              <button className="text-sm text-[var(--muted)] transition hover:text-gold" type="submit">
                Log out
              </button>
            </form>
          </div>
        </header>
        <div className="flex-1 px-3 py-5 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:px-5 sm:py-8 md:pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
