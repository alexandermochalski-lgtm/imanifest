import { updateProfile } from "@/app/actions/campus";
import { Flash, GoldButton } from "@/components/ui";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const session = await getSession();
  const state = await getState();
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Profile</h1>
      <Flash ok={ok} map={{ "1": "Profile updated." }} />
      <p className="mt-3 text-sm text-muted">{session?.email} · {session?.role}</p>
      <form action={updateProfile} className="mt-8 max-w-xl space-y-4">
        <input name="name" defaultValue={state.profile.name || session?.name} className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2" />
        <input name="phone" defaultValue={state.profile.phone} className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2" />
        <textarea name="bio" rows={5} defaultValue={state.profile.bio} className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2" />
        <GoldButton type="submit">Save profile</GoldButton>
      </form>
      <p className="mt-6 text-sm text-muted">Password / avatar / cover uploads stay on the live Laravel stack until storage is wired. This desk updates name, phone, and bio on the campus ledger.</p>
    </main>
  );
}
