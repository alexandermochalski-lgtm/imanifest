import { redirect } from "next/navigation";
import { appendLivePayment } from "@/lib/admin-state";
import { premiumMembership } from "@/lib/catalog";
import { memberRecord, recordPaidMember, stampCampusSeat, syncCampusSeatCookie } from "@/lib/membership";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";

export async function GET() {
  const session = await getSession();
  if (!session) redirect("/login?next=/api/stripe/return");
  if (session.role === "admin") redirect("/admin");

  const current = await getState();
  const existing = await memberRecord(session.userId, session.email);
  if (existing?.status === "canceled") redirect("/get?error=canceled");

  if (existing?.status === "active" || current.membershipPaidAt) {
    await syncCampusSeatCookie(session.userId, session.email, current);
    redirect("/campus");
  }

  const paidAt = await recordPaidMember(session.userId, session.email, "active");
  await stampCampusSeat(paidAt, false);
  await appendLivePayment({
    id: `live-membership-${session.userId}-${paidAt}`,
    userId: session.userId,
    kind: "membership",
    sku: premiumMembership.id,
    label: `${premiumMembership.name} · $${premiumMembership.price.toFixed(2)}/mo`,
    amountUsd: premiumMembership.price,
    coins: 0,
    status: "paid",
    createdAt: paidAt,
  });
  redirect("/campus");
}
