"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { MetricCards } from "@/features/dashboard/components/metric-cards";
import { AIAgentsCard } from "@/features/dashboard/components/ai-agents-card";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { WebsiteBuilderCard } from "@/features/dashboard/components/website-builder-card";
import { RecentLeadsCard } from "@/features/dashboard/components/recent-leads-card";
import { ClientsPipelineCard } from "@/features/dashboard/components/clients-pipeline-card";

// Dynamic code-splitting for heavy recharts visualization components
const LeadsGrowthChart = dynamic(
  () => import("@/features/dashboard/components/leads-growth-chart").then((m) => m.LeadsGrowthChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[340px] w-full rounded-2xl bg-[#F8FAFC] dark:bg-[#121816] animate-pulse border border-[#E2E8F0] dark:border-[#22302B] flex items-center justify-center text-xs text-slate-400">
        Loading chart...
      </div>
    ),
  }
);

const LeadSourcesChart = dynamic(
  () => import("@/features/dashboard/components/lead-sources-chart").then((m) => m.LeadSourcesChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[340px] w-full rounded-2xl bg-[#F8FAFC] dark:bg-[#121816] animate-pulse border border-[#E2E8F0] dark:border-[#22302B] flex items-center justify-center text-xs text-slate-400">
        Loading sources...
      </div>
    ),
  }
);

const RevenueOverview = dynamic(
  () => import("@/features/dashboard/components/revenue-overview").then((m) => m.RevenueOverview),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] w-full rounded-2xl bg-[#F8FAFC] dark:bg-[#121816] animate-pulse border border-[#E2E8F0] dark:border-[#22302B] flex items-center justify-center text-xs text-slate-400">
        Loading revenue...
      </div>
    ),
  }
);

function DashboardContent() {
  const searchParams = useSearchParams();
  const range = searchParams?.get("range") || "this_month";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activityData, setActivityData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`/api/dashboard/metrics?timeframe=${encodeURIComponent(range)}`).then((r) => r.json()),
      fetch("/api/dashboard/activity").then((r) => r.json()),
    ])
      .then(([metricsRes, activityRes]) => {
        setData(metricsRes);
        setActivityData(activityRes?.activities || []);
      })
      .catch((err) => console.error("Failed to load dashboard data:", err))
      .finally(() => setIsLoading(false));
  }, [range]);

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

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
