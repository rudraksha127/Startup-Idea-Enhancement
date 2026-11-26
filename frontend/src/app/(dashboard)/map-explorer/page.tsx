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
import { LiveInteractiveMap } from "@/components/maps/LiveInteractiveMap";

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
  mapCoord: { x: number; y: number }; // Percentage fallback on map canvas
  location?: { lat: number; lng: number };
}

// 10 Detailed realistic businesses matching the design screenshot
const REALISTIC_BUSINESSES: BusinessResult[] = [
  {
    id: "biz-1",
    name: "The Urban Kitchen",
    rating: 4.4,
    reviews: 1234,
    category: "Restaurant",
    distance: "0.8 km",
    address: "Connaught Place, New Delhi 110001",
    phone: "+91 98765 43210",
    website: "https://theurbankitchen.in",
    img: "/assets/urban-kitchen.jpg",
    gallery: [
      "/assets/urban-kitchen.jpg",
      "/assets/templates/restaurant.jpg",
      "/assets/templates/hotel.jpg",
      "/assets/templates/cafe.jpg",
    ],
    opportunityScore: 8.5,
    hours: "Open • Closes 11:00 PM",
    priceRange: "₹₹ (Moderate)",
    source: "Google Maps",
    potential: "High Potential",
    oppChecklist: [
      "No website found or outdated",
      "High number of customer reviews",
      "Weak social media presence",
      "Good location and brand presence",
      "Potential for online reservations",
    ],
    pinColor: "orange",
    mapCoord: { x: 58, y: 38 },
  },
  {
    id: "biz-2",
    name: "Spice Junction",
    rating: 4.6,
    reviews: 892,
    category: "Restaurant",
    distance: "1.2 km",
    address: "Scheme 54, Vijay Nagar, Indore 452010",
    phone: "+91 98260 11223",
    website: "https://spicejunction-indore.com",
    img: "/assets/templates/restaurant.jpg",
    gallery: ["/assets/templates/restaurant.jpg", "/assets/urban-kitchen.jpg"],
    opportunityScore: 7.8,
    hours: "Open • Closes 11:30 PM",
    priceRange: "₹₹ (Moderate)",
    source: "Google Maps",
    potential: "High Potential",
    oppChecklist: [
      "Menu not mobile-friendly",
      "890+ active customer reviews",
      "No online table reservation",
      "Prime Vijay Nagar commercial hub",
      "Fast ROI on modern web presence",
    ],
    pinColor: "red",
    mapCoord: { x: 52, y: 41 },
  },
  {
    id: "biz-3",
    name: "Flavors of India",
    rating: 4.3,
    reviews: 764,
    category: "Restaurant",
    distance: "1.4 km",
    address: "AB Road, Near Palasia Square, Indore 452001",
    phone: "+91 98261 44556",
    website: "",
    img: "/assets/templates/hotel.jpg",
    gallery: ["/assets/templates/hotel.jpg", "/assets/templates/restaurant.jpg"],
    opportunityScore: 8.9,
    hours: "Open • Closes 10:30 PM",
    priceRange: "₹₹ (Moderate)",
    source: "Google Maps",
    potential: "High Potential",
    oppChecklist: [
      "No active website domain registered",
      "Competitor websites outranking on Google",
      "High walk-in review velocity",
      "Great candidate for instant AI website build",
      "Online order button absent",
    ],
    pinColor: "red",
    mapCoord: { x: 44, y: 52 },
  },
  {
    id: "biz-4",
    name: "Tandoori Nights",
    rating: 4.1,
    reviews: 986,
    category: "Restaurant",
    distance: "1.8 km",
    address: "Chhatripura Main Road, Indore 452007",
    phone: "+91 98262 77889",
    website: "",
    img: "/assets/templates/restaurant.jpg",
    gallery: ["/assets/templates/restaurant.jpg"],
    opportunityScore: 8.2,
    hours: "Open • Closes 12:00 AM",
    priceRange: "₹ (Budget-Friendly)",
    source: "Google Maps",
    potential: "High Potential",
    oppChecklist: [
      "Zero digital presence beyond Google Pin",
      "Late-night dining hotspot",
      "Over 980 positive food reviews",
      "High demand for digital QR menu",
      "Can easily add WhatsApp direct ordering",
    ],
    pinColor: "orange",
    mapCoord: { x: 62, y: 45 },
  },
  {
    id: "biz-5",
    name: "Café Central",
    rating: 4.5,
    reviews: 632,
    category: "Cafe",
    distance: "2.1 km",
    address: "Pipliyahana Road, Near World Cup Square, Indore",
    phone: "+91 98263 99001",
    website: "https://cafecentral.co.in",
    img: "/assets/templates/cafe.jpg",
    gallery: ["/assets/templates/cafe.jpg", "/assets/urban-kitchen.jpg"],
    opportunityScore: 7.4,
    hours: "Open • Closes 11:00 PM",
    priceRange: "₹₹ (Moderate)",
    source: "Google Maps",
    potential: "Medium Potential",
    oppChecklist: [
      "Slow WordPress site (>5.2s load)",
      "High youth demographic engagement",
      "No event booking landing page",
      "Instagram bio links to broken page",
      "Prime target for modern Next.js revamp",
    ],
    pinColor: "orange",
    mapCoord: { x: 38, y: 63 },
  },
  {
    id: "biz-6",
    name: "The Food Factory",
    rating: 4.2,
    reviews: 421,
    category: "Restaurant",
    distance: "2.3 km",
    address: "Bhanwarkuan Main Road, Indore 452014",
    phone: "+91 98264 22334",
    website: "",
    img: "/assets/templates/restaurant.jpg",
    gallery: ["/assets/templates/restaurant.jpg"],
    opportunityScore: 8.6,
    hours: "Open • Closes 11:00 PM",
    priceRange: "₹₹ (Moderate)",
    source: "Google Maps",
    potential: "High Potential",
    oppChecklist: [
      "Missing website link on Google Maps",
      "Close to major university colleges",
      "Huge student traffic needing delivery menu",
      "Low digital marketing competition in local radius",
      "Easy conversion to recurring retainer",
    ],
    pinColor: "red",
    mapCoord: { x: 46, y: 69 },
  },
  {
    id: "biz-7",
    name: "Hotel Grand Plaza",
    rating: 4.4,
    reviews: 512,
    category: "Hotel",
    distance: "2.5 km",
    address: "South Tukoganj, Near Railway Station, Indore 452001",
    phone: "+91 98265 55667",
    website: "https://grandplazaindore.com",
    img: "/assets/templates/hotel.jpg",
    gallery: ["/assets/templates/hotel.jpg"],
    opportunityScore: 7.9,
    hours: "Open 24 Hours",
    priceRange: "₹₹₹ (Upscale)",
    source: "Google Maps",
    potential: "High Potential",
    oppChecklist: [
      "OTA commissions eating 22% profits",
      "Direct room booking engine required",
      "Outdated non-responsive website",
      "Corporate banquet hall marketing needed",
      "High budget agency prospect ($2,500+ deal)",
    ],
    pinColor: "blue",
    mapCoord: { x: 67, y: 65 },
  },
  {
    id: "biz-8",
    name: "Brew & Bites",
    rating: 4.3,
    reviews: 389,
    category: "Cafe",
    distance: "2.7 km",
    address: "New Palasia, 56 Dukan Area, Indore 452001",
    phone: "+91 98266 77880",
    website: "",
    img: "/assets/templates/cafe.jpg",
    gallery: ["/assets/templates/cafe.jpg"],
    opportunityScore: 8.1,
    hours: "Open • Closes 11:00 PM",
    priceRange: "₹₹ (Moderate)",
    source: "Google Maps",
    potential: "High Potential",
    oppChecklist: [
      "Prime 56 Dukan foodie tourist hub",
      "No official website or Google catalog",
      "High customer interest in artisan coffee",
      "Social media traffic wasted without lead capture",
      "Ready for instant proposal delivery",
    ],
    pinColor: "orange",
    mapCoord: { x: 51, y: 74 },
  },
  {
    id: "biz-9",
    name: "The Green Bowl",
    rating: 4.6,
    reviews: 298,
    category: "Healthy Food",
    distance: "2.8 km",
    address: "Old Palasia, Indore 452018",
    phone: "+91 98267 88991",
    website: "https://thegreenbowl.in",
    img: "/assets/templates/restaurant.jpg",
    gallery: ["/assets/templates/restaurant.jpg"],
    opportunityScore: 7.2,
    hours: "Open • Closes 10:00 PM",
    priceRange: "₹₹ (Moderate)",
    source: "Google Maps",
    potential: "Medium Potential",
    oppChecklist: [
      "Clean diet and meal plan subscription absent",
      "High average order value",
      "Website lacks SEO optimization for local search",
      "Good potential for recurring monthly retainers",
      "Fast response to WhatsApp outreach",
    ],
    pinColor: "green",
    mapCoord: { x: 42, y: 32 },
  },
  {
    id: "biz-10",
    name: "Royal Dine",
    rating: 4.1,
    reviews: 450,
    category: "Restaurant",
    distance: "3.1 km",
    address: "Annapurna Road, Near Temple, Indore 452009",
    phone: "+91 98268 00112",
    website: "",
    img: "/assets/templates/restaurant.jpg",
    gallery: ["/assets/templates/restaurant.jpg"],
    opportunityScore: 8.7,
    hours: "Open • Closes 11:00 PM",
    priceRange: "₹₹ (Moderate)",
    source: "Google Maps",
    potential: "High Potential",
    oppChecklist: [
      "Traditional family restaurant lacking digital presence",
      "Over 450 positive reviews on Maps",
      "Zero competition from nearby websites",
      "Family dining booking portal opportunity",
      "Immediate conversion potential",
    ],
    pinColor: "yellow",
    mapCoord: { x: 48, y: 81 },
  },
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

export default function MapExplorerPage() {
  const [businesses, setBusinesses] = useState<BusinessResult[]>(REALISTIC_BUSINESSES);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessResult | null>(REALISTIC_BUSINESSES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Indore, Madhya Pradesh");
  const [activeCategoryPill, setActiveCategoryPill] = useState("Restaurant");
  const [placesSource, setPlacesSource] = useState("Loading Places...");
  const [isFallbackPlaces, setIsFallbackPlaces] = useState(false);
  const [auditingBizId, setAuditingBizId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<"map" | "satellite">("map");
  const [searchInArea, setSearchInArea] = useState(true);
  const [previewTab, setPreviewTab] = useState("Overview");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addingLead, setAddingLead] = useState(false);
  const [savedLeadMap, setSavedLeadMap] = useState<Record<string, boolean>>({});
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch("/api/maps/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: searchQuery.trim(),
            category: activeCategoryPill,
            city: selectedCity.split(",")[0].trim(),
          }),
        });
        const data = await res.json();
        if (!active || !res.ok || !Array.isArray(data?.places)) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: BusinessResult[] = data.places.map((p: any, idx: number) => ({
          id: String(p.id || `place_${idx}`),
          name: p.name || "Unknown Business",
          rating: Number(p.rating ?? 0),
          reviews: Number(p.reviews ?? 0),
          category: p.category || activeCategoryPill || "Business",
          distance: p.distance || "Nearby",
          address: p.address || selectedCity,
          phone: p.phone || "",
          website: p.website || "",
          img: p.img || "/assets/templates/restaurant.jpg",
          gallery: [p.img || "/assets/templates/restaurant.jpg"],
          opportunityScore: Number(p.opportunityScore ?? 0),
          hours: p.hours || "Hours not listed",
          priceRange: p.priceRange || "—",
          source: data.source || p.source || "Maps API",
          potential:
            Number(p.opportunityScore ?? 0) >= 8.5
              ? "High Potential"
              : Number(p.opportunityScore ?? 0) >= 7
              ? "Medium Potential"
              : "Low Potential",
          oppChecklist: [
            p.website ? `Website detected: ${p.website}` : "No website listed — greenfield build candidate",
            p.reviews ? `${Number(p.reviews).toLocaleString()} customer reviews on profile` : "Review profile pending",
          ],
          pinColor: p.category === "Restaurant" ? "orange" : "blue",
          mapCoord: {
            x: 25 + ((idx * 17) % 55),
            y: 22 + ((idx * 21) % 58),
          },
          location: p.location,
        }));

        setBusinesses(mapped);
        setSelectedBusiness(mapped[0] || null);
        setPlacesSource(data.source || "Google Places API");
        setIsFallbackPlaces(Boolean(data.isFallback || String(data.source || "").toLowerCase().includes("fallback")));
      } catch {
        // Retain current state on transient network failure
      } finally {
        if (active) setIsSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, activeCategoryPill, selectedCity]);

  // Switch selected business
  const handleSelectBusiness = (biz: BusinessResult) => {
    setSelectedBusiness(biz);
    setGalleryIndex(0);
  };

  const handleRunInstantAudit = async (biz: BusinessResult) => {
    if (!biz.website) {
      showToast(`"${biz.name}" has no listed website URL — high-opportunity greenfield lead.`);
      return;
    }
    setAuditingBizId(biz.id);
    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: biz.website,
          businessName: biz.name,
          category: biz.category,
          location: biz.address,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.audit) {
        showToast(data?.error || "Live audit failed or blocked");
        return;
      }
      showToast(`Live audit complete for ${biz.name}: Overall ${data.audit.overallScore}/100 (${data.audit.dataMode})`);
    } catch {
      showToast("Failed to connect to live audit engine");
    } finally {
      setAuditingBizId(null);
    }
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
          location: selectedCity.split(",")[0].trim(),
          phone: biz.phone || "",
          website: biz.website || "",
          rating: biz.rating || 0,
          reviewCount: biz.reviews || 0,
          opportunityScore: biz.opportunityScore ? Math.round(biz.opportunityScore * 10) : 0,
          source: biz.source || "Map Explorer",
          status: "New",
        }),
      });
      const data = await res.json();
      if (!res.ok || (!data.success && !data.lead)) {
        showToast(data?.error || `Failed to save "${biz.name}" to Leads`);
        return;
      }
      setSavedLeadMap((prev) => ({ ...prev, [biz.id]: true }));
      showToast(`Added "${biz.name}" to Leads pipeline!`);
    } catch {
      showToast(`Network error while saving "${biz.name}"`);
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
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast("Opening saved searches...")}
            className="h-8 px-3 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] hover:bg-gray-50 text-xs font-medium text-gray-700 dark:text-gray-200 inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Bookmark size={13} className="text-gray-400" />
            <span>Saved Searches</span>
          </button>

          <button
            onClick={() => showToast("Territories: Indore, Delhi, Mumbai configured")}
            className="h-8 px-3 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] hover:bg-gray-50 text-xs font-medium text-gray-700 dark:text-gray-200 inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <MapPin size={13} className="text-gray-400" />
            <span>My Locations</span>
          </button>

          <button
            onClick={() => {
              setSearchQuery("");
              showToast("Ready for new search query");
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
            placeholder="Search business by name, category, or city..."
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
        <div className="h-8.5 px-3 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium shadow-2xs cursor-pointer">
          <MapPin size={13} className="text-emerald-600" />
          <span>{selectedCity}</span>
          <ChevronDown size={11} className="text-gray-400" />
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

      {isFallbackPlaces && (
        <div className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2">
          <span>
            <strong>Data Provenance:</strong> {placesSource}. Configure{" "}
            <code className="font-mono">GOOGLE_MAPS_SERVER_KEY</code> for live Google Places results.
          </span>
        </div>
      )}

      {/* 3-COLUMN MAIN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-start">
        {/* COLUMN 1: Businesses Found List */}
        <div className="xl:col-span-3 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-3.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#22302B] text-xs">
            <span className="font-bold text-[#171918] dark:text-white">
              Businesses Found ({businesses.length})
            </span>
            <div className="flex items-center gap-1 text-gray-400 text-[11px]">
              <span>Sort by: Relevance</span>
              <ChevronDown size={10} />
            </div>
          </div>

          <div className="space-y-2 max-h-[610px] overflow-y-auto pr-0.5">
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

          {/* Honest pagination */}
          <div className="pt-2 border-t border-gray-100 dark:border-[#22302B] flex items-center justify-between text-xs text-gray-500">
            <span>Page 1 of 1</span>
            <span>{businesses.length} loaded</span>
          </div>
        </div>

        {/* COLUMN 2: Real Interactive Live Map (Google Maps JS SDK / Slippy OpenStreetMap & Satellite) */}
        <LiveInteractiveMap
          businesses={businesses}
          selectedBusiness={selectedBusiness}
          city={selectedCity}
          mapMode={mapMode}
          onMapModeChange={setMapMode}
          searchInArea={searchInArea}
          onToggleSearchInArea={() => {
            setSearchInArea((prev) => !prev);
            showToast(searchInArea ? "Auto-viewport scan disabled" : "Scanning places in current viewport");
          }}
          onSelectBusiness={(bizId) => {
            const match = businesses.find((b) => b.id === bizId);
            if (match) handleSelectBusiness(match);
          }}
          onDrawAreaClick={() => showToast("Territory selection active")}
        />

        {/* COLUMN 3: Right Drawer (Selected Business Detail Panel) */}
        <div className="xl:col-span-4 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4 shadow-xs space-y-4">
          {selectedBusiness ? (
            <>
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

              <button
                type="button"
                onClick={() => handleRunInstantAudit(selectedBusiness)}
                disabled={auditingBizId === selectedBusiness.id}
                className="p-2 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-2xs disabled:opacity-60 text-left"
              >
                {auditingBizId === selectedBusiness.id ? (
                  <Loader2 size={13} className="animate-spin text-emerald-600 shrink-0" />
                ) : (
                  <Globe size={13} className="text-emerald-600 shrink-0" />
                )}
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                  {auditingBizId === selectedBusiness.id ? "Auditing..." : "Run Instant Audit"}
                </span>
              </button>

              <Link
                href={selectedBusiness.website ? `/audits?url=${encodeURIComponent(selectedBusiness.website)}` : "/audits"}
                className="p-2 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-2xs"
              >
                <FileText size={13} className="text-amber-600 shrink-0" />
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate">Open Audit Hub</span>
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
            </>
          ) : (
            <div className="py-16 text-center text-xs text-gray-500">
              No business selected. Search a city or category above to inspect businesses.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
