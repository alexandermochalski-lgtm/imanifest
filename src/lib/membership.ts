import { mutateOverlay, readOverlay } from "@/lib/storage";
import { mutateState, notify } from "@/lib/state";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { utcMonth } from "@/lib/daily-desk";
import type { AuthSession } from "@/lib/session";
import type { CampusState, MemberRecord, Role } from "@/lib/types";

export const MEMBERSHIP_STIPEND = 50;

/** Freemium desk — enrolled for every free seat. Paid unlocks the full catalog. */
export const FREE_COURSE_IDS = ["c-mindset", "c-personal-finance"] as const;

const DEMO_STUDENT_EMAIL = "student@imanifest.money";
const DEMO_ADMIN_EMAILS = new Set([
  "admin@imanifest.money",
  "dean@imanifest.money",
  "steve@imanifest.money",
]);

export function isDemoCampusSeat(email: string): boolean {
  const normalized = email.toLowerCase();
  return normalized === DEMO_STUDENT_EMAIL || DEMO_ADMIN_EMAILS.has(normalized);
}

export function isFreeCourseId(courseId: string) {
  return (FREE_COURSE_IDS as readonly string[]).includes(courseId);
}

/** Cookie-level: paid OR freemium seat can enter campus chrome. */
export function hasCampusAccess(role: Role | undefined, state: CampusState): boolean {
  if (role === "admin") return true;
  return Boolean(state.membershipPaidAt || state.freeSeatAt);
}

/** Full catalog / stipend — paid seat only. */
export function hasPaidCampus(state: CampusState): boolean {
  return Boolean(state.membershipPaidAt);
}

export function isFreeSeat(state: CampusState): boolean {
  return Boolean(state.freeSeatAt) && !state.membershipPaidAt;
}

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
  const query = (async () => {
    const { data: byId } = await client.from("memberships").select("user_id, email, status, paid_at").eq("user_id", userId).maybeSingle();
    if (byId) return asRecord(byId as MembershipRow);
    const { data: byEmail } = await client
      .from("memberships")
      .select("user_id, email, status, paid_at")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    return byEmail ? asRecord(byEmail as MembershipRow) : null;
  })();
  return Promise.race([
    query,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
  ]);
}

export async function memberRecord(userId: string, email: string): Promise<MemberRecord | null> {
  try {
    const row = await supabaseRecord(userId, email);
    if (row) return row;
  } catch {
    /* table missing or RLS */
  }
  try {
    return await overlayRecord(userId, email);
  } catch {
    return null;
  }
}

export async function isCampusUnlocked(
  role: Role | undefined,
  state: CampusState,
  userId: string,
  email: string,
): Promise<boolean> {
  if (role === "admin") return true;
  if (isDemoCampusSeat(email)) return true;
  if (state.membershipPaidAt || state.freeSeatAt) return true;
  const row = await memberRecord(userId, email);
  if (row?.status === "canceled") return false;
  if (row?.status === "active" || row?.status === "free") return true;
  return false;
}

export async function isPaidMember(
  role: Role | undefined,
  state: CampusState,
  userId: string,
  email: string,
): Promise<boolean> {
  if (role === "admin") return true;
  if (isDemoCampusSeat(email)) return true;
  if (state.membershipPaidAt) return true;
  const row = await memberRecord(userId, email);
  return row?.status === "active";
}

export async function syncCampusSeatCookie(userId: string, email: string, state: CampusState) {
  if (state.membershipPaidAt) return;
  const row = await memberRecord(userId, email);
  if (row?.status === "active") {
    await stampCampusSeat(row.paidAt, false);
    return;
  }
  if (row?.status === "free" && !state.freeSeatAt) {
    await stampFreeSeat(row.paidAt);
  }
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

/** Register freemium seat — campus open, no stipend. */
export async function recordFreeMember(userId: string, email: string): Promise<string> {
  const existing = await memberRecord(userId, email);
  if (existing?.status === "active") return existing.paidAt;
  const at = new Date().toISOString().slice(0, 10);
  const record: MemberRecord = { status: "free", paidAt: at, email: email.toLowerCase(), userId };
  try {
    await upsertSupabaseMember(userId, email, "free", at);
  } catch {
    /* overlay fallback */
  }
  await mutateOverlay((overlay) => ({
    ...overlay,
    members: {
      ...(overlay.members ?? {}),
      [userId]: record,
      [email.toLowerCase()]: record,
    },
  }));
  return at;
}

export async function stampFreeSeat(at: string) {
  return mutateState((state) => {
    if (state.membershipPaidAt || state.freeSeatAt) return state;
    return notify(
      {
        ...state,
        freeSeatAt: at,
        enrollments: [...new Set([...state.enrollments, ...FREE_COURSE_IDS])],
      },
      "Free campus seat",
      "Two foundation desks are on your ledger. Upgrade anytime for the full catalog.",
      "/campus",
    );
  });
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
        freeSeatAt: state.freeSeatAt || paidAt,
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

export function stipendDue(session: AuthSession, state: CampusState) {
  if (session.role === "admin") return false;
  if (!state.membershipPaidAt) return false;
  return state.lastStipendMonth !== utcMonth();
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
