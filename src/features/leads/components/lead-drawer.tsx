"use client";

import Link from "next/link";
import { X, ExternalLink, MapPin, Phone, Mail, Globe, Sparkles, ArrowRight } from "lucide-react";
import { LeadStatusBadge } from "./lead-status-badge";

interface LeadDrawerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lead: any | null;
  onClose: () => void;
  onStatusChange: (leadId: string, status: string) => void;
}

export function LeadDrawer({ lead, onClose, onStatusChange }: LeadDrawerProps) {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#faf9f6] border-l border-[#161f1b]/15 shadow-2xl flex flex-col justify-between text-[#101413]">
          {/* Header */}
          <div className="p-5 border-b border-[#161f1b]/10 bg-white flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-[#0da66c]">{lead.category}</span>
                <span className="text-gray-300">•</span>
                <LeadStatusBadge status={lead.status} />
              </div>
              <h2 className="font-serif text-xl font-bold">{lead.businessName}</h2>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                <span className="text-amber-500 font-bold">★ {lead.rating}</span>
                <span>({lead.reviewCount || 120} reviews)</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* Quick Status Selector */}
            <div className="p-3 bg-white rounded-xl border border-gray-200">
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Update Lead Status
              </label>
              <select
                value={lead.status}
                onChange={(e) => onStatusChange(lead._id || lead.slug, e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-gray-300 bg-white"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Replied">Replied</option>
                <option value="Converted">Converted</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Scores summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-gray-200 text-center">
                <div className="text-[11px] font-semibold text-gray-500">Website Health</div>
                <div className="text-2xl font-bold font-serif text-[#101413] mt-1">
                  {lead.websiteScore || 62}/100
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200 text-center">
                <div className="text-[11px] font-semibold text-gray-500">Opportunity Score</div>
                <div className="text-2xl font-bold font-serif text-[#0da66c] mt-1">
                  {lead.opportunityScore || 92}/100
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2.5">
              <h4 className="font-bold text-[#101413] mb-2">Business Details</h4>
              {lead.address && (
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin size={14} className="shrink-0 mt-0.5 text-gray-400" />
                  <span>{lead.address}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} className="shrink-0 text-gray-400" />
                  <span>{lead.phone}</span>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={14} className="shrink-0 text-gray-400" />
                  <span>{lead.email}</span>
                </div>
              )}
              {lead.website && (
                <div className="flex items-center gap-2 text-[#0da66c]">
                  <Globe size={14} className="shrink-0 text-gray-400" />
                  <a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 truncate">
                    {lead.website} <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>

            {/* Pain Points */}
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-1.5 font-bold text-[#101413] mb-2">
                <Sparkles size={14} className="text-[#0da66c]" /> Growth Opportunities
              </div>
              <ul className="space-y-1.5 text-gray-600 pl-4 list-disc">
                {(lead.painPoints || [
                  "Mobile page load time exceeds 4.5 seconds",
                  "Missing direct online table booking engine",
                  "Static PDF menu format hurting local SEO",
                ]).map((pt: string, idx: number) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Drawer footer */}
          <div className="p-4 bg-white border-t border-[#161f1b]/10">
            <Link
              href={`/leads/${lead.slug || lead._id}`}
              className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-[#101513] hover:bg-[#1a2c27] text-white text-xs font-bold shadow transition-all"
            >
              <span>Open Lead Intelligence</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

