import { Users, PhoneCall, MessageCircle, Briefcase, TrendingUp } from "lucide-react";

interface MetricCardsProps {
  metrics?: {
    totalLeads?: number;
    qualifiedLeads?: number;
    activeOutreaches?: number;
    convertedClients?: number;
    leadsTrend?: string;
    qualifiedTrend?: string;
    outreachTrend?: string;
    convertedTrend?: string;
  };
}

export function MetricCards({ metrics }: MetricCardsProps) {
  const cards = [
    {
      title: metrics?.totalLeads !== undefined ? "Total Leads" : "Businesses Found",
      value: metrics?.totalLeads !== undefined ? metrics.totalLeads.toLocaleString() : "2,847",
      trend: metrics?.leadsTrend?.replace("+", "") || "12%",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50/80 border border-blue-100",
      sparkColor: "#3568E8",
    },
    {
      title: metrics?.qualifiedLeads !== undefined ? "Qualified Leads" : "Leads Contacted",
      value: metrics?.qualifiedLeads !== undefined ? metrics.qualifiedLeads.toLocaleString() : "892",
      trend: metrics?.qualifiedTrend?.replace("+", "") || "16%",
      icon: PhoneCall,
      color: "text-sky-600",
      bg: "bg-sky-50/80 border border-sky-100",
      sparkColor: "#38BDF8",
    },
    {
      title: metrics?.activeOutreaches !== undefined ? "Active Outreaches" : "Positive Responses",
      value: metrics?.activeOutreaches !== undefined ? metrics.activeOutreaches.toLocaleString() : "142",
      trend: metrics?.outreachTrend?.replace("+", "") || "34%",
      icon: MessageCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50/80 border border-emerald-100",
      sparkColor: "#10B981",
    },
    {
      title: metrics?.convertedClients !== undefined ? "Converted Clients" : "Active Clients",
      value: metrics?.convertedClients !== undefined ? metrics.convertedClients.toLocaleString() : "38",
      trend: metrics?.convertedTrend?.replace("+", "") || "18%",
      icon: Briefcase,
      color: "text-indigo-600",
      bg: "bg-indigo-50/80 border border-indigo-100",
      sparkColor: "#6366F1",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <span className={`w-11 h-11 rounded-xl ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
                <Icon size={18} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold tracking-tight text-[#171918]">
                    {card.value}
                  </span>
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                    <TrendingUp size={10} className="mr-0.5" />
                    ↑ {card.trend}
                  </span>
                </div>
                <div className="text-xs text-[#68717D] font-medium mt-0.5">
                  <span>{card.title}</span>
                </div>
              </div>
            </div>

            {/* Subtle sparkline */}
            <div className="w-14 h-6 opacity-70 hidden sm:block">
              <svg viewBox="0 0 60 25" className="w-full h-full overflow-visible">
                <path
                  d="M 0 18 Q 15 22 25 12 T 45 10 T 60 4"
                  fill="none"
                  stroke={card.sparkColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
