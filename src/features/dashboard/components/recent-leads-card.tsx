"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MoreHorizontal } from "lucide-react";

interface RecentLeadItem {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  status: "New" | "Contacted" | "Replied" | "Interested" | "Converted";
  img: string;
}

const RECENT_LEADS: RecentLeadItem[] = [
  { id: "urbankitchen", name: "The Urban Kitchen", category: "Restaurant", location: "New Delhi", rating: 4.4, status: "New", img: "/assets/urban-kitchen.jpg" },
  { id: "glowbeauty", name: "Glow Beauty Salon", category: "Beauty", location: "New Delhi", rating: 4.6, status: "Contacted", img: "/assets/templates/salon.jpg" },
  { id: "fitzone", name: "FitZone Gym", category: "Fitness", location: "New Delhi", rating: 4.3, status: "Replied", img: "/assets/templates/gym.jpg" },
  { id: "smiledental", name: "Smile Dental Clinic", category: "Healthcare", location: "New Delhi", rating: 4.8, status: "Interested", img: "/assets/templates/clinic.jpg" },
  { id: "grandplaza", name: "Hotel Grand Plaza", category: "Hotel", location: "New Delhi", rating: 4.2, status: "New", img: "/assets/templates/hotel.jpg" },
  { id: "stylefashion", name: "Style Fashion Store", category: "Retail", location: "New Delhi", rating: 4.1, status: "Contacted", img: "/assets/templates/ecommerce.jpg" },
  { id: "citycare", name: "City Care Clinic", category: "Healthcare", location: "New Delhi", rating: 4.7, status: "Converted", img: "/assets/templates/clinic.jpg" },
];

export function RecentLeadsCard() {
  const getBadgeStyle = (status: RecentLeadItem["status"]) => {
    switch (status) {
      case "New":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Contacted":
        return "bg-sky-50 text-sky-700 border border-sky-200";
      case "Replied":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Interested":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Converted":
        return "bg-green-50 text-green-700 border border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  return (
    <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#171918]">Recent Leads</h3>
        <Link
          href="/leads"
          className="text-xs font-semibold text-gray-500 hover:text-[#171918] inline-flex items-center gap-1"
        >
          View All <ArrowRight size={12} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-[#68717D] text-[11px]">
              <th className="pb-2 font-medium">Business ⌄</th>
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium">Location ⌄</th>
              <th className="pb-2 font-medium">Rating ⌄</th>
              <th className="pb-2 font-medium">Status ⌄</th>
              <th className="pb-2 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {RECENT_LEADS.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-2.5 pr-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md overflow-hidden bg-gray-100 relative shrink-0">
                      <Image src={lead.img} alt={lead.name} fill className="object-cover" />
                    </div>
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-semibold text-[#171918] hover:text-[#3568E8] truncate max-w-[120px]"
                    >
                      {lead.name}
                    </Link>
                  </div>
                </td>
                <td className="py-2.5 pr-2 text-gray-500 text-[11px]">{lead.category}</td>
                <td className="py-2.5 pr-2 text-gray-500 text-[11px] whitespace-nowrap">{lead.location}</td>
                <td className="py-2.5 pr-2 text-amber-500 font-bold text-[11px] whitespace-nowrap">
                  ★ {lead.rating}
                </td>
                <td className="py-2.5 pr-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getBadgeStyle(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-black">
                    <MoreHorizontal size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

