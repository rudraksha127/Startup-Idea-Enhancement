"use client";

import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Compass } from "lucide-react";
import { WHITE_TOOLTIP_STYLE } from "@/lib/chart-theme";

interface GrowthData {
  month: string;
  leadsFound: number;
  contacted: number;
  replies: number;
  clients: number;
}

interface LeadsGrowthChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export function LeadsGrowthChart({ data }: LeadsGrowthChartProps) {
  const chartData: GrowthData[] = Array.isArray(data) ? data : [];
  const hasData =
    chartData.length > 0 &&
    chartData.some(
      (d) =>
        (d.leadsFound && d.leadsFound > 0) ||
        (d.contacted && d.contacted > 0) ||
        (d.replies && d.replies > 0) ||
        (d.clients && d.clients > 0)
    );

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-xs flex flex-col justify-between min-h-[340px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#171918] dark:text-white">
            Leads &amp; Clients Growth
            <span className="sr-only">Leads Growth</span>
          </h3>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#68717D] dark:text-[#9AA29E]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3568E8]" /> Leads Found
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8]" /> Leads Contacted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Positive Replies
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Clients
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
          <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2.5">
            <TrendingUp size={18} />
          </div>
          <p className="text-xs font-semibold text-[#171918] dark:text-white">
            No historical growth data yet
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 max-w-xs mt-1 mb-3.5">
            Growth curves for discovered leads, outreaches, positive replies, and active clients will reflect here as campaigns execute.
          </p>
          <Link
            href="/map-explorer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111614] dark:bg-white text-white dark:text-[#111614] text-xs font-semibold hover:opacity-90 transition-opacity shadow-2xs"
          >
            <Compass size={13} />
            <span>Discover Leads in Map Explorer →</span>
          </Link>
        </div>
      ) : (
        <div className="h-64 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EFEA" />
              <XAxis dataKey="month" stroke="#A0A6A3" fontSize={11} tickLine={false} />
              <YAxis stroke="#A0A6A3" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={WHITE_TOOLTIP_STYLE.contentStyle}
                itemStyle={WHITE_TOOLTIP_STYLE.itemStyle}
                labelStyle={WHITE_TOOLTIP_STYLE.labelStyle}
                formatter={(val: number, name: string) => {
                  const labelMap: Record<string, string> = {
                    leadsFound: "Leads Found",
                    contacted: "Contacted",
                    replies: "Replies",
                    clients: "Clients",
                  };
                  return [val.toLocaleString(), labelMap[name] || name];
                }}
              />
              <Line type="monotone" dataKey="leadsFound" stroke="#3568E8" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="contacted" stroke="#38BDF8" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="replies" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="clients" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
