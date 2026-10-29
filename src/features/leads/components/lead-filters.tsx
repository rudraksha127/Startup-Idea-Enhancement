"use client";

import { Search } from "lucide-react";

interface LeadFiltersProps {
  currentStatus: string;
  onSelectStatus: (status: string) => void;
  counts: Record<string, number>;
  search: string;
  onSearchChange: (search: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
}

const STATUS_TABS = ["All", "New", "Contacted", "Interested", "Replied", "Converted", "Archived"];

const CATEGORIES = [
  "All",
  "Restaurant",
  "Retail",
  "Beauty",
  "Healthcare",
  "Fitness",
  "Hotel",
  "Automotive",
  "Cafe",
  "Other",
];

export function LeadFilters({
  currentStatus,
  onSelectStatus,
  counts,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sortBy,
  onSortByChange,
}: LeadFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Status Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-[#161f1b]/10 pb-px scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = currentStatus === tab;
          const count = counts[tab] ?? (tab === "All" ? 28 : 0);

          return (
            <button
              key={tab}
              onClick={() => onSelectStatus(tab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? "border-[#101413] text-[#101413] font-bold"
                  : "border-transparent text-[#555956] hover:text-[#101413] hover:border-gray-300"
              }`}
            >
              <span>{tab}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? "bg-[#101413] text-white" : "bg-gray-100 text-[#555956]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter controls row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <Search size={14} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search leads by name, address, category..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#161f1b]/15 bg-white focus:outline-none focus:ring-1 focus:ring-[#0d251f]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="border border-[#161f1b]/15 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.filter((c) => c !== "All").map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="border border-[#161f1b]/15 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none"
          >
            <option value="opportunityScore">Sort: Opportunity Score</option>
            <option value="websiteScore">Sort: Website Score</option>
            <option value="rating">Sort: High Rating</option>
            <option value="businessName">Sort: Business Name</option>
          </select>
        </div>
      </div>
    </div>
  );
}

