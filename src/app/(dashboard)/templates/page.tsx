"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Layers,
  CheckCircle2,
  ArrowRight,
  Star,
  Search,
  Plus,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  categoryBadge: string;
  rating: number;
  uses: string;
  description: string;
  img: string;
  thumbnails: string[];
  features: string[];
  variations: { name: string; preview: string; isDefault?: boolean }[];
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "1",
    name: "Restaurant Pro",
    category: "Restaurant",
    categoryBadge: "bg-blue-50 text-blue-700",
    rating: 4.8,
    uses: "1.2k uses",
    description:
      "A modern and elegant website template for restaurants with online menu, reservation system, gallery and location integration. Perfect for local restaurants, cafés and food businesses.",
    img: "/assets/templates/restaurant.jpg",
    thumbnails: [
      "/assets/templates/restaurant.jpg",
      "/assets/urban-kitchen.jpg",
      "/assets/templates/restaurant.jpg",
      "/assets/urban-kitchen.jpg",
    ],
    features: [
      "Responsive design (Mobile + Desktop)",
      "Contact form",
      "Online menu with categories",
      "Social media integration",
      "Table reservation system",
      "SEO optimized",
      "Gallery and image showcase",
      "Fast loading speed",
      "Location map integration",
      "Easy customization",
    ],
    variations: [
      { name: "Modern (Default)", preview: "/assets/templates/restaurant.jpg", isDefault: true },
      { name: "Classic", preview: "/assets/urban-kitchen.jpg" },
      { name: "Minimal", preview: "/assets/templates/restaurant.jpg" },
      { name: "Dark", preview: "/assets/templates/restaurant.jpg" },
      { name: "Premium", preview: "/assets/urban-kitchen.jpg" },
    ],
  },
  {
    id: "2",
    name: "Café Delight",
    category: "Café",
    categoryBadge: "bg-amber-50 text-amber-700",
    rating: 4.7,
    uses: "856 uses",
    description:
      "Warm artisanal coffee shop template with seasonal specials, digital order ahead, and customer loyalty program integration.",
    img: "/assets/templates/restaurant.jpg",
    thumbnails: [
      "/assets/templates/restaurant.jpg",
      "/assets/urban-kitchen.jpg",
      "/assets/templates/restaurant.jpg",
      "/assets/urban-kitchen.jpg",
    ],
    features: [
      "Responsive coffee & pastry menu",
      "Takeout pre-order integration",
      "Instagram feed sync",
      "Events & acoustic nights calendar",
      "Google Maps directions",
      "Speed 99/100 Lighthouse score",
    ],
    variations: [
      { name: "Warm Amber", preview: "/assets/templates/restaurant.jpg", isDefault: true },
      { name: "Nordic Minimal", preview: "/assets/urban-kitchen.jpg" },
      { name: "Roastery Dark", preview: "/assets/templates/restaurant.jpg" },
    ],
  },
  {
    id: "3",
    name: "Dental Care Plus",
    category: "Dental Clinic",
    categoryBadge: "bg-cyan-50 text-cyan-700",
    rating: 4.8,
    uses: "921 uses",
    description:
      "Clean clinical design engineered for high appointment conversions, doctor bios, insurance partner badges, and smile makeover galleries.",
    img: "/assets/templates/clinic.jpg",
    thumbnails: [
      "/assets/templates/clinic.jpg",
      "/assets/templates/clinic.jpg",
      "/assets/templates/clinic.jpg",
      "/assets/templates/clinic.jpg",
    ],
    features: [
      "Online patient appointment booking",
      "Doctor credentials & video intro",
      "Dental emergency click-to-call",
      "HIPAA-compliant intake forms",
      "Before & after smile comparison slider",
      "Schema markup for local healthcare",
    ],
    variations: [
      { name: "Clinical Blue", preview: "/assets/templates/clinic.jpg", isDefault: true },
      { name: "Pediatric Friendly", preview: "/assets/templates/clinic.jpg" },
      { name: "Luxury Cosmetic", preview: "/assets/templates/clinic.jpg" },
    ],
  },
  {
    id: "4",
    name: "FitLife Gym",
    category: "Gym & Fitness",
    categoryBadge: "bg-emerald-50 text-emerald-700",
    rating: 4.6,
    uses: "743 uses",
    description:
      "High-energy fitness portal with 1-day free trial booking, trainer profiles, weekly group class schedule, and membership tier calculator.",
    img: "/assets/templates/gym.jpg",
    thumbnails: [
      "/assets/templates/gym.jpg",
      "/assets/templates/gym.jpg",
      "/assets/templates/gym.jpg",
      "/assets/templates/gym.jpg",
    ],
    features: [
      "Free 1-day guest pass funnel",
      "Interactive class schedule timetable",
      "Trainer bio & certified specialization",
      "Membership pricing calculator",
      "Virtual facility walkthrough",
      "WhatsApp direct consultation",
    ],
    variations: [
      { name: "Bold Dark", preview: "/assets/templates/gym.jpg", isDefault: true },
      { name: "CrossFit Neon", preview: "/assets/templates/gym.jpg" },
      { name: "Pilates Minimal", preview: "/assets/templates/gym.jpg" },
    ],
  },
  {
    id: "5",
    name: "Hotel Stay Elite",
    category: "Hotel",
    categoryBadge: "bg-purple-50 text-purple-700",
    rating: 4.7,
    uses: "632 uses",
    description:
      "Luxury boutique stay experience featuring direct room booking, virtual room tours, multi-currency display, and amenities showcase.",
    img: "/assets/templates/hotel.jpg",
    thumbnails: [
      "/assets/templates/hotel.jpg",
      "/assets/templates/hotel.jpg",
      "/assets/templates/hotel.jpg",
      "/assets/templates/hotel.jpg",
    ],
    features: [
      "Direct room reservation engine",
      "Multi-currency & seasonal rates",
      "Photo & video 360 virtual tour",
      "Nearby tourist attractions guide",
      "Airport shuttle request form",
      "Zero OTA commission architecture",
    ],
    variations: [
      { name: "Luxury Gold", preview: "/assets/templates/hotel.jpg", isDefault: true },
      { name: "Resort Tropical", preview: "/assets/templates/hotel.jpg" },
      { name: "Urban Modern", preview: "/assets/templates/hotel.jpg" },
    ],
  },
  {
    id: "6",
    name: "Glow Beauty Salon",
    category: "Salon & Spa",
    categoryBadge: "bg-pink-50 text-pink-700",
    rating: 4.8,
    uses: "689 uses",
    description:
      "Modern aesthetic spa and beauty lounge framework with stylist slot booking, bridal packages, and prepaid gift cards.",
    img: "/assets/templates/salon.jpg",
    thumbnails: [
      "/assets/templates/salon.jpg",
      "/assets/templates/salon.jpg",
      "/assets/templates/salon.jpg",
      "/assets/templates/salon.jpg",
    ],
    features: [
      "Real-time slot reservation system",
      "Stylist portfolio & client reviews",
      "Service pricing menu & bridal bundles",
      "Digital gift voucher sales",
      "Automated WhatsApp appointment reminder",
      "Mobile-first responsive UX",
    ],
    variations: [
      { name: "Pastel Rose", preview: "/assets/templates/salon.jpg", isDefault: true },
      { name: "Modern Minimal", preview: "/assets/templates/salon.jpg" },
      { name: "Luxury Noir", preview: "/assets/templates/salon.jpg" },
    ],
  },
  {
    id: "7",
    name: "Bright Minds Academy",
    category: "Education",
    categoryBadge: "bg-sky-50 text-sky-700",
    rating: 4.6,
    uses: "512 uses",
    description:
      "Trusted education academy and preschool layout with curriculum guides, admissions registration forms, and teacher profiles.",
    img: "/assets/templates/restaurant.jpg",
    thumbnails: ["/assets/templates/restaurant.jpg"],
    features: ["Online admission inquiry", "Curriculum PDF download", "Teacher faculty directory"],
    variations: [{ name: "Playful Primary", preview: "/assets/templates/restaurant.jpg" }],
  },
  {
    id: "8",
    name: "Auto Garage Pro",
    category: "Automotive",
    categoryBadge: "bg-indigo-50 text-indigo-700",
    rating: 4.5,
    uses: "498 uses",
    description:
      "High-converting automotive repair and detailing shop template with instant service quote calculator and emergency roadside button.",
    img: "/assets/templates/restaurant.jpg",
    thumbnails: ["/assets/templates/restaurant.jpg"],
    features: ["Instant quote calculator", "Emergency roadside dispatch", "Google Reviews live stream"],
    variations: [{ name: "Industrial Dark", preview: "/assets/templates/restaurant.jpg" }],
  },
  {
    id: "9",
    name: "Real Estate Prime",
    category: "Real Estate",
    categoryBadge: "bg-teal-50 text-teal-700",
    rating: 4.6,
    uses: "467 uses",
    description:
      "Modern real estate agency landing framework for luxury property listings, agent WhatsApp chat, and scheduled site visits.",
    img: "/assets/templates/hotel.jpg",
    thumbnails: ["/assets/templates/hotel.jpg"],
    features: ["Interactive property showcase", "Schedule site visit calendar", "EMI loan calculator"],
    variations: [{ name: "Luxury Slate", preview: "/assets/templates/hotel.jpg" }],
  },
];

