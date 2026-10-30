"use client";

import { useState } from "react";
import { Send, CheckCircle2, Mail, Clock, Loader2, Sparkles } from "lucide-react";

interface CommunicationsTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lead: any;
  onOutreachSent: () => void;
}

const TEMPLATES = [
  {
    name: "Direct Table Booking Pitch",
    subject: "Quick idea for dinner reservations at {{businessName}}",
    body: `Hi there,

I noticed that {{businessName}} is one of the highest-rated spots in {{location}}, but your website doesn't offer an instant table reservation widget. Many guests looking for weekend dinner tables are booking at competitors with direct reservation buttons.

We built a fast Next.js reservation engine that integrates directly into your existing site with instant WhatsApp SMS confirmation — without paying 20% platform commissions.

Would you be open to a 5-minute preview next week?

Best regards,
Rudraksh
AgencyOS / Apex Digital`,
  },
  {
    name: "Mobile Speed & SEO Audit Pitch",
    subject: "{{businessName}} website audit — mobile loading delay",
    body: `Hi there,

Our audit engine ran a performance scan on {{businessName}}'s website and discovered that your mobile pages currently take over 4.8 seconds to load, largely due to uncompressed image assets and PDF menu files.

Google penalizes slow mobile speeds in local search results, costing you high-intent local diner queries every weekend.

We can optimize your digital presence and provide a modern, accessible web redesign. Here is a summary of our findings. Let us know if you'd like to review the full brief.

Best regards,
Rudraksh
AgencyOS / Apex Digital`,
  },
];

export function CommunicationsTab({ lead, onOutreachSent }: CommunicationsTabProps) {
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [toEmail, setToEmail] = useState(lead.email || "info@theurbankitchen.example");
  const [subject, setSubject] = useState(
    TEMPLATES[0].subject.replace("{{businessName}}", lead.businessName)
  );
  const [body, setBody] = useState(
    TEMPLATES[0].body
      .replace(/{{businessName}}/g, lead.businessName)
      .replace(/{{location}}/g, lead.location || "Connaught Place")
  );
  const [loading, setLoading] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const handleTemplateChange = (idx: number) => {
    setSelectedTemplateIndex(idx);
    const tmpl = TEMPLATES[idx];
    setSubject(tmpl.subject.replace("{{businessName}}", lead.businessName));
    setBody(
      tmpl.body
        .replace(/{{businessName}}/g, lead.businessName)
        .replace(/{{location}}/g, lead.location || "Connaught Place")
    );
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSentMessage(null);

    try {
      const res = await fetch(`/api/leads/${lead.slug || lead._id}/outreach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail,
          subject,
          body,
          templateUsed: TEMPLATES[selectedTemplateIndex].name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record outreach");
      }

      setSentMessage(data.message || "Outreach message draft recorded successfully!");
      onOutreachSent();
    } catch (err: unknown) {
      setSentMessage(err instanceof Error ? err.message : "Error sending outreach");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Composer Card */}
      <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Mail size={15} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#101413]">Personalized Outreach Composer</h3>
              <p className="text-[11px] text-gray-500">Autonomous email generator grounded in audit evidence</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Template:</span>
            <select
              value={selectedTemplateIndex}
              onChange={(e) => handleTemplateChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-lg bg-white font-semibold text-xs"
            >
              {TEMPLATES.map((t, idx) => (
                <option key={t.name} value={idx}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {sentMessage && (
          <div className="p-3 rounded-lg bg-[#eef9f2] border border-[#ccecd8] text-xs text-[#176e42] flex items-center gap-2 font-semibold">
            <CheckCircle2 size={15} />
            <span>{sentMessage}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-gray-700">To Email Address</label>
            <input
              type="email"
              required
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700">Subject Line</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700">Email Message Body</label>
            <textarea
              rows={8}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 bg-white font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Sparkles size={12} className="text-[#0da66c]" /> Auto-populates business name and location
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-[#101513] hover:bg-[#1a2c27] text-white font-bold inline-flex items-center gap-2 shadow"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>Send Outreach Draft</span>
            </button>
          </div>
        </form>
      </div>

      {/* Communications History / Timeline */}
      <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-2xs space-y-3">
        <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2">
          <Clock size={14} className="text-gray-500" /> Communications Stream
        </h4>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg bg-[#faf9f6] border border-gray-100 flex items-start justify-between">
            <div>
              <div className="font-bold text-[#101413]">Introductory Pitch Draft Created</div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Targeting dinner reservation leak to Connaught Bistro.
              </p>
            </div>
            <span className="text-[10px] text-gray-400">14 Mar 2024</span>
          </div>

          <div className="p-3 rounded-lg bg-[#faf9f6] border border-gray-100 flex items-start justify-between">
            <div>
              <div className="font-bold text-[#101413]">WhatsApp Message Dispatched</div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Follow-up sent to general manager: +91 98765 43210
              </p>
            </div>
            <span className="text-[10px] text-gray-400">15 Mar 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
}

