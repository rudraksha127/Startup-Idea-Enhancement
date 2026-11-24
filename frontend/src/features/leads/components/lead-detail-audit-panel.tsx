"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";

interface LeadDetailAuditPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lead: any;
  onClose: () => void;
  onStatusChange: (status: string) => void;
}

export function LeadDetailAuditPanel({
  lead,
  onClose,
  onStatusChange,
}: LeadDetailAuditPanelProps) {
  const [activeTab, setActiveTab] = useState("Overview");

  if (!lead) return null;

  return (
    <div className="w-full xl:w-[620px] bg-white dark:bg-[#151D1A] rounded-2xl border border-[#E7E7E2] dark:border-[#22302B] p-5 shadow-lg text-[#171918] dark:text-white space-y-4 shrink-0 overflow-y-auto max-h-[calc(100vh-140px)]">
      {/* Top Header Card */}
      <div className="flex items-start gap-3.5 pb-3 border-b border-gray-100 dark:border-[#22302B] relative">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative shrink-0 border border-gray-200 dark:border-gray-700">
          <Image
            src={lead.imageUrl || "/assets/urban-kitchen.jpg"}
            alt={lead.businessName}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#171918] dark:text-white truncate">
              {lead.businessName}
            </h2>
            <select
              value={lead.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-[11px] font-bold px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 focus:outline-none"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Replied">Replied</option>
              <option value="Converted">Converted</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mt-0.5">
            <span>★★★★☆</span>
            <span className="text-gray-500 font-normal">
              {lead.rating} ({lead.reviewCount || "1,234"} reviews)
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#68717D] mt-1">
            <span>{lead.category} ⌄</span>
            <span>•</span>
            <span>{lead.location || "New Delhi"}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-1 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>

      {/* Action buttons row */}
      <div className="flex items-center gap-2 text-xs">
        <button className="flex-1 h-8 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white font-bold inline-flex items-center justify-center gap-1.5 shadow-xs">
          <Phone size={12} /> Contact Now
        </button>
        <button className="flex-1 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-semibold inline-flex items-center justify-center gap-1.5 text-gray-700">
          <Mail size={12} /> Send Email
        </button>
        <button className="flex-1 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-semibold inline-flex items-center justify-center gap-1.5 text-emerald-700">
          <MessageCircle size={12} /> WhatsApp
        </button>
        <button className="w-8 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500">
          <MoreHorizontal size={13} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-100 text-xs font-semibold overflow-x-auto scrollbar-none">
        {["Overview", "Website Audit", "AI Research", "Communications", "Notes"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-2.5 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab
                ? "border-[#3568E8] text-[#3568E8] font-bold"
                : "border-transparent text-[#68717D] hover:text-[#171918]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Body: Overview */}
      {activeTab === "Overview" && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Business Info & AI Analysis */}
            <div className="space-y-4">
              {/* Business Information Card */}
              <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-2">
                <h4 className="font-bold text-[#171918]">Business Information</h4>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Address</span>
                    <span className="font-medium text-right truncate max-w-[150px]">{lead.address || "Connaught Place, New Delhi"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium">{lead.phone || "+91 98765 43210"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-blue-600 truncate max-w-[150px]">{lead.email || "info@theurbankitchen.in"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Website</span>
                    <a href={lead.website || "#"} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline inline-flex items-center gap-0.5 truncate max-w-[150px]">
                      {lead.website || "theurbankitchen.in"} <ExternalLink size={10} />
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category</span>
                    <span className="font-medium">{lead.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Source</span>
                    <span className="font-medium">{lead.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="font-bold text-blue-600">{lead.status}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200/60">
                    <span className="text-gray-500">Assigned To</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-4 h-4 rounded-full bg-[#171918] text-white text-[9px] flex items-center justify-center">R</span>
                      Rudraksh
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Created At</span>
                    <span>12 Mar 2024, 10:24 AM</span>
                  </div>
                </div>
              </div>

              {/* AI Analysis Card */}
              <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#171918]">AI Analysis</h4>
                  <Link href={`/leads/${lead.slug || lead._id}`} className="text-[10px] font-bold text-blue-600 hover:underline">
                    View Full Analysis ↗
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full border-4 border-amber-500 flex flex-col items-center justify-center font-bold shrink-0">
                    <span className="text-sm text-[#171918]">{lead.websiteScore || 62}</span>
                    <span className="text-[8px] text-gray-400">/100</span>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex items-center gap-1 text-rose-600 font-medium">
                      <XCircle size={11} /> No clear call-to-action
                    </div>
                    <div className="flex items-center gap-1 text-rose-600 font-medium">
                      <XCircle size={11} /> Mobile experience needs improvement
                    </div>
                    <div className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 size={11} /> Good customer reviews (1,234)
                    </div>
                    <div className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 size={11} /> Potential for online reservations
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Website Preview, Quick Actions, Opportunity Score */}
            <div className="space-y-4">
              {/* Website Preview */}
              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>Website Preview</span>
                  <span className="text-gray-400 hover:text-black cursor-pointer font-normal">Edit</span>
                </div>
                <div className="aspect-video w-full rounded-lg overflow-hidden relative border border-gray-200 bg-gray-900">
                  <Image
                    src="/assets/urban-kitchen.jpg"
                    alt="Website Preview"
                    fill
                    className="object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center text-white">
                    <span className="font-serif text-sm font-bold">Authentic Flavors Memorable Experiences</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{lead.website || "theurbankitchen.in"}</span>
                  <a
                    href={lead.website || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-0.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-[10px] font-semibold text-gray-700"
                  >
                    View Full Website
                  </a>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-1.5 text-[11px]">
                <h4 className="font-bold text-[#171918]">Quick Actions</h4>
                <div className="space-y-1 text-gray-600">
                  <button className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white text-left font-medium">
                    <MapPin size={12} className="text-red-500" /> Open in Google Maps
                  </button>
                  <button className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white text-left font-medium">
                    <Star size={12} className="text-amber-500" /> View Reviews
                  </button>
                  <button className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white text-left font-medium">
                    <Mail size={12} className="text-blue-500" /> Generate Outreach Email
                  </button>
                </div>
              </div>

              {/* Opportunity Score */}
              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#171918]">Opportunity Score</h4>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    High Potential
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#171918]">{lead.opportunityScore ? (lead.opportunityScore / 10).toFixed(1) : "8.5"}</span>
                  <span className="text-gray-400 text-xs">/10</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full w-[85%]" />
                </div>
                <div className="space-y-1 text-[10px] text-gray-600 pt-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 size={11} /> Active business (recent reviews)
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 size={11} /> No proper website optimization
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 size={11} /> High search volume keywords
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 size={11} /> Good location and brand presence
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Recent Activity */}
          <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#171918]">Recent Activity</h4>
              <span className="text-[10px] text-gray-400 cursor-pointer hover:text-black">View All ⌄</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
              <div className="p-2 rounded bg-white border border-gray-100">
                <span className="font-semibold text-gray-800 block">Lead added from Google Maps</span>
                <span className="text-gray-400">12 Mar 2024, 10:24 AM</span>
              </div>
              <div className="p-2 rounded bg-white border border-gray-100">
                <span className="font-semibold text-gray-800 block">Website audit completed</span>
                <span className="text-gray-400">12 Mar 2024, 10:26 AM</span>
              </div>
              <div className="p-2 rounded bg-white border border-gray-100">
                <span className="font-semibold text-gray-800 block">AI research analysis generated</span>
                <span className="text-gray-400">12 Mar 2024, 10:27 AM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab !== "Overview" && (
        <div className="p-6 text-center text-xs text-gray-500 bg-[#FAF9F6] rounded-xl space-y-2">
          <p>Full {activeTab} dossier is available in the dedicated Lead Intelligence workspace.</p>
          <Link
            href={`/leads/${lead.slug || lead._id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171918] text-white font-bold"
          >
            Open Complete Intelligence Dossier ↗
          </Link>
        </div>
      )}
    </div>
  );
}

