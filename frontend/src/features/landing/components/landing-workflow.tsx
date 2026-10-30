"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertTriangle, AlertCircle, Calendar } from "lucide-react";

export function LandingWorkflow() {
  return (
    <section id="process" className="py-20 bg-gradient-to-br from-[#151B1A] via-[#1A2321] to-[#0F1413] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-12">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#A7F3D0] mb-4">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              HOW IT WORKS
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold leading-tight mb-4">
              From Discovery to Deployment. <br />
              <span className="italic font-normal text-[#D1FAE5]">Fully Automated.</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6">
              Our AI agents handle the entire client acquisition and project preparation process, so you can focus on what you do best — building amazing websites.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F8F6F0] hover:bg-white text-xs font-bold text-[#151B1A] shadow transition-all hover:-translate-y-0.5"
            >
              <span>View Full Process</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="bg-[#FAF9F6] text-[#171918] rounded-xl p-4 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase text-[#25835B]">Step 01</span>
              </div>
              <h3 className="text-xs font-bold mb-3">Find Opportunities</h3>
              <div className="h-32 bg-[#EAE8E1] rounded-lg p-2.5 flex flex-col justify-between border border-[#D5D3CC] relative overflow-hidden">
                <div className="text-[10px] font-medium text-[#151B1A]">New Delhi • 42 Local Leads</div>
                <div className="bg-white/95 p-2 rounded shadow-2xs text-[10px]">
                  <b className="text-[11px] block text-[#171918]">The Urban Kitchen</b>
                  <span className="text-[#68717D] text-[9px]">Restaurant • Connaught Place</span>
                  <div className="text-amber-500 text-[10px] font-bold mt-0.5">★★★★☆ 4.6</div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FAF9F6] text-[#171918] rounded-xl p-4 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase text-[#25835B]">Step 02</span>
              </div>
              <h3 className="text-xs font-bold mb-3">Analyze &amp; Research</h3>
              <div className="h-32 bg-[#EEF2FF] rounded-lg p-2.5 flex flex-col justify-between border border-[#C7D2FE] text-[10px]">
                <div className="flex items-center justify-between font-bold text-[#3730A3]">
                  <span>Website Audit</span>
                  <span className="text-red-500 font-bold">62/100</span>
                </div>
                <div className="space-y-1 text-[9px]">
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle size={10} /> <span>Mobile load &gt; 4.8s</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle size={10} /> <span>PDF menu unindexed</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 size={10} /> <span>High organic reviews</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FAF9F6] text-[#171918] rounded-xl p-4 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase text-[#25835B]">Step 03</span>
              </div>
              <h3 className="text-xs font-bold mb-3">AI Outreach</h3>
              <div className="h-32 bg-white rounded-lg p-2.5 flex flex-col justify-between border border-[#E7E7E2] text-[9px] shadow-inner">
                <div>
                  <div className="font-semibold text-gray-700">To: owner@theurbankitchen...</div>
                  <div className="text-gray-500 truncate">Subject: Idea for dinner bookings</div>
                </div>
                <p className="text-gray-600 italic line-clamp-3">
                  &ldquo;I noticed your mobile site is taking 5 seconds to load menus, losing bookings to Connaught Bistro...&rdquo;
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#FAF9F6] text-[#171918] rounded-xl p-4 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase text-[#25835B]">Step 04</span>
              </div>
              <h3 className="text-xs font-bold mb-3">Client Conversion</h3>
              <div className="h-32 bg-[#ECFDF5] rounded-lg p-2.5 flex flex-col justify-between border border-[#A7F3D0] text-[10px]">
                <div className="flex items-center gap-1.5 font-bold text-[#065F46]">
                  <Calendar size={12} /> Meeting Scheduled
                </div>
                <div className="text-[9px] text-gray-600">
                  Thu, 11:00 AM - 11:30 AM<br />
                  Lead: The Urban Kitchen
                </div>
                <span className="text-[#25835B] font-bold text-[9px]">Status: Discussion →</span>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-[#FAF9F6] text-[#171918] rounded-xl p-4 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase text-[#25835B]">Step 05</span>
              </div>
              <h3 className="text-xs font-bold mb-3">Project Handoff</h3>
              <div className="h-32 bg-[#F8F6F0] rounded-lg p-2.5 flex flex-col justify-between border border-[#E7E7E2] text-[9px]">
                <div className="font-bold text-[#171918]">Brief &amp; Assets Ready</div>
                <ul className="space-y-1 text-gray-600 text-[8.5px]">
                  <li>☑ Technical Requirements</li>
                  <li>☑ Next.js Responsive Layout</li>
                  <li>☑ Direct Table Booking</li>
                </ul>
                <div className="text-[9px] text-[#151B1A] font-semibold">Contract: ₹45,000</div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-[#FAF9F6] text-[#171918] rounded-xl p-4 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase text-[#25835B]">Step 06</span>
              </div>
              <h3 className="text-xs font-bold mb-3">Live Website</h3>
              <div className="h-32 bg-[#151B1A] text-white rounded-lg p-2.5 flex flex-col justify-between text-[9px]">
                <div className="text-amber-300 font-serif font-bold text-[10px]">THE URBAN KITCHEN</div>
                <p className="text-[8px] text-gray-300">Flavors. Memorable Experiences.</p>
                <div className="bg-[#25835B] text-white text-center py-1 rounded font-bold text-[8px]">
                  Reserve Table Online
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
