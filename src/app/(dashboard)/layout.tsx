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
  const [leadCount, setLeadCount] = useState(28);

  useEffect(() => {
    // Fetch live lead count from API
    fetch("/api/leads?limit=1")
      .then((res) => res.json())
      .then((data) => {
        if (data?.counts?.All) {
          setLeadCount(data.counts.All);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex text-[#171918]">
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

        <footer className="border-t border-[#E7E7E2] bg-white/40 px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-[#68717D] gap-2">
          <span>© 2024–2026 AgencyOS</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]" />
            All systems operational
          </span>
          <Link href="/" className="hover:text-[#171918] font-medium transition-colors">
            Marketing site →
          </Link>
        </footer>
      </div>
    </div>
  );
}

