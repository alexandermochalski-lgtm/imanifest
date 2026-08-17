"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mutateAdminOverlay } from "@/lib/admin-state";
import { getSession } from "@/lib/session";
import { mutateState } from "@/lib/state";
import type { AccountStatus, JobApplication } from "@/lib/types";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/access-denied");
  return session;
}

function revalidateDesk() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/applications");
  revalidatePath("/admin/coins");
  revalidatePath("/admin/jobs");
}

export async function setUserStatus(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const status = String(formData.get("status") ?? "") as AccountStatus;
  if (!userId || !["active", "suspended", "pending"].includes(status)) return;
  await mutateAdminOverlay((overlay) => ({
    ...overlay,
    userStatus: { ...overlay.userStatus, [userId]: status },
  }));
  revalidateDesk();
  redirect(`/admin/users/${userId}?ok=status`);
}

export async function saveUserNote(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!userId) return;
  await mutateAdminOverlay((overlay) => ({
    ...overlay,
    notes: { ...overlay.notes, [userId]: note },
  }));
  revalidateDesk();
  redirect(`/admin/users/${userId}?ok=note`);
}

export async function setApplicationStatus(formData: FormData) {
  await requireAdmin();
  const applicationId = String(formData.get("applicationId") ?? "");
  const status = String(formData.get("status") ?? "") as JobApplication["status"];
  if (!applicationId || !["submitted", "reviewing", "rejected", "hired"].includes(status)) return;
  await mutateAdminOverlay((overlay) => ({
    ...overlay,
    applicationStatus: { ...overlay.applicationStatus, [applicationId]: status },
  }));
  await mutateState((state) => ({
    ...state,
    applications: state.applications.map((item) => (item.id === applicationId ? { ...item, status } : item)),
  }));
  revalidateDesk();
  redirect("/admin/applications?ok=status");
}

export async function togglePromo(formData: FormData) {
  await requireAdmin();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const active = String(formData.get("active") ?? "") === "1";
  if (!code) return;
  await mutateAdminOverlay((overlay) => ({
    ...overlay,
    promoActive: { ...overlay.promoActive, [code]: active },
  }));
  revalidateDesk();
  redirect("/admin/coins?ok=promo");
}
