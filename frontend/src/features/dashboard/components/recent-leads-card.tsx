"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

interface RecentLeadItem {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  status: string;
}

export function RecentLeadsCard() {
  const [leads, setLeads] = useState<RecentLeadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/leads?limit=5");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.leads)) {
            const mapped = data.leads.map((l: any) => ({
              id: l._id || l.leadId || l.slug,
              name: l.businessName || l.name || "Business Lead",
              category: l.category || "General",
              location: l.city || l.location || "Local",
              rating: l.rating || 4.2,
              status: l.status || l.qualificationStatus || "New",
            }));
            setLeads(mapped);
          }
        }
      } catch {
        setLeads([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800";
      case "Contacted":
        return "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800";
      case "Replied":
      case "Interested":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800";
      case "Converted":
        return "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800";
      default:
        return "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800";
    }
  };

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#171918] dark:text-white">Recent Leads</h3>
        <Link
          href="/leads"
          className="text-xs font-semibold text-[#10251f] hover:text-[#0da66c] dark:text-emerald-400 inline-flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight size={12} />
        </Link>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-gray-400">Loading recent leads...</div>
      ) : leads.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 mb-2">
            <Compass size={18} />
          </div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">No leads in pipeline yet</p>
          <p className="text-[11px] text-gray-400 mt-0.5 mb-3">Launch your Prospect Discovery Agent to begin finding leads.</p>
          <Link
            href="/ai-agents"
            className="px-3 py-1 rounded-md bg-[#111614] hover:bg-black text-white text-[11px] font-semibold transition-colors shadow-2xs"
          >
            Launch AI Agents →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[#F2F2EE] dark:divide-[#1C2723]">
          {leads.map((lead) => (
            <div key={lead.id} className="py-2.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#171918] dark:text-white">{lead.name}</p>
                <p className="text-[11px] text-gray-400">{lead.category} • {lead.location}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getBadgeStyle(lead.status)}`}>
                {lead.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
