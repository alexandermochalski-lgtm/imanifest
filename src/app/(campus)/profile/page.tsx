import { updateProfile } from "@/app/actions/campus";
import { Flash, GoldButton } from "@/components/ui";
import { campusDayHint, deskClosedToday, formatCampusDay, formatCoins, liveStreak } from "@/lib/daily-desk";
import { loadOwnProfile } from "@/lib/directory";
import { loginStreakLive } from "@/lib/login-bonus";
import { PEER_MESSAGE_COST } from "@/lib/messenger";
import { rankHint, STUDENT_RANKS, studentRank } from "@/lib/ranks";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";
import Link from "next/link";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const session = await getSession();
  const state = await getState();
  const streak = liveStreak(state);
  const loginStreak = loginStreakLive(state);
  const closedToday = deskClosedToday(state);
  const rank = studentRank(state);
  let listed = true;
  try {
    const own = session ? await loadOwnProfile(session.userId) : null;
    if (own) listed = own.listed;
  } catch {
    listed = true;
  }
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Profile</h1>
      <Flash ok={ok} map={{ "1": "Profile updated." }} />
      <p className="mt-3 text-sm text-muted">
        {session?.email} · {session?.role} · <span className="text-gold">{rank}</span>
      </p>
      <div className="mt-6 grid max-w-2xl gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--line)] bg-panel p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Rank</p>
          <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-gold">{rank}</p>
          <p className="mt-2 text-sm text-muted">{rankHint(state)}</p>
          <p className="mt-3 text-[11px] leading-5 text-[var(--muted)]">{STUDENT_RANKS.join(" → ")}</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-panel p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Desk streak</p>
          <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-gold">{formatCampusDay(streak)}</p>
          <p className="mt-2 text-sm text-muted">{campusDayHint(streak, closedToday)}</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-panel p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Ledger</p>
          <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-gold">{formatCoins(state.coins)}</p>
          <p className="mt-2 text-sm text-muted">
            Login day {formatCampusDay(loginStreak)} ·{" "}
            <Link href="/campus#desk" className="text-gold">
              Daily desk
            </Link>{" "}
            +0.5
          </p>
        </div>
      </div>
      <form action={updateProfile} className="mt-8 max-w-xl space-y-4">
        <input name="name" defaultValue={state.profile.name || session?.name} className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2" />
        <input name="phone" defaultValue={state.profile.phone} className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2" />
        <textarea name="bio" rows={5} defaultValue={state.profile.bio} className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2" />
        <label className="flex items-start gap-3 text-sm text-muted">
          <input name="listed" type="checkbox" defaultChecked={listed} className="mt-1" />
          <span>
            List me in the{" "}
            <Link href="/directory" className="text-gold">
              campus directory
            </Link>
            . Other students can find this name and bio, then open a {PEER_MESSAGE_COST}-coin thread. Uncheck to hide.
          </span>
        </label>
        <GoldButton type="submit">Save profile</GoldButton>
      </form>
      <p className="mt-6 text-sm text-muted">Password / avatar / cover uploads stay on the live Laravel stack until storage is wired. This desk updates name, phone, and bio on the campus ledger.</p>
    </main>
  );
}
