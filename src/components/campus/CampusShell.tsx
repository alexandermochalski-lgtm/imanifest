import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/actions/auth";
import type { AuthSession } from "@/lib/session";
import { formatCoins } from "@/lib/daily-desk";

const links = [
  { href: "/campus", label: "Dashboard" },
  { href: "/campus#desk", label: "Daily desk" },
  { href: "/courses", label: "Courses" },
  { href: "/library", label: "Books" },
  { href: "/guides", label: "Guides" },
  { href: "/journals", label: "Journals" },
  { href: "/forum", label: "Forum" },
  { href: "/jobs", label: "Job Board" },
  { href: "/bundles", label: "Bundles" },
  { href: "/insights", label: "Insights" },
  { href: "/pricing", label: "Purchase Coins" },
  { href: "/profile", label: "Profile" },
  { href: "/messages", label: "Messages" },
  { href: "/notifications", label: "Notifications" },
];

export function CampusShell({
  session,
  coins,
  streak,
  unread,
  children,
}: {
  session: AuthSession;
  coins: number;
  streak: number;
  unread: number;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full">
      <aside className="hidden w-64 shrink-0 border-r border-[var(--line)] bg-black/50 md:flex md:flex-col">
        <Link href="/" className="flex items-center gap-3 border-b border-[var(--line)] px-5 py-4">
          <Image src="/logo.svg" alt="iManifest" width={28} height={34} />
          <span className="font-[family-name:var(--font-cormorant)] text-lg text-gold">iMU Campus</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-[#e8e8e8] transition hover:-translate-y-0.5 hover:bg-[rgba(247,230,138,0.08)] hover:text-gold hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
            >
              {link.label}
              {link.href === "/notifications" && unread > 0 ? (
                <span className="ml-2 text-xs text-gold">({unread})</span>
              ) : null}
            </Link>
          ))}
          {session.role === "admin" ? (
            <Link href="/admin" className="rounded-lg px-3 py-2 text-gold hover:bg-white/5">
              Admin desk
            </Link>
          ) : null}
        </nav>
        <form action={logoutAction} className="border-t border-[var(--line)] p-4">
          <button className="text-sm text-muted hover:text-gold" type="submit">
            Log out
          </button>
        </form>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
          <div className="md:hidden">
            <Link href="/campus" className="text-gold">
              Campus
            </Link>
          </div>
          <p className="text-sm text-muted">
            {session.name}
            {streak > 0 ? ` · Day ${streak}` : ""} · <span className="text-gold">{formatCoins(coins)} coins</span>
          </p>
          <Link href="/pricing" className="text-sm text-gold">
            Top up
          </Link>
        </header>
        <div className="flex-1 px-5 py-8">{children}</div>
      </div>
    </div>
  );
}
