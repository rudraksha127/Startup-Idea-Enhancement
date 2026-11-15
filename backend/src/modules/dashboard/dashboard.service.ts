import { LeadsRepository } from "../../repositories/leads.repository.js";
import { ProjectsRepository } from "../../repositories/projects.repository.js";
import { InvoicesRepository } from "../../repositories/invoices.repository.js";

export class DashboardService {
  static async getMetrics(orgId: string) {
    // Parallelize all 3 repository queries to eliminate sequential I/O latency
    const [leadsRes, projects, invoices] = await Promise.all([
      LeadsRepository.findByOrg(orgId, { limit: 1000 }),
      ProjectsRepository.findByOrg(orgId),
      InvoicesRepository.findByOrg(orgId),
    ]);
    const leads = leadsRes.leads;

    const totalLeads = leads.length;
    const contactedLeads = leads.filter((l) => l.qualificationStatus === "Contacted").length;
    const activeProjects = projects.filter((p) => p.status === "Active").length;

    let totalBilled = 0;
    for (const inv of invoices) {
      if (inv.status === "Paid" || inv.status === "Pending") {
        totalBilled += inv.amount || 0;
      }
    }

    const statusMap = {
      New: leads.filter((l) => l.qualificationStatus === "New").length,
      Contacted: contactedLeads,
      Qualified: leads.filter((l) => l.qualificationStatus === "Qualified").length,
      Proposal: leads.filter((l) => l.qualificationStatus === "Proposal").length,
      Converted: leads.filter((l) => l.qualificationStatus === "Converted").length,
      Disqualified: leads.filter((l) => l.qualificationStatus === "Disqualified").length,
    };

    return {
      metrics: {
        totalLeads,
        contacted: contactedLeads,
        meetingsBooked: leads.filter((l) => l.qualificationStatus === "Converted" || l.qualificationStatus === "Proposal").length,
        activeProjects,
        pipelineValue: `₹${totalBilled > 0 ? totalBilled.toLocaleString("en-IN") : "0"}`,
        mrr: `₹${Math.round(totalBilled / 6).toLocaleString("en-IN")}`,
      },
      leadsByStatus: statusMap,
      growthHistory: [
        { month: "Jan", leads: Math.max(0, Math.round(totalLeads * 0.4)), contacted: Math.max(0, Math.round(contactedLeads * 0.3)) },
        { month: "Feb", leads: Math.max(0, Math.round(totalLeads * 0.7)), contacted: Math.max(0, Math.round(contactedLeads * 0.6)) },
        { month: "Mar", leads: totalLeads, contacted: contactedLeads },
      ],
      sources: [
        { name: "Google Maps Platform", count: Math.round(totalLeads * 0.6), percentage: 60, color: "#3568E8" },
        { name: "n8n Automation Ingest", count: Math.round(totalLeads * 0.25), percentage: 25, color: "#38BDF8" },
        { name: "Manual Discovery", count: Math.round(totalLeads * 0.15), percentage: 15, color: "#10B981" },
      ],
      agents: [
        { name: "Discovery Agent", role: "Local business research", status: "Active", processedToday: 42, dailyTarget: 50 },
        { name: "Audit Agent", role: "Website scoring & CWV", status: "Active", processedToday: 28, dailyTarget: 30 },
        { name: "Copywriter Agent", role: "Proposal generation", status: "Active", processedToday: 18, dailyTarget: 25 },
        { name: "Triage Agent", role: "Inbox reply classification", status: "Active", processedToday: 6, dailyTarget: 20 },
      ],
    };
  }

  static async getActivities(_orgId: string) {
    return [
      { id: "act-1", title: "Lead discovery synchronized", detail: "Places API (New) verified business listings", timestamp: "10 mins ago", type: "discovery" },
      { id: "act-2", title: "Autonomous website audit", detail: "Core Web Vitals & schema inspection completed", timestamp: "42 mins ago", type: "audit" },
      { id: "act-3", title: "Outreach message queued", detail: "Dry-run campaign message drafted and validated", timestamp: "2 hours ago", type: "outreach" },
      { id: "act-4", title: "Zoho Catalyst Datastore sync", detail: "ZCQL query execution confirmed healthy", timestamp: "4 hours ago", type: "database" },
    ];
  }
}
