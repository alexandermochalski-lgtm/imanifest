import { redirect } from "next/navigation";
import { appendLivePayment } from "@/lib/admin-state";
import { premiumMembership } from "@/lib/catalog";
import { memberRecord, recordPaidMember, stampCampusSeat } from "@/lib/membership";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";

export async function GET() {
  const session = await getSession();
  if (!session) redirect("/login?next=/api/stripe/return");
  if (session.role === "admin") redirect("/admin");
  const current = await getState();
  const existing = await memberRecord(session.userId, session.email);
  if (existing?.status === "canceled") redirect("/get?error=canceled");
  if (current.membershipPaidAt || existing?.status === "active") {
    if (!current.membershipPaidAt && existing?.status === "active") {
      await stampCampusSeat(existing.paidAt, false);
    }
    redirect("/campus");
  }
  let paidAt = new Date().toISOString().slice(0, 10);
  try {
    paidAt = await recordPaidMember(session.userId, session.email, "active");
  } catch {
    paidAt = new Date().toISOString().slice(0, 10);
  }
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
