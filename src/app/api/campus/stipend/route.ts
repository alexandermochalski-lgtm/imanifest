import { redirect } from "next/navigation";
import { claimMonthlyStipend } from "@/lib/membership";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) redirect("/login?next=/campus");
  await claimMonthlyStipend(session);
  redirect("/campus");
}
