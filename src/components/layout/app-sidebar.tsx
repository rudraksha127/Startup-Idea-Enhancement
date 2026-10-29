"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Compass,
  Bot,
  Send,
  Building2,
  FolderGit2,
  Layers,
  BarChart3,
  CreditCard,
  Settings,
  Crown,
  MoreHorizontal,
  LogOut,
  ExternalLink,
} from "lucide-react";

interface AppSidebarProps {
  leadCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users, badge: 28 },
  { href: "/map-explorer", label: "Map Explorer", icon: Compass },
  { href: "/ai-agents", label: "AI Agents", icon: Bot },
  { href: "/outreach", label: "Outreach", icon: Send },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/projects", label: "Projects", icon: FolderGit2 },
  { href: "/templates", label: "Templates", icon: Layers },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({ leadCount = 28, isOpen = false, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 h-screen max-h-screen bg-[#151B1A] border-r border-[#232B29] flex flex-col justify-between text-white transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 shrink-0 overflow-hidden ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Brand */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#232B29]/60 shrink-0">
          <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-white hover:opacity-90">
            <span className="w-8 h-8 rounded-full bg-white text-[#151B1A] flex items-center justify-center font-bold text-sm shadow-inner">
              A
            </span>
            <span>AgencyOS</span>
          </Link>
          <Link
            href="/"
            title="View marketing site"
            className="text-gray-400 hover:text-white p-1 rounded transition-colors"
          >
            <ExternalLink size={14} />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                  isActive
                    ? "bg-white text-[#171918] shadow-xs font-bold"
                    : "text-[#9AA29E] hover:bg-white/5 hover:text-white font-medium"
                }`}
              >
                <Icon size={16} className={isActive ? "text-[#171918]" : "text-[#9AA29E]"} />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-[#171918] text-white" : "bg-[#232B29] text-gray-300"
                    }`}
                  >
                    {leadCount || item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-[#232B29]/60 space-y-2.5 shrink-0">
        {/* Upgrade Plan Box */}
        <div className="p-3.5 rounded-xl bg-[#1D2523] border border-[#2B3532] text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs mb-1">
            <Crown size={14} />
            <span>Upgrade Plan</span>
          </div>
          <p className="text-[11px] text-gray-300 leading-snug mb-3">
            Unlock more leads, AI credits and team members.
          </p>
          <Link
            href="/billing"
            className="w-full h-8 inline-flex items-center justify-center rounded-lg bg-white hover:bg-gray-100 text-[#171918] font-bold text-xs shadow-xs transition-colors"
          >
            Upgrade →
          </Link>
        </div>

        {/* Profile Card */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-white/15 text-white flex items-center justify-center font-bold text-xs shrink-0 border border-white/20">
              RU
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">Rudraksh</div>
              <div className="text-[10px] text-gray-400 truncate">Founder</div>
            </div>
            <MoreHorizontal size={14} className="text-gray-400" />
          </button>

          {profileMenuOpen && (
            <div className="absolute bottom-full left-0 mb-1 w-full rounded-xl bg-[#1D2523] border border-[#2B3532] shadow-xl py-1 text-xs">
              <Link
                href="/settings"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-gray-200 hover:bg-white/10"
              >
                <Settings size={13} /> Account Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-rose-300 hover:bg-rose-500/20 text-left"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
