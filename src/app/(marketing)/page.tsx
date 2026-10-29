"use client";

import { useState } from "react";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { LandingMetrics } from "@/features/landing/components/landing-metrics";
import { LandingFeatures } from "@/features/landing/components/landing-features";
import { LandingWorkflow } from "@/features/landing/components/landing-workflow";
import { LandingDemoModal } from "@/features/landing/components/landing-demo-modal";
import { LandingFooter } from "@/features/landing/components/landing-footer";

export default function MarketingLandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f6f0] flex flex-col font-sans selection:bg-[#0d251f] selection:text-white">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero onOpenDemo={() => setDemoOpen(true)} />
        <LandingMetrics />
        <LandingFeatures />
        <LandingWorkflow />
      </main>
      <LandingFooter />
      <LandingDemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
