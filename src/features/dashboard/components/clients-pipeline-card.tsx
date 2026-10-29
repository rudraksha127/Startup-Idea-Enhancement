"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface PipelineClient {
  id: string;
  name: string;
  service: string;
  amount: string;
  priority: "High Priority" | "High" | "Medium" | "Completed";
  img: string;
}

const PIPELINE_COLUMNS: { title: string; count: number; clients: PipelineClient[] }[] = [
  {
    title: "Interested",
    count: 12,
    clients: [
      { id: "1", name: "Glow Beauty Salon", service: "Website + SEO", amount: "₹15,000", priority: "High Priority", img: "/assets/templates/salon.jpg" },
      { id: "2", name: "FitZone Gym", service: "Website + Booking", amount: "₹20,000", priority: "Medium", img: "/assets/templates/gym.jpg" },
      { id: "3", name: "City Care Clinic", service: "Website + Appointment", amount: "₹25,000", priority: "High", img: "/assets/templates/clinic.jpg" },
    ],
  },
  {
    title: "In Discussion",
    count: 8,
    clients: [
      { id: "4", name: "The Urban Kitchen", service: "Restaurant Website", amount: "₹30,000", priority: "High", img: "/assets/urban-kitchen.jpg" },
      { id: "5", name: "Style Fashion Store", service: "Ecommerce", amount: "₹40,000", priority: "Medium", img: "/assets/templates/ecommerce.jpg" },
      { id: "6", name: "Pet Care Clinic", service: "Website + SEO", amount: "₹18,000", priority: "Medium", img: "/assets/templates/clinic.jpg" },
    ],
  },
  {
    title: "Closed",
    count: 6,
    clients: [
      { id: "7", name: "Hotel Grand Plaza", service: "Website + Booking", amount: "₹35,000", priority: "Completed", img: "/assets/templates/hotel.jpg" },
      { id: "8", name: "Smile Dental Clinic", service: "Website + SEO", amount: "₹25,000", priority: "Completed", img: "/assets/templates/clinic.jpg" },
      { id: "9", name: "AutoFix Garage", service: "Website + SEO", amount: "₹18,000", priority: "Completed", img: "/assets/templates/restaurant.jpg" },
    ],
  },
];

export function ClientsPipelineCard() {
  const getPriorityStyle = (p: PipelineClient["priority"]) => {
    switch (p) {
      case "High Priority":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      case "High":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Medium":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  return (
    <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#171918]">Clients Pipeline</h3>
        <Link
          href="/clients"
          className="text-xs font-semibold text-gray-500 hover:text-[#171918] inline-flex items-center gap-1"
        >
          View All <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PIPELINE_COLUMNS.map((col) => (
          <div key={col.title} className="bg-[#FAF9F6] p-2.5 rounded-lg border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#171918] pb-1 border-b border-gray-200/60">
              <span>{col.title} ({col.count})</span>
              <span className="text-gray-400 text-[10px] cursor-pointer hover:text-black">+</span>
            </div>

            <div className="space-y-2">
              {col.clients.map((c) => (
                <div key={c.id} className="p-2 rounded-md bg-white border border-gray-200/80 shadow-2xs text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded overflow-hidden relative shrink-0 bg-gray-100">
                      <Image src={c.img} alt={c.name} fill className="object-cover" />
                    </div>
                    <span className="font-semibold text-[11px] text-[#171918] truncate flex-1">{c.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span className="truncate max-w-[90px]">{c.service}</span>
                    <span className="font-bold text-[#171918]">{c.amount}</span>
                  </div>
                  <div>
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${getPriorityStyle(c.priority)}`}>
                      {c.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

