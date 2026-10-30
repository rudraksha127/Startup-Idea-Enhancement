"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SourceItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface LeadSourcesChartProps {
  sources?: SourceItem[];
}

const DEFAULT_SOURCES: SourceItem[] = [
  { name: "Google Maps", count: 911, percentage: 32, color: "#3568E8" },
  { name: "Local Directories", count: 683, percentage: 24, color: "#38BDF8" },
  { name: "Social Media", count: 455, percentage: 16, color: "#10B981" },
  { name: "Manual Search", count: 455, percentage: 16, color: "#F59E0B" },
  { name: "Referrals", count: 284, percentage: 10, color: "#0D9488" },
  { name: "Others", count: 59, percentage: 2, color: "#9CA3AF" },
];

export function LeadSourcesChart({ sources }: LeadSourcesChartProps) {
  const chartData = sources && sources.length > 0 ? sources : DEFAULT_SOURCES;
  const [activeItem, setActiveItem] = useState<SourceItem | null>(null);

  const totalLeads = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-xs flex flex-col justify-between min-h-[220px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-[#171918] dark:text-white">Lead Sources</h3>
        <span className="text-[11px] font-semibold text-[#68717D] dark:text-[#9AA29E]">
          {totalLeads.toLocaleString()} Total
        </span>
      </div>

      <div className="flex flex-row items-center justify-between gap-4 my-auto py-1">
        {/* Donut chart with perfectly centered dynamic badge */}
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
                          <span className="font-bold text-xs text-gray-900 truncate">
                            {data.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-[11px] text-gray-600">
                          <span>
                            Leads: <strong className="text-gray-900 font-semibold">{data.count.toLocaleString()}</strong>
                          </span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] border border-emerald-200">
                            {data.percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered label inside donut hole: shows Total or hovered source */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center px-1">
            {activeItem ? (
              <>
                <span className="text-[9px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 truncate max-w-[70px]">
                  {activeItem.name}
                </span>
                <span className="text-sm font-extrabold text-[#171918] dark:text-white leading-tight mt-0.5">
                  {activeItem.percentage}%
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-400 font-medium leading-none">
                  {activeItem.count}
                </span>
              </>
            ) : (
              <>
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#68717D] dark:text-[#9AA29E]">
                  TOTAL
                </span>
                <span className="text-base font-extrabold text-[#171918] dark:text-white leading-tight mt-0.5">
                  {totalLeads.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend with clean spacing and hover synchronization */}
        <div className="flex-1 min-w-0 space-y-1.5 text-xs pl-1">
          {chartData.map((s) => {
            const isHovered = activeItem?.name === s.name;
            return (
              <div
                key={s.name}
                onMouseEnter={() => setActiveItem(s)}
                onMouseLeave={() => setActiveItem(null)}
                className={`flex items-center justify-between text-[11px] gap-2 py-0.5 px-1.5 rounded cursor-pointer transition-colors ${
                  isHovered
                    ? "bg-gray-100 dark:bg-[#1D2523] font-medium"
                    : "hover:bg-gray-50 dark:hover:bg-[#1D2523]/60"
                }`}
              >
                <span className="flex items-center gap-2 truncate text-[#353b38] dark:text-[#E2E8F0] min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="truncate">{s.name}</span>
                </span>
                <span className="font-bold text-[#171918] dark:text-white shrink-0 ml-1">
                  {s.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
