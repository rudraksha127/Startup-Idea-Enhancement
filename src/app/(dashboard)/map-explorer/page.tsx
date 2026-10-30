"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  Bookmark,
  ChevronDown,
  Plus,
  Mail,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  SlidersHorizontal,
  FolderPlus,
  Compass,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  FileText,
  Phone,
  Clock,
  Globe,
} from "lucide-react";

interface BusinessResult {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  category: string;
  distance: string;
  address: string;
  phone: string;
  website: string;
  img: string;
  opportunityScore: number;
  hours: string;
  priceRange: string;
  source: string;
}

const BUSINESS_RESULTS: BusinessResult[] = [
  { id: "1", name: "The Urban Kitchen", rating: 4.4, reviews: 1234, category: "Restaurant", distance: "0.8 km", address: "Connaught Place, New Delhi 110001", phone: "+91 98765 43210", website: "https://theurbankitchen.in", img: "/assets/urban-kitchen.jpg", opportunityScore: 8.5, hours: "Open • Closes 11:00 PM", priceRange: "₹₹ (Moderate)", source: "Google Maps" },
  { id: "2", name: "Spice Junction", rating: 4.6, reviews: 892, category: "Restaurant", distance: "1.2 km", address: "Vijay Nagar, Indore", phone: "+91 98260 11223", website: "https://spicejunction.example", img: "/assets/templates/restaurant.jpg", opportunityScore: 8.2, hours: "Open • Closes 10:30 PM", priceRange: "₹₹ (Moderate)", source: "Google Maps" },
  { id: "3", name: "Flavors of India", rating: 4.3, reviews: 764, category: "Restaurant", distance: "1.4 km", address: "South Extension, New Delhi", phone: "+91 98111 22334", website: "https://flavorsofindia.example", img: "/assets/urban-kitchen.jpg", opportunityScore: 7.9, hours: "Open • Closes 11:30 PM", priceRange: "₹₹₹ (Upscale)", source: "Google Maps" },
  { id: "4", name: "Tandoori Nights", rating: 4.1, reviews: 986, category: "Restaurant", distance: "1.8 km", address: "Hauz Khas, New Delhi", phone: "+91 98765 00112", website: "https://tandoorinights.example", img: "/assets/templates/restaurant.jpg", opportunityScore: 8.7, hours: "Open • Closes 12:00 AM", priceRange: "₹₹ (Moderate)", source: "Google Maps" },
  { id: "5", name: "Café Central", rating: 4.5, reviews: 632, category: "Cafe", distance: "2.1 km", address: "Palasia, Indore", phone: "+91 98261 44556", website: "https://cafecentral.example", img: "/assets/templates/restaurant.jpg", opportunityScore: 7.8, hours: "Open • Closes 9:00 PM", priceRange: "₹ (Budget)", source: "Google Maps" },
  { id: "6", name: "The Food Factory", rating: 4.2, reviews: 421, category: "Restaurant", distance: "2.3 km", address: "Karol Bagh, New Delhi", phone: "+91 98100 88990", website: "https://thefoodfactory.example", img: "/assets/urban-kitchen.jpg", opportunityScore: 8.4, hours: "Open • Closes 11:00 PM", priceRange: "₹₹ (Moderate)", source: "Google Maps" },
  { id: "7", name: "Hotel Grand Plaza", rating: 4.4, reviews: 512, category: "Hotel", distance: "2.5 km", address: "Aerocity, New Delhi", phone: "+91 98990 12345", website: "https://grandplaza.example", img: "/assets/templates/hotel.jpg", opportunityScore: 9.1, hours: "Open 24 Hours", priceRange: "₹₹₹₹ (Luxury)", source: "Google Maps" },
  { id: "8", name: "Luxe Glow Salon & Spa", rating: 4.7, reviews: 340, category: "Salon", distance: "1.1 km", address: "Saket Nagar, Indore", phone: "+91 98260 45678", website: "", img: "/assets/templates/salon.jpg", opportunityScore: 9.3, hours: "Open • Closes 8:30 PM", priceRange: "₹₹ (Moderate)", source: "Local Registry" },
  { id: "9", name: "Iron & Pulse Fitness Club", rating: 4.8, reviews: 450, category: "Gym", distance: "1.9 km", address: "AB Road, Indore", phone: "+91 98260 99887", website: "", img: "/assets/templates/restaurant.jpg", opportunityScore: 8.9, hours: "Open • Closes 10:00 PM", priceRange: "₹₹ (Moderate)", source: "Local Registry" },
  { id: "10", name: "City Care Specialty Clinic", rating: 4.6, reviews: 620, category: "Clinic", distance: "2.8 km", address: "Old Palasia, Indore", phone: "+91 98260 77889", website: "https://citycare.example", img: "/assets/templates/clinic.jpg", opportunityScore: 8.6, hours: "Open • Closes 8:00 PM", priceRange: "₹₹₹ (Upscale)", source: "Local Registry" },
  { id: "11", name: "Urban Elegance Boutique", rating: 4.3, reviews: 180, category: "Retail", distance: "3.2 km", address: "Treasure Island Mall, Indore", phone: "+91 98260 33445", website: "", img: "/assets/templates/restaurant.jpg", opportunityScore: 8.4, hours: "Open • Closes 9:30 PM", priceRange: "₹₹ (Moderate)", source: "Local Registry" },
  { id: "12", name: "Apex Coding Academy", rating: 4.9, reviews: 510, category: "Education", distance: "0.6 km", address: "Vijay Nagar, Indore", phone: "+91 98260 22331", website: "https://apexcoding.example", img: "/assets/templates/restaurant.jpg", opportunityScore: 9.0, hours: "Open • Closes 7:00 PM", priceRange: "₹₹₹ (Upscale)", source: "Local Registry" },
];

