"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { logoutAction } from "@/app/actions/auth";

type NavLink = { href: string; label: string };

export function CampusMobileNav({
  links,
  unread,
  isAdmin,
}: {
  links: NavLink[];
  unread: number;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--text-soft)] transition hover:border-gold/40 hover:text-gold"
        onClick={() => setOpen((value) => !value)}
      >
        Menu
      </button>
      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(18rem,88vw)] flex-col border-r border-[var(--line)] bg-[var(--panel)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-4">
              <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <Image src="/logo.svg" alt="iManifest" width={24} height={29} />
                <span className="font-[family-name:var(--font-cormorant)] text-lg text-white">
                  iMU <span className="text-gold">Campus</span>
                </span>
              </Link>
              <button
                type="button"
                className="text-sm text-[var(--muted)] hover:text-gold"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 text-sm">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-[var(--text-soft)] transition hover:bg-white/[0.04] hover:text-gold"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                  {link.href === "/notifications" && unread > 0 ? (
                    <span className="ml-2 text-xs text-gold">({unread})</span>
                  ) : null}
                </Link>
              ))}
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="rounded-lg px-3 py-2 text-gold hover:bg-white/[0.04]"
                  onClick={() => setOpen(false)}
                >
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
        </div>
      ) : null}
    </div>
  );
}
