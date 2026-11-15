"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [leadCount, setLeadCount] = useState(0);

  useEffect(() => {
    // Fetch live lead count from API
    fetch("/api/leads?limit=1")
      .then((res) => res.json())
      .then((data) => {
        if (data?.counts?.All !== undefined) {
          setLeadCount(data.counts.All);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F0E] flex text-[#0F172A] dark:text-[#F7F9F8] transition-colors duration-200">
      {/* Sidebar */}
      <AppSidebar
        leadCount={leadCount}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Mobile scrim overlay */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main content shell */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1720px] w-full mx-auto">
          {children}
        </main>

        <footer className="border-t border-[#E2E8F0] dark:border-[#22302B] bg-white dark:bg-[#121816]/40 px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] dark:text-[#9AA29E] gap-2">
          <span>© 2024–2026 AgencyOS</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]" />
            All systems operational
          </span>
          <Link href="/" className="hover:text-[#0F172A] dark:hover:text-white font-medium transition-colors">
            Marketing site →
          </Link>
        </footer>
      </div>
    </div>
  );
}

