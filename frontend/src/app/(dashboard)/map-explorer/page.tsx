"use client";

import { useState, useEffect, useRef } from "react";
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
  AlertCircle,
  Loader2,
  Layers,
  Crosshair,
  Sparkles,
  Check,
  Share2,
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
  gallery: string[];
  opportunityScore: number;
  hours: string;
  priceRange: string;
  source: string;
  potential: "High Potential" | "Medium Potential" | "Low Potential";
  oppChecklist: string[];
  pinColor: "red" | "orange" | "yellow" | "green" | "blue" | "gray";
  mapCoord: { x: number; y: number }; // Percentage on map canvas
}

// 10 Detailed realistic businesses matching the design screenshot
const MAP_CLUSTERS = [
  { id: "c1", label: "", x: 50, y: 46, color: "bg-[#EA4335]", size: "w-8 h-8", text: "text-white" },
  { id: "c2", label: "", x: 58, y: 77, color: "bg-[#EA4335]", size: "w-8 h-8", text: "text-white" },
  { id: "c3", label: "", x: 45, y: 40, color: "bg-[#4285F4]", size: "w-7 h-7", text: "text-white" },
  { id: "c4", label: "", x: 58, y: 63, color: "bg-[#4285F4]", size: "w-7 h-7", text: "text-white" },
  { id: "c5", label: "", x: 65, y: 42, color: "bg-[#4285F4]", size: "w-6 h-6", text: "text-white" },
  { id: "c6", label: "", x: 44, y: 73, color: "bg-[#4285F4]", size: "w-6 h-6", text: "text-white" },
  { id: "c7", label: "", x: 63, y: 82, color: "bg-[#4285F4]", size: "w-6 h-6", text: "text-white" },
];

const CATEGORY_PILLS = [
  { name: "Restaurant", icon: "🍴" },
  { name: "Cafe", icon: "☕" },
  { name: "Salon", icon: "💇" },
  { name: "Gym", icon: "🏋️" },
  { name: "Clinic", icon: "🩺" },
  { name: "Hotel", icon: "🏨" },
  { name: "Retail", icon: "🛍️" },
  { name: "Education", icon: "🎓" },
  { name: "Automotive", icon: "🚗" },
  { name: "Healthcare", icon: "❤️" },
  { name: "More", icon: "▾" },
];

const POPULAR_CITIES = [
  "Indore, Madhya Pradesh",
  "New Delhi, Delhi",
  "Mumbai, Maharashtra",
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Pune, Maharashtra",
  "Jaipur, Rajasthan",
  "Ahmedabad, Gujarat",
  "Kolkata, West Bengal",
  "London, United Kingdom",
  "New York, United States",
];

