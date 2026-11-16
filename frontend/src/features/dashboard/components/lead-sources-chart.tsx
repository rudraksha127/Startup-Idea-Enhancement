"use client";

import { useState } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Compass } from "lucide-react";

interface SourceItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface LeadSourcesChartProps {
  sources?: SourceItem[];
}

export function LeadSourcesChart({ sources }: LeadSourcesChartProps) {
  const chartData: SourceItem[] = sources && Array.isArray(sources) ? sources : [];
  const [activeItem, setActiveItem] = useState<SourceItem | null>(null);

  const totalLeads = chartData.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const hasData = chartData.length > 0 && totalLeads > 0;

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-xs flex flex-col justify-between min-h-[340px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-[#171918] dark:text-white">Lead Sources</h3>
        <span className="text-[11px] font-semibold text-[#68717D] dark:text-[#9AA29E]">
          {totalLeads.toLocaleString()} Total
        </span>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center my-auto">
          <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400 mb-3">
            <Compass size={22} className="text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-xs font-semibold text-[#171918] dark:text-white">
            No attributed lead sources yet
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 max-w-xs mt-1 mb-3">
            Attribution percentages will populate once leads are discovered via Google Maps, n8n, or manual entry.
          </p>
          <Link
            href="/leads"
            className="text-xs font-semibold text-[#10251f] dark:text-emerald-400 hover:underline"
          >
            Import or Add Leads →
          </Link>
        </div>
      ) : (
        <div className="flex flex-row items-center justify-between gap-4 my-auto py-1">
          {/* Donut chart */}
          <div className="w-36 h-36 relative shrink-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={58}
                  paddingAngle={3}
                  dataKey="percentage"
                  nameKey="name"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  onMouseEnter={(_, index) => setActiveItem(chartData[index])}
                  onMouseLeave={() => setActiveItem(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="cursor-pointer transition-opacity duration-150"
                      opacity={activeItem && activeItem.name !== entry.name ? 0.6 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  offset={14}
                  wrapperStyle={{ zIndex: 9999, pointerEvents: "none" }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as SourceItem;
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-lg min-w-[140px] pointer-events-none">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: data.color }}
                            />
                            <p className="text-xs font-bold text-gray-900 truncate">{data.name}</p>
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-gray-600">
                            <span>Count:</span>
                            <span className="font-semibold text-gray-900">{data.count.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-gray-600">
                            <span>Share:</span>
                            <span className="font-semibold text-emerald-600">{data.percentage}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Dynamic Center Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A0A6A3]">
                {activeItem ? activeItem.name.split(" ")[0] : "TOTAL"}
              </span>
              <span className="text-xs font-bold text-[#171918] dark:text-white leading-tight">
                {activeItem ? `${activeItem.percentage}%` : totalLeads.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {chartData.map((item) => (
              <div
                key={item.name}
                onMouseEnter={() => setActiveItem(item)}
                onMouseLeave={() => setActiveItem(null)}
                className={`flex items-center justify-between text-xs py-0.5 cursor-pointer rounded px-1 -mx-1 transition-colors ${
                  activeItem && activeItem.name === item.name ? "bg-gray-50 dark:bg-gray-800" : ""
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300 truncate">
                    {item.name}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-gray-900 dark:text-white ml-2">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
