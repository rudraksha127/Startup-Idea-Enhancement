import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, getJwtSecret, type SessionUser } from "./edge-jwt";

export type { SessionUser };

export const VALID_ROLES = ["Founder", "Admin", "Member"] as const;

export type ValidRole = typeof VALID_ROLES[number];

export function normalizeRole(role?: string): ValidRole | null {
  if (!role) return null;
  const r = role.trim().toLowerCase();
  if (r.includes("founder") || r.includes("owner")) return "Founder";
  if (r.includes("admin")) return "Admin";
  if (r.includes("member") || r.includes("developer") || r.includes("outreach") || r.includes("success") || r.includes("operator")) {
    return "Member";
  }
  return null;
}

export function hasAdminRole(role?: string): boolean {
  if (!role) return false;
  const r = role.toLowerCase();
  return r.includes("owner") || r.includes("founder") || r.includes("admin");
}

export function signToken(user: SessionUser): string {
  const secret = getJwtSecret();
  if (!secret) {
    throw new Error("JWT_SECRET environment variable must be configured in production");
  }
  return jwt.sign(user, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const secret = getJwtSecret();
    if (!secret) return null;
    return jwt.verify(token, secret) as SessionUser;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function getAuthSession(req?: NextRequest): Promise<SessionUser | null> {
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      const user = verifyToken(token);
      if (user) return user;
    }
    const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
    if (cookieToken) {
      const user = verifyToken(cookieToken);
      if (user) return user;
    }
  }

  return getCurrentUser();
}

/**
 * Extracts authenticated user and verified organizationId for API route handlers.
 */
export async function requireApiAuth(
  req?: NextRequest
): Promise<{ session: SessionUser; error?: never } | { session?: never; error: NextResponse }> {
  const session = await getAuthSession(req);
  if (!session || !session.organizationId) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized: valid authentication session required" },
        { status: 401 }
      ),
    };
  }
  return { session };
}

/**
 * Enforces both authentication and Organization Owner/Admin role.
 */
export async function requireAdminAuth(
  req?: NextRequest
): Promise<{ session: SessionUser; error?: never } | { session?: never; error: NextResponse }> {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth;

  if (!hasAdminRole(auth.session.role)) {
    return {
      error: NextResponse.json(
        { error: "Forbidden: Owner or Admin role required" },
        { status: 403 }
      ),
    };
  }
  return auth;
}

/**
 * Builds forwarding headers containing caller Bearer token for AppSail Express API calls.
 */
export function forwardAuthHeaders(req?: NextRequest, extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (!req) return headers;

  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  } else {
    const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
    if (cookieToken) {
      headers["Authorization"] = `Bearer ${cookieToken}`;
    }
  }
  return headers;
}

export { COOKIE_NAME };

