import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifyTokenEdge } from "@/lib/auth/edge-jwt";

const PUBLIC_PAGES = new Set(["/", "/login", "/register"]);

const PUBLIC_API_PREFIXES = [
  "/api/health",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/billing/webhook",
  "/api/n8n/webhook",
];

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Allow public marketing and authentication pages
  if (PUBLIC_PAGES.has(pathname)) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Allow public auth/health/signature-validated webhook API routes
  if (PUBLIC_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Extract token from Bearer header or HttpOnly session cookie
  let token: string | undefined;
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }
  if (!token) {
    token = req.cookies.get(COOKIE_NAME)?.value;
  }

  const session = token ? await verifyTokenEdge(token) : null;

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: "Unauthorized", message: "Valid authentication session required" },
          { status: 401 }
        )
      );
    }

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};
