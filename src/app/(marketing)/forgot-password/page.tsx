import type { Metadata } from "next";
import Link from "next/link";
import { forgotAction } from "@/app/actions/auth";
import { Flash, GoldButton } from "@/components/ui";

export const metadata: Metadata = { title: "Reset password" };

export default async function ForgotPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Reset password</h1>
      <Flash ok={params.sent} error={params.error} map={{ "1": "Reset mail queued (simulated). Use password imanifest on the demo seats.", invalid: "Enter an email." }} />
      <form action={forgotAction} className="mt-8 space-y-4">
        <label className="block text-sm text-muted">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2 text-white" />
        </label>
        <GoldButton type="submit">Send reset</GoldButton>
      </form>
      <Link href="/login" className="mt-6 inline-block text-sm text-gold">
        Back to login
      </Link>
    </main>
  );
}
