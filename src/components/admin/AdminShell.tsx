"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/actions/auth";

const groups = [
  {
    label: "Desk",
    links: [
      { href: "/admin", label: "Command" },
      { href: "/admin/payments", label: "Payments" },
      { href: "/admin/registrations", label: "Registrations" },
    ],
  },
  {
    label: "People",
    links: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/enrollments", label: "Enrollments" },
      { href: "/admin/applications", label: "Applications" },
    ],
  },
  {
    label: "Catalog",
    links: [
      { href: "/admin/courses", label: "Courses" },
      { href: "/admin/books", label: "Books" },
      { href: "/admin/media", label: "Media" },
      { href: "/admin/jobs", label: "Jobs" },
      { href: "/admin/coins", label: "Coins & promo" },
    ],
  },
  {
    label: "Campus",
    links: [
      { href: "/admin/content", label: "Content" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

const flat = groups.flatMap((group) => group.links);

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex min-h-full">
      <aside className="hidden w-64 shrink-0 border-r border-[var(--line)] bg-black/60 md:flex md:flex-col">
        <Link href="/admin" className="flex items-center gap-3 border-b border-[var(--line)] px-5 py-4">
          <Image src="/logo.svg" alt="iManifest" width={28} height={34} />
          <span className="font-[family-name:var(--font-cormorant)] text-xl text-gold">iMU Admin</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto p-3 text-sm">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1 text-[10px] uppercase tracking-[0.2em] text-gold-deep">{group.label}</p>
              <div className="flex flex-col gap-0.5">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-3 py-2 transition ${
                      isActive(pathname, link.href)
                        ? "bg-[rgba(247,230,138,0.1)] text-gold"
                        : "text-[#e8e8e8] hover:bg-white/5 hover:text-gold"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
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
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3 md:px-6">
          <select
            className="px-3 py-2 text-sm md:hidden"
            onChange={(event) => router.push(event.target.value)}
            value={flat.find((link) => isActive(pathname, link.href))?.href ?? "/admin"}
          >
            {flat.map((link) => (
              <option key={link.href} value={link.href}>
                {link.label}
              </option>
            ))}
          </select>
          <p className="hidden text-xs uppercase tracking-[0.18em] text-muted md:block">Operations desk</p>
          <Link className="text-sm text-gold" href="/campus">
            Campus
          </Link>
        </header>
        <div className="flex-1 px-4 py-8 md:px-8">{children}</div>
      </div>
    </div>
  );
}
