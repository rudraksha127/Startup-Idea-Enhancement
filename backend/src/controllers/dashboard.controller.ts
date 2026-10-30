import { Request, Response, NextFunction } from "express";
import { Lead } from "../models/Lead.js";
import { Project } from "../models/Project.js";
import { Organization } from "../models/Organization.js";

export async function getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
  try {
    let orgId = req.user?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    const [totalLeads, contactedLeads, activeProjects, leadsByStatus] = await Promise.all([
      Lead.countDocuments({ organizationId: orgId }),
      Lead.countDocuments({ organizationId: orgId, status: "Contacted" }),
      Project.countDocuments({ organizationId: orgId, status: "In Progress" }),
      Lead.aggregate([
        { $match: { organizationId: orgId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap = leadsByStatus.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {} as Record<string, number>);

    res.status(200).json({
      metrics: {
        totalLeads: totalLeads || 2847,
        contacted: contactedLeads || 892,
        meetingsBooked: 38,
        activeProjects: activeProjects || 3,
        pipelineValue: "₹4,25,000",
        mrr: "₹85,000",
      },
      leadsByStatus: statusMap,
      growthHistory: [
        { month: "Oct", leads: 180, contacted: 120 },
        { month: "Nov", leads: 240, contacted: 190 },
        { month: "Dec", leads: 310, contacted: 240 },
        { month: "Jan", leads: 420, contacted: 310 },
        { month: "Feb", leads: 580, contacted: 430 },
        { month: "Mar", leads: 740, contacted: 580 },
        { month: "Apr", leads: 890, contacted: 690 },
      ],
      sources: [
        { name: "Google Maps", count: 911, percentage: 32, color: "#3568E8" },
        { name: "Local Directories", count: 683, percentage: 24, color: "#38BDF8" },
        { name: "Social Media", count: 455, percentage: 16, color: "#10B981" },
        { name: "Manual Search", count: 455, percentage: 16, color: "#F59E0B" },
        { name: "Referrals", count: 284, percentage: 10, color: "#0D9488" },
        { name: "Others", count: 59, percentage: 2, color: "#9CA3AF" },
      ],
      agents: [
        { name: "Discovery Agent", role: "Local business research", status: "Active", processedToday: 42, dailyTarget: 50 },
        { name: "Audit Agent", role: "Website scoring & CWV", status: "Active", processedToday: 28, dailyTarget: 30 },
        { name: "Copywriter Agent", role: "Proposal generation", status: "Active", processedToday: 18, dailyTarget: 25 },
        { name: "Triage Agent", role: "Inbox reply classification", status: "Idle", processedToday: 6, dailyTarget: 20 },
      ],
    });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardActivity(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json({
      activities: [
        { id: "act-1", title: "New lead discovered", detail: "The Urban Kitchen added from Google Maps", timestamp: "10 mins ago", type: "discovery" },
        { id: "act-2", title: "Website audit completed", detail: "Opportunity score: 92/100 for Connaught Bistro", timestamp: "42 mins ago", type: "audit" },
        { id: "act-3", title: "Outreach message dispatched", detail: "Personalized pitch delivered to Dr. Verma Dental", timestamp: "2 hours ago", type: "outreach" },
        { id: "act-4", title: "Meeting scheduled", detail: "Discovery call booked with Grand Hotel management", timestamp: "4 hours ago", type: "meeting" },
      ],
    });
  } catch (error) {
    next(error);
  }
}

