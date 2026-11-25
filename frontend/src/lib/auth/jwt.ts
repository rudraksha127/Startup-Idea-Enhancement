import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "agencyos-dev-jwt-super-secret-key-min-32-chars-long";
const COOKIE_NAME = "agencyos_token";

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
}

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
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
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

export { COOKIE_NAME };

