"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/actions/auth";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { adminNavGroups, isAdminNavActive } from "@/components/admin/nav";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full">
      <aside className="hidden w-64 shrink-0 border-r border-[var(--line)] bg-[var(--panel)] md:flex md:flex-col">
        <Link href="/admin" className="flex items-center gap-3 border-b border-[var(--line)] px-5 py-4">
          <Image src="/logo.svg" alt="iManifest" width={28} height={34} />
          <span className="font-[family-name:var(--font-cormorant)] text-lg font-medium tracking-tight text-white">
            iMU <span className="text-gold">Admin</span>
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto p-3 text-sm">
          {adminNavGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-deep">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-3 py-2 transition ${
                      isAdminNavActive(pathname, link.href)
                        ? "bg-white/[0.06] text-gold"
                        : "text-[var(--text-soft)] hover:bg-white/[0.04] hover:text-gold"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link href="/campus" className="rounded-lg px-3 py-2 text-gold hover:bg-white/[0.04]">
            Student campus
          </Link>
        </nav>
        <form action={logoutAction} className="border-t border-[var(--line)] p-4">
          <button className="text-sm text-[var(--muted)] transition hover:text-gold" type="submit">
            Log out
          </button>
        </form>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--ink)]/80 px-5 py-3 backdrop-blur-xl">
          <AdminMobileNav />
          <p className="min-w-0 flex-1 truncate text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)] md:text-left">
            Operations desk
          </p>
          <div className="flex shrink-0 items-center gap-4">
            <Link href="/" className="hidden text-sm text-[var(--muted)] transition hover:text-white sm:inline">
              Website
            </Link>
            <Link href="/campus" className="text-sm text-gold transition hover:text-white">
              Campus
            </Link>
            <form action={logoutAction} className="hidden sm:block">
              <button className="text-sm text-[var(--muted)] transition hover:text-gold" type="submit">
                Log out
              </button>
            </form>
          </div>
        </header>
        <div className="mx-auto w-full max-w-[90rem] flex-1 px-5 py-8 md:px-8">{children}</div>
      </div>
    </div>
  );
}
