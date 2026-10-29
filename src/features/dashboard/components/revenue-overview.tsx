"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, ChevronDown } from "lucide-react";
import { WHITE_TOOLTIP_STYLE } from "@/lib/chart-theme";

interface MonthlyRevenue {
  month: string;
  amount: number;
}

const DEFAULT_MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: "Jan", amount: 45000 },
  { month: "Feb", amount: 75000 },
  { month: "Mar", amount: 110000 },
  { month: "Apr", amount: 145000 },
  { month: "May", amount: 185000 },
  { month: "Jun", amount: 245000 },
];

interface RevenueOverviewProps {
  totalFormatted?: string;
  trend?: string;
  data?: MonthlyRevenue[];
}

export function RevenueOverview({
  totalFormatted = "₹2,45,000",
  trend = "32%",
  data,
}: RevenueOverviewProps) {
  const [timeframe, setTimeframe] = useState("This Month");
  const chartData = data && data.length > 0 ? data : DEFAULT_MONTHLY_REVENUE;

  return (
    <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#171918]">Revenue Overview</h3>
        <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#E7E7E2] bg-white text-xs font-medium text-gray-700 hover:bg-gray-50">
          <span>{timeframe}</span>
          <ChevronDown size={11} className="text-gray-400" />
        </button>
      </div>

      <div className="flex items-baseline gap-2.5 mb-1">
        <span className="text-2xl font-bold tracking-tight text-[#171918]">
          {totalFormatted}
        </span>
        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
          <TrendingUp size={10} className="mr-0.5" />
          ↑ {trend}
        </span>
      </div>
      <p className="text-[11px] text-[#68717D] mb-3">Total Revenue</p>

      <div className="h-40 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <XAxis dataKey="month" stroke="#A0A6A3" fontSize={10} tickLine={false} />
            <YAxis stroke="#A0A6A3" fontSize={10} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip
              contentStyle={WHITE_TOOLTIP_STYLE.contentStyle}
              itemStyle={WHITE_TOOLTIP_STYLE.itemStyle}
              labelStyle={WHITE_TOOLTIP_STYLE.labelStyle}
              formatter={(val: number) => [`₹${val.toLocaleString()}`, "Revenue"]}
            />
            <Bar dataKey="amount" fill="#93C5FD" radius={[4, 4, 0, 0]} activeBar={{ fill: "#3568E8" }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
