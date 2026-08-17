import { redirect } from "next/navigation";
import { CampusShell } from "@/components/campus/CampusShell";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";

export default async function CampusLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const state = await getState();
  const unread = state.notifications.filter((item) => !item.read).length;
  return (
    <CampusShell session={session} coins={state.coins} unread={unread}>
      {children}
    </CampusShell>
  );
}
