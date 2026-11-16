import Link from "next/link";
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
      title: "Total Leads",
      value: (metrics?.totalLeads ?? 0).toLocaleString(),
      trend: metrics?.leadsTrend || "No prior period",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50",
      sparkColor: "#3568E8",
      href: "/leads",
    },
    {
      title: "Leads Contacted",
      value: (metrics?.qualifiedLeads ?? 0).toLocaleString(),
      trend: metrics?.qualifiedTrend || "No prior period",
      icon: PhoneCall,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-50/80 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50",
      sparkColor: "#38BDF8",
      href: "/outreach",
    },
    {
      title: "Positive Responses",
      value: (metrics?.activeOutreaches ?? 0).toLocaleString(),
      trend: metrics?.outreachTrend || "No prior period",
      icon: MessageCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50",
      sparkColor: "#10B981",
      href: "/outreach",
    },
    {
      title: "Active Clients",
      value: (metrics?.convertedClients ?? 0).toLocaleString(),
      trend: metrics?.convertedTrend || "No prior period",
      icon: Briefcase,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50",
      sparkColor: "#6366F1",
      href: "/clients",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isCleanBaseline = card.trend.includes("No prior") || card.value === "0";

        return (
          <Link
            key={card.title}
            href={card.href}
            className="p-5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-2xs hover:shadow-md hover:border-gray-300 dark:hover:border-[#35433E] hover:-translate-y-0.5 transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <span className={`w-11 h-11 rounded-xl ${card.bg} ${card.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon size={18} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold tracking-tight text-[#171918] dark:text-white">
                    {card.value}
                  </span>
                  {isCleanBaseline ? (
                    <span className="inline-flex items-center text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-800">
                      No prior data
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <TrendingUp size={10} className="mr-0.5" />
                      {card.trend}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#68717D] dark:text-[#9AA29E] font-medium mt-0.5 group-hover:text-[#171918] dark:group-hover:text-white transition-colors">
                  <span>{card.title}</span>
                </div>
              </div>
            </div>

            {/* Subtle sparkline */}
            <div className="w-14 h-6 opacity-70 hidden sm:block">
              <svg viewBox="0 0 60 25" className="w-full h-full overflow-visible">
                <path
                  d={isCleanBaseline ? "M 0 18 L 60 18" : "M 0 18 Q 15 22 25 12 T 45 10 T 60 4"}
                  fill="none"
                  stroke={isCleanBaseline ? "#94A3B8" : card.sparkColor}
                  strokeWidth="1.5"
                  strokeDasharray={isCleanBaseline ? "3 3" : undefined}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
