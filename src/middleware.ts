import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  "/messages",
  "/notifications",
  "/admin",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!needsAuth) return NextResponse.next();

  const raw = request.cookies.get("imu_auth")?.value;
  if (!raw) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/admin")) {
    try {
      const session = JSON.parse(raw) as { role?: string };
      if (session.role !== "admin") {
        return NextResponse.redirect(new URL("/access-denied", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|logo.svg|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
