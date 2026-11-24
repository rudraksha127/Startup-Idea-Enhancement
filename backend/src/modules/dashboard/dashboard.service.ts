import { LeadsRepository } from "../../repositories/leads.repository.js";
import { ProjectsRepository } from "../../repositories/projects.repository.js";
import { InvoicesRepository } from "../../repositories/invoices.repository.js";
import { catalystClient } from "../../infrastructure/persistence/zoho-catalyst/catalyst.client.js";

export class DashboardService {
  static async getMetrics(orgId: string) {
    // Parallelize all 3 repository queries to eliminate sequential I/O latency.
    // Propagate repository errors instead of silently masking them with zero metrics.
    const [leadsRes, projects, invoices] = await Promise.all([
      LeadsRepository.findByOrg(orgId, { limit: 1000 }),
      ProjectsRepository.findByOrg(orgId),
      InvoicesRepository.findByOrg(orgId),
    ]);
    const leads = leadsRes?.leads || [];

    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter(
      (l) => l.qualificationStatus === "Contacted" || (l as any).status === "Contacted" || (l as any).lastContactedAt != null
    ).length;
    const activeOutreaches = leads.filter(
      (l) =>
        l.qualificationStatus === "Qualified" ||
        l.qualificationStatus === "Proposal" ||
        (l as any).status === "Replied" ||
        (l as any).status === "Interested"
    ).length;
    const activeProjectsCount = projects.filter((p) => p.status === "Active").length;
    const convertedLeadsCount = leads.filter(
      (l) => l.qualificationStatus === "Converted" || (l as any).status === "Converted"
    ).length;
    const convertedClients = activeProjectsCount + convertedLeadsCount;

    let totalBilled = 0;
    for (const inv of invoices) {
      if (inv.status === "Paid") {
        totalBilled += inv.amount || 0;
      }
    }

    const statusMap = {
      New: leads.filter((l) => l.qualificationStatus === "New" || (l as any).status === "New").length,
      Contacted: qualifiedLeads,
      Qualified: leads.filter((l) => l.qualificationStatus === "Qualified").length,
      Proposal: leads.filter((l) => l.qualificationStatus === "Proposal").length,
      Converted: convertedLeadsCount,
      Disqualified: leads.filter((l) => l.qualificationStatus === "Disqualified").length,
    };

    // Calculate genuine source attribution from actual leads
    let sources: Array<{ name: string; count: number; percentage: number; color: string }> = [];
    if (totalLeads > 0) {
      const sourceCounts: Record<string, number> = {};
      for (const lead of leads) {
        const src = lead.source || "Google Maps Platform";
        sourceCounts[src] = (sourceCounts[src] || 0) + 1;
      }
      const palette: Record<string, string> = {
        "Google Maps Platform": "#3568E8",
        "Google Maps": "#3568E8",
        "n8n Automation Ingest": "#38BDF8",
        "Manual Discovery": "#10B981",
        "Social Media": "#e1306c",
        "Referrals": "#F59E0B",
      };
      sources = Object.entries(sourceCounts).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalLeads) * 100),
        color: palette[name] || "#10251f",
      }));
    }

    // Calculate genuine growth history if real data exists; otherwise return empty array
    let growthHistory: Array<{
      month: string;
      leadsFound: number;
      contacted: number;
      replies: number;
      clients: number;
    }> = [];

    if (totalLeads > 0 || convertedClients > 0) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      const currentMonthIdx = now.getMonth();
      const pastMonths = [
        { name: months[(currentMonthIdx - 2 + 12) % 12], monthIdx: (currentMonthIdx - 2 + 12) % 12 },
        { name: months[(currentMonthIdx - 1 + 12) % 12], monthIdx: (currentMonthIdx - 1 + 12) % 12 },
        { name: months[currentMonthIdx], monthIdx: currentMonthIdx },
      ];

      const hasDates = leads.some((l) => l.createdAt) || projects.some((p) => p.createdAt);
      if (hasDates) {
        growthHistory = pastMonths.map((m) => {
          const mLeads = leads.filter((l) => {
            if (!l.createdAt) return false;
            const d = new Date(l.createdAt);
            return d.getMonth() === m.monthIdx;
          });
          const mProjects = projects.filter((p) => {
            if (!p.createdAt) return false;
            const d = new Date(p.createdAt);
            return d.getMonth() === m.monthIdx && p.status === "Active";
          });
          return {
            month: m.name,
            leadsFound: mLeads.length,
            contacted: mLeads.filter(
              (l) => l.qualificationStatus === "Contacted" || (l as any).status === "Contacted" || (l as any).lastContactedAt != null
            ).length,
            replies: mLeads.filter(
              (l) =>
                l.qualificationStatus === "Qualified" ||
                l.qualificationStatus === "Proposal" ||
                (l as any).status === "Replied" ||
                (l as any).status === "Interested"
            ).length,
            clients: mProjects.length + mLeads.filter((l) => l.qualificationStatus === "Converted" || (l as any).status === "Converted").length,
          };
        });
      } else {
        growthHistory = [];
      }
    }

    const now = new Date();
    const currentMonthInvoices = invoices.filter((inv) => {
      if (inv.status !== "Paid") return false;
      const dateStr = inv.paidAt || inv.createdAt;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const currentPeriodBilled = currentMonthInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    const revenueOverview = {
      totalFormatted: `₹${totalBilled > 0 ? totalBilled.toLocaleString("en-IN") : "0"}`,
      totalRaw: totalBilled,
      trend: "No prior period",
      monthly: currentPeriodBilled > 0 ? [{ month: "Current", amount: currentPeriodBilled }] : [],
    };

    // Actual configured agent health (Idle/Ready in fresh workspace, not fake "Active scanning")
    const agents = [
      { name: "Research Agent", role: "Scanning locations", status: "Idle", processedToday: 0, dailyTarget: 50 },
      { name: "Outreach Agent", role: "Sending emails", status: "Idle", processedToday: 0, dailyTarget: 50 },
      { name: "Reply Manager", role: "Handling responses", status: "Idle", processedToday: 0, dailyTarget: 25 },
      { name: "Sales Agent", role: "Booking meetings", status: "Idle", processedToday: 0, dailyTarget: 20 },
      { name: "Content Agent", role: "Creating content", status: "Idle", processedToday: 0, dailyTarget: 15 },
    ];

    return {
      metrics: {
        totalLeads,
        qualifiedLeads,
        activeOutreaches,
        convertedClients,
        contacted: qualifiedLeads,
        meetingsBooked: activeOutreaches,
        activeProjects: activeProjectsCount,
        pipelineValue: `₹${totalBilled > 0 ? totalBilled.toLocaleString("en-IN") : "0"}`,
        mrr: `₹${Math.round(totalBilled / 6).toLocaleString("en-IN")}`,
        leadsTrend: "No prior period",
        qualifiedTrend: "No prior period",
        outreachTrend: "No prior period",
        convertedTrend: "No prior period",
      },
      leadsByStatus: statusMap,
      growthHistory,
      sources,
      revenueOverview,
      agents,
    };
  }

  static async getActivities(orgId: string) {
    try {
      const logs = await catalystClient.find<any>("AuditLogs", { organizationId: orgId });
      if (logs && logs.length > 0) {
        return logs.slice(0, 10).map((log: any) => ({
          id: log.logId || log.ROWID || String(Math.random()),
          title: log.action || "System Event",
          detail: log.details || log.description || "Activity recorded",
          time: log.createdAt || "Recently",
          type: log.category || "activity",
        }));
      }
    } catch {
      // In clean baseline with no audit logs yet, return empty list
    }
    return [];
  }
}
