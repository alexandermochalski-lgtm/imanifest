import { claimHandleAndOpen } from "@/app/actions/social";
import { Flash } from "@/components/ui";
import { ensureProfileHandle } from "@/lib/social";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/login");

  try {
    const profile = await ensureProfileHandle({
      userId: session.userId,
      name: session.name,
      email: session.email,
    });
    if (profile.handle) redirect(`/u/${profile.handle}`);
  } catch {
    /* fall through to claim UI */
  }

  return (
    <main className="mx-auto max-w-lg">
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Claim your handle</h1>
      <p className="mt-3 text-sm text-muted">
        Campus profiles need an @handle so other operators can find you. We&apos;ll suggest one from your name —
        you can change it anytime.
      </p>
      <Flash
        error={error}
        map={{
          unavailable: "Profile storage is offline. Paste migration 004 in Supabase, then retry.",
          handle_taken: "That handle is taken — try again.",
          handle_invalid: "Invalid handle.",
        }}
      />
      <form action={claimHandleAndOpen} className="mt-8">
        <button className="gold-btn rounded-xl px-6 py-3 text-xs" type="submit">
          Open my profile
        </button>
      </form>
    </main>
  );
}
