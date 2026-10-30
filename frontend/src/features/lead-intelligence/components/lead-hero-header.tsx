"use client";

import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  Send,
  Calendar,
  FileCode,
  Sparkles,
  Download,
} from "lucide-react";

interface LeadHeroHeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lead: any;
  onStatusChange: (status: string) => void;
  onTabSelect: (tab: string) => void;
  onOpenProjectBrief: () => void;
  onRunResearch: () => void;
  onExportAudit: () => void;
}

export function LeadHeroHeader({
  lead,
  onStatusChange,
  onTabSelect,
  onOpenProjectBrief,
  onRunResearch,
  onExportAudit,
}: LeadHeroHeaderProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 sm:p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Lead Identity */}
        <div className="lg:col-span-8 flex flex-col sm:flex-row items-start gap-5">
          <div className="relative w-32 h-28 rounded-xl overflow-hidden shrink-0 border border-gray-200 bg-gray-100 shadow-2xs">
            <Image
              src={lead.imageUrl || "/assets/urban-kitchen.jpg"}
              alt={lead.businessName}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">
                HOT LEAD
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs font-semibold text-gray-500">{lead.category}</span>
              <span className="text-gray-300">•</span>
              <div className="flex items-center text-amber-500 text-xs font-bold">
                ★ {lead.rating} <span className="text-gray-400 font-normal ml-1">({lead.reviewCount || 128} reviews)</span>
              </div>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#101413] tracking-tight mb-2">
              {lead.businessName}
            </h1>

            {/* Contacts bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mb-3">
              {lead.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-gray-400" />
                  {lead.address}
                </span>
              )}
              {lead.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={13} className="text-gray-400" />
                  {lead.phone}
                </span>
              )}
              {lead.email && (
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-gray-400" />
                  {lead.email}
                </span>
              )}
              {lead.website && (
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#0da66c] font-semibold hover:underline"
                >
                  <Globe size={13} />
                  Website <ExternalLink size={10} />
                </a>
              )}
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => onTabSelect("Communications")}
                className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-[#101513] hover:bg-[#1a2c27] text-white text-xs font-bold shadow transition-all"
              >
                <Send size={12} /> Send Outreach
              </button>
              <button
                onClick={onOpenProjectBrief}
                className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-800 shadow-2xs transition-all"
              >
                <FileCode size={12} /> Create Project Brief
              </button>
              <button
                onClick={onRunResearch}
                className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-800 shadow-2xs transition-all"
              >
                <Sparkles size={12} className="text-[#0da66c]" /> Run AI Audit
              </button>
              <button
                onClick={onExportAudit}
                className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs text-gray-600"
                title="Export Website Audit Report"
              >
                <Download size={12} /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Right: Status Selector & Opportunity Banner */}
        <div className="lg:col-span-4 bg-[#faf9f6] p-4 rounded-xl border border-gray-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-500">Pipeline Status</span>
            <select
              value={lead.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-gray-300 bg-white font-bold text-xs text-[#101413] focus:outline-none"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Replied">Replied</option>
              <option value="Converted">Converted</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="pt-2 border-t border-gray-200/80">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs font-bold text-gray-700">Opportunity Score</span>
              <span className="font-serif text-2xl font-bold text-[#0da66c]">
                {lead.opportunityScore || 92}/100
              </span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Prime candidate for direct website modernization and booking automation to recoup commissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

