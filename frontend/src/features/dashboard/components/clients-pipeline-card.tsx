"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";

interface PipelineClient {
  id: string;
  name: string;
  service: string;
  amount: string;
  priority: string;
}

export function ClientsPipelineCard() {
  const [clients, setClients] = useState<PipelineClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/clients");
        if (res.ok) {
          const json = await res.json();
          const list = json.clients || (json.success && Array.isArray(json.data) ? json.data : (Array.isArray(json.data) ? json.data : []));
          if (Array.isArray(list) && list.length > 0) {
            setClients(list.map((c: any) => ({
              id: c._id || c.clientId || c.id,
              name: c.businessName || c.name || "Client",
              service: c.type || "Web Development",
              amount: c.totalValue || "₹25,000",
              priority: c.status === "Active" ? "High" : "Medium",
            })));
          } else {
            setClients([]);
          }
        } else {
          setClients([]);
        }
      } catch {
        setClients([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#171918] dark:text-white">Clients Pipeline</h3>
        <Link
          href="/clients"
          className="text-xs font-semibold text-[#10251f] hover:text-[#0da66c] dark:text-emerald-400 inline-flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight size={12} />
        </Link>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-gray-400">Loading pipeline...</div>
      ) : clients.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 mb-2">
            <Briefcase size={18} />
          </div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Pipeline is clean</p>
          <p className="text-[11px] text-gray-400 mt-0.5 mb-3">Convert qualified leads to track clients and deal stages.</p>
          <Link
            href="/leads"
            className="px-3 py-1 rounded-md bg-[#111614] hover:bg-black text-white text-[11px] font-semibold transition-colors shadow-2xs"
          >
            Explore Leads →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[#F2F2EE] dark:divide-[#1C2723]">
          {clients.slice(0, 4).map((c) => (
            <div key={c.id} className="py-2.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#171918] dark:text-white">{c.name}</p>
                <p className="text-[11px] text-gray-400">{c.service}</p>
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {c.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
