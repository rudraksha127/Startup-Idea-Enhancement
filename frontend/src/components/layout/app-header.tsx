"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Search,
  Calendar,
  Bell,
  ChevronDown,
  Settings,
  CreditCard,
  Users,
  LogOut,
  X,
  Loader2,
  Building2,
  FolderGit2,
  Compass,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AppHeaderProps {
  onToggleMobileNav: () => void;
  onOpenAddLead?: () => void;
  onDateRangeChange?: (range: string) => void;
}

interface SearchResultItem {
  id: string;
  type: "lead" | "client" | "project" | "business";
  title: string;
  subtitle: string;
  href: string;
}

interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  category: "lead" | "agent" | "project" | "billing" | "system";
  unread: boolean;
  href: string;
}

// Compute dynamic current date label for Asia/Kolkata
function getCurrentMonthLabel(): string {
  const now = new Date();
  const start = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(now.getFullYear(), now.getMonth(), 1));

  const end = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  return `${start} — ${end}`;
}

const DATE_OPTIONS = [
  "This month",
  "Today",
  "Yesterday",
  "Last 7 days",
  "Last 30 days",
  "This week",
  "Last week",
  "Last month",
  "This quarter",
  "This year",
];

export function AppHeader({ onToggleMobileNav, onDateRangeChange }: AppHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Date Range State
  const [dateRange, setDateRange] = useState(() => getCurrentMonthLabel());
  const [dateMenuOpen, setDateMenuOpen] = useState(false);

  // Notification State
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Profile Menu State
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch real notifications on mount
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadNotifications(data.unreadCount || 0);
      }
    } catch {
      // In clean baseline, keep 0
      setNotifications([]);
      setUnreadNotifications(0);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Debounced Global Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchOpen(false);
      return;
    }

    setIsSearching(true);
    setSearchOpen(true);
    setSelectedIndex(-1);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }

      // Escape to close menus
      if (e.key === "Escape") {
        setDateMenuOpen(false);
        setNotifyOpen(false);
        setProfileMenuOpen(false);
        setSearchOpen(false);
        searchRef.current?.blur();
      }

      // Keyboard navigation for search results
      if (searchOpen && searchResults.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
        } else if (e.key === "Enter" && selectedIndex >= 0) {
          e.preventDefault();
          const target = searchResults[selectedIndex];
          if (target?.href) {
            setSearchOpen(false);
            router.push(target.href);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, searchResults, selectedIndex, router]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(e.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectDateRange = (option: string) => {
    setDateRange(option);
    setDateMenuOpen(false);
    onDateRangeChange?.(option);
    // Update URL param if on dashboard
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("range", option.toLowerCase().replace(/\s+/g, "_"));
    router.replace(`/dashboard?${params.toString()}`);
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-all-read" }),
      });
      setUnreadNotifications(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch {
      setUnreadNotifications(0);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "lead":
      case "business":
        return <Compass size={14} className="text-emerald-600 dark:text-emerald-400" />;
      case "client":
        return <Building2 size={14} className="text-blue-600 dark:text-blue-400" />;
      case "project":
        return <FolderGit2 size={14} className="text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Search size={14} className="text-gray-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-[#121816]/95 backdrop-blur border-b border-[#E2E8F0] dark:border-[#232B29] px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile hamburger & Global Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg relative">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 rounded-lg text-[#0F172A] dark:text-[#F3F4F6] hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Open mobile navigation"
        >
          <Menu size={20} />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-gray-500 pointer-events-none">
            {isSearching ? <Loader2 size={15} className="animate-spin text-emerald-600" /> : <Search size={15} />}
          </span>
          <input
            ref={searchRef}
            type="search"
            value={searchQuery}
            onFocus={() => {
              if (searchQuery.trim().length >= 2) setSearchOpen(true);
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search businesses, clients, projects..."
            className="w-full pl-9 pr-14 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-[#2B3532] bg-[#F8FAFC] dark:bg-[#151D1A] text-[#0F172A] dark:text-[#F3F4F6] focus:bg-white dark:focus:bg-[#192320] focus:outline-none focus:ring-1 focus:ring-[#0d251f] dark:focus:ring-emerald-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setSearchOpen(false);
              }}
              className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          ) : null}
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 dark:text-gray-500 bg-white dark:bg-[#1D2523] border border-gray-200 dark:border-[#2B3532] rounded shadow-2xs pointer-events-none">
            ⌘ K
          </kbd>
        </form>

        {/* Global Search Results Dropdown */}
        {searchOpen && searchQuery.trim().length >= 2 && (
          <div
            ref={searchDropdownRef}
            className="absolute left-0 right-0 top-full mt-1.5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E2E8F0] dark:border-[#2B3532] shadow-2xl overflow-hidden z-40 max-h-96 flex flex-col text-xs"
          >
            {isSearching ? (
              <div className="py-6 flex flex-col items-center justify-center text-gray-400 gap-1.5">
                <Loader2 size={16} className="animate-spin text-emerald-600" />
                <span className="text-[11px]">Searching workspace records...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-6 px-4 text-center text-gray-500 dark:text-gray-400">
                <p className="font-semibold text-xs">No matching records found</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  No businesses, clients, or projects matched &quot;{searchQuery}&quot;.
                </p>
              </div>
            ) : (
              <div className="p-1 divide-y divide-gray-100 dark:divide-[#232B29]/60 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Results ({searchResults.length})
                </div>
                {searchResults.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      selectedIndex === idx
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-white"
                        : "hover:bg-gray-50 dark:hover:bg-[#1D2523] text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      {getResultIcon(item.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs truncate">{item.title}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{item.subtitle}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 shrink-0">
                      {item.type}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            <div className="px-3 py-1.5 bg-gray-50 dark:bg-[#121816] border-t border-gray-100 dark:border-[#232B29] flex items-center justify-between text-[10px] text-gray-400">
              <span>Use ↑ ↓ to navigate</span>
              <span>Press Enter to select • Esc to dismiss</span>
            </div>
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dynamic Date range picker */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setDateMenuOpen(!dateMenuOpen)}
            className="h-9 px-3 inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] dark:border-[#2B3532] bg-white dark:bg-[#151D1A] text-xs font-medium text-[#0F172A] dark:text-[#F3F4F6] hover:bg-gray-50 dark:hover:bg-[#1D2523] shadow-2xs transition-colors"
            aria-expanded={dateMenuOpen}
            aria-label="Filter dashboard by date range"
          >
            <Calendar size={13} className="text-gray-500 dark:text-gray-400" />
            <span className="truncate max-w-[180px]">{dateRange}</span>
            <ChevronDown size={12} className={`text-gray-400 transition-transform ${dateMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {dateMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E2E8F0] dark:border-[#2B3532] shadow-xl py-1 text-xs z-30">
              {DATE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelectDateRange(opt)}
                  className={`w-full px-3 py-1.5 text-left transition-colors ${
                    dateRange === opt
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1D2523]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Dropdown Toggle */}
        <ThemeToggle variant="dropdown" />

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotifyOpen(!notifyOpen)}
            aria-label="View notifications"
            className="w-9 h-9 rounded-lg border border-[#E2E8F0] dark:border-[#2B3532] bg-white dark:bg-[#151D1A] flex items-center justify-center text-[#0F172A] dark:text-[#F3F4F6] hover:bg-gray-50 dark:hover:bg-[#1D2523] shadow-2xs relative transition-colors"
          >
            <Bell size={16} className="text-gray-600 dark:text-gray-400" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_0_2px_white] dark:shadow-[0_0_0_2px_#151D1A]" />
            )}
          </button>

          {notifyOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E2E8F0] dark:border-[#2B3532] shadow-2xl p-3 text-xs z-30 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#232B29]">
                <span className="font-bold text-[#171918] dark:text-white">Notifications</span>
                {unreadNotifications > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-[#3568E8] dark:text-emerald-400 hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-6 text-center">
                  <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 mx-auto mb-2">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="font-semibold text-xs text-gray-700 dark:text-gray-300">
                    No unread notifications
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    Operational updates for leads, client replies, and tasks will notify you here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-[11px] text-[#353b38] dark:text-gray-300 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.href || "/dashboard"}
                      onClick={() => setNotifyOpen(false)}
                      className={`p-2 rounded-lg flex items-start gap-2 transition-colors ${
                        n.unread ? "bg-emerald-50/60 dark:bg-emerald-950/20" : "bg-[#F7F6F2] dark:bg-[#1D2523]"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${n.unread ? "bg-emerald-500" : "bg-gray-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{n.title}</p>
                        <p className="text-gray-500 dark:text-gray-400 truncate">{n.detail}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            aria-label="User profile menu"
            className="w-9 h-9 rounded-full bg-[#191B1A] dark:bg-white text-white dark:text-[#151B1A] flex items-center justify-center font-bold text-xs tracking-wider shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
          >
            RU
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E2E8F0] dark:border-[#2B3532] shadow-xl py-1 text-xs z-30 divide-y divide-gray-100 dark:divide-[#232B29]">
              <div className="px-3 py-2.5">
                <p className="font-bold text-[#171918] dark:text-white">Rudraksh</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Founder • AgencyOS</p>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1D2523] transition-colors"
                >
                  <Settings size={13} className="text-gray-400" />
                  <span>Account Settings</span>
                </Link>
                <Link
                  href="/billing"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1D2523] transition-colors"
                >
                  <CreditCard size={13} className="text-gray-400" />
                  <span>Billing &amp; Plans</span>
                </Link>
                <Link
                  href="/team"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1D2523] transition-colors"
                >
                  <Users size={13} className="text-gray-400" />
                  <span>Team Members</span>
                </Link>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left transition-colors"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
