"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/app/actions/auth";

type NavLink = { href: string; label: string };

function pathActive(pathname: string, href: string) {
  if (href.includes("#")) return pathname === href.split("#")[0];
  if (href === "/campus") return pathname === "/campus";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CampusMobileNav({
  links,
  unread,
  isAdmin,
  profileHref,
}: {
  links: NavLink[];
  unread: number;
  isAdmin: boolean;
  profileHref: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const primary = [
    { href: "/campus", label: "Home" },
    { href: "/campus/feed", label: "Feed" },
    { href: "/directory", label: "Directory" },
    { href: profileHref, label: "Profile" },
  ];

  return (
    <>
      <div className="flex items-center gap-2 md:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--line)] text-sm text-[var(--text-soft)]"
          onClick={() => setOpen(true)}
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[min(20rem,90vw)] flex-col border-r border-[var(--line)] bg-[var(--panel)] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-4">
              <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <Image src="/logo.svg" alt="iManifest" width={24} height={29} />
                <span className="font-[family-name:var(--font-cormorant)] text-lg text-white">
                  iMU <span className="text-gold">Campus</span>
                </span>
              </Link>
              <button type="button" className="min-h-11 px-2 text-sm text-[var(--muted)] hover:text-gold" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain p-3 text-sm">
              {links.map((link) => (
                <Link
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  className={`rounded-lg px-3 py-3 text-[var(--text-soft)] transition hover:bg-white/[0.04] hover:text-gold ${
                    pathActive(pathname, link.href) ? "bg-white/[0.04] text-gold" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                  {link.href === "/notifications" && unread > 0 ? (
                    <span className="ml-2 text-xs text-gold">({unread})</span>
                  ) : null}
                </Link>
              ))}
              {isAdmin ? (
                <Link href="/admin" className="rounded-lg px-3 py-3 text-gold hover:bg-white/[0.04]" onClick={() => setOpen(false)}>
                  Admin desk
                </Link>
              ) : null}
            </nav>
            <form action={logoutAction} className="border-t border-[var(--line)] p-4">
              <button className="min-h-11 text-sm text-[var(--muted)] hover:text-gold" type="submit">
                Log out
              </button>
            </form>
          </aside>
        </div>
      ) : null}

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--ink)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        aria-label="Primary"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-0 px-1 pt-1">
          {primary.map((item) => {
            const active = pathActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] uppercase tracking-[0.12em] ${
                    active ? "text-gold" : "text-muted"
                  }`}
                >
                  <span className={`h-1 w-1 rounded-full ${active ? "bg-gold" : "bg-transparent"}`} />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              className="flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] uppercase tracking-[0.12em] text-muted"
              onClick={() => setOpen(true)}
            >
              <span className="h-1 w-1 rounded-full bg-transparent" />
              More
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
