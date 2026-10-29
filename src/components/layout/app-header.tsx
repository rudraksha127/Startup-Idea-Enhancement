"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Calendar,
  Bell,
  Plus,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  FolderPlus,
} from "lucide-react";

interface AppHeaderProps {
  onToggleMobileNav: () => void;
  onOpenAddLead?: () => void;
}

export function AppHeader({ onToggleMobileNav, onOpenAddLead }: AppHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("Mar 1, 2024 — Mar 31, 2024");
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#faf9f6]/95 backdrop-blur border-b border-[#161f1b]/10 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 rounded-lg text-[#101413] hover:bg-black/5"
          aria-label="Open mobile navigation"
        >
          <Menu size={20} />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            <Search size={15} />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search businesses, clients, projects..."
            className="w-full pl-9 pr-14 py-2 text-xs rounded-lg border border-[#161f1b]/15 bg-[#fafaf8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0d251f] placeholder:text-gray-400"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white border border-gray-200 rounded shadow-2xs pointer-events-none">
            ⌘ K
          </kbd>
        </form>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date range picker */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setDateMenuOpen(!dateMenuOpen)}
            className="h-9 px-3 inline-flex items-center gap-2 rounded-lg border border-[#E7E7E2] bg-white text-xs font-medium text-[#171918] hover:bg-gray-50 shadow-2xs"
          >
            <Calendar size={13} className="text-gray-500" />
            <span className="truncate max-w-[180px]">{dateRange}</span>
            <ChevronDown size={12} className="text-gray-400" />
          </button>

          {dateMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white border border-[#E7E7E2] shadow-xl py-1 text-xs z-30">
              {["Mar 1, 2024 - Mar 31, 2024", "Today", "This week", "This month", "Last 30 days", "This quarter"].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setDateRange(r);
                    setDateMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-gray-700 hover:bg-[#F7F6F2] hover:text-[#171918]"
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifyOpen(!notifyOpen)}
            aria-label="View notifications"
            className="w-9 h-9 rounded-lg border border-[#E7E7E2] bg-white flex items-center justify-center text-[#171918] hover:bg-gray-50 shadow-2xs relative"
          >
            <Bell size={16} className="text-gray-600" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_0_2px_white]" />
            )}
          </button>

          {notifyOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-[#E7E7E2] shadow-xl p-3 text-xs z-30 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="font-bold text-[#171918]">Notifications</span>
                {unreadNotifications > 0 && (
                  <button
                    onClick={() => setUnreadNotifications(0)}
                    className="text-[10px] text-[#3568E8] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-2 text-[11px] text-[#353b38]">
                <div className="p-2 rounded-lg bg-[#F7F6F2] flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <b>New lead found:</b> Glow Beauty Salon in New Delhi
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#F7F6F2] flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3568E8] mt-1 shrink-0" />
                  <div>
                    <b>Research Agent finished:</b> 12 audits ready for review
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#F7F6F2] flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                  <div>
                    <b>2 project briefs:</b> Need founder approval
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User avatar circle */}
        <div className="w-9 h-9 rounded-full bg-[#191B1A] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs cursor-pointer hover:opacity-90">
          RU
        </div>
      </div>
    </header>
  );
}

