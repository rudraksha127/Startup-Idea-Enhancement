import { LeadsRepository } from "../../repositories/leads.repository.js";
import { ClientsRepository } from "../../repositories/clients.repository.js";
import { ProjectsRepository } from "../../repositories/projects.repository.js";
import { CreateLeadInput } from "../../validators/lead.validator.js";
import { LeadRecord } from "../../infrastructure/persistence/zoho-catalyst/catalyst.types.js";
import { runBackendWebsiteAudit } from "./website-audit-engine.js";

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
      address: input.address || input.location || "",
      city: input.location?.split(",")[0]?.trim() || "",
      phone: input.phone || "",
      website: input.website,
      rating: input.rating || 0,
      reviewCount: input.reviewCount || 0,
      opportunityScore: input.opportunityScore || 0,
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

    const result = await runBackendWebsiteAudit({
      website: lead.website,
      rating: lead.rating,
      reviewCount: lead.reviewCount,
    });

    const auditData = {
      auditId: `audit_${Date.now()}`,
      leadId: lead.leadId,
      organizationId: orgId,
      performanceScore: result.performanceScore,
      seoScore: result.seoScore,
      accessibilityScore: result.accessibilityScore,
      mobileScore: result.mobileScore,
      detectedTech: result.detectedTech,
      issuesJson: JSON.stringify(result.issues),
    };

    await LeadsRepository.saveAudit(auditData);
    const updated = await LeadsRepository.update(lead.leadId, orgId, {
      opportunityScore: result.opportunityScore,
      qualificationStatus: result.dataMode === "unreachable" ? lead.qualificationStatus : "Qualified",
    });

    return {
      lead: updated,
      audit: auditData,
      dataMode: result.dataMode,
    };
  }

  static async convertLeadToClient(
    idOrSlug: string,
    orgId: string,
    options: { monthlyRetainer?: number; projectTitle?: string; createProject?: boolean } = {}
  ) {
    const lead = await this.getLeadById(idOrSlug, orgId);
    if (!lead) return null;

    const retainer = typeof options.monthlyRetainer === "number" ? options.monthlyRetainer : 25000;
    const createProject = options.createProject !== false;
    const client = await ClientsRepository.create({
      clientId: `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: orgId,
      name: lead.businessName,
      domain: lead.website,
      type: lead.category || "General",
      location: lead.city || lead.address || "",
      phone: lead.phone || "",
      status: "Onboarding",
      totalValue: retainer,
      projectsCount: createProject ? 1 : 0,
    });

    let project = null;
    if (createProject) {
      project = await ProjectsRepository.create({
        projectId: `prj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        organizationId: orgId,
        clientId: client.clientId,
        clientName: client.name,
        name: options.projectTitle || `${lead.businessName} — Website Modernization`,
        type: lead.category || "Website Modernization",
        status: "Active",
        budget: retainer,
        amountPaid: 0,
        amountDue: retainer,
        progress: 10,
      });
    }

    const updatedLead = await LeadsRepository.update(lead.leadId, orgId, {
      qualificationStatus: "Converted",
    });

    return { lead: updatedLead, client, project };
  }
}
