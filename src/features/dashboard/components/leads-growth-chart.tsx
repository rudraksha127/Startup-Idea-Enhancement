"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface GrowthData {
  month: string;
  leadsFound: number;
  contacted: number;
  replies: number;
  clients: number;
}

const DEFAULT_GROWTH_DATA: GrowthData[] = [
  { month: "Jan", leadsFound: 450, contacted: 280, replies: 45, clients: 12 },
  { month: "Feb", leadsFound: 780, contacted: 490, replies: 82, clients: 22 },
  { month: "Mar", leadsFound: 1240, contacted: 892, replies: 142, clients: 38 },
  { month: "Apr", leadsFound: 1680, contacted: 1150, replies: 210, clients: 54 },
  { month: "May", leadsFound: 2250, contacted: 1540, replies: 285, clients: 72 },
  { month: "Jun", leadsFound: 2847, contacted: 1890, replies: 380, clients: 95 },
];

interface LeadsGrowthChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export function LeadsGrowthChart({ data }: LeadsGrowthChartProps) {
  const chartData = data && Array.isArray(data) && data[0]?.leadsFound ? data : DEFAULT_GROWTH_DATA;

  return (
    <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#171918]">
            Leads &amp; Clients Growth
            <span className="sr-only">Leads Growth</span>
          </h3>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#68717D]">
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

      <div className="h-64 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EFEA" />
            <XAxis dataKey="month" stroke="#A0A6A3" fontSize={11} tickLine={false} />
            <YAxis stroke="#A0A6A3" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#171918",
                borderColor: "#232B29",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "11px",
                padding: "8px 12px",
              }}
            />
            <Line type="monotone" dataKey="leadsFound" stroke="#3568E8" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="contacted" stroke="#38BDF8" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="replies" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="clients" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
