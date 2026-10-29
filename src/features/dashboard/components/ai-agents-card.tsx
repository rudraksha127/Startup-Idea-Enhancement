"use client";

import Link from "next/link";
import { Search, Mail, MessageSquare, Briefcase, FileText, ArrowRight } from "lucide-react";

interface AgentItem {
  _id?: string;
  name: string;
  role: string;
  status: "Active" | "Idle" | "Paused";
  dailyTarget?: number;
  processedToday?: number;
}

interface AIAgentsCardProps {
  agents?: AgentItem[];
}

const DEFAULT_AGENTS = [
  { name: "Research Agent", role: "Scanning locations", status: "Active" as const, icon: Search, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { name: "Outreach Agent", role: "Sending emails", status: "Active" as const, icon: Mail, color: "text-blue-700 bg-blue-50 border-blue-200" },
  { name: "Reply Manager", role: "Handling responses", status: "Active" as const, icon: MessageSquare, color: "text-purple-700 bg-purple-50 border-purple-200" },
  { name: "Sales Agent", role: "Booking meetings", status: "Active" as const, icon: Briefcase, color: "text-amber-700 bg-amber-50 border-amber-200" },
  { name: "Content Agent", role: "Creating content", status: "Active" as const, icon: FileText, color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
];

export function AIAgentsCard({ agents }: AIAgentsCardProps) {
  return (
    <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-xs">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-sm font-bold text-[#171918]">Active AI Agents</h3>
        <Link
          href="/ai-agents"
          className="text-xs font-semibold text-gray-500 hover:text-[#171918] inline-flex items-center gap-1"
        >
          Manage Agents <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {DEFAULT_AGENTS.map((agent) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.name}
              className="p-3 rounded-lg bg-[#FAF9F6] border border-gray-100 flex flex-col justify-between space-y-2 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 ${agent.color}`}>
                  <Icon size={13} />
                </span>
                <span className="font-bold text-[11px] text-[#171918] truncate">{agent.name}</span>
              </div>
              <p className="text-[10px] text-gray-500 truncate">{agent.role}</p>
              <div>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
