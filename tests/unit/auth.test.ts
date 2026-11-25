import { describe, it, expect } from "vitest";
import { signToken, verifyToken, hashPassword, comparePassword, hasAdminRole, VALID_ROLES } from "@/lib/auth/jwt";

describe("Authentication & JWT Helpers", () => {
  it("hashes and correctly verifies passwords with bcryptjs", async () => {
    const password = "securePassword123!";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash.startsWith("$2")).toBe(true);

    const matches = await comparePassword(password, hash);
    expect(matches).toBe(true);

    const incorrectMatches = await comparePassword("wrongPassword", hash);
    expect(incorrectMatches).toBe(false);
  });

  it("signs and verifies valid JWT session tokens with user claims", () => {
    const sessionUser = {
      userId: "654321654321654321654321",
      email: "founder@agencyos.com",
      name: "Rudraksh",
      role: "Founder",
      organizationId: "123456123456123456123456",
    };

    const token = signToken(sessionUser);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.email).toBe(sessionUser.email);
    expect(decoded?.name).toBe(sessionUser.name);
    expect(decoded?.role).toBe(sessionUser.role);
    expect(decoded?.organizationId).toBe(sessionUser.organizationId);
  });

  it("returns null for invalid or tampered tokens", () => {
    const result = verifyToken("invalid.tampered.token");
    expect(result).toBeNull();
  });

  it("evaluates admin roles accurately", () => {
    expect(hasAdminRole("Founder")).toBe(true);
    expect(hasAdminRole("Owner")).toBe(true);
    expect(hasAdminRole("Admin")).toBe(true);
    expect(hasAdminRole("Owner / Founder")).toBe(true);
    expect(hasAdminRole("Lead Developer")).toBe(false);
    expect(hasAdminRole("Member")).toBe(false);
    expect(hasAdminRole("Operator")).toBe(false);
    expect(hasAdminRole(undefined)).toBe(false);
  });

  it("validates recognized role taxonomy", () => {
    expect(VALID_ROLES).toContain("Founder");
    expect(VALID_ROLES).toContain("Admin");
    expect(VALID_ROLES).toContain("Member");
  });
});

