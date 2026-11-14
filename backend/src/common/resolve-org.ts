import { Request } from "express";
import { OrganizationsRepository } from "../repositories/organizations.repository.js";

const DEFAULT_ORG_ID = "org-apex-001";

/**
 * Resolves the active organization ID from request user auth or default organization.
 */
export async function resolveOrgId(req: Request): Promise<string> {
  if (req.user?.organizationId) {
    return req.user.organizationId;
  }
  try {
    const defaultOrg = await OrganizationsRepository.findBySlug("agencyos-demo");
    if (!defaultOrg) {
      const created = await OrganizationsRepository.create({
        orgId: DEFAULT_ORG_ID,
        name: "Apex Digital Labs",
        slug: "agencyos-demo",
        plan: "Enterprise",
        credits: 500,
      });
      return created.orgId;
    }
    return defaultOrg.orgId || DEFAULT_ORG_ID;
  } catch {
    return DEFAULT_ORG_ID;
  }
}

/**
 * Extracts a single string ID from Express request parameters safely.
 */
export function extractId(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] || "";
  return param || "";
}