const CATEGORY_TABS = [
  "All Templates (24)",
  "Restaurant (6)",
  "Café (3)",
  "Clinic (3)",
  "Gym & Fitness (3)",
  "Hotel (3)",
  "Salon & Spa (3)",
  "Education (3)",
];

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem>(TEMPLATES[0]);
  const [selectedVariation, setSelectedVariation] = useState("Modern (Default)");
  const [activeCategory, setActiveCategory] = useState("All Templates (24)");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customTemplateName, setCustomTemplateName] = useState("");
  const [customCategory, setCustomCategory] = useState("Restaurant");

  const filteredTemplates = TEMPLATES.filter((tmpl) => {
    if (activeCategory !== "All Templates (24)" && !activeCategory.toLowerCase().includes(tmpl.category.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tmpl.name.toLowerCase().includes(q) ||
        tmpl.category.toLowerCase().includes(q) ||
        tmpl.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUseTemplate = (tmpl: TemplateItem) => {
    setSelectedTemplate(tmpl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
            Website Templates
          </h1>
          <p className="text-xs text-[#68717D] mt-0.5">
            Professional, industry-specific templates customized for local businesses. Launch faster with AI-powered content.
          </p>
        </div>

        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="h-8 px-3.5 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Create Custom Template</span>
        </button>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Layers size={16} />
          </span>
          <div>
            <div className="text-xl font-bold text-[#171918]">24</div>
            <div className="text-[11px] text-[#68717D]">Total Templates</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <CheckCircle2 size={16} />
          </span>
          <div>
            <div className="text-xl font-bold text-[#171918]">8</div>
            <div className="text-[11px] text-[#68717D]">Industries Covered</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
            <TrendingUp size={16} />
          </span>
          <div>
            <div className="text-xl font-bold text-[#171918]">12.5K</div>
            <div className="text-[11px] text-[#68717D]">Total Deployments</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Star size={16} />
          </span>
          <div>
            <div className="text-xl font-bold text-[#171918]">4.8</div>
            <div className="text-[11px] text-[#68717D]">Average Rating</div>
          </div>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-1 border-b border-gray-200 text-xs font-semibold overflow-x-auto scrollbar-none pb-1">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveCategory(tab)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeCategory === tab
                  ? "bg-[#171918] text-white font-bold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-xs">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-7 pr-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select className="h-7 px-2 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 focus:outline-none shadow-2xs">
              <option>Sort: Popular ⌄</option>
              <option>Sort: Highest Rated</option>
              <option>Sort: Most Deployments</option>
              <option>Sort: Newest</option>
            </select>
          </div>
        </div>
      </div>

      {copied && (
        <div className="p-3 rounded-xl bg-[#eef9f2] border border-[#ccecd8] text-xs text-[#176e42] font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span>{selectedTemplate.name} code scaffolding cloned into your project staging queue!</span>
        </div>
      )}

      {/* Main Grid: Left 8-col Templates Grid + Right 4-col Template Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (8 cols): 3x3 Cards Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTemplates.map((tmpl) => {
            const isSelected = selectedTemplate.id === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`bg-white rounded-xl border transition-all cursor-pointer overflow-hidden flex flex-col justify-between shadow-xs ${
                  isSelected
                    ? "border-blue-500 ring-2 ring-blue-500/20"
                    : "border-[#E7E7E2] hover:border-gray-300"
                }`}
              >
                <div>
                  <div className="aspect-[16/10] w-full relative overflow-hidden bg-gray-900 border-b border-gray-100">
                    <Image
                      src={tmpl.img}
                      alt={tmpl.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-[#171918]">{tmpl.name}</h3>
                      <span className="text-[11px] text-amber-500 font-bold flex items-center gap-0.5">
                        ★ {tmpl.rating} <span className="text-gray-400 font-normal">({tmpl.uses})</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                      {tmpl.description}
                    </p>

                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${tmpl.categoryBadge}`}>
                        {tmpl.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF9F6] border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(tmpl);
                    }}
                    className="flex-1 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-[11px] font-semibold text-gray-700 shadow-2xs text-center"
                  >
                    Preview
                  </button>
                  <Link
                    href={`/projects?template=${encodeURIComponent(tmpl.name)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(tmpl);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-[#3568E8] hover:bg-[#2855C7] text-white text-[11px] font-bold shadow-2xs text-center inline-flex items-center justify-center gap-1"
                  >
                    <span>Use Template</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (4 cols): Selected Template Inspector */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E7E7E2] p-4 shadow-xs space-y-4 text-xs">
          {/* Main Hero Preview Banner */}
          <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-gray-900 relative border border-gray-200">
            <Image
              src={selectedTemplate.img}
              alt={selectedTemplate.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                {selectedTemplate.category}
              </span>
              <h2 className="font-serif text-lg font-bold">
                Authentic Flavors Memorable Experiences
              </h2>
            </div>
          </div>

          {/* 4 Thumbnail Carousel Strip */}
          <div className="flex items-center justify-between gap-1.5">
            <button className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-black">
              <ChevronLeft size={13} />
            </button>
            <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
              {selectedTemplate.thumbnails.map((t, idx) => (
                <div
                  key={idx}
                  className="w-14 h-10 rounded-lg overflow-hidden border border-gray-200 relative shrink-0 cursor-pointer hover:border-blue-500"
                >
                  <Image src={t} alt="Thumbnail" fill className="object-cover" />
                </div>
              ))}
            </div>
            <button className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-black">
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Title & Category & Rating */}
          <div className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#171918]">{selectedTemplate.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                  {selectedTemplate.category}
                </span>
              </div>
              <span className="text-[11px] text-amber-500 font-bold">
                ★ {selectedTemplate.rating} <span className="text-gray-400 font-normal">({selectedTemplate.uses})</span>
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed mt-2">
              {selectedTemplate.description}
            </p>
          </div>

          {/* Key Features (2-column checkmark list) */}
          <div className="space-y-2">
            <span className="font-bold text-xs text-[#171918]">Key Features</span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-gray-600">
              {selectedTemplate.features.map((feat) => (
                <div key={feat} className="flex items-start gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={10} />
                  </span>
                  <span className="leading-tight">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <Link
              href={`/projects?template=${encodeURIComponent(selectedTemplate.name)}`}
              onClick={() => handleUseTemplate(selectedTemplate)}
              className="flex-1 py-2 rounded-lg bg-[#3568E8] hover:bg-[#2855C7] text-white font-bold text-xs shadow-xs text-center inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Use This Template</span>
              <ArrowRight size={13} />
            </Link>
            <button className="flex-1 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs shadow-2xs text-center inline-flex items-center justify-center gap-1">
              <span>Live Preview</span>
              <ExternalLink size={12} />
            </button>
          </div>

          {/* Available Variations */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <span className="font-bold text-xs text-[#171918]">Available Variations</span>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {selectedTemplate.variations.map((v) => {
                const isSelected = selectedVariation === v.name;
                return (
                  <div
                    key={v.name}
                    onClick={() => setSelectedVariation(v.name)}
                    className="cursor-pointer space-y-1"
                  >
                    <div
                      className={`aspect-[4/3] rounded-lg overflow-hidden border relative bg-gray-100 ${
                        isSelected ? "border-blue-600 ring-2 ring-blue-500/20" : "border-gray-200"
                      }`}
                    >
                      <Image src={v.preview} alt={v.name} fill className="object-cover" />
                    </div>
                    <span className={`text-[9px] block truncate ${isSelected ? "font-bold text-blue-600" : "text-gray-500"}`}>
                      {v.name.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Template Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#E7E7E2] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Layers size={14} />
                </span>
                <h3 className="font-bold text-base text-[#171918]">Create Custom Template</h3>
              </div>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsCustomModalOpen(false);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luxury Spa &amp; Wellness Suite"
                  value={customTemplateName}
                  onChange={(e) => setCustomTemplateName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Category *</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none text-xs"
                >
                  <option value="Restaurant">Restaurant</option>
                  <option value="Café">Café</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Gym & Fitness">Gym &amp; Fitness</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Salon & Spa">Salon &amp; Spa</option>
                  <option value="Education">Education</option>
                  <option value="Automotive">Automotive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus size={13} />
                  <span>Save Template</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
