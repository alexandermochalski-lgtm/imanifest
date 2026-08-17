import type { Metadata } from "next";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { Flash, GoldButton } from "@/components/ui";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Create a campus seat</h1>
      <Flash
        error={error}
        map={{
          invalid: "Name, email, and a 6+ character password are required.",
          "demo-only": "This staging build uses seeded seats only. Log in as student@ or admin@ imanifest.money.",
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
        <GoldButton type="submit">Register</GoldButton>
      </form>
      <Link href="/login" className="mt-6 inline-block text-sm text-gold">
        Back to login
      </Link>
    </main>
  );
}