const CATEGORY_PILLS = [
  { name: "Restaurant", icon: "🍴" },
  { name: "Cafe", icon: "☕" },
  { name: "Salon", icon: "💇" },
  { name: "Gym", icon: "🏋️" },
  { name: "Clinic", icon: "🏥" },
  { name: "Hotel", icon: "🏨" },
  { name: "Retail", icon: "🛍️" },
  { name: "Education", icon: "🎓" },
  { name: "Automotive", icon: "🚗" },
  { name: "Healthcare", icon: "🩺" },
  { name: "More", icon: "⌄" },
];

export default function MapExplorerPage() {
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessResult>(BUSINESS_RESULTS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Indore, Madhya Pradesh");
  const [activeCategoryPill, setActiveCategoryPill] = useState("Restaurant");
  const [mapMode, setMapMode] = useState<"map" | "satellite">("map");
  const [previewTab, setPreviewTab] = useState("Overview");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addingLead, setAddingLead] = useState(false);
  const [savedLeadMap, setSavedLeadMap] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddLead = async (biz: BusinessResult) => {
    if (savedLeadMap[biz.id] || addingLead) return;
    setAddingLead(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: biz.name,
          category: biz.category,
          address: biz.address,
          city: selectedCity.split(",")[0].trim(),
          phone: biz.phone,
          website: biz.website,
          rating: biz.rating,
          reviewCount: biz.reviews,
          opportunityScore: biz.opportunityScore,
          source: "Map Explorer",
          status: "New",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedLeadMap((prev) => ({ ...prev, [biz.id]: true }));
        showToast(`✓ Added "${biz.name}" to Leads database!`);
      } else {
        showToast(`Error: ${data.error || "Failed to add lead"}`);
      }
    } catch {
      showToast("Network error saving lead to database");
    } finally {
      setAddingLead(false);
    }
  };

  const filteredBusinesses = BUSINESS_RESULTS.filter((biz) => {
    const matchesCat =
      activeCategoryPill === "All" ||
      activeCategoryPill === "More" ||
      biz.category.toLowerCase() === activeCategoryPill.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      biz.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      biz.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
            Map Explorer
          </h1>
          <p className="text-xs text-[#68717D] mt-0.5">
            Discover businesses with real opportunities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("Loaded 4 saved search presets: Restaurants (Indore), Cafes (Jaipur), Clinics (Delhi), Salons (Indore)")}
            className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs"
          >
            Saved Searches
          </button>
          <button
            onClick={() => showToast("Locations: Indore, MP (Active) • Jaipur, RJ • New Delhi, DL")}
            className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs"
          >
            My Locations
          </button>
          <button
            onClick={() => showToast("Scanning new businesses in " + selectedCity + "...")}
            className="h-8 px-3.5 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus size={14} />
            <span>New Search</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-xl border border-[#E7E7E2] shadow-2xs text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search business category or name..."
            className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-gray-200 bg-[#FAF9F6] text-xs focus:bg-white focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <button className="h-8 px-3 rounded-lg border border-gray-200 bg-white inline-flex items-center gap-1.5 text-gray-700 font-medium">
          <MapPin size={12} className="text-gray-500" />
          <span>{selectedCity}</span>
          <ChevronDown size={11} className="text-gray-400" />
        </button>

        <button className="h-8 px-3 rounded-lg border border-gray-200 bg-white inline-flex items-center gap-1.5 text-gray-700 font-medium">
          <span>Category</span>
          <ChevronDown size={11} className="text-gray-400" />
        </button>

        <button className="h-8 px-3 rounded-lg border border-gray-200 bg-white inline-flex items-center gap-1.5 text-gray-700 font-medium">
          <span>Rating</span>
          <ChevronDown size={11} className="text-gray-400" />
        </button>

        <button className="h-8 px-3 rounded-lg border border-gray-200 bg-white inline-flex items-center gap-1.5 text-gray-700 font-medium">
          <span>Min Reviews</span>
          <ChevronDown size={11} className="text-gray-400" />
        </button>

        <button className="h-8 px-3 rounded-lg border border-gray-200 bg-white inline-flex items-center gap-1.5 text-gray-700 font-medium">
          <span>Radius: 5 km</span>
          <ChevronDown size={11} className="text-gray-400" />
        </button>

        <button className="h-8 px-3 rounded-lg border border-gray-200 bg-white inline-flex items-center gap-1.5 text-gray-700 font-medium">
          <SlidersHorizontal size={12} className="text-gray-500" />
          <span>More Filters</span>
        </button>
      </div>

      {/* Category Quick Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        {CATEGORY_PILLS.map((pill) => {
          const isActive = activeCategoryPill === pill.name;
          return (
            <button
              key={pill.name}
              onClick={() => setActiveCategoryPill(pill.name)}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors border flex items-center gap-1 ${
                isActive
                  ? "bg-[#171918] text-white border-[#171918]"
                  : "bg-white text-gray-600 border-[#E7E7E2] hover:bg-gray-50 hover:text-black"
              }`}
            >
              <span>{pill.icon}</span>
              <span>{pill.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3-Column Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left Column: Businesses Found List */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-[#E7E7E2] p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs">
            <span className="font-bold text-[#171918]">Businesses Found ({filteredBusinesses.length})</span>
            <span className="text-gray-400 text-[11px] cursor-pointer hover:text-black">
              Sort: Relevance ⌄
            </span>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {(filteredBusinesses.length > 0 ? filteredBusinesses : BUSINESS_RESULTS).map((biz) => {
              const isSelected = selectedBusiness.id === biz.id;
              return (
                <div
                  key={biz.id}
                  onClick={() => setSelectedBusiness(biz)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-blue-50/50 border-blue-200 shadow-2xs"
                      : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 relative shrink-0 border border-gray-200">
                      <Image src={biz.img} alt={biz.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-[#171918] truncate">{biz.name}</div>
                      <div className="text-[11px] text-amber-500 font-semibold flex items-center gap-1">
                        ★ {biz.rating} <span className="text-gray-400 font-normal">({biz.reviews})</span>
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {biz.category} • {biz.distance}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button className="px-2 py-1 rounded bg-[#FAF9F6] border border-gray-200 hover:bg-gray-100 text-[10px] font-semibold text-gray-700">
                      View
                    </button>
                    <button className="p-1 rounded text-gray-400 hover:text-black">
                      <Bookmark size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>Page 1 of 285</span>
            <div className="flex items-center gap-1">
              <button className="px-1.5 py-0.5 rounded border border-gray-200 bg-white">‹</button>
              <button className="px-2 py-0.5 rounded bg-[#171918] text-white font-bold">1</button>
              <button className="px-2 py-0.5 rounded hover:bg-gray-100">2</button>
              <button className="px-2 py-0.5 rounded hover:bg-gray-100">3</button>
              <button className="px-1.5 py-0.5 rounded border border-gray-200 bg-white">›</button>
            </div>
          </div>
        </div>

        {/* Center Column: Interactive Map Canvas */}
        <div className="xl:col-span-5 bg-white rounded-xl border border-[#E7E7E2] overflow-hidden shadow-xs relative flex flex-col h-[700px]">
          {/* Map Controls Header */}
          <div className="p-3 bg-white/90 backdrop-blur border-b border-gray-200/80 flex items-center justify-between text-xs z-10">
            <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
              <button
                onClick={() => setMapMode("map")}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  mapMode === "map" ? "bg-white text-[#171918] shadow-2xs" : "text-gray-500"
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setMapMode("satellite")}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  mapMode === "satellite" ? "bg-white text-[#171918] shadow-2xs" : "text-gray-500"
                }`}
              >
                Satellite
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-gray-700 font-medium cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#171918] focus:ring-0" />
                <span>Search in this area</span>
              </label>
              <button className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-[11px] font-semibold text-gray-700 shadow-2xs">
                Draw Area
              </button>
            </div>
          </div>

          {/* Map Visual (Simulated Vector Map Canvas with Street Grid & Cluster Nodes) */}
          <div className="flex-1 bg-[#E8EDE5] relative overflow-hidden flex items-center justify-center">
            {/* Street Grid pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#D3DDD0" strokeWidth="1.5" />
                  <path d="M 0 30 L 60 30" fill="none" stroke="#DDE5DB" strokeWidth="0.8" />
                  <path d="M 30 0 L 30 60" fill="none" stroke="#DDE5DB" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* City watermark */}
            <div className="text-center pointer-events-none select-none">
              <div className="text-4xl font-bold text-gray-400/40 tracking-wider font-serif">Indore</div>
              <div className="text-2xl font-bold text-gray-400/30">इंदौर</div>
            </div>

            {/* Simulated Cluster Pins */}
            <div className="absolute top-[28%] left-[45%] w-10 h-10 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
              28
            </div>
            <div className="absolute top-[40%] left-[25%] w-8 h-8 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
              12
            </div>
            <div className="absolute top-[65%] left-[60%] w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
              15
            </div>
            <div className="absolute top-[78%] left-[55%] w-9 h-9 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
              24
            </div>
            <div className="absolute top-[32%] left-[75%] w-8 h-8 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
              8
            </div>

            {/* Single pin indicator */}
            <div className="absolute top-[38%] left-[55%] flex flex-col items-center cursor-pointer">
              <div className="px-2 py-0.5 rounded bg-[#171918] text-white text-[10px] font-bold shadow-md whitespace-nowrap mb-0.5">
                {selectedBusiness.name}
              </div>
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-md animate-pulse" />
            </div>

            {/* Zoom controls */}
            <div className="absolute right-4 bottom-14 flex flex-col rounded-lg bg-white border border-gray-200 shadow-md overflow-hidden text-xs">
              <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 font-bold">+</button>
              <div className="h-px bg-gray-200" />
              <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 font-bold">−</button>
            </div>
          </div>

          {/* Bottom Pin Legend */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Restaurant</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Cafe</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Salon</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Gym</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Hotel</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-400" /> Other</span>
          </div>
        </div>

        {/* Right Column: Selected Business Preview Panel */}
        <div className="xl:col-span-4 bg-white rounded-xl border border-[#E7E7E2] p-4 space-y-4 shadow-xs">
          {/* Photos carousel header */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-200">
            <Image
              src={selectedBusiness.img}
              alt={selectedBusiness.name}
              fill
              className="object-cover"
            />
            <button className="absolute top-2.5 right-2.5 p-1 rounded-full bg-black/50 text-white hover:bg-black/80">
              <X size={14} />
            </button>
            <div className="absolute inset-y-0 left-2 flex items-center">
              <button className="w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/70">
                <ChevronLeft size={14} />
              </button>
            </div>
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button className="w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/70">
                <ChevronRight size={14} />
              </button>
            </div>
            <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
              1 / 8
            </span>
          </div>

          {/* Business title & badges */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg text-[#171918]">{selectedBusiness.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                High Potential
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mt-0.5">
              <span>★ {selectedBusiness.rating}</span>
              <span className="text-gray-400 font-normal">({selectedBusiness.reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
              <span>{selectedBusiness.category} ⌄</span>
              <span>•</span>
              <span>{selectedBusiness.address.split(",")[1] || "New Delhi"}</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">{selectedBusiness.hours}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => handleAddLead(selectedBusiness)}
              disabled={addingLead || savedLeadMap[selectedBusiness.id]}
              className={`flex-1 h-8 rounded-lg font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
                savedLeadMap[selectedBusiness.id]
                  ? "bg-emerald-600 text-white cursor-default"
                  : "bg-[#171918] hover:bg-[#232B29] text-white"
              }`}
            >
              {addingLead ? (
                <span>Adding...</span>
              ) : savedLeadMap[selectedBusiness.id] ? (
                <>
                  <CheckCircle2 size={13} />
                  <span>Added to Leads</span>
                </>
              ) : (
                <>
                  <Plus size={13} />
                  <span>Add to Leads</span>
                </>
              )}
            </button>
            <Link
              href={`/outreach?lead=${encodeURIComponent(selectedBusiness.name)}`}
              className="h-8 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold inline-flex items-center gap-1 shadow-2xs"
            >
              <Mail size={12} /> Send Email
            </Link>
            <a
              href={`https://wa.me/${selectedBusiness.phone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(selectedBusiness.name)}%20team,%20noticed%20your%20presence`}
              target="_blank"
              rel="noreferrer"
              className="h-8 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-emerald-700 font-semibold inline-flex items-center gap-1 shadow-2xs"
            >
              <MessageCircle size={12} /> WhatsApp
            </a>
            <button
              onClick={() => showToast(`Lead info: ${selectedBusiness.name} • ${selectedBusiness.phone}`)}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-400 hover:text-black shadow-2xs"
            >
              <MoreHorizontal size={13} />
            </button>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1 border-b border-gray-100 text-xs font-semibold overflow-x-auto scrollbar-none pb-1">
            {["Overview", "Reviews", "Photos", "Website Audit", "AI Insights"].map((tab) => (
              <button
                key={tab}
                onClick={() => setPreviewTab(tab)}
                className={`px-2 py-1 rounded transition-colors ${
                  previewTab === tab ? "bg-[#171918] text-white font-bold" : "text-gray-500 hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {previewTab === "Overview" && (
            <>
              {/* Business Information List */}
              <div className="space-y-2 text-xs border-b border-gray-100 pb-3">
                <span className="font-bold text-[#171918] text-xs block">Business Information</span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-1"><MapPin size={11} /> Address</span>
                    <span className="font-medium text-gray-700 text-right max-w-[200px] truncate">{selectedBusiness.address}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-1"><Phone size={11} /> Phone</span>
                    <span className="font-medium text-gray-700">{selectedBusiness.phone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-1"><Globe size={11} /> Website</span>
                    <a href={selectedBusiness.website} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline flex items-center gap-1">
                      <span>{selectedBusiness.website.replace("https://", "")}</span>
                      <ExternalLink size={9} />
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Category</span>
                    <span className="font-medium text-gray-700">{selectedBusiness.category} • Food &amp; Beverage</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-1"><Clock size={11} /> Hours</span>
                    <span className="font-medium text-gray-700">{selectedBusiness.hours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price Range</span>
                    <span className="font-medium text-gray-700">{selectedBusiness.priceRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Reviews</span>
                    <span className="font-medium text-gray-700">{selectedBusiness.reviews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Source</span>
                    <span className="font-medium text-gray-700">{selectedBusiness.source}</span>
                  </div>
                </div>
              </div>

              {/* AI Opportunity Analysis Card */}
              <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#171918]">AI Opportunity Analysis</span>
                  <span className="font-bold text-emerald-700 text-base">
                    {selectedBusiness.opportunityScore}/10
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-gray-600">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 size={12} /> No modern responsive website found
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 size={12} /> High number of verified customer reviews
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 size={12} /> Weak social media link presence
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 size={12} /> Strong foot-traffic prime location
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 size={12} /> Opportunity: Digital menu &amp; table reservations
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Reviews */}
          {previewTab === "Reviews" && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="font-bold text-[#171918]">Customer Reviews ({selectedBusiness.reviews.toLocaleString()})</span>
                <span className="text-amber-500 font-bold flex items-center gap-1">
                  <Star size={12} className="fill-amber-400 text-amber-400" /> {selectedBusiness.rating} / 5.0
                </span>
              </div>
              <div className="space-y-2.5">
                {[
                  { author: "Ananya Deshmukh", rating: 5, date: "3 days ago", text: "Food was fantastic! But tried finding their menu online before coming and couldn't find a proper website." },
                  { author: "Vikram Singhal", rating: 4, date: "1 week ago", text: "Ambience is great for family dinners. A website with online table booking would make weekends much easier!" },
                  { author: "Rohan Patel", rating: 5, date: "2 weeks ago", text: "Best signature pasta in Indore! Needs an official website with catering inquiries." }
                ].map((rev, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-100 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-gray-800">{rev.author}</span>
                      <span className="text-gray-400 text-[10px]">{rev.date}</span>
                    </div>
                    <div className="flex text-amber-400 text-[10px]">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-600 italic">"{rev.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Photos */}
          {previewTab === "Photos" && (
            <div className="space-y-2 text-xs">
              <span className="font-bold text-[#171918] block pb-1 border-b border-gray-100">Location Photos</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { title: "Main Dining", img: selectedBusiness.img },
                  { title: "Signature Dish", img: "/assets/urban-kitchen.jpg" },
                  { title: "Outdoor Seating", img: "/assets/templates/restaurant.jpg" },
                  { title: "Storefront", img: selectedBusiness.img }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="w-full h-20 relative rounded-lg overflow-hidden border border-gray-200">
                      <Image src={item.img} alt={item.title} fill className="object-cover" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium block truncate">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Website Audit */}
          {previewTab === "Website Audit" && (
            <div className="space-y-3 text-xs">
              <span className="font-bold text-[#171918] block pb-1 border-b border-gray-100">Live Website Diagnostic</span>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-lg bg-red-50 border border-red-100">
                  <div className="text-base font-bold text-red-600">42 / 100</div>
                  <div className="text-[10px] text-gray-500 font-medium">PageSpeed (Mobile 4G)</div>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="text-base font-bold text-amber-600">48 / 100</div>
                  <div className="text-[10px] text-gray-500 font-medium">Local SEO Visibility</div>
                </div>
                <div className="p-2 rounded-lg bg-red-50 border border-red-100">
                  <div className="text-base font-bold text-red-600">38 / 100</div>
                  <div className="text-[10px] text-gray-500 font-medium">Mobile Usability</div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="text-base font-bold text-emerald-600">85 / 100</div>
                  <div className="text-[10px] text-gray-500 font-medium">SSL / HTTPS</div>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-100 text-[11px] text-gray-600 space-y-1">
                <div className="font-semibold text-gray-800">Critical Issues Found:</div>
                <div className="text-red-600">✗ Missing mobile viewport responsive meta tags</div>
                <div className="text-red-600">✗ Hero banner 4.8MB uncompressed image</div>
                <div className="text-amber-600">⚠ No Open Graph social share cards</div>
              </div>
            </div>
          )}

          {/* Tab 5: AI Insights */}
          {previewTab === "AI Insights" && (
            <div className="space-y-3 text-xs">
              <span className="font-bold text-[#171918] block pb-1 border-b border-gray-100">Outreach Intelligence</span>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="font-bold text-[11px]">Estimated Opportunity Value</div>
                <div className="text-base font-bold text-emerald-700">₹1,40,000 / month</div>
                <p className="text-[10px] text-emerald-800">Lost revenue from ~140 uncaptured weekend table reservations.</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                <div className="font-bold text-[11px]">Recommended Pitch Hook</div>
                <p className="text-[10px] text-blue-800">
                  "Hi {selectedBusiness.name} team, noticed your 1,200+ five-star Google reviews. We built a fast modern reservation website demo that can capture 30+ extra bookings every weekend."
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions Links */}
          <div className="pt-2 border-t border-gray-100 space-y-2 text-xs">
            <span className="font-bold text-xs text-[#171918]">Quick Actions</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/outreach"
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Mail size={12} className="text-blue-600" />
                <span>Generate Outreach</span>
              </Link>
              <Link
                href={`/leads/${selectedBusiness.id === "1" ? "urbankitchen" : selectedBusiness.id}`}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Compass size={12} className="text-emerald-600" />
                <span>Run Website Audit</span>
              </Link>
              <Link
                href="/projects"
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold inline-flex items-center gap-1.5 shadow-2xs"
              >
                <FileText size={12} className="text-purple-600" />
                <span>Developer Brief</span>
              </Link>
              <Link
                href="/projects"
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold inline-flex items-center gap-1.5 shadow-2xs"
              >
                <FolderPlus size={12} className="text-amber-600" />
                <span>Create Project</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#171918] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
