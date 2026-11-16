"use client";

import Link from "next/link";
import { Search, Mail, Reply, FolderPlus, Bot, Calendar, ArrowRight, Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  detail: string;
  time: string;
}

export function RecentActivity({ activities }: { activities?: ActivityItem[] }) {
  const items = Array.isArray(activities) ? activities : [];

  const getIcon = (type: string) => {
    switch (type) {
      case "search":
      case "discovery":
        return <Search size={14} className="text-gray-700 dark:text-gray-300" />;
      case "mail":
      case "outreach":
        return <Mail size={14} className="text-blue-600 dark:text-blue-400" />;
      case "reply":
        return <Reply size={14} className="text-indigo-600 dark:text-indigo-400" />;
      case "project":
        return <FolderPlus size={14} className="text-amber-600 dark:text-amber-400" />;
      case "ai":
      case "audit":
        return <Bot size={14} className="text-emerald-600 dark:text-emerald-400" />;
      case "meeting":
        return <Calendar size={14} className="text-rose-600 dark:text-rose-400" />;
      default:
        return <Activity size={14} className="text-gray-600 dark:text-gray-400" />;
    }
  };

  const getItemHref = (type: string) => {
    switch (type) {
      case "search":
      case "discovery":
        return "/leads";
      case "mail":
      case "reply":
      case "outreach":
        return "/outreach";
      case "project":
        return "/projects";
      case "ai":
      case "audit":
        return "/ai-agents";
      case "meeting":
        return "/clients";
      default:
        return "/dashboard";
    }
  };

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-xs flex flex-col justify-between min-h-[300px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${items.length > 0 ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`} />
            <h3 className="text-sm font-bold text-[#171918] dark:text-white">Live Activities</h3>
            <span className="sr-only">Recent Activity</span>
          </div>
          <Link
            href="/outreach"
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-[#171918] dark:hover:text-white inline-flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight size={12} />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-[#121816] border border-gray-200 dark:border-[#2B3532] flex items-center justify-center text-gray-400 mb-2.5">
              <Activity size={16} />
            </div>
            <p className="text-xs font-semibold text-[#171918] dark:text-white">
              No operational activities yet
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 max-w-xs mt-0.5 mb-3">
              Real-time events will populate as AI agents discover leads, send campaigns, and clients reply.
            </p>
            <Link
              href="/ai-agents"
              className="px-3 py-1 rounded-md bg-[#111614] dark:bg-white text-white dark:text-[#111614] text-[11px] font-semibold hover:opacity-90 transition-opacity shadow-2xs"
            >
              Launch Agents →
            </Link>
          </div>
        ) : (
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
                    <span className="font-semibold text-[#171918] dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#68717D] dark:text-[#9AA29E] truncate mt-0.5">
                    {item.detail}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
