"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const TEMPLATES = [
  { name: "Restaurant Template", img: "/assets/templates/restaurant.jpg" },
  { name: "Salon Template", img: "/assets/templates/salon.jpg" },
  { name: "Gym Template", img: "/assets/templates/gym.jpg" },
  { name: "Clinic Template", img: "/assets/templates/clinic.jpg" },
  { name: "Hotel Template", img: "/assets/templates/hotel.jpg" },
  { name: "Ecommerce Template", img: "/assets/templates/ecommerce.jpg" },
];

export function WebsiteBuilderCard() {
  return (
    <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-xs">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-sm font-bold text-[#171918]">Website Builder</h3>
        <Link
          href="/templates"
          className="text-xs font-semibold text-gray-500 hover:text-[#171918] inline-flex items-center gap-1"
        >
          View All <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {TEMPLATES.map((tmpl) => (
          <Link
            key={tmpl.name}
            href={`/templates?selected=${encodeURIComponent(tmpl.name)}`}
            className="group block text-center"
          >
            <div className="aspect-[4/3] w-full relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group-hover:shadow-md transition-all">
              <Image
                src={tmpl.img}
                alt={tmpl.name}
                fill
                sizes="120px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="text-[10px] font-medium text-gray-700 truncate mt-1.5 group-hover:text-black">
              {tmpl.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
