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
    <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-[#171918]">Lead Sources</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 my-auto py-2">
        {/* Donut chart */}
        <div className="w-40 h-40 relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="percentage"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171918",
                  borderColor: "#232B29",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "11px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-[#68717D] uppercase tracking-wider font-semibold">Total</span>
            <span className="text-lg font-bold text-[#171918]">2,847</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5 w-full text-xs">
          {chartData.map((s) => (
            <div key={s.name} className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-2 truncate text-[#353b38]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="truncate">{s.name}</span>
              </span>
              <span className="font-semibold text-[#171918] ml-2">{s.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
