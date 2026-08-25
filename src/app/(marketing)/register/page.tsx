import type { Metadata } from "next";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { Flash, GoldButton } from "@/components/ui";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Create a free campus seat</h1>
      <p className="mt-3 text-sm text-muted">
        $0 forever — Sovereign Mindset and Personal Finance included. Upgrade later for the full catalog.
      </p>
      <Flash
        ok={ok}
        error={error}
        map={{
          invalid: "Name, email, and a 6+ character password are required.",
          "demo-only": "Supabase is not configured on this deploy. Add NEXT_PUBLIC_SUPABASE_URL and the publishable key.",
          rejected: "That email was rejected. Try another, or log in.",
          confirm: "Check your email to confirm the seat, then log in.",
        }}
      />
      <form action={registerAction} className="mt-8 space-y-4">
        <label className="block text-sm text-muted">
          Name
          <input name="name" required className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2 text-white" />
        </label>
        <label className="block text-sm text-muted">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2 text-white" />
        </label>
        <label className="block text-sm text-muted">
          Password
          <input name="password" type="password" required className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2 text-white" />
        </label>
        <GoldButton type="submit">Start free</GoldButton>
      </form>
      <Link href="/login" className="mt-6 inline-block text-sm text-gold">
        Back to login
      </Link>
    </main>
  );
}
