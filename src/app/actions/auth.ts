"use server";

import { redirect } from "next/navigation";
import { findSeedUser, sessionUserFromAuth, setSession, clearSession } from "@/lib/session";
import { emptyState, getState, saveState } from "@/lib/state";
import { MEMBERSHIP_STIPEND, claimMonthlyStipend, isCampusUnlocked, recordFreeMember, safeNextPath, stampFreeSeat, syncCampusSeatCookie } from "@/lib/membership";
import { utcMonth } from "@/lib/daily-desk";
import { upsertDirectoryProfile } from "@/lib/directory";
import { createServerSupabase } from "@/lib/supabase/server";
import { siteUrl, supabaseConfigured } from "@/lib/supabase/env";

async function publishSeat(userId: string, name: string, bio = "") {
  try {
    await upsertDirectoryProfile({ userId, name, bio });
  } catch {
    /* profiles table may not exist yet */
  }
}

const DEMO_PASSWORD = "imanifest";

function afterLoginPath(role: "student" | "admin", campusOpen: boolean, next: string) {
  if (role === "admin") return next.startsWith("/admin") ? next : "/admin";
  if (campusOpen) return next && !next.startsWith("/admin") ? next : "/campus";
  return "/register";
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));
  const seed = findSeedUser(email);
  if (seed && password === DEMO_PASSWORD) {
    const prior = await getState();
    const paidAt = prior.membershipPaidAt || new Date().toISOString().slice(0, 10);
    const month = utcMonth();
    await setSession(seed);
    await saveState({
      ...emptyState(),
      profile: { name: seed.name, phone: seed.phone, bio: seed.bio },
      coins: seed.role === "admin" ? 5000 : 500 + MEMBERSHIP_STIPEND,
      membershipPaidAt: seed.role === "student" ? paidAt : prior.membershipPaidAt,
      lastStipendMonth: seed.role === "student" ? month : "",
    });
    const state = await getState();
    const paid = await isCampusUnlocked(seed.role, state, seed.id, seed.email);
    if (paid && !state.membershipPaidAt) await syncCampusSeatCookie(seed.id, seed.email, state);
    redirect(afterLoginPath(seed.role, paid, next));
  }

  const supabase = await createServerSupabase();
  if (!supabase) redirect("/login?error=invalid");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user?.email) redirect("/login?error=invalid");
  const user = sessionUserFromAuth({
    id: data.user.id,
    email: data.user.email,
    name: String(data.user.user_metadata?.name ?? ""),
  });
  const prior = await getState();
  await setSession(user);
  await saveState({
    ...emptyState(),
    profile: { name: user.name, phone: user.phone, bio: user.bio },
    coins: user.role === "admin" ? 5000 : 500,
    membershipPaidAt: prior.membershipPaidAt,
  });
  await publishSeat(user.id, user.name, user.bio);
  const state = await getState();
  const campusOpen = await isCampusUnlocked(user.role, state, user.id, user.email);
  if (campusOpen) await syncCampusSeatCookie(user.id, user.email, state);
  if (campusOpen && state.membershipPaidAt) {
    await claimMonthlyStipend({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  }
  // Legacy accounts with no membership row yet → freemium seat
  if (!campusOpen) {
    await recordFreeMember(user.id, user.email);
    await stampFreeSeat(new Date().toISOString().slice(0, 10));
    redirect(afterLoginPath(user.role, true, next));
  }
  redirect(afterLoginPath(user.role, true, next));
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!name || !email || password.length < 6) {
    redirect("/register?error=invalid");
  }
  if (findSeedUser(email)) {
    redirect("/login?error=exists");
  }
  if (!supabaseConfigured()) redirect("/register?error=demo-only");
  const supabase = await createServerSupabase();
  if (!supabase) redirect("/register?error=demo-only");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${siteUrl()}/login`,
    },
  });
  if (error) {
    if (/already/i.test(error.message)) redirect("/login?error=exists");
    redirect("/register?error=rejected");
  }
  if (!data.session || !data.user?.email) redirect("/register?ok=confirm");
  const user = sessionUserFromAuth({ id: data.user.id, email: data.user.email, name });
  await setSession(user);
  await saveState({
    ...emptyState(),
    profile: { name, phone: "", bio: "" },
    coins: 100,
  });
  await publishSeat(user.id, name);
  const freeAt = await recordFreeMember(user.id, user.email);
  await stampFreeSeat(freeAt);
  redirect("/campus");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function forgotAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/forgot-password?error=invalid");
  const supabase = await createServerSupabase();
  if (supabase) {
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl()}/login` });
  }
  redirect("/forgot-password?sent=1");
}
