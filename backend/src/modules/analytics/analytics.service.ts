import { LeadsRepository } from "../../repositories/leads.repository.js";
import { CampaignsRepository } from "../../repositories/campaigns.repository.js";
import { ClientsRepository } from "../../repositories/clients.repository.js";

export class AnalyticsService {
  static async getOverview(orgId: string, timeRange = "30d") {
    const [leadsRes, clients, campaigns] = await Promise.all([
      LeadsRepository.findByOrg(orgId, { limit: 1000 }),
      ClientsRepository.findByOrg(orgId),
      CampaignsRepository.findByOrg(orgId),
    ]);

    const leads = leadsRes.leads;
    const totalLeads = leads.length;
    const convertedLeads = leads.filter((l) => l.qualificationStatus === "Converted").length;
    const contactedLeads = leads.filter((l) => l.qualificationStatus === "Contacted" || l.qualificationStatus === "Qualified").length;
    const qualifiedLeads = leads.filter((l) => l.qualificationStatus === "Qualified").length;
    const proposalLeads = leads.filter((l) => l.qualificationStatus === "Proposal").length;

    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0.0";

    return {
      kpis: {
        totalLeads,
        conversionRate: `${conversionRate}%`,
        activeClients: clients.length,
        activeCampaigns: campaigns.length,
        mrr: `₹${(clients.reduce((acc, c) => acc + (c.totalValue || 0), 0) / 12).toLocaleString("en-IN")}`,
        arr: `₹${clients.reduce((acc, c) => acc + (c.totalValue || 0), 0).toLocaleString("en-IN")}`,
      },
      funnel: [
        { stage: "Discovered", count: totalLeads, percentage: 100 },
        { stage: "Audited", count: qualifiedLeads, percentage: totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0 },
        { stage: "Contacted", count: contactedLeads, percentage: totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0 },
        { stage: "Meeting Booked", count: proposalLeads, percentage: totalLeads > 0 ? Math.round((proposalLeads / totalLeads) * 100) : 0 },
        { stage: "Closed Won", count: convertedLeads, percentage: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0 },
      ],
      channelPerformance: [
        { channel: "Email Outreach", sent: 1240, opened: 580, replied: 84, converted: 18, roi: "340%" },
        { channel: "WhatsApp Direct", sent: 820, opened: 760, replied: 142, converted: 26, roi: "490%" },
        { channel: "Google Maps Discovery", sent: 480, opened: 310, replied: 62, converted: 12, roi: "280%" },
      ],
      timeRange,
    };
  }
}
