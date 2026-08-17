import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { copyCookies, updateSupabaseSession } from "@/lib/supabase/middleware";

const protectedPrefixes = [
  "/campus",
  "/courses",
  "/library",
  "/guides",
  "/journals",
  "/forum",
  "/jobs",
  "/bundles",
  "/insights",
  "/pricing",
  "/profile",
  "/directory",
  "/messages",
  "/notifications",
  "/admin",
];

function isPaidMember(raw: string | undefined): boolean {
  if (!raw) return false;
  try {
    const state = JSON.parse(raw) as { membershipPaidAt?: string };
    return Boolean(state.membershipPaidAt);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const supabaseResponse = await updateSupabaseSession(request);
  const { pathname } = request.nextUrl;
  const needsAuth = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!needsAuth) return supabaseResponse;

  const raw = request.cookies.get("imu_auth")?.value;
  if (!raw) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return copyCookies(supabaseResponse, NextResponse.redirect(login));
  }

  let role = "";
  try {
    role = (JSON.parse(raw) as { role?: string }).role ?? "";
  } catch {
    return copyCookies(supabaseResponse, NextResponse.redirect(new URL("/login", request.url)));
  }

  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      return copyCookies(supabaseResponse, NextResponse.redirect(new URL("/access-denied", request.url)));
    }
    return supabaseResponse;
  }

  if (role !== "admin" && !isPaidMember(request.cookies.get("imu_state")?.value)) {
    return copyCookies(supabaseResponse, NextResponse.redirect(new URL("/get", request.url)));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|logo.svg|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
