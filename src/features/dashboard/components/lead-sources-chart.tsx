"use client";

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

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-xs flex flex-col justify-between overflow-hidden">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-[#171918]">Lead Sources</h3>
      </div>

      <div className="flex flex-row items-center justify-between gap-3 sm:gap-4 my-auto py-1">
        {/* Donut chart with centered Total badge */}
        <div className="w-32 h-32 sm:w-36 sm:h-36 relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={42}
                outerRadius={58}
                paddingAngle={2}
                dataKey="percentage"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as SourceItem;
                    return (
                      <div className="bg-[#171918] text-white px-3 py-2 rounded-lg text-xs shadow-xl border border-[#2B3533] pointer-events-none z-50">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: data.color }}
                          />
                          <span className="font-semibold text-white">{data.name}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 mt-1 text-[11px] text-gray-300">
                          <span>
                            Leads: <strong className="text-white">{data.count.toLocaleString()}</strong>
                          </span>
                          <span className="font-bold text-emerald-400">{data.percentage}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] text-[#68717D] uppercase tracking-wider font-bold">Total</span>
            <span className="text-base font-bold text-[#171918] leading-tight">2,847</span>
          </div>
        </div>

        {/* Legend with flexible layout & truncation */}
        <div className="flex-1 min-w-0 space-y-1.5 text-xs">
          {chartData.map((s) => (
            <div key={s.name} className="flex items-center justify-between text-[11px] gap-1.5">
              <span className="flex items-center gap-1.5 truncate text-[#353b38] min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="truncate">{s.name}</span>
              </span>
              <span className="font-semibold text-[#171918] shrink-0 ml-1">{s.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
