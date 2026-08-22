"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

export function Flash({
  ok,
  error,
  map,
}: {
  ok?: string;
  error?: string;
  map: Record<string, string>;
}) {
  const key = error ?? ok;
  const message = key ? map[key] : undefined;
  if (!message) return null;
  return (
    <p
      className={`mb-6 rounded-xl border px-4 py-3 text-sm ${error ? "border-red-500/40 text-red-200" : "border-[var(--line)] text-gold"}`}
    >
      {message}
    </p>
  );
}

export function GoldButton({
  children,
  className = "",
  pendingLabel,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      {...props}
      className={`gold-btn rounded-xl px-5 py-2.5 text-xs disabled:opacity-50 ${className}`}
      disabled={props.disabled || pending}
    >
      {pending ? pendingLabel || "Working…" : children}
    </button>
  );
}

export function GhostLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="ghost-btn rounded-xl px-5 py-2.5 text-xs">
      {children}
    </Link>
  );
}
