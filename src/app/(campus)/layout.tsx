import { redirect } from "next/navigation";
import { claimDailyLogin } from "@/app/actions/campus";
import { CampusShell } from "@/components/campus/CampusShell";
import { liveStreak } from "@/lib/daily-desk";
import { isCampusUnlocked } from "@/lib/membership";
import { getSession } from "@/lib/session";
import { ensureProfileHandle } from "@/lib/social";
import { getState, mutateState } from "@/lib/state";

export default async function CampusLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  let state = await getState();
  let unlocked = false;
  try {
    unlocked = await isCampusUnlocked(session.role, state, session.userId, session.email);
  } catch {
    unlocked = session.role === "admin" || Boolean(state.membershipPaidAt);
  }
  if (!unlocked) redirect("/get");

  // Free daily login coins + streak bonuses (once per UTC day).
  try {
    await claimDailyLogin();
    state = await getState();
  } catch {
    /* ignore — never block campus on login award */
  }

  let profileHref = "/profile";
  try {
    const profile = await ensureProfileHandle({
      userId: session.userId,
      name: session.name,
      email: session.email,
    });
    if (profile.handle) {
      profileHref = `/u/${profile.handle}`;
      if (state.profile.handle !== profile.handle) {
        await mutateState((current) => ({
          ...current,
          profile: {
            ...current.profile,
            name: current.profile.name || profile.name || session.name,
            handle: profile.handle,
            avatarUrl: profile.avatarUrl || current.profile.avatarUrl,
          },
        }));
      }
    }
  } catch {
    profileHref = "/profile";
  }

  const unread = state.notifications.filter((item) => !item.read).length;
  return (
    <CampusShell
      session={session}
      coins={state.coins}
      streak={liveStreak(state)}
      unread={unread}
      profileHref={profileHref}
    >
      {children}
    </CampusShell>
  );
}
