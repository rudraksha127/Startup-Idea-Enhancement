"use client";

import { useState } from "react";
import { Search, ChevronDown, Bookmark } from "lucide-react";

interface LeadFiltersSidebarProps {
  category: string;
  onCategoryChange: (cat: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  onReset: () => void;
  counts?: Record<string, number>;
  totalLeads?: number;
}

export function LeadFiltersSidebar({
  category,
  onCategoryChange,
  status,
  onStatusChange,
  onReset,
  counts,
  totalLeads = 0,
}: LeadFiltersSidebarProps) {
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedList, setSelectedList] = useState("High Potential");

  const isZero = totalLeads === 0;

  const categories = [
    { name: "Restaurant", count: isZero ? 0 : 324 },
    { name: "Beauty", count: isZero ? 0 : 218 },
    { name: "Healthcare", count: isZero ? 0 : 186 },
    { name: "Fitness", count: isZero ? 0 : 172 },
    { name: "Hotel", count: isZero ? 0 : 145 },
  ];

  const ratings = [
    { label: "4.5 and above", count: isZero ? 0 : 412 },
    { label: "4.0 – 4.5", count: isZero ? 0 : 876 },
    { label: "3.5 – 4.0", count: isZero ? 0 : 689 },
    { label: "Below 3.5", count: isZero ? 0 : 114 },
  ];

  const statuses = [
    { name: "New", count: counts?.New ?? (isZero ? 0 : 680) },
    { name: "Contacted", count: counts?.Contacted ?? (isZero ? 0 : 892) },
    { name: "Replied", count: counts?.Replied ?? (isZero ? 0 : 142) },
    { name: "Interested", count: counts?.Interested ?? (isZero ? 0 : 68) },
    { name: "Converted", count: counts?.Converted ?? (isZero ? 0 : 38) },
  ];

  const savedLists = [
    { name: "High Potential", count: isZero ? 0 : 128 },
    { name: "Need Website", count: isZero ? 0 : 286 },
    { name: "Follow Up This Week", count: isZero ? 0 : 54 },
  ];

  return (
    <div className="w-64 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4 space-y-5 text-xs shadow-xs shrink-0 hidden lg:block">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#22302B]">
        <span className="font-bold text-sm text-[#171918] dark:text-white">Filters</span>
        <button
          onClick={onReset}
          className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          Reset All
        </button>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <div className="flex items-center justify-between font-semibold text-[#171918] dark:text-white">
          <span>Location</span>
          <ChevronDown size={13} className="text-gray-400" />
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            placeholder="Search city or area..."
            className="w-full pl-7 pr-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-[#FAF9F6] dark:bg-[#1A2420] text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-[#151D1A] focus:outline-none"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-[#22302B]">
        <div className="flex items-center justify-between font-semibold text-[#171918] dark:text-white">
          <span>Category</span>
          <ChevronDown size={13} className="text-gray-400" />
        </div>
        <div className="space-y-1.5 text-[11px]">
          {categories.map((c) => (
            <label
              key={c.name}
              className="flex items-center justify-between cursor-pointer text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={category === c.name}
                  onChange={() => onCategoryChange(category === c.name ? "All" : c.name)}
                  className="rounded border-gray-300 dark:border-gray-600 text-[#171918] focus:ring-0"
                />
                <span>{c.name}</span>
              </div>
              <span className="text-gray-400 dark:text-gray-500">({c.count})</span>
            </label>
          ))}
          <button className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold hover:underline pt-0.5">
            + Show More
          </button>
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between font-semibold text-[#171918]">
          <span>Rating</span>
          <ChevronDown size={13} className="text-gray-400" />
        </div>
        <div className="space-y-1.5 text-[11px]">
          {ratings.map((r) => (
            <label
              key={r.label}
              className="flex items-center justify-between cursor-pointer text-gray-600 hover:text-black"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#171918] focus:ring-0"
                />
                <span>{r.label}</span>
              </div>
              <span className="text-gray-400">({r.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between font-semibold text-[#171918]">
          <span>Status</span>
          <ChevronDown size={13} className="text-gray-400" />
        </div>
        <div className="space-y-1.5 text-[11px]">
          {statuses.map((s) => (
            <label
              key={s.name}
              className="flex items-center justify-between cursor-pointer text-gray-600 hover:text-black"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={status === s.name}
                  onChange={() => onStatusChange(status === s.name ? "All" : s.name)}
                  className="rounded border-gray-300 text-[#171918] focus:ring-0"
                />
                <span>{s.name}</span>
              </div>
              <span className="text-gray-400">({s.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Saved Lists */}
      <div className="space-y-2 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 font-bold text-[#171918]">
          <Bookmark size={13} />
          <span>Saved Lists</span>
        </div>
        <div className="space-y-1 text-[11px]">
          {savedLists.map((list) => {
            const isSelected = selectedList === list.name;
            return (
              <button
                key={list.name}
                onClick={() => setSelectedList(list.name)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  isSelected
                    ? "bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{list.name}</span>
                <span className="text-gray-400">({list.count})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

