"use server";

import { redirect } from "next/navigation";
import { findSeedUser, setSession, clearSession } from "@/lib/session";
import { emptyState, saveState } from "@/lib/state";

const DEMO_PASSWORD = "imanifest";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const user = findSeedUser(email);
  if (!user || password !== DEMO_PASSWORD) {
    redirect("/login?error=invalid");
  }
  await setSession(user);
  await saveState({
    ...emptyState(),
    profile: { name: user.name, phone: user.phone, bio: user.bio },
    coins: user.role === "admin" ? 5000 : 500,
  });
  redirect(user.role === "admin" ? "/admin" : "/campus");
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
