import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "cc_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me"
);

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/explore",
  "/product",
  "/sell",
  "/rent",
  "/exchange",
  "/offers",
  "/messages",
  "/wishlist",
  "/orders",
  "/rentals",
  "/my-listings",
  "/profile",
  "/notifications",
  "/settings",
  "/onboarding",
];

const ADMIN_PREFIX = "/admin";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);
  const isProtected = isAdminRoute || PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    if (isAdminRoute && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  } catch {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/explore/:path*",
    "/product/:path*",
    "/sell/:path*",
    "/rent/:path*",
    "/exchange/:path*",
    "/offers/:path*",
    "/messages/:path*",
    "/wishlist/:path*",
    "/orders/:path*",
    "/rentals/:path*",
    "/my-listings/:path*",
    "/profile/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
  ],
};
