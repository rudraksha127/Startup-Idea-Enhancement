"use client";

import { AlertCircle, AlertTriangle, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

interface AuditTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lead: any;
}

export function AuditTab({ lead }: AuditTabProps) {
  const audit = lead.websiteAudit || {
    lcp: "4.8s",
    fid: "190ms",
    cls: "0.28",
    fcp: "2.6s",
    issues: [
      { type: "critical", title: "Mobile Page Load Exceeds 4.8s", detail: "Heavy uncompressed hero banner causes high bounce rate on 4G networks." },
      { type: "critical", title: "Missing Mobile Touch Targets", detail: "Navigation buttons overlap on screens smaller than 390px width." },
      { type: "warning", title: "Unoptimized Static PDF Menu", detail: "Search engines cannot index menu items, costing ranking for dish queries." },
      { type: "warning", title: "No SSL Certificate Automatic Redirect", detail: "HTTP traffic does not force redirect to HTTPS on older browsers." },
      { type: "passed", title: "Valid OpenGraph Social Metas", detail: "Twitter and Facebook preview cards display correct business imagery." },
      { type: "passed", title: "Responsive Viewport Tag Present", detail: "HTML headers include initial-scale=1 viewport directives." },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Core Web Vitals metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
          <div className="text-[11px] font-semibold text-gray-500">Largest Contentful Paint</div>
          <div className="text-2xl font-bold font-serif text-red-600 mt-1">{audit.lcp || "4.8s"}</div>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700">
            Poor (&gt; 2.5s)
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
          <div className="text-[11px] font-semibold text-gray-500">First Input Delay</div>
          <div className="text-2xl font-bold font-serif text-amber-600 mt-1">{audit.fid || "190ms"}</div>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">
            Needs Work (&gt; 100ms)
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
          <div className="text-[11px] font-semibold text-gray-500">Cumulative Layout Shift</div>
          <div className="text-2xl font-bold font-serif text-red-600 mt-1">{audit.cls || "0.28"}</div>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700">
            High Shift (&gt; 0.1)
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
          <div className="text-[11px] font-semibold text-gray-500">First Contentful Paint</div>
          <div className="text-2xl font-bold font-serif text-amber-600 mt-1">{audit.fcp || "2.6s"}</div>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">
            Moderate
          </span>
        </div>
      </div>

      {/* Issues Breakdown List */}
      <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-[#101413] pb-2 border-b border-gray-100 flex items-center gap-2">
          <Zap size={16} className="text-[#0da66c]" />
          <span>Audit Diagnostics &amp; Evidence</span>
        </h3>

        <div className="divide-y divide-gray-100">
          {(audit.issues || []).map((issue: { type: string; title: string; detail: string }, idx: number) => {
            const isCrit = issue.type === "critical";
            const isWarn = issue.type === "warning";
            const isPass = issue.type === "passed";

            return (
              <div key={idx} className="py-3 flex items-start gap-3 text-xs">
                <span className="mt-0.5 shrink-0">
                  {isCrit && <AlertCircle size={15} className="text-red-500" />}
                  {isWarn && <AlertTriangle size={15} className="text-amber-500" />}
                  {isPass && <CheckCircle2 size={15} className="text-green-600" />}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-[#101413]">{issue.title}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                        isCrit
                          ? "bg-red-50 text-red-700"
                          : isWarn
                          ? "bg-amber-50 text-amber-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {issue.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">{issue.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

