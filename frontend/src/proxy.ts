import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "cc_session";

/**
 * Optimistic gate: bounce visitors with no session cookie to /login before
 * rendering. The Express backend is the source of truth — it verifies the
 * token on every API call, and the (app)/admin layouts redirect when /api/me
 * says the session is invalid or lacks the admin role.
 */
export function proxy(req: NextRequest) {
  if (req.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();

  const url = new URL("/login", req.url);
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
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
    "/cart/:path*",
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
