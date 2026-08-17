import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { findSeedUser } from "@/lib/session";
import { recordPaidMember } from "@/lib/membership";

export const runtime = "nodejs";

function verifySignature(payload: string, header: string, secret: string) {
  const stamp = header.split(",").find((part) => part.startsWith("t="))?.slice(2);
  const signature = header.split(",").find((part) => part.startsWith("v1="))?.slice(3);
  if (!stamp || !signature) return false;
  const age = Math.abs(Date.now() / 1000 - Number(stamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = createHmac("sha256", secret).update(`${stamp}.${payload}`).digest("hex");
  const left = Buffer.from(expected, "utf8");
  const right = Buffer.from(signature, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

function pickIdentity(data: Record<string, unknown>) {
  const object = (data.object ?? data) as Record<string, unknown>;
  const userId = String(object.client_reference_id ?? "").trim();
  const email = String(
    object.customer_email ??
      (object.customer_details as { email?: string } | undefined)?.email ??
      object.email ??
      "",
  )
    .trim()
    .toLowerCase();
  const seed = email ? findSeedUser(email) : undefined;
  return { userId: userId || seed?.id || email, email: email || seed?.email || "" };
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not set." }, { status: 501 });
  }
  const payload = await request.text();
  const header = request.headers.get("stripe-signature") ?? "";
  if (!verifySignature(payload, header, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }
  const event = JSON.parse(payload) as { type: string; data: { object: Record<string, unknown> } };
  const { userId, email } = pickIdentity(event.data.object);
  if (!userId && !email) return NextResponse.json({ ok: true, skipped: true });

  if (event.type === "checkout.session.completed" || event.type === "invoice.paid") {
    try {
      await recordPaidMember(userId || email, email || userId, "active");
    } catch {
      /* overlay may be cookie-only on this request */
    }
  }
  if (event.type === "customer.subscription.deleted") {
    try {
      await recordPaidMember(userId || email, email || userId, "canceled");
    } catch {
      /* ignore */
    }
  }
  return NextResponse.json({ ok: true });
}
