import { describe, it, expect } from "vitest";
import {
  signToken,
  verifyToken,
  hasAdminRole,
  VALID_ROLES,
  COOKIE_NAME,
  SessionUser,
} from "@/lib/auth/jwt";
import { verifyTokenEdge } from "@/lib/auth/edge-jwt";

describe("Security & RBAC Hardening (TASK-AUDIT-01)", () => {
  const founderUser: SessionUser = {
    userId: "usr_founder_001",
    email: "rudraksh@agencyos.ai",
    name: "Rudraksh",
    role: "Founder",
    organizationId: "org_agencyos_hq",
  };

  const adminUser: SessionUser = {
    userId: "usr_admin_002",
    email: "sarah@agencyos.ai",
    name: "Sarah Chen",
    role: "Admin",
    organizationId: "org_agencyos_hq",
  };

  const memberUser: SessionUser = {
    userId: "usr_member_003",
    email: "marcus@agencyos.ai",
    name: "Marcus Vance",
    role: "Growth & Outreach",
    organizationId: "org_agencyos_hq",
  };

  const operatorUser: SessionUser = {
    userId: "usr_operator_004",
    email: "operator@agencyos.ai",
    name: "Operator",
    role: "Operator",
    organizationId: "org_agencyos_hq",
  };

  it("identifies administrative roles correctly with hasAdminRole", () => {
    expect(hasAdminRole("Founder")).toBe(true);
    expect(hasAdminRole("Owner")).toBe(true);
    expect(hasAdminRole("Owner / Founder")).toBe(true);
    expect(hasAdminRole("Admin")).toBe(true);
    expect(hasAdminRole("Organization Admin")).toBe(true);

    expect(hasAdminRole("Lead Developer")).toBe(false);
    expect(hasAdminRole("Growth & Outreach")).toBe(false);
    expect(hasAdminRole("Client Success")).toBe(false);
    expect(hasAdminRole("Member")).toBe(false);
    expect(hasAdminRole("Operator")).toBe(false);
    expect(hasAdminRole(undefined)).toBe(false);
    expect(hasAdminRole("")).toBe(false);
  });

  it("validates that all permitted roles exist in VALID_ROLES", () => {
    expect(VALID_ROLES).toContain("Founder");
    expect(VALID_ROLES).toContain("Admin");
    expect(VALID_ROLES).toContain("Member");
  });

  it("creates and decodes valid cryptographic tokens with multi-tenant claims", async () => {
    const token = signToken(founderUser);
    const decoded = verifyToken(token);
    const edgeDecoded = await verifyTokenEdge(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(founderUser.userId);
    expect(decoded?.email).toBe(founderUser.email);
    expect(decoded?.role).toBe(founderUser.role);
    expect(decoded?.organizationId).toBe(founderUser.organizationId);

    expect(edgeDecoded).not.toBeNull();
    expect(edgeDecoded?.userId).toBe(founderUser.userId);
    expect(edgeDecoded?.organizationId).toBe(founderUser.organizationId);
    expect(await verifyTokenEdge(`${token}tampered`)).toBeNull();
  });

  it("rejects unauthorized role modifications by unprivileged members", () => {
    const isMemberPrivileged = hasAdminRole(memberUser.role);
    const isOperatorPrivileged = hasAdminRole(operatorUser.role);

    expect(isMemberPrivileged).toBe(false);
    expect(isOperatorPrivileged).toBe(false);
  });

  it("permits role administration by Owners and Admins", () => {
    const isFounderPrivileged = hasAdminRole(founderUser.role);
    const isAdminPrivileged = hasAdminRole(adminUser.role);

    expect(isFounderPrivileged).toBe(true);
    expect(isAdminPrivileged).toBe(true);
  });
});