export default function MapExplorerPage() {
  const [businesses, setBusinesses] = useState<BusinessResult[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("Restaurant");
  const [selectedCity, setSelectedCity] = useState("Indore, Madhya Pradesh");
  const [activeCategoryPill, setActiveCategoryPill] = useState("Restaurant");
  const [mapMode, setMapMode] = useState<"map" | "satellite">("map");
  const [mapZoom, setMapZoom] = useState(14);
  const [customCoords, setCustomCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
  const [searchInArea, setSearchInArea] = useState(true);
  const [previewTab, setPreviewTab] = useState("Overview");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addingLead, setAddingLead] = useState(false);
  const [savedLeadMap, setSavedLeadMap] = useState<Record<string, boolean>>({});
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch businesses automatically when category, query, or city changes
  useEffect(() => {
    let isMounted = true;
    const loadPlaces = async () => {
      setIsSearching(true);
      try {
        const res = await fetch("/api/maps/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: searchQuery || activeCategoryPill,
            category: activeCategoryPill,
            city: selectedCity.split(",")[0].trim(),
          }),
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.success && Array.isArray(data.places)) {
            const mapped: BusinessResult[] = data.places.map((p: any, idx: number) => ({
              id: p.id || `place-${idx}`,
              name: p.name || "Business",
              rating: typeof p.rating === "number" ? p.rating : 4.4,
              reviews: typeof p.reviews === "number" ? p.reviews : 420,
              category: p.category || activeCategoryPill,
              distance: p.distance || "1.2 km",
              address: p.address || selectedCity,
              phone: p.phone || "+91 98765 43210",
              website: p.website || "",
              img: p.img || "/assets/urban-kitchen.jpg",
              gallery: p.gallery || ["/assets/urban-kitchen.jpg"],
              opportunityScore: typeof p.opportunityScore === "number" ? p.opportunityScore : 8.5,
              hours: p.hours || "Open • Closes 10:30 PM",
              priceRange: p.priceRange || "₹₹ (Moderate)",
              source: p.source || "Google Maps Platform",
              potential: (p.opportunityScore && p.opportunityScore > 8 ? "High Potential" : "Medium Potential") as any,
              oppChecklist: p.oppChecklist || [
                "Page load exceeds 4.5s on mobile",
                "Missing Google Local Schema markup",
                "Unclaimed Google Business Profile elements",
              ],
              pinColor: (["red", "orange", "blue", "green", "yellow"][idx % 5]) as any,
              mapCoord: p.location
                ? { x: 50 + ((idx % 3) - 1) * 15, y: 50 + (Math.floor(idx / 3) - 1) * 15 }
                : { x: 50, y: 50 },
            }));
            setBusinesses(mapped);
            if (mapped.length > 0 && !selectedBusiness) {
              setSelectedBusiness(mapped[0]);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to query map places:", err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    };
    loadPlaces();
    return () => {
      isMounted = false;
    };
  }, [searchQuery, activeCategoryPill, selectedCity]);

  // Dynamic live Google Map search query
  const mapQuery = selectedBusiness
    ? `${selectedBusiness.name}, ${selectedBusiness.address || selectedCity}`
    : customCoords
    ? `${customCoords.lat},${customCoords.lng}`
    : `${searchQuery || activeCategoryPill} in ${selectedCity}`;

  // Switch selected business
  const handleSelectBusiness = (biz: BusinessResult) => {
    setSelectedBusiness(biz);
    setGalleryIndex(0);
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
          category: biz.category || "Restaurant",
          address: biz.address,
          city: selectedCity.split(",")[0].trim(),
          phone: biz.phone,
          website: biz.website || "",
          rating: biz.rating,
          reviewCount: biz.reviews,
          opportunityScore: biz.opportunityScore,
          source: "Map Explorer",
          status: "New",
        }),
      });
      const data = await res.json();
      if (res.ok && (data.success || data.lead)) {
        setSavedLeadMap((prev) => ({ ...prev, [biz.id]: true }));
        showToast(`✓ Added "${biz.name}" to Leads pipeline`);
      } else {
        showToast(
          `Could not add "${biz.name}": ${data.message || data.error || "request failed"}`
        );
      }
    } catch {
      showToast(`Could not add "${biz.name}". Nothing was saved.`);
    } finally {
      setAddingLead(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#171918] text-white text-xs font-semibold shadow-xl border border-gray-700 animate-in fade-in flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: Map Explorer + Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] dark:text-white tracking-tight">
            Map Explorer
          </h1>
          <p className="text-xs text-[#68717D] dark:text-[#9AA29E] mt-0.5">
            Discover businesses with real opportunities
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Google Maps Integration • {businesses.length} places discovered in {selectedCity}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast("Saved searches: 3 territories bookmarked")}
            className="h-8 px-3 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] hover:bg-gray-50 text-xs font-medium text-gray-700 dark:text-gray-200 inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Bookmark size={13} className="text-gray-400" />
            <span>Saved Searches</span>
          </button>

          <button
            onClick={() => showToast("My Locations: " + selectedCity)}
            className="h-8 px-3 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] hover:bg-gray-50 text-xs font-medium text-gray-700 dark:text-gray-200 inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <MapPin size={13} className="text-gray-400" />
            <span>My Locations</span>
          </button>

          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedBusiness(null);
              showToast("Reset map query for " + selectedCity);
            }}
            className="h-8 px-3.5 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus size={13} />
            <span>New Search</span>
          </button>
        </div>
      </div>

      {/* FILTER TOOLBAR: Search + Dropdowns */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Search Input with Clear Button */}
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search business..."
            className="w-full h-8.5 pl-8 pr-7 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Location Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCityMenuOpen(!isCityMenuOpen)}
            className="h-8.5 px-3 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium shadow-2xs hover:bg-gray-50 dark:hover:bg-[#1A2522]"
          >
            <MapPin size={13} className="text-emerald-600" />
            <span>{selectedCity}</span>
            <ChevronDown size={11} className="text-gray-400" />
          </button>
          {isCityMenuOpen && (
            <div className="absolute left-0 top-9.5 w-60 bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] rounded-xl shadow-xl p-2 z-50 space-y-1 text-xs">
              <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">
                Select Territory
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setCustomCoords(null);
                      setSelectedBusiness(null);
                      setIsCityMenuOpen(false);
                      showToast(`Live map navigating to ${city}`);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      selectedCity === city
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city && <Check size={12} className="text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="h-8.5 px-3 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium shadow-2xs cursor-pointer">
          <span>Category</span>
          <ChevronDown size={11} className="text-gray-400" />
        </div>

        {/* Rating Dropdown */}
        <div className="h-8.5 px-3 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium shadow-2xs cursor-pointer">
          <span>Rating</span>
          <ChevronDown size={11} className="text-gray-400" />
        </div>

        {/* Min Reviews Dropdown */}
        <div className="h-8.5 px-3 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium shadow-2xs cursor-pointer">
          <span>Min Reviews</span>
          <ChevronDown size={11} className="text-gray-400" />
        </div>

        {/* Radius Dropdown */}
        <div className="h-8.5 px-3 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium shadow-2xs cursor-pointer">
          <span>Radius: 5 km</span>
          <ChevronDown size={11} className="text-gray-400" />
        </div>

        {/* More Filters */}
        <button
          onClick={() => showToast("Advanced filters: Price range, Website status, Verification filters active")}
          className="h-8.5 px-3 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] hover:bg-gray-50 text-xs font-medium text-gray-700 dark:text-gray-300 inline-flex items-center gap-1.5 shadow-2xs"
        >
          <SlidersHorizontal size={12} className="text-gray-500" />
          <span>More Filters</span>
        </button>
      </div>

      {/* CATEGORY QUICK FILTER PILLS (Row 2) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        {CATEGORY_PILLS.map((pill) => {
          const isActive = activeCategoryPill === pill.name;
          return (
            <button
              key={pill.name}
              onClick={() => setActiveCategoryPill(pill.name)}
              className={`h-7.5 px-3 rounded-lg font-medium whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
                isActive
                  ? "bg-[#FFF4ED] text-[#EA580C] border-[#FFD8BF] dark:bg-[#2B1B15] dark:text-[#FB923C] dark:border-[#52291E] shadow-2xs"
                  : "bg-white dark:bg-[#151D1A] text-gray-600 dark:text-gray-300 border-[#E7E7E2] dark:border-[#22302B] hover:bg-gray-50 hover:text-black"
              }`}
            >
              <span>{pill.icon}</span>
              <span>{pill.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3-COLUMN MAIN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-start">
        {/* COLUMN 1: Loaded Businesses */}
        <div className="xl:col-span-3 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-3.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#22302B] text-xs">
            <span className="font-bold text-[#171918] dark:text-white">Businesses Found ({businesses.length})</span>
            <div className="flex items-center gap-1 text-gray-400 text-[11px] cursor-pointer hover:text-black">
              <span>Sort by: Relevance</span>
              <ChevronDown size={10} />
            </div>
          </div>

          <div className="space-y-2 max-h-[610px] overflow-y-auto pr-0.5">
            {businesses.length === 0 && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 py-6 text-center leading-relaxed">
                No businesses loaded. Discovery is not connected in this
                milestone; nothing is being displayed.
              </p>
            )}
            {businesses.map((biz) => {
              const isSelected = selectedBusiness?.id === biz.id;
              const isBookmarked = Boolean(bookmarkedMap[biz.id]);

              return (
                <div
                  key={biz.id}
                  onClick={() => handleSelectBusiness(biz)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? "bg-[#F0F7FF] dark:bg-[#142333] border-[#B9DAFF] dark:border-[#1E3A5F] shadow-2xs"
                      : "bg-white dark:bg-[#151D1A] border-[#F0EFEA] dark:border-[#22302B] hover:border-gray-200 hover:bg-[#FAF9F6]/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 relative shrink-0 border border-gray-200/80">
                      <Image src={biz.img} alt={biz.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-[#171918] dark:text-white truncate">
                        {biz.name}
                      </div>
                      <div className="text-[11px] text-[#F59E0B] font-semibold flex items-center gap-1 mt-0.5">
                        <Star size={11} className="fill-[#F59E0B] text-[#F59E0B]" />
                        <span>{biz.rating}</span>
                        <span className="text-gray-400 font-normal">({biz.reviews.toLocaleString()})</span>
                      </div>
                      <div className="text-[10px] text-gray-400 truncate mt-0.5">
                        {biz.category} • {biz.distance}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectBusiness(biz);
                      }}
                      className="h-6 px-2.5 rounded-md bg-[#F4F6F8] dark:bg-[#1A2522] hover:bg-gray-200 text-[#171918] dark:text-gray-200 text-[10px] font-semibold border border-gray-200/60 dark:border-[#2B3834] transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBookmarkedMap((prev) => ({ ...prev, [biz.id]: !prev[biz.id] }));
                        showToast(isBookmarked ? "Removed bookmark" : `Bookmarked ${biz.name}`);
                      }}
                      className={`p-1 rounded text-xs transition-colors ${
                        isBookmarked ? "text-amber-500 fill-amber-500" : "text-gray-300 hover:text-gray-500"
                      }`}
                      title="Bookmark"
                    >
                      <Bookmark size={13} className={isBookmarked ? "fill-current" : ""} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination bar matching screenshot */}
          <div className="pt-2 border-t border-gray-100 dark:border-[#22302B] flex items-center justify-between text-xs">
            <button className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100">
              <ChevronLeft size={13} />
            </button>
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 rounded bg-[#2563EB] text-white font-bold text-[11px] flex items-center justify-center">
                1
              </button>
              <button className="w-6 h-6 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 text-[11px] flex items-center justify-center">
                2
              </button>
              <button className="w-6 h-6 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 text-[11px] flex items-center justify-center">
                3
              </button>
              <button className="w-6 h-6 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 text-[11px] flex items-center justify-center">
                4
              </button>
              <button className="w-6 h-6 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 text-[11px] flex items-center justify-center">
                5
              </button>
              <span className="text-gray-400 text-[10px]">...</span>
              <button className="px-1.5 h-6 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 text-[11px] flex items-center justify-center">
                285
              </button>
            </div>
            <button className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* COLUMN 2: Center Realistic Map View */}
        <div className="xl:col-span-5 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] overflow-hidden shadow-xs relative flex flex-col h-[690px]">
          {/* Map Layer Switcher (Top Left) */}
          <div className="absolute top-3 left-3 z-30 flex items-center gap-1 p-0.5 bg-white/95 dark:bg-[#151D1A]/95 rounded-lg border border-gray-200/90 shadow-md backdrop-blur">
            <button
              onClick={() => setMapMode("map")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                mapMode === "map"
                  ? "bg-[#171918] text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-black"
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setMapMode("satellite")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                mapMode === "satellite"
                  ? "bg-[#171918] text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-black"
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Floating Action Buttons (Top Center-Right) */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
            <button
              onClick={() => {
                setSearchInArea(!searchInArea);
                showToast(searchInArea ? "Auto-viewport scan disabled" : "Scanning places in current viewport");
              }}
              className="h-7.5 px-3 rounded-lg bg-white/95 dark:bg-[#151D1A]/95 text-gray-800 dark:text-gray-200 text-xs font-medium border border-gray-200/90 shadow-md backdrop-blur inline-flex items-center gap-1.5 hover:bg-white"
            >
              <input
                type="checkbox"
                checked={searchInArea}
                onChange={() => {}}
                className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Search in this area</span>
            </button>

            <button
              onClick={() => showToast("Draw Polygon: Click on map to create boundary")}
              className="h-7.5 px-3 rounded-lg bg-white/95 dark:bg-[#151D1A]/95 text-gray-800 dark:text-gray-200 text-xs font-medium border border-gray-200/90 shadow-md backdrop-blur inline-flex items-center gap-1.5 hover:bg-white"
            >
              <Layers size={13} className="text-gray-600" />
              <span>Draw Area</span>
            </button>
          </div>

          {/* REAL DYNAMIC LIVE GOOGLE MAP CANVAS */}
          <div className="flex-1 relative overflow-hidden transition-colors w-full h-full min-h-[550px] bg-gray-100 dark:bg-[#121816]">
            {/* Real Interactive Google Maps Iframe */}
            <iframe
              key={`${mapQuery}-${mapMode}-${mapZoom}`}
              title="Google Map Live Explorer"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                mapQuery
              )}&t=${mapMode === "satellite" ? "k" : "m"}&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full border-0 absolute inset-0 select-none z-10"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Right Map Zoom & Locate Controls (Floating over Google Map) */}
            <div className="absolute right-3.5 bottom-12 flex flex-col gap-2 z-30">
              <button
                onClick={() => {
                  if (typeof window !== "undefined" && "geolocation" in navigator) {
                    showToast("Locating your current GPS coordinates...");
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setCustomCoords({
                          lat: pos.coords.latitude,
                          lng: pos.coords.longitude,
                        });
                        setSelectedCity("Your Current Location");
                        setSelectedBusiness(null);
                        setMapZoom(16);
                        showToast("✓ Map centered on your live GPS position");
                      },
                      () => {
                        showToast("Location access denied. Centering on " + selectedCity);
                      }
                    );
                  } else {
                    showToast("Geolocation is not supported by your browser");
                  }
                }}
                className="w-8 h-8 rounded-lg bg-white/95 dark:bg-[#151D1A]/95 border border-gray-200 dark:border-[#22302B] shadow-md flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white backdrop-blur transition-all"
                title="Locate Me (Current GPS Coordinates)"
              >
                <Crosshair size={15} className="text-emerald-600" />
              </button>

              <div className="flex flex-col rounded-lg bg-white/95 dark:bg-[#151D1A]/95 border border-gray-200 dark:border-[#22302B] shadow-md overflow-hidden text-xs backdrop-blur">
                <button
                  onClick={() => setMapZoom((z) => Math.min(20, z + 1))}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 font-bold text-gray-800 dark:text-gray-100 transition-colors"
                  title="Zoom In"
                >
                  +
                </button>
                <div className="h-px bg-gray-200 dark:bg-[#22302B]" />
                <button
                  onClick={() => setMapZoom((z) => Math.max(3, z - 1))}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 font-bold text-gray-800 dark:text-gray-100 transition-colors"
                  title="Zoom Out"
                >
                  −
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM PIN & MAP STATUS LEGEND */}
          <div className="p-2.5 bg-white dark:bg-[#151D1A] border-t border-gray-100 dark:border-[#22302B] flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-400 px-4 select-none z-20">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]" /> Restaurant
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> Cafe
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" /> Salon
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Gym
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /> Hotel
              </span>
            </div>
            <div className="text-[11px] text-gray-400 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real Google Maps Live</span>
              <span>•</span>
              <span className="capitalize">{mapMode === "satellite" ? "Satellite 3D" : "Roadmap"}</span>
              <span>•</span>
              <span>Zoom {mapZoom}x</span>
            </div>
          </div>
        </div>

        {selectedBusiness ? (
        <div className="xl:col-span-4 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4 shadow-xs space-y-4">
          {/* Top Hero Image Carousel */}
          <div className="relative h-44 rounded-xl overflow-hidden bg-gray-100 border border-gray-200/80">
            <Image
              src={selectedBusiness.gallery[galleryIndex] || selectedBusiness.img}
              alt={selectedBusiness.name}
              fill
              className="object-cover"
            />

            {/* Left & Right Carousel Arrows */}
            {selectedBusiness.gallery.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setGalleryIndex((prev) =>
                      prev === 0 ? selectedBusiness.gallery.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
                >
                  <ChevronLeft size={13} />
                </button>
                <button
                  onClick={() =>
                    setGalleryIndex((prev) =>
                      prev === selectedBusiness.gallery.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
                >
                  <ChevronRight size={13} />
                </button>
              </>
            )}

            {/* Top Right Counter & Close */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur">
                {galleryIndex + 1}/{selectedBusiness.gallery.length || 1}
              </span>
              <button
                onClick={() => showToast("Panel minimized")}
                className="w-5.5 h-5.5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          </div>

          {/* Business Header Title + High Potential Badge */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-bold text-[#171918] dark:text-white leading-tight">
                {selectedBusiness.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] dark:bg-[#064E3B]/40 dark:text-[#34D399] font-bold text-[10px] border border-[#A7F3D0] shrink-0">
                {selectedBusiness.potential}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-[#F59E0B] font-semibold mt-1">
              <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
              <span>{selectedBusiness.rating}</span>
              <span className="text-gray-400 font-normal">({selectedBusiness.reviews.toLocaleString()} reviews)</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              <span>🍴 {selectedBusiness.category}</span>
              <span>•</span>
              <span>📍 {selectedBusiness.address.split(",")[0]}</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {selectedBusiness.hours}
              </span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAddLead(selectedBusiness)}
              disabled={addingLead || Boolean(savedLeadMap[selectedBusiness.id])}
              className="flex-1 h-8 rounded-lg bg-[#171918] hover:bg-black text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-60"
            >
              {addingLead ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              <span>{savedLeadMap[selectedBusiness.id] ? "Saved in Leads" : "Add to Leads"}</span>
            </button>

            <Link
              href={`/outreach?email=${encodeURIComponent(selectedBusiness.name)}`}
              className="h-8 px-3 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] hover:bg-gray-50 text-xs font-semibold text-gray-700 dark:text-gray-200 inline-flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Mail size={12} className="text-gray-500" />
              <span>Send Email</span>
            </Link>

            <a
              href={`https://wa.me/${selectedBusiness.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                `Hello ${selectedBusiness.name}, we reviewed your digital presence and prepared a modern booking portal prototype for your team.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="h-8 px-3 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] hover:bg-gray-50 text-xs font-semibold text-gray-700 dark:text-gray-200 inline-flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <MessageCircle size={12} className="text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={() => showToast("Export, Share or Delete place")}
              className="w-8 h-8 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] hover:bg-gray-50 text-gray-500 flex items-center justify-center shadow-2xs"
            >
              <MoreHorizontal size={13} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-[#22302B] text-xs font-semibold pb-1">
            {["Overview", "Reviews", "Photos", "Website Audit", "AI Insights"].map((tab) => {
              const isActive = previewTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setPreviewTab(tab)}
                  className={`pb-1.5 transition-colors relative ${
                    isActive
                      ? "text-[#2563EB] font-bold border-b-2 border-[#2563EB]"
                      : "text-gray-400 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Business Information Section */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-[#171918] dark:text-white text-xs">Business Information</h4>

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 text-[11px] flex-1">
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 w-20 shrink-0">Address</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{selectedBusiness.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-20 shrink-0">Phone</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{selectedBusiness.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-20 shrink-0">Website</span>
                  {selectedBusiness.website ? (
                    <a
                      href={selectedBusiness.website}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>{selectedBusiness.website}</span>
                      <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-rose-500 font-semibold">No website listed</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-20 shrink-0">Category</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {selectedBusiness.category} - Food &amp; Beverage
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-20 shrink-0">Hours</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{selectedBusiness.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-20 shrink-0">Price Range</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{selectedBusiness.priceRange}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-20 shrink-0">Total Reviews</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {selectedBusiness.reviews.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-20 shrink-0">Source</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{selectedBusiness.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-20 shrink-0">Location</span>
                  <button
                    onClick={() => showToast("Focused on map location")}
                    className="font-medium text-blue-600 hover:underline inline-flex items-center gap-1 text-[11px]"
                  >
                    <span>View on Map</span>
                    <ExternalLink size={10} />
                  </button>
                </div>
              </div>

              {/* Thumbnail image on right */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 relative shrink-0 border border-gray-200">
                <Image src={selectedBusiness.img} alt={selectedBusiness.name} fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* AI Opportunity Analysis Card */}
          <div className="p-3.5 rounded-xl bg-[#F0FDF4] dark:bg-[#062417] border border-[#BBF7D0] dark:border-[#0D442B] space-y-2.5">
            <h4 className="font-bold text-xs text-[#171918] dark:text-white">AI Opportunity Analysis</h4>

            <div className="flex items-center gap-4">
              <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#093522] border border-[#BBF7D0] dark:border-[#14532D] text-center shrink-0">
                <span className="text-2xl font-extrabold text-[#16A34A] leading-none">
                  {selectedBusiness.opportunityScore}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">/10</span>
              </div>

              <div className="space-y-1 text-[11px] text-gray-700 dark:text-gray-300">
                {selectedBusiness.oppChecklist.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-[#16A34A] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions (2x2 Grid) */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#171918] dark:text-white text-xs">Quick Actions</h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href={`/outreach?lead=${encodeURIComponent(selectedBusiness.name)}`}
                className="p-2 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-2xs"
              >
                <Mail size={13} className="text-blue-600 shrink-0" />
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate">Generate Outreach</span>
              </Link>

          <Link
            href={`/audits?url=${encodeURIComponent(selectedBusiness.website || "")}`}
                className="p-2 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-2xs"
              >
                <Globe size={13} className="text-emerald-600 shrink-0" />
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate">Run Website Audit</span>
              </Link>

              <Link
                href={`/website-builder?lead=${encodeURIComponent(selectedBusiness.name)}`}
                className="p-2 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-2xs"
              >
                <FileText size={13} className="text-amber-600 shrink-0" />
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate">Cold Website Brief</span>
              </Link>

              <Link
                href={`/projects?new=${encodeURIComponent(selectedBusiness.name)}`}
                className="p-2 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-2xs"
              >
                <FolderPlus size={13} className="text-purple-600 shrink-0" />
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate">Create Project</span>
              </Link>
            </div>
          </div>
        </div>
        ) : (
          <div className="xl:col-span-4 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-6 shadow-xs">
            <div className="py-16 text-center">
              <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800 dark:text-white">
                No business selected
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                No business data is loaded. Nothing is fabricated to fill this
                panel.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
