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

    const emailCampaigns = campaigns.filter((c) => !c.channel || c.channel === "Email");
    const whatsappCampaigns = campaigns.filter((c) => c.channel === "WhatsApp");
    const sumStats = (list: typeof campaigns) => ({
      sent: list.reduce((sum, c) => sum + (c.sentCount || 0), 0),
      opened: list.reduce((sum, c) => sum + (c.openedCount || 0), 0),
      replied: list.reduce((sum, c) => sum + (c.repliedCount || 0), 0),
    });
    const emailStats = sumStats(emailCampaigns);
    const whatsappStats = sumStats(whatsappCampaigns);

    return {
      kpis: {
        totalLeads,
        conversionRate: `${conversionRate}%`,
        activeClients: clients.length,
        activeCampaigns: campaigns.length,
        mrr: `₹${Math.round(clients.reduce((acc, c) => acc + (c.totalValue || 0), 0) / 12).toLocaleString("en-IN")}`,
        arr: `₹${clients.reduce((acc, c) => acc + (c.totalValue || 0), 0).toLocaleString("en-IN")}`,
      },
      funnel: [
        { stage: "Discovered", count: totalLeads, percentage: totalLeads > 0 ? 100 : 0 },
        { stage: "Audited", count: qualifiedLeads, percentage: totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0 },
        { stage: "Contacted", count: contactedLeads, percentage: totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0 },
        { stage: "Meeting Booked", count: proposalLeads, percentage: totalLeads > 0 ? Math.round((proposalLeads / totalLeads) * 100) : 0 },
        { stage: "Closed Won", count: convertedLeads, percentage: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0 },
      ],
      channelPerformance: [
        { channel: "Email Outreach", sent: emailStats.sent, opened: emailStats.opened, replied: emailStats.replied, converted: 0, roi: "0%" },
        { channel: "WhatsApp Direct", sent: whatsappStats.sent, opened: whatsappStats.opened, replied: whatsappStats.replied, converted: 0, roi: "0%" },
        { channel: "Google Maps Discovery", sent: totalLeads, opened: qualifiedLeads, replied: contactedLeads, converted: convertedLeads, roi: "0%" },
      ],
      timeRange,
    };
  }
}
