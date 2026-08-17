import { mutateOverlay, readOverlay } from "@/lib/storage";
import { mutateState, notify } from "@/lib/state";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { utcMonth } from "@/lib/daily-desk";
import type { AuthSession } from "@/lib/session";
import type { CampusState, MemberRecord, Role } from "@/lib/types";

export const MEMBERSHIP_STIPEND = 50;

type MembershipRow = {
  user_id: string;
  email: string;
  status: MemberRecord["status"];
  paid_at: string;
};

function asRecord(row: MembershipRow): MemberRecord {
  return {
    status: row.status,
    paidAt: row.paid_at,
    email: row.email,
    userId: row.user_id,
  };
}

export function hasCampusAccess(role: Role | undefined, state: CampusState): boolean {
  if (role === "admin") return true;
  return Boolean(state.membershipPaidAt);
}

export function safeNextPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) return "";
  return value;
}

async function overlayRecord(userId: string, email: string): Promise<MemberRecord | null> {
  const members = (await readOverlay()).members ?? {};
  return members[userId] ?? members[email.toLowerCase()] ?? null;
}

async function supabaseRecord(userId: string, email: string): Promise<MemberRecord | null> {
  const admin = createAdminSupabase();
  const client = admin ?? (await createServerSupabase());
  if (!client) return null;
  const { data: byId } = await client.from("memberships").select("user_id, email, status, paid_at").eq("user_id", userId).maybeSingle();
  if (byId) return asRecord(byId as MembershipRow);
  const { data: byEmail } = await client
    .from("memberships")
    .select("user_id, email, status, paid_at")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return byEmail ? asRecord(byEmail as MembershipRow) : null;
}

export async function memberRecord(userId: string, email: string): Promise<MemberRecord | null> {
  try {
    const row = await supabaseRecord(userId, email);
    if (row) return row;
  } catch {
    /* table missing or RLS */
  }
  return overlayRecord(userId, email);
}

export async function isCampusUnlocked(
  role: Role | undefined,
  state: CampusState,
  userId: string,
  email: string,
): Promise<boolean> {
  if (role === "admin") return true;
  const row = await memberRecord(userId, email);
  if (row?.status === "canceled") return false;
  if (row?.status === "active") return true;
  return Boolean(state.membershipPaidAt);
}

async function upsertSupabaseMember(userId: string, email: string, status: MemberRecord["status"], paidAt: string) {
  const row = {
    user_id: userId,
    email: email.toLowerCase(),
    status,
    paid_at: paidAt,
    updated_at: new Date().toISOString(),
  };
  const admin = createAdminSupabase();
  if (admin) {
    await admin.from("memberships").upsert(row, { onConflict: "user_id" });
    return;
  }
  const client = await createServerSupabase();
  if (!client) return;
  await client.from("memberships").upsert(row, { onConflict: "user_id" });
}

export async function recordPaidMember(
  userId: string,
  email: string,
  status: MemberRecord["status"] = "active",
): Promise<string> {
  const paidAt = new Date().toISOString().slice(0, 10);
  const record: MemberRecord = { status, paidAt, email: email.toLowerCase(), userId };
  try {
    await upsertSupabaseMember(userId, email, status, paidAt);
  } catch {
    /* fall back to overlay */
  }
  await mutateOverlay((overlay) => ({
    ...overlay,
    members: {
      ...(overlay.members ?? {}),
      [userId]: record,
      [email.toLowerCase()]: record,
    },
  }));
  return paidAt;
}

export async function stampCampusSeat(paidAt: string, alreadyPaid: boolean): Promise<CampusState | void> {
  if (alreadyPaid) return;
  const month = utcMonth();
  return mutateState((state) => {
    if (state.membershipPaidAt) return state;
    const grant = state.lastStipendMonth === month ? 0 : MEMBERSHIP_STIPEND;
    return notify(
      {
        ...state,
        membershipPaidAt: paidAt,
        coins: state.coins + grant,
        lastStipendMonth: grant ? month : state.lastStipendMonth,
      },
      "Campus unlocked",
      grant
        ? `Monthly campus seat is active. ${grant} coins credited this month.`
        : "Monthly campus seat is active.",
      "/campus",
    );
  });
}

export async function claimMonthlyStipend(session: AuthSession) {
  if (session.role === "admin") return;
  const month = utcMonth();
  await mutateState((state) => {
    if (!state.membershipPaidAt || state.lastStipendMonth === month) return state;
    return notify(
      {
        ...state,
        coins: state.coins + MEMBERSHIP_STIPEND,
        lastStipendMonth: month,
      },
      "Membership stipend",
      `${MEMBERSHIP_STIPEND} coins on the ledger this month.`,
      "/pricing",
    );
  });
}
