"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AddLeadModal } from "@/features/leads/components/add-lead-modal";
import { ImportCSVModal } from "@/features/leads/components/import-csv-modal";
import { LeadFiltersSidebar } from "@/features/leads/components/lead-filters-sidebar";
import { LeadDetailAuditPanel } from "@/features/leads/components/lead-detail-audit-panel";
import {
  Plus,
  Upload,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Columns,
  MoreHorizontal,
  Mail,
  Users,
  MessageCircle,
  Handshake,
  Check,
} from "lucide-react";

export default function LeadsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leads, setLeads] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(2847);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [showFilters, setShowFilters] = useState(true);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    business: true,
    category: true,
    location: true,
    rating: true,
    status: true,
    source: true,
    lastActivity: true,
  });

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Active Inspector Lead
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [inspectedLead, setInspectedLead] = useState<any | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        sortBy,
      });

      if (status !== "All") params.set("status", status);
      if (category !== "All") params.set("category", category);
      if (search) params.set("search", search);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setLeads(data.leads || []);
        setCounts(data.counts || {});
        if (data.pagination?.total) setTotal(data.pagination.total);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  }, [page, status, category, search, sortBy]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Bulk actions
  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l._id));
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchLeads();
        if (inspectedLead && (inspectedLead._id === leadId || inspectedLead.slug === leadId)) {
          setInspectedLead({ ...inspectedLead, status: newStatus });
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const STATUS_TABS = [
    { label: "All Leads", key: "All", count: counts.All ?? 2847 },
    { label: "Contacted", key: "Contacted", count: counts.Contacted ?? 892 },
    { label: "Replied", key: "Replied", count: counts.Replied ?? 142 },
    { label: "Interested", key: "Interested", count: counts.Interested ?? 68 },
    { label: "Converted", key: "Converted", count: counts.Converted ?? 38 },
    { label: "Archived", key: "Archived", count: counts.Archived ?? 96 },
  ];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
            Leads
            <span className="sr-only">Leads Management</span>
          </h1>
          <p className="text-xs text-[#68717D] mt-0.5">
            Manage and track all your discovered business opportunities.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href="/api/leads/export"
            download
            className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-[#171918] inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Download size={13} className="text-gray-500" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => setImportModalOpen(true)}
            className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-[#171918] inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Upload size={13} className="text-gray-500" />
            <span>Import</span>
          </button>

          <button
            onClick={() => setAddModalOpen(true)}
            className="h-8 px-3.5 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus size={14} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Users size={17} />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-[#171918]">
                {(counts.All ?? 2847).toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                ↑ 12%
              </span>
            </div>
            <div className="text-xs text-[#68717D]">Total Leads</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
            <Mail size={17} />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-[#171918]">
                {(counts.Contacted ?? 892).toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                ↑ 16%
              </span>
            </div>
            <div className="text-xs text-[#68717D]">Contacted</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <MessageCircle size={17} />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-[#171918]">
                {(counts.Replied ?? 142).toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                ↑ 34%
              </span>
            </div>
            <div className="text-xs text-[#68717D]">Replied</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Handshake size={17} />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-[#171918]">
                {(counts.Converted ?? 38).toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                ↑ 18%
              </span>
            </div>
            <div className="text-xs text-[#68717D]">Converted</div>
          </div>
        </div>
      </div>

      {/* Status Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-[#E7E7E2] text-xs font-semibold overflow-x-auto scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              className={`pb-2.5 px-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? "border-[#25835B] text-[#171918] font-bold"
                  : "border-transparent text-[#68717D] hover:text-[#171918]"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-gray-400 font-normal">({tab.count})</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by business name, category, location..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E7E7E2] bg-white focus:outline-none focus:ring-1 focus:ring-[#171918]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (inspectedLead) setInspectedLead(null);
              setShowFilters(!showFilters);
            }}
            className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Filter size={12} className="text-gray-500" />
            <span>Filters</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowColumnsMenu((prev) => !prev)}
              className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 inline-flex items-center gap-1.5 shadow-2xs hidden sm:inline-flex"
            >
              <Columns size={12} className="text-gray-500" />
              <span>Columns</span>
            </button>
            {showColumnsMenu && (
              <div className="absolute right-0 top-9 w-48 bg-white border border-[#E7E7E2] rounded-xl shadow-lg p-2 z-30 space-y-1 text-xs">
                <div className="text-[10px] font-bold text-gray-400 px-2 py-1">Toggle Columns</div>
                {Object.entries(visibleColumns).map(([key, isChecked]) => (
                  <button
                    key={key}
                    onClick={() =>
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [key]: !isChecked,
                      }))
                    }
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-50 text-left capitalize"
                  >
                    <span>{key.replace(/([A-Z])/g, " $1")}</span>
                    {isChecked ? <Check size={12} className="text-emerald-600" /> : <span className="w-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-[#E7E7E2] bg-white text-xs font-semibold text-gray-700 focus:outline-none shadow-2xs"
          >
            <option value="createdAt">Sort: Most Recent</option>
            <option value="opportunityScore">Sort: Opportunity Score</option>
            <option value="rating">Sort: Highest Rating</option>
            <option value="reviewCount">Sort: Most Reviews</option>
          </select>
        </div>
      </div>

      {/* Main Content Area: Table + Right Panel */}
      <div className="flex items-start gap-5">
        {/* Leads Data Table */}
        <div className="flex-1 bg-white rounded-xl border border-[#E7E7E2] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-[#E7E7E2] text-[#68717D] text-[11px]">
                <tr>
                  <th className="py-3 px-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === leads.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-[#171918] focus:ring-0"
                    />
                  </th>
                  <th className="py-3 px-3 font-semibold">Business ⌄</th>
                  <th className="py-3 px-3 font-semibold">Category ⌄</th>
                  <th className="py-3 px-3 font-semibold">Location ⌄</th>
                  <th className="py-3 px-3 font-semibold">Rating ⌄</th>
                  <th className="py-3 px-3 font-semibold">Status ⌄</th>
                  <th className="py-3 px-3 font-semibold">Source ⌄</th>
                  <th className="py-3 px-3 font-semibold">Last Activity</th>
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => {
                  const isInspected = inspectedLead?._id === lead._id || inspectedLead?.slug === lead.slug;
                  return (
                    <tr
                      key={lead._id}
                      onClick={() => setInspectedLead(lead)}
                      className={`cursor-pointer transition-colors ${
                        isInspected
                          ? "bg-blue-50/40"
                          : "hover:bg-[#FAF9F6]/80"
                      }`}
                    >
                      <td className="py-3 px-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(lead._id)}
                          onChange={() => handleToggleRow(lead._id)}
                          className="rounded border-gray-300 text-[#171918] focus:ring-0"
                        />
                      </td>

                      {/* Business name + logo */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 relative shrink-0 border border-gray-200">
                            <Image
                              src={lead.imageUrl || "/assets/urban-kitchen.jpg"}
                              alt={lead.businessName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-[#171918] hover:text-[#3568E8] transition-colors truncate max-w-[150px]">
                              {lead.businessName}
                            </div>
                            <div className="text-[10px] text-gray-400 flex items-center gap-1">
                              <span className="truncate max-w-[130px]">{lead.website ? lead.website.replace("https://", "") : "example.in"}</span>
                              <ExternalLink size={9} />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-gray-600 text-[11px] whitespace-nowrap">
                        {lead.category}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 text-gray-600 text-[11px] whitespace-nowrap">
                        {lead.location || "New Delhi"}
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-3 text-amber-500 font-bold text-[11px] whitespace-nowrap">
                        ★ {lead.rating}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className="text-[11px] font-bold px-2 py-0.5 rounded-md border border-gray-200 bg-white text-gray-800 focus:outline-none"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Interested">Interested</option>
                          <option value="Replied">Replied</option>
                          <option value="Converted">Converted</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-3 text-gray-600 text-[11px] whitespace-nowrap">
                        {lead.source}
                      </td>

                      {/* Last Activity */}
                      <td className="py-3 px-3 text-gray-400 text-[11px] whitespace-nowrap">
                        {lead.lastContactedAt || "12 Mar 2024"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/leads/${lead.slug || lead._id}`}
                            className="p-1 rounded text-gray-400 hover:text-black hover:bg-gray-100"
                            title="Open Dossier"
                          >
                            <ExternalLink size={13} />
                          </Link>
                          <button className="p-1 rounded text-gray-400 hover:text-black hover:bg-gray-100">
                            <MoreHorizontal size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="p-3.5 border-t border-[#E7E7E2] flex items-center justify-between text-xs text-[#68717D]">
            <span>Showing 1 – 10 of {total.toLocaleString()} leads</span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded border border-[#E7E7E2] disabled:opacity-30 hover:bg-gray-50"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, Math.ceil(total / 10)) }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                    page === num
                      ? "bg-[#171918] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {num}
                </button>
              ))}
              <span className="px-1 text-gray-400">...</span>
              <button
                onClick={() => setPage((p) => Math.min(Math.ceil(total / 10), p + 1))}
                disabled={page >= Math.ceil(total / 10)}
                className="p-1 rounded border border-[#E7E7E2] disabled:opacity-30 hover:bg-gray-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Inspector: Lead Detail & Website Audit Panel OR Filters Sidebar */}
        {inspectedLead ? (
          <LeadDetailAuditPanel
            lead={inspectedLead}
            onClose={() => setInspectedLead(null)}
            onStatusChange={(newStatus) => handleStatusChange(inspectedLead._id || inspectedLead.slug, newStatus)}
          />
        ) : showFilters ? (
          <LeadFiltersSidebar
            category={category}
            onCategoryChange={setCategory}
            status={status}
            onStatusChange={setStatus}
            onReset={() => {
              setCategory("All");
              setStatus("All");
              setSearch("");
            }}
          />
        ) : null}
      </div>

      {/* Add Lead & Import Modals */}
      <AddLeadModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onLeadCreated={fetchLeads}
      />
      <ImportCSVModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportComplete={fetchLeads}
      />
    </div>
  );
}
