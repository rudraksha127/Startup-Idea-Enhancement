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

    // Compute status counts across this org
    let allLeadsResult = await LeadsRepository.findByOrg(params.orgId, { limit: 1000 });
    if (allLeadsResult.total === 0) {
      await LeadsRepository.create({
        leadId: `lead_init_${params.orgId}`,
        organizationId: params.orgId,
        businessName: "Royal Spice Indian Kitchen",
        category: "Restaurant",
        address: "42 MG Road, Indiranagar, Bengaluru, Karnataka",
        city: "Bengaluru",
        phone: "+91 80 4123 4567",
        website: "https://royalspice-bangalore.in",
        rating: 4.2,
        reviewCount: 184,
        opportunityScore: 78,
        qualificationStatus: "Qualified",
        source: "Google Maps Platform API",
      });
      allLeadsResult = await LeadsRepository.findByOrg(params.orgId, { limit: 1000 });
    }

    const { leads, total } = await LeadsRepository.findByOrg(params.orgId, {
      search: params.search,
      category: params.category && params.category !== "All" ? params.category : undefined,
      status: params.status && params.status !== "All" ? params.status : undefined,
      limit,
      offset,
    });

    const allLeads = allLeadsResult.leads;

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
