import { claimHandleAndOpen } from "@/app/actions/social";
import { Flash } from "@/components/ui";
import { ensureProfileHandle } from "@/lib/social";
import { getSession } from "@/lib/session";
import { mutateState } from "@/lib/state";
import { redirect } from "next/navigation";

/** Always land on /u/[handle] — claim handle automatically when storage is up. */
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
    if (profile.handle) {
      await mutateState((state) => ({
        ...state,
        profile: {
          ...state.profile,
          name: state.profile.name || profile.name || session.name,
          handle: profile.handle,
          avatarUrl: profile.avatarUrl || state.profile.avatarUrl,
        },
      }));
      redirect(`/u/${profile.handle}`);
    }
  } catch {
    /* fall through */
  }

  return (
    <main className="mx-auto max-w-lg">
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Profile offline</h1>
      <p className="mt-3 text-sm text-muted">
        Could not reach profile storage. Run migration{" "}
        <code className="text-gold">004_social_profiles.sql</code> in Supabase, then retry.
      </p>
      <Flash
        error={error}
        map={{
          unavailable: "Profile storage is offline.",
          handle_taken: "That handle is taken — try again.",
          handle_invalid: "Invalid handle.",
        }}
      />
      <form action={claimHandleAndOpen} className="mt-8">
        <button className="gold-btn rounded-xl px-6 py-3 text-xs" type="submit">
          Retry
        </button>
      </form>
    </main>
  );
}
