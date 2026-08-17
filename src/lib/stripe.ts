import { premiumMembership } from "@/lib/catalog";

export const STRIPE_RETURN_PATH = "/api/stripe/return";

export function campusCheckoutUrl(email: string, userId: string): string {
  const url = new URL(premiumMembership.stripeUrl);
  url.searchParams.set("prefilled_email", email);
  url.searchParams.set("client_reference_id", userId);
  return url.toString();
}
