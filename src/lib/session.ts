import { cookies } from "next/headers";
import { seedUsers } from "@/lib/catalog";
import type { Role, User } from "@/lib/types";

const AUTH_COOKIE = "imu_auth";

export type AuthSession = {
  userId: string;
  email: string;
  name: string;
  role: Role;
};

export async function getSession(): Promise<AuthSession | null> {
  const raw = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}

export async function setSession(user: User) {
  (await cookies()).set(
    AUTH_COOKIE,
    JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    } satisfies AuthSession),
    { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 },
  );
}

export async function clearSession() {
  (await cookies()).delete(AUTH_COOKIE);
}

export function findSeedUser(email: string) {
  return seedUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
}
