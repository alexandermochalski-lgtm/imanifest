"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/match", label: "AI Matching" },
  { href: "/programs", label: "Programs" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/about", label: "University" },
];

export function MarketingMobileNav({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
        aria-label="Open menu"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--line)] text-sm text-[var(--text-soft)]"
        onClick={() => setOpen(true)}
      >
        Menu
      </button>
      {open ? (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-[min(20rem,90vw)] flex-col border-l border-[var(--line)] bg-[var(--panel)] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-4">
              <span className="font-[family-name:var(--font-cormorant)] text-lg text-white">Menu</span>
              <button type="button" className="min-h-11 px-2 text-sm text-muted hover:text-gold" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-4 text-sm">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-3 text-[var(--text-soft)] hover:bg-white/[0.04] hover:text-gold"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link href={ctaHref} className="gold-btn mt-4 rounded-lg px-5 py-3 text-center" onClick={() => setOpen(false)}>
                {ctaLabel}
              </Link>
            </nav>
            <Link href="/" className="flex items-center gap-2 border-t border-[var(--line)] px-4 py-4" onClick={() => setOpen(false)}>
              <Image src="/logo.svg" alt="" width={22} height={27} />
              <span className="text-sm text-muted">iManifest University</span>
            </Link>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
