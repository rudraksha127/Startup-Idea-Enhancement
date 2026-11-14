import { catalystClient } from "../infrastructure/persistence/zoho-catalyst/catalyst.client.js";
import { OrganizationRecord } from "../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export class OrganizationsRepository {
  static async findById(orgId: string): Promise<OrganizationRecord | null> {
    const orgs = await catalystClient.find<OrganizationRecord>("Organizations", { orgId });
    if (orgs.length > 0) return orgs[0];
    const byRow = await catalystClient.find<OrganizationRecord>("Organizations", { ROWID: orgId });
    return byRow.length > 0 ? byRow[0] : null;
  }

  static async findBySlug(slug: string): Promise<OrganizationRecord | null> {
    const orgs = await catalystClient.find<OrganizationRecord>("Organizations", { slug });
    return orgs.length > 0 ? orgs[0] : null;
  }

  static async create(data: Omit<OrganizationRecord, "ROWID" | "createdAt" | "updatedAt">): Promise<OrganizationRecord> {
    const orgId = data.orgId || `org_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return catalystClient.insertRow<OrganizationRecord>("Organizations", { ...data, orgId });
  }

  static async update(orgId: string, data: Partial<OrganizationRecord>): Promise<OrganizationRecord> {
    return catalystClient.updateRow<OrganizationRecord>("Organizations", orgId, data);
  }
}
