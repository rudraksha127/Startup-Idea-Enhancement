"use client";

import { useEffect, useState } from "react";
import { MetricCards } from "@/features/dashboard/components/metric-cards";
import { LeadsGrowthChart } from "@/features/dashboard/components/leads-growth-chart";
import { LeadSourcesChart } from "@/features/dashboard/components/lead-sources-chart";
import { AIAgentsCard } from "@/features/dashboard/components/ai-agents-card";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { RevenueOverview } from "@/features/dashboard/components/revenue-overview";
import { WebsiteBuilderCard } from "@/features/dashboard/components/website-builder-card";
import { RecentLeadsCard } from "@/features/dashboard/components/recent-leads-card";
import { ClientsPipelineCard } from "@/features/dashboard/components/clients-pipeline-card";

export default function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activityData, setActivityData] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/metrics").then((r) => r.json()),
      fetch("/api/dashboard/activity").then((r) => r.json()),
    ])
      .then(([metricsRes, activityRes]) => {
        setData(metricsRes);
        setActivityData(activityRes?.activities || []);
      })
      .catch((err) => console.error("Failed to load dashboard data:", err));
  }, []);

  return (
    <div className="space-y-5">
      {/* Page Title & Subtitle matching Reference */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] dark:text-white tracking-tight">
          Dashboard
          <span className="sr-only">Operations Dashboard</span>
        </h1>
        <p className="text-xs text-[#68717D] dark:text-[#9AA29E] mt-0.5">
          Here&apos;s what&apos;s happening with your autonomous agency.
        </p>
      </div>

      {/* 4 Top KPI Metric Cards */}
      <MetricCards metrics={data?.metrics} />

      {/* Main Grid: 8-col Left Area + 4-col Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (8 cols on large screens) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Row 1: Leads & Clients Growth Chart + Lead Sources Donut Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            <div className="xl:col-span-7">
              <LeadsGrowthChart data={data?.growthHistory} />
            </div>
            <div className="xl:col-span-5">
              <LeadSourcesChart sources={data?.sources} />
            </div>
          </div>

          {/* Row 2: Active AI Agents Horizontal Cards */}
          <AIAgentsCard agents={data?.agents} />

          {/* Row 3: Recent Leads Table + Clients Pipeline Kanban */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <RecentLeadsCard />
            <ClientsPipelineCard />
          </div>
        </div>

        {/* Right Column (4 cols on large screens) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Live Activities Widget */}
          <RecentActivity activities={activityData} />

          {/* Revenue Overview Widget */}
          <RevenueOverview
            totalFormatted={data?.revenueOverview?.totalFormatted}
            trend={data?.revenueOverview?.trend}
            data={data?.revenueOverview?.monthly}
          />

          {/* Website Builder Templates Widget */}
          <WebsiteBuilderCard />
        </div>
      </div>
    </div>
  );
}
