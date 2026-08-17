import type { Metadata } from "next";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { Flash, GoldButton } from "@/components/ui";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-[#fff8e8]">Campus login</h1>
      <p className="mt-3 text-sm text-[#d4d4d4]">
        Demo ledger: <code>student@imanifest.money</code> or <code>admin@imanifest.money</code> / password{" "}
        <code>imanifest</code>
      </p>
      <p className="mt-2 text-sm text-muted">Students subscribe $49.99 / month on Stripe, then campus opens. Admin skips the door.</p>
      <Flash
        error={error}
        map={{ invalid: "Email or password rejected.", exists: "That email already has a campus seat. Log in." }}
      />
      <form action={loginAction} className="mt-8 space-y-4">
        {next ? <input name="next" type="hidden" value={next} /> : null}
        <label className="block text-sm text-muted">
          Email
          <input
            name="email"
            type="email"
            required
            defaultValue="student@imanifest.money"
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[#16130e] px-3 py-2 text-[#f6f1e4]"
          />
        </label>
        <label className="block text-sm text-muted">
          Password
          <input
            name="password"
            type="password"
            required
            defaultValue="imanifest"
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[#16130e] px-3 py-2 text-[#f6f1e4]"
          />
        </label>
        <GoldButton type="submit">Continue</GoldButton>
      </form>
      <p className="mt-6 text-sm text-muted">
        <Link href="/register" className="text-gold">
          Create a seat
        </Link>
        {" · "}
        <Link href="/forgot-password" className="text-gold">
          Forgot password
        </Link>
      </p>
    </main>
  );
}
