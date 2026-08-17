import { cookies } from "next/headers";
import { seedUsers } from "@/lib/catalog";
import { createServerSupabase } from "@/lib/supabase/server";
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
  if (raw) {
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      /* fall through to Supabase */
    }
  }
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as { sub?: string; email?: string; user_metadata?: { name?: string } } | undefined;
  if (!claims?.sub || !claims.email) return null;
  const seed = findSeedUser(claims.email);
  return {
    userId: claims.sub,
    email: claims.email,
    name: String(claims.user_metadata?.name ?? seed?.name ?? claims.email.split("@")[0]),
    role: seed?.role ?? "student",
  };
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
  const supabase = await createServerSupabase();
  await supabase?.auth.signOut();
}

export function findSeedUser(email: string) {
  return seedUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function sessionUserFromAuth(input: {
  id: string;
  email: string;
  name?: string;
  role?: Role;
}): User {
  const seed = findSeedUser(input.email);
  return {
    id: input.id,
    name: input.name || seed?.name || input.email.split("@")[0],
    username: input.email.split("@")[0],
    email: input.email,
    phone: seed?.phone ?? "",
    role: input.role ?? seed?.role ?? "student",
    bio: seed?.bio ?? "",
    avatarLabel: seed?.avatarLabel ?? input.email.slice(0, 2).toUpperCase(),
  };
}
