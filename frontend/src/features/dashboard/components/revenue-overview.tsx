"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, ChevronDown, CreditCard } from "lucide-react";
import { WHITE_TOOLTIP_STYLE } from "@/lib/chart-theme";

interface MonthlyRevenue {
  month: string;
  amount: number;
}

interface RevenueOverviewProps {
  totalFormatted?: string;
  trend?: string;
  data?: MonthlyRevenue[];
}

export function RevenueOverview({
  totalFormatted = "₹0",
  trend = "No prior period",
  data,
}: RevenueOverviewProps) {
  const [timeframe, setTimeframe] = useState("This Month");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const chartData = Array.isArray(data) ? data : [];
  const hasData = chartData.length > 0 && chartData.some((d) => d.amount > 0);
  const isCleanBaseline = !trend || trend.includes("No prior") || trend === "Unavailable";

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-xs relative flex flex-col justify-between min-h-[260px]">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#171918] dark:text-white">Revenue Overview</h3>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#E7E7E2] dark:border-[#2B3532] bg-white dark:bg-[#151D1A] text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1D2523] transition-colors"
              aria-expanded={isMenuOpen}
              aria-label="Select revenue timeframe"
            >
              <span>{timeframe}</span>
              <ChevronDown
                size={11}
                className={`text-gray-400 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#2B3532] shadow-xl py-1 text-xs z-30">
                {["This Month", "Last Month", "This Quarter", "Year to Date"].map((opt) => {
                  const isAvailable = opt === "This Month";
                  return (
                    <button
                      key={opt}
                      disabled={!isAvailable}
                      onClick={() => {
                        if (isAvailable) {
                          setTimeframe(opt);
                          setIsMenuOpen(false);
                        }
                      }}
                      className={`w-full px-3 py-1.5 text-left transition-colors flex items-center justify-between ${
                        timeframe === opt
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold"
                          : !isAvailable
                          ? "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1D2523]"
                      }`}
                    >
                      <span>{opt}</span>
                      {!isAvailable && <span className="text-[9px] opacity-70">N/A</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-2.5 mb-1">
          <span className="text-2xl font-bold tracking-tight text-[#171918] dark:text-white">
            {totalFormatted}
          </span>
          {isCleanBaseline ? (
            <span className="inline-flex items-center text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-800">
              No prior period
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-800">
              <TrendingUp size={10} className="mr-0.5" />
              {trend}
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#68717D] dark:text-[#9AA29E] mb-3">Total Recognized Revenue</p>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
            <CreditCard size={16} />
          </div>
          <p className="text-xs font-semibold text-[#171918] dark:text-white">
            No revenue recorded yet
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 max-w-xs mt-0.5 mb-2.5">
            Client retainer payments and settled invoices will reflect in monthly charts.
          </p>
          <Link
            href="/billing"
            className="text-[11px] font-semibold text-[#10251f] dark:text-emerald-400 hover:underline"
          >
            Create Invoices in Billing →
          </Link>
        </div>
      ) : (
        <div className="h-40 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#A0A6A3" fontSize={10} tickLine={false} />
              <YAxis stroke="#A0A6A3" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
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
      )}
    </div>
  );
}
