import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/actions/auth";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/books", label: "Books" },
  { href: "/admin/jobs", label: "Job posts" },
  { href: "/admin/coins", label: "Coins & promo" },
  { href: "/admin/users", label: "Users & permissions" },
  { href: "/admin/content", label: "Forum / journals / pages" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full">
      <aside className="hidden w-64 shrink-0 border-r border-[var(--line)] bg-black/60 md:flex md:flex-col">
        <p className="border-b border-[var(--line)] px-5 py-4 font-[family-name:var(--font-cormorant)] text-xl text-gold">
          iMU Admin
        </p>
        <nav className="flex flex-1 flex-col gap-1 p-3 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-muted hover:bg-white/5 hover:text-gold">
              {link.label}
            </Link>
          ))}
          <Link href="/campus" className="rounded-lg px-3 py-2 text-gold hover:bg-white/5">
            Student campus
          </Link>
        </nav>
        <form action={logoutAction} className="border-t border-[var(--line)] p-4">
          <button className="text-sm text-muted hover:text-gold" type="submit">
            Log out
          </button>
        </form>
      </aside>
      <div className="flex-1 px-6 py-8">{children}</div>
    </div>
  );
}
