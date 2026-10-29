"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, CheckCircle, Search, FileText, Users, Send, Briefcase, TrendingUp } from "lucide-react";

interface LandingHeroProps {
  onOpenDemo: () => void;
}

export function LandingHero({ onOpenDemo }: LandingHeroProps) {
  return (
    <section id="product" className="relative overflow-hidden pt-10 pb-16 lg:py-20 bg-[#F8F6F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left copy */}
          <div className="lg:col-span-7 z-10">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE8E1] text-[12px] font-semibold text-[#171918] mb-6 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#25835B] shadow-[0_0_0_3px_rgba(37,131,91,0.2)]" />
              <span>AI-Powered Business Growth</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] tracking-tight text-[#171918] leading-[1.08] font-bold mb-6">
              <span>Find Clients.</span>
              <br />
              <span>Close Projects.</span>
              <br />
              <span className="text-[#151B1A] font-normal italic">You Build. We Handle the Rest.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#68717D] max-w-xl leading-relaxed mb-8">
              An autonomous AI agency operating system that finds businesses, analyzes their online presence, reaches out, converts them into clients and prepares complete project handoffs for development.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link
                href="/dashboard"
                className="h-12 px-7 inline-flex items-center justify-center gap-2 rounded-lg bg-[#151B1A] hover:bg-[#222a29] text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5"
              >
                <span>Get Started Free</span>
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={onOpenDemo}
                className="h-12 px-6 inline-flex items-center justify-center gap-2.5 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-sm font-semibold text-[#171918] shadow-2xs transition-all hover:-translate-y-0.5"
              >
                <span className="w-5 h-5 rounded-full bg-[#151B1A] text-white flex items-center justify-center text-[10px] pl-0.5">
                  <Play size={10} fill="currentColor" />
                </span>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* 3 Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-[#E7E7E2]">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#EAE8E1] text-[#151B1A] flex items-center justify-center shrink-0 mt-0.5">
                  <Search size={14} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#171918]">No Manual Outreach</h4>
                  <p className="text-[11px] text-[#68717D]">AI finds &amp; contacts leads</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#EAE8E1] text-[#151B1A] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle size={14} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#171918]">Real Opportunities</h4>
                  <p className="text-[11px] text-[#68717D]">Not just random leads</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#EAE8E1] text-[#151B1A] flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={14} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#171918]">Dev-Ready Handoffs</h4>
                  <p className="text-[11px] text-[#68717D]">Complete project briefs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual with Floating Metric Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative">
              {/* Laptop mock frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-black/10 bg-white">
                <Image
                  src="/assets/hero-laptop.png"
                  alt="AgencyOS Operations Dashboard on laptop"
                  width={700}
                  height={480}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>

              {/* Floating Badge 1: 2,847 Businesses Found (Top-left) */}
              <div className="hidden sm:flex absolute -top-4 -left-6 bg-white/95 backdrop-blur border border-[#E7E7E2] rounded-xl p-3 shadow-lg items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 text-[#3568E8] flex items-center justify-center shrink-0">
                  <Users size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-[#171918]">2,847</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      ↑ 12%
                    </span>
                  </div>
                  <div className="text-[10px] text-[#68717D] font-medium">Businesses Found</div>
                </div>
              </div>

              {/* Floating Badge 2: 892 Leads Contacted (Top-right) */}
              <div className="hidden sm:flex absolute -top-3 -right-5 bg-white/95 backdrop-blur border border-[#E7E7E2] rounded-xl p-3 shadow-lg items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
                <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <Send size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-[#171918]">892</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      ↑ 16%
                    </span>
                  </div>
                  <div className="text-[10px] text-[#68717D] font-medium">Leads Contacted</div>
                </div>
              </div>

              {/* Floating Badge 3: 38 Active Clients (Bottom-right) */}
              <div className="hidden sm:flex absolute -bottom-5 -right-4 bg-white/95 backdrop-blur border border-[#E7E7E2] rounded-xl p-3 shadow-lg items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 text-[#25835B] flex items-center justify-center shrink-0">
                  <Briefcase size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-[#171918]">38</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      ↑ 18%
                    </span>
                  </div>
                  <div className="text-[10px] text-[#68717D] font-medium">Active Clients</div>
                </div>
              </div>
            </div>

            {/* Handwritten scribble annotation */}
            <div className="hidden sm:block absolute -bottom-8 -left-8 bg-transparent text-[#151B1A] font-handwriting text-2xl rotate-[-6deg] select-none pointer-events-none">
              <span>Turn Opportunities</span>
              <br />
              <span className="pl-4">into Real Clients</span>
              <svg className="w-16 h-10 mt-1 ml-6 text-[#151B1A]" viewBox="0 0 80 48" fill="none">
                <path d="M4 2C12 23 30 26 62 34" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="m51 25 13 10-16 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
