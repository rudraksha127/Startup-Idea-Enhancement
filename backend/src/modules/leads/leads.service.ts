import { LeadsRepository } from "../../repositories/leads.repository.js";
import { CreateLeadInput } from "../../validators/lead.validator.js";
import { LeadRecord } from "../../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export interface GetLeadsQuery {
  orgId: string;
  search?: string;
  status?: string;
  category?: string;
  location?: string;
  sortBy?: string;
  sortOrder?: 1 | -1;
  page?: number;
  limit?: number;
}

export class LeadsService {
  static async getLeads(params: GetLeadsQuery) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const offset = (page - 1) * limit;

    // Single-pass query: Fetch all leads for this organization once
    const allLeadsResult = await LeadsRepository.findByOrg(params.orgId, { limit: 10000 });
    const allLeads = allLeadsResult.leads;

    // Compute status counts directly from the unified dataset (0 duplicate DB queries)
    const counts = {
      All: allLeads.length,
      New: allLeads.filter((l) => l.qualificationStatus === "New").length,
      Contacted: allLeads.filter((l) => l.qualificationStatus === "Contacted").length,
      Qualified: allLeads.filter((l) => l.qualificationStatus === "Qualified").length,
      Proposal: allLeads.filter((l) => l.qualificationStatus === "Proposal").length,
      Converted: allLeads.filter((l) => l.qualificationStatus === "Converted").length,
      Disqualified: allLeads.filter((l) => l.qualificationStatus === "Disqualified").length,
      Interested: allLeads.filter((l) => l.qualificationStatus === "Qualified").length, // legacy alias
      Replied: allLeads.filter((l) => l.qualificationStatus === "Contacted").length, // legacy alias
      Archived: allLeads.filter((l) => l.qualificationStatus === "Disqualified").length, // legacy alias
    };

    // Filter in-memory for active request parameters
    let filtered = allLeads;
    if (params.status && params.status !== "All") {
      filtered = filtered.filter((l) => l.qualificationStatus === params.status);
    }
    if (params.category && params.category !== "All") {
      const cat = params.category.toLowerCase();
      filtered = filtered.filter((l) => l.category && l.category.toLowerCase() === cat);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((l) =>
        (l.businessName && l.businessName.toLowerCase().includes(q)) ||
        (l.city && l.city.toLowerCase().includes(q)) ||
        (l.address && l.address.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0));

    const total = filtered.length;
    const leads = filtered.slice(offset, offset + limit);

    return {
      leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || (total > 0 ? 1 : 0),
      counts,
    };
  }

  static async getLeadById(idOrSlug: string, orgId: string): Promise<LeadRecord | null> {
    const lead = await LeadsRepository.findById(idOrSlug, orgId);
    if (lead) return lead;

    // Search by name if slug
    const leads = await LeadsRepository.findByOrg(orgId, { limit: 100 });
    return (
      leads.leads.find(
        (l) =>
          l.leadId === idOrSlug ||
          l.ROWID === idOrSlug ||
          l.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-") === idOrSlug.toLowerCase()
      ) || null
    );
  }

  static async createLead(input: CreateLeadInput, orgId: string): Promise<LeadRecord> {
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return LeadsRepository.create({
      leadId,
      organizationId: orgId,
      businessName: input.businessName,
      category: input.category || "General Business",
      address: input.address || input.location || "Indore, MP, India",
      city: input.location?.split(",")[0]?.trim() || "Indore",
      phone: input.phone || "+91 98110 00000",
      website: input.website,
      rating: input.rating || 4.5,
      reviewCount: input.reviewCount || 10,
      opportunityScore: input.opportunityScore || 75,
      qualificationStatus: (input.status as any) || "New",
      source: input.source || "Manual Entry",
    });
  }

  static async updateLeadStatus(idOrSlug: string, status: string, orgId: string): Promise<LeadRecord | null> {
    const lead = await this.getLeadById(idOrSlug, orgId);
    if (!lead) return null;

    const qualificationStatus = (status as any) || "Contacted";
    return LeadsRepository.update(lead.leadId, orgId, { qualificationStatus });
  }

  static async runLeadAudit(idOrSlug: string, orgId: string) {
    const lead = await this.getLeadById(idOrSlug, orgId);
    if (!lead) return null;

    const auditData = {
      auditId: `audit_${Date.now()}`,
      leadId: lead.leadId,
      organizationId: orgId,
      performanceScore: 52,
      seoScore: 68,
      accessibilityScore: 75,
      mobileScore: 45,
      detectedTech: "WordPress, Apache, jQuery",
      issuesJson: JSON.stringify([
        { type: "critical", title: "Slow Mobile First Contentful Paint", detail: "Exceeds Core Web Vitals recommended standard." },
        { type: "warning", title: "Missing Local Business Schema Markup", detail: "Schema.org/LocalBusiness missing from header." },
        { type: "passed", title: "Valid SSL/TLS Certificate", detail: "TLS 1.3 protocol active." },
      ]),
    };

    await LeadsRepository.saveAudit(auditData);
    const updated = await LeadsRepository.update(lead.leadId, orgId, {
      opportunityScore: 88,
      qualificationStatus: "Qualified",
    });

    return {
      lead: updated,
      audit: auditData,
    };
  }
}
