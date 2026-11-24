"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#f8f6f0]/95 dark:bg-[#0b0f0e]/95 backdrop-blur border-b border-[#E7E7E2] dark:border-[#22302b] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-[#171918] dark:text-white">
          <span className="w-8 h-8 rounded-full bg-[#151B1A] dark:bg-white text-white dark:text-[#151B1A] flex items-center justify-center font-bold text-sm shadow-inner">
            A
          </span>
          <span className="font-serif">AgencyOS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#171918] dark:text-[#cbd5e1]">
          <a href="#solutions" className="hover:text-[#3568E8] dark:hover:text-emerald-400 transition-colors">Solutions</a>
          <a href="#process" className="hover:text-[#3568E8] dark:hover:text-emerald-400 transition-colors">How it Works</a>
          <Link href="/billing" className="hover:text-[#3568E8] dark:hover:text-emerald-400 transition-colors">Pricing</Link>
          <a href="#case-studies" className="hover:text-[#3568E8] dark:hover:text-emerald-400 transition-colors">Case Studies</a>
          <a href="#resources" className="hover:text-[#3568E8] dark:hover:text-emerald-400 transition-colors">Resources</a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="h-9 px-4 inline-flex items-center justify-center rounded-lg border border-[#E7E7E2] dark:border-[#22302b] bg-white dark:bg-[#151d1a] hover:bg-gray-50 dark:hover:bg-[#1f2b26] text-xs font-semibold text-[#171918] dark:text-white shadow-2xs transition-all hover:-translate-y-0.5"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="h-9 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#151B1A] hover:bg-[#222a29] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold text-white shadow-xs transition-all hover:-translate-y-0.5"
          >
            <span>Get Started Free</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-[#171918] dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E7E7E2] dark:border-[#22302b] bg-[#f8f6f0] dark:bg-[#0b0f0e] px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col gap-2 text-sm font-medium">
            <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#171918] dark:text-white">Solutions</a>
            <a href="#process" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#171918] dark:text-white">How it Works</a>
            <Link href="/billing" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#171918] dark:text-white">Pricing</Link>
            <a href="#case-studies" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#171918] dark:text-white">Case Studies</a>
            <a href="#resources" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#171918] dark:text-white">Resources</a>
          </nav>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="h-10 flex items-center justify-center rounded-lg border border-[#E7E7E2] dark:border-[#22302b] bg-white dark:bg-[#151d1a] text-xs font-semibold text-[#171918] dark:text-white"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="h-10 flex items-center justify-center gap-1.5 rounded-lg bg-[#151B1A] dark:bg-emerald-600 text-xs font-semibold text-white"
            >
              <span>Get Started Free</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
