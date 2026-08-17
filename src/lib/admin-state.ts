import { cookies } from "next/headers";
import type { AdminOverlay, Payment } from "@/lib/types";

const ADMIN_COOKIE = "imu_admin";

export function emptyOverlay(): AdminOverlay {
  return {
    userStatus: {},
    applicationStatus: {},
    promoActive: {},
    notes: {},
    livePayments: [],
  };
}

export async function getAdminOverlay(): Promise<AdminOverlay> {
  const raw = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!raw) return emptyOverlay();
  try {
    return { ...emptyOverlay(), ...(JSON.parse(raw) as AdminOverlay) };
  } catch {
    return emptyOverlay();
  }
}

export async function saveAdminOverlay(overlay: AdminOverlay) {
  (await cookies()).set(ADMIN_COOKIE, JSON.stringify(overlay), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function mutateAdminOverlay(mutator: (overlay: AdminOverlay) => AdminOverlay) {
  const next = mutator(await getAdminOverlay());
  next.livePayments = next.livePayments.slice(0, 40);
  await saveAdminOverlay(next);
  return next;
}

export async function appendLivePayment(payment: Payment) {
  await mutateAdminOverlay((overlay) => ({
    ...overlay,
    livePayments: [payment, ...overlay.livePayments.filter((item) => item.id !== payment.id)],
  }));
}
