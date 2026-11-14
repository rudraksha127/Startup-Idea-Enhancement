import { catalystClient } from "../infrastructure/persistence/zoho-catalyst/catalyst.client.js";
import { LeadRecord, LeadAuditRecord, LeadNoteRecord } from "../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export class LeadsRepository {
  static async findByOrg(orgId: string, options: { search?: string; category?: string; status?: string; limit?: number; offset?: number } = {}): Promise<{ leads: LeadRecord[]; total: number }> {
    const all = await catalystClient.find<LeadRecord>("Leads", { organizationId: orgId });
    
    let filtered = all;
    if (options.status) {
      filtered = filtered.filter((l) => l.qualificationStatus === options.status);
    }
    if (options.category) {
      filtered = filtered.filter((l) => l.category.toLowerCase() === options.category?.toLowerCase());
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      filtered = filtered.filter((l) => l.businessName.toLowerCase().includes(q) || (l.city && l.city.toLowerCase().includes(q)));
    }

    filtered.sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0));

    const total = filtered.length;
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    const leads = filtered.slice(offset, offset + limit);

    return { leads, total };
  }

  static async findById(leadId: string, orgId?: string): Promise<LeadRecord | null> {
    const leads = await catalystClient.find<LeadRecord>("Leads", orgId ? { leadId, organizationId: orgId } : { leadId });
    return leads.length > 0 ? leads[0] : null;
  }

  static async findByGooglePlaceId(googlePlaceId: string, orgId: string): Promise<LeadRecord | null> {
    const leads = await catalystClient.find<LeadRecord>("Leads", { googlePlaceId, organizationId: orgId });
    return leads.length > 0 ? leads[0] : null;
  }

  static async findByWebsite(website: string, orgId?: string): Promise<LeadRecord | null> {
    const query: Record<string, any> = { website };
    if (orgId) query.organizationId = orgId;
    const leads = await catalystClient.find<LeadRecord>("Leads", query);
    return leads.length > 0 ? leads[0] : null;
  }

  static async findByName(businessName: string, orgId?: string): Promise<LeadRecord | null> {
    const query: Record<string, any> = { businessName };
    if (orgId) query.organizationId = orgId;
    const leads = await catalystClient.find<LeadRecord>("Leads", query);
    return leads.length > 0 ? leads[0] : null;
  }

  static async create(leadData: Omit<LeadRecord, "ROWID" | "createdAt" | "updatedAt">): Promise<LeadRecord> {
    const leadId = leadData.leadId || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return catalystClient.insertRow<LeadRecord>("Leads", { ...leadData, leadId });
  }

  static async update(leadId: string, orgId: string, data: Partial<LeadRecord>): Promise<LeadRecord> {
    return catalystClient.updateRow<LeadRecord>("Leads", leadId, data);
  }

  static async delete(leadId: string, orgId: string): Promise<boolean> {
    return catalystClient.deleteRow("Leads", leadId);
  }

  static async getAudit(leadId: string, orgId: string): Promise<LeadAuditRecord | null> {
    const audits = await catalystClient.find<LeadAuditRecord>("LeadAudits", { leadId, organizationId: orgId });
    return audits.length > 0 ? audits[0] : null;
  }

  static async saveAudit(auditData: Omit<LeadAuditRecord, "ROWID" | "createdAt">): Promise<LeadAuditRecord> {
    const auditId = auditData.auditId || `audit_${Date.now()}`;
    return catalystClient.insertRow<LeadAuditRecord>("LeadAudits", { ...auditData, auditId });
  }

  static async getNotes(leadId: string, orgId: string): Promise<LeadNoteRecord[]> {
    return catalystClient.find<LeadNoteRecord>("LeadNotes", { leadId, organizationId: orgId });
  }

  static async addNote(noteData: Omit<LeadNoteRecord, "ROWID" | "createdAt">): Promise<LeadNoteRecord> {
    const noteId = noteData.noteId || `note_${Date.now()}`;
    return catalystClient.insertRow<LeadNoteRecord>("LeadNotes", { ...noteData, noteId });
  }
}
