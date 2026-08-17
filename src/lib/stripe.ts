import { coinPacks, premiumMembership } from "@/lib/catalog";
import type { CoinPack } from "@/lib/types";

export const STRIPE_RETURN_PATH = "/api/stripe/return";
export const COIN_PENDING_COOKIE = "imu_coin_pending";
export const COIN_THANKS_PATH = "/pricing/thanks";

export function campusCheckoutUrl(email: string, userId: string): string {
  const url = new URL(premiumMembership.stripeUrl);
  url.searchParams.set("prefilled_email", email);
  url.searchParams.set("client_reference_id", userId);
  return url.toString();
}

export function coinCheckoutUrl(pack: CoinPack, email: string, userId: string): string {
  const url = new URL(pack.stripeUrl);
  url.searchParams.set("prefilled_email", email);
  url.searchParams.set("client_reference_id", `${userId}|${pack.id}`);
  return url.toString();
}

export function coinPackFromId(id: string): CoinPack | undefined {
  return coinPacks.find((pack) => pack.id === id);
}

export function isCoinCheckout(object: Record<string, unknown>) {
  const mode = String(object.mode ?? "");
  if (mode === "payment") return true;
  const amount = Number(object.amount_total ?? 0);
  return coinPacks.some((pack) => Math.round(pack.price * 100) === amount);
}
