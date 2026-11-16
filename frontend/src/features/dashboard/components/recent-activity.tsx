"use client";

import Link from "next/link";
import { Search, Mail, Reply, FolderPlus, Bot, Calendar, ArrowRight } from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  detail: string;
  time: string;
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  { id: "1", type: "search", title: "New lead found", detail: "Glow Beauty Salon – New Delhi", time: "2m ago" },
  { id: "2", type: "mail", title: "Email sent", detail: "To: hello@fitzonegym.in", time: "5m ago" },
  { id: "3", type: "reply", title: "Client replied", detail: "The Urban Kitchen", time: "12m ago" },
  { id: "4", type: "project", title: "New project created", detail: "Hotel Grand Plaza – Website", time: "18m ago" },
  { id: "5", type: "ai", title: "AI agent completed research", detail: "City Care Clinic", time: "25m ago" },
  { id: "6", type: "meeting", title: "Meeting scheduled", detail: "Style Fashion Store", time: "32m ago" },
];

export function RecentActivity({ activities }: { activities?: ActivityItem[] }) {
  const items = activities && activities.length > 0 ? activities : DEFAULT_ACTIVITIES;

  const getIcon = (type: string) => {
    switch (type) {
      case "search":
        return <Search size={14} className="text-gray-700" />;
      case "mail":
        return <Mail size={14} className="text-blue-600" />;
      case "reply":
        return <Reply size={14} className="text-indigo-600" />;
      case "project":
        return <FolderPlus size={14} className="text-amber-600" />;
      case "ai":
        return <Bot size={14} className="text-emerald-600" />;
      case "meeting":
        return <Calendar size={14} className="text-rose-600" />;
      default:
        return <Search size={14} className="text-gray-600" />;
    }
  };

  const getItemHref = (type: string) => {
    switch (type) {
      case "search":
        return "/leads";
      case "mail":
      case "reply":
        return "/outreach";
      case "project":
        return "/projects";
      case "ai":
        return "/ai-agents";
      case "meeting":
        return "/clients";
      default:
        return "/dashboard";
    }
  };

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-bold text-[#171918] dark:text-white">Live Activities</h3>
          <span className="sr-only">Recent Activity</span>
        </div>
        <Link
          href="/outreach"
          className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-[#171918] dark:hover:text-white inline-flex items-center gap-1"
        >
          View All <ArrowRight size={12} />
        </Link>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={getItemHref(item.type)}
            className="flex items-start gap-3 text-xs p-1.5 -mx-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1D2523] transition-colors group cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-[#121816] border border-gray-100 dark:border-[#22302B] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
              {getIcon(item.type)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-1">
                <span className="font-semibold text-[#171918] dark:text-white truncate group-hover:text-emerald-600 transition-colors">{item.title}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">{item.time}</span>
              </div>
              <p className="text-[11px] text-[#68717D] dark:text-[#9AA29E] truncate mt-0.5">{item.detail}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
