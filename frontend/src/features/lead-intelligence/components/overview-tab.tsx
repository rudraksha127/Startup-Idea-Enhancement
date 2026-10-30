"use client";

import { CheckCircle2, AlertTriangle, TrendingUp, Sparkles, Building, ArrowRight } from "lucide-react";

interface OverviewTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lead: any;
  onOpenProjectBrief?: () => void;
}

export function OverviewTab({ lead, onOpenProjectBrief }: OverviewTabProps) {
  const competitors = lead.competitors && lead.competitors.length > 0 ? lead.competitors : [
    { name: "Connaught Bistro", rating: 4.7, price: "₹₹₹", note: "Has mobile ordering & high local SEO rank" },
    { name: "The Imperial Diner", rating: 4.5, price: "₹₹", note: "Modern Next.js website with table booking" },
    { name: "Spice & Craft Kitchen", rating: 4.4, price: "₹₹", note: "Integrated Zomato & Direct Delivery" },
  ];

  const actionPlan = lead.actionPlan && lead.actionPlan.length > 0 ? lead.actionPlan : [
    {
      phase: "Immediate (Day 1-3)",
      title: "Mobile Performance Optimization",
      description: "Convert static unindexed PDF menu to modern responsive HTML with Next.js image caching.",
      timeEstimate: "3 days",
    },
    {
      phase: "Week 1",
      title: "Direct Table Reservation Widget",
      description: "Embed automated booking form with instant WhatsApp SMS confirmation to eliminate commissions.",
      timeEstimate: "5 days",
    },
    {
      phase: "Month 1",
      title: "Local SEO & Review Engine",
      description: "Deploy local schema markup, OpenGraph tags, and automated Google review collector.",
      timeEstimate: "2 weeks",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 2-column top grid: Quick Signals + Competitors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pain Points & Levers */}
        <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle size={15} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#101413]">Detected Conversion Bottlenecks</h3>
              <p className="text-[11px] text-gray-500">Key friction points extracted from digital presence audit</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {(lead.painPoints || [
              "No online table reservation system",
              "Mobile site loading time is over 5.2 seconds",
              "Menu is in static unindexed PDF format",
              "Missing Google Local Schema markup",
            ]).map((point: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#faf9f6] border border-gray-100">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <span className="text-[#353b38] leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Local Competitors Benchmark */}
        <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <TrendingUp size={15} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#101413]">Local Competitive Landscape</h3>
              <p className="text-[11px] text-gray-500">Benchmark against top alternatives in {lead.location || "Connaught Place"}</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {competitors.map((comp: { name: string; rating: number; price: string; note: string }) => (
              <div key={comp.name} className="p-3 rounded-lg bg-[#faf9f6] border border-gray-100 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <b className="text-[#101413]">{comp.name}</b>
                    <span className="text-amber-500 font-bold text-[11px]">★ {comp.rating}</span>
                    <span className="text-gray-400 text-[10px]">{comp.price}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{comp.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Action Plan */}
      <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#0da66c]/10 text-[#0da66c] flex items-center justify-center">
              <Sparkles size={15} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#101413]">Recommended Development Roadmap</h3>
              <p className="text-[11px] text-gray-500">Action plan ready to convert into a client project brief</p>
            </div>
          </div>

          {onOpenProjectBrief && (
            <button
              onClick={onOpenProjectBrief}
              className="px-3 py-1.5 rounded-lg bg-[#101513] hover:bg-[#1a2c27] text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <span>Generate Project Brief</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {actionPlan.map((step: { phase: string; title: string; description: string; timeEstimate: string }, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-[#faf9f6] border border-gray-200 flex flex-col justify-between">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold text-[#0da66c] bg-[#eef9f2] mb-2 uppercase">
                  {step.phase}
                </span>
                <h4 className="font-bold text-[#101413] mb-1.5">{step.title}</h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">{step.description}</p>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-200/60 flex items-center justify-between text-[10px] text-gray-500">
                <span>Estimated effort:</span>
                <b className="text-gray-800">{step.timeEstimate}</b>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

