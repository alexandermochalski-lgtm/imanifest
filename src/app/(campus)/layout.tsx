import { redirect } from "next/navigation";
import { CampusShell } from "@/components/campus/CampusShell";
import { liveStreak } from "@/lib/daily-desk";
import { claimMonthlyStipend, isCampusUnlocked, syncCampusSeatCookie } from "@/lib/membership";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";

export default async function CampusLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const state = await getState();
  if (!(await isCampusUnlocked(session.role, state, session.userId, session.email))) redirect("/get");
  if (!state.membershipPaidAt && session.role !== "admin") {
    await syncCampusSeatCookie(session.userId, session.email, state);
  }
  await claimMonthlyStipend(session);
  const live = await getState();
  const unread = live.notifications.filter((item) => !item.read).length;
  return (
    <CampusShell session={session} coins={live.coins} streak={liveStreak(live)} unread={unread}>
      {children}
    </CampusShell>
  );
}
