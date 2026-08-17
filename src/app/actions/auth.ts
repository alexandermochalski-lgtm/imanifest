"use server";

import { redirect } from "next/navigation";
import { findSeedUser, setSession, clearSession } from "@/lib/session";
import { emptyState, getState, saveState } from "@/lib/state";
import { hasCampusAccess, safeNextPath } from "@/lib/membership";

const DEMO_PASSWORD = "imanifest";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));
  const user = findSeedUser(email);
  if (!user || password !== DEMO_PASSWORD) {
    redirect("/login?error=invalid");
  }
  const prior = await getState();
  await setSession(user);
  await saveState({
    ...emptyState(),
    profile: { name: user.name, phone: user.phone, bio: user.bio },
    coins: user.role === "admin" ? 5000 : 500,
    membershipPaidAt: prior.membershipPaidAt,
  });
  if (user.role === "admin") {
    redirect(next.startsWith("/admin") ? next : "/admin");
  }
  if (hasCampusAccess(user.role, { ...emptyState(), membershipPaidAt: prior.membershipPaidAt })) {
    redirect(next && !next.startsWith("/admin") ? next : "/campus");
  }
  redirect("/get");
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!name || !email || password.length < 6) {
    redirect("/register?error=invalid");
  }
  const existing = findSeedUser(email);
  if (existing) {
    redirect("/login?error=exists");
  }
  redirect("/register?error=demo-only");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function forgotAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/forgot-password?error=invalid");
  redirect("/forgot-password?sent=1");
}
