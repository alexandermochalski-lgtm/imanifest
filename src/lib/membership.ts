import { mutateOverlay, readOverlay } from "@/lib/storage";
import { mutateState, notify } from "@/lib/state";
import type { CampusState, MemberRecord, Role } from "@/lib/types";

export function hasCampusAccess(role: Role | undefined, state: CampusState): boolean {
  if (role === "admin") return true;
  return Boolean(state.membershipPaidAt);
}

export function safeNextPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) return "";
  return value;
}

export async function memberRecord(userId: string, email: string): Promise<MemberRecord | null> {
  const members = (await readOverlay()).members ?? {};
  return members[userId] ?? members[email.toLowerCase()] ?? null;
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

export async function recordPaidMember(
  userId: string,
  email: string,
  status: MemberRecord["status"] = "active",
): Promise<string> {
  const paidAt = new Date().toISOString().slice(0, 10);
  const record: MemberRecord = { status, paidAt, email: email.toLowerCase(), userId };
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
  return mutateState((state) => {
    if (state.membershipPaidAt) return state;
    return notify(
      { ...state, membershipPaidAt: paidAt },
      "Campus unlocked",
      "Monthly campus seat is active.",
      "/campus",
    );
  });
}
