"use client";

import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb, Target } from "lucide-react";

interface AIResearchTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lead: any;
}

export function AIResearchTab({ lead }: AIResearchTabProps) {
  const insights = lead.aiInsights || {
    summary:
      "High volume of weekly walk-in customers with stellar food reputation, but losing high-ticket dinner reservations to Connaught Bistro due to lack of a modern booking experience.",
    strengths: [
      "High 4.6 Google rating with over 120 organic reviews",
      "Prime Connaught Place commercial district foot traffic",
      "Recognized heritage culinary legacy with loyal recurring clientele",
    ],
    weaknesses: [
      "Slow unoptimized website taking 5.2s to load on 4G networks",
      "Zero direct customer capture or table reservation channel",
      "Heavy reliance on third-party aggregators charging 18-24% commission",
    ],
    pitchAngle:
      "Offer a high-converting website redesign with a zero-commission table booking engine that pays for itself in the first 30 days.",
  };

  return (
    <div className="space-y-6">
      {/* Executive AI Synthesis */}
      <div className="p-5 bg-gradient-to-br from-[#fbfaf6] to-[#f4f2ea] rounded-xl border border-gray-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#0da66c]/10 text-[#0da66c] flex items-center justify-center">
            <Sparkles size={15} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#101413]">Autonomous Intelligence Synthesis</h3>
            <p className="text-[11px] text-gray-500">Multimodal synthesis of online reviews, speed audits &amp; local competitive density</p>
          </div>
        </div>

        <p className="text-xs text-gray-700 leading-relaxed font-medium bg-white p-4 rounded-lg border border-gray-100">
          &ldquo;{insights.summary}&rdquo;
        </p>
      </div>

      {/* Strengths vs Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Strengths */}
        <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#0da66c]" /> Business Strengths &amp; Levers
          </h4>
          <div className="space-y-2 text-xs">
            {insights.strengths?.map((str: string, i: number) => (
              <div key={i} className="p-2.5 rounded-lg bg-[#faf9f6] text-gray-700 leading-relaxed">
                • {str}
              </div>
            ))}
          </div>
        </div>

        {/* Digital Weaknesses */}
        <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500" /> Digital Vulnerabilities
          </h4>
          <div className="space-y-2 text-xs">
            {insights.weaknesses?.map((weak: string, i: number) => (
              <div key={i} className="p-2.5 rounded-lg bg-[#faf9f6] text-gray-700 leading-relaxed">
                • {weak}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested Pitch Angle */}
      <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Lightbulb size={15} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#101413]">Recommended Outreach Hook &amp; Angle</h3>
            <p className="text-[11px] text-gray-500">Value proposition tailored to overcome owner skepticism</p>
          </div>
        </div>

        <div className="p-4 bg-[#faf9f6] rounded-xl border border-gray-200 text-xs text-gray-800 font-semibold leading-relaxed">
          {insights.pitchAngle}
        </div>
      </div>
    </div>
  );
}

