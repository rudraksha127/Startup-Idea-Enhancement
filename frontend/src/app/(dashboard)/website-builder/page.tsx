"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Globe,
  Smartphone,
  Tablet,
  Monitor,
  Share2,
  Copy,
  ExternalLink,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  Star,
  Settings,
  Layers,
  Palette,
  Send,
  Download,
  Loader2,
  Check,
} from "lucide-react";

interface TemplateTheme {
  id: string;
  name: string;
  category: string;
  primaryColor: string;
  heroImage: string;
}

const TEMPLATES: TemplateTheme[] = [
  { id: "restaurant", name: "Modern Bistro", category: "Restaurant", primaryColor: "#E11D48", heroImage: "/assets/urban-kitchen.jpg" },
  { id: "cafe", name: "Artisanal Roastery", category: "Cafe", primaryColor: "#D97706", heroImage: "/assets/templates/restaurant.jpg" },
  { id: "clinic", name: "Specialty Medical", category: "Clinic", primaryColor: "#0284C7", heroImage: "/assets/templates/clinic.jpg" },
  { id: "gym", name: "High-Pulse Fitness", category: "Gym", primaryColor: "#10B981", heroImage: "/assets/templates/gym.jpg" },
  { id: "salon", name: "Luxe Glow Studio", category: "Salon", primaryColor: "#8B5CF6", heroImage: "/assets/templates/salon.jpg" },
  { id: "hotel", name: "Grand Boutique", category: "Hotel", primaryColor: "#475569", heroImage: "/assets/templates/hotel.jpg" },
];

export default function WebsiteBuilderPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateTheme>(TEMPLATES[0]);
  const [deviceView, setDeviceView] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [businessName, setBusinessName] = useState("The Urban Kitchen");
  const [tagline, setTagline] = useState("Handcrafted Artisanal Dining in the Heart of New Delhi");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [address, setAddress] = useState("Connaught Place, New Delhi 110001");
  const [ctaText, setCtaText] = useState("Reserve a Table");
  const [rating, setRating] = useState("4.4");
  const [reviewsCount, setReviewsCount] = useState("1,234");
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsGenerating(false);
    showToast("✓ Refreshed website preview with AI styling");
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(`https://preview.agencyos.ai/demo/${encodeURIComponent(businessName.toLowerCase().replace(/\s+/g, "-"))}`);
    showToast("✓ Copied shareable client demo link to clipboard!");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#171918] text-white text-xs font-semibold shadow-xl border border-gray-700 animate-in fade-in slide-in-from-bottom-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] dark:text-white tracking-tight">
            AI Website Generator
          </h1>
          <p className="text-xs text-[#68717D] dark:text-[#9AA29E] mt-0.5">
            Turn prospects into clients with instant high-performance interactive website previews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="h-8 px-3 rounded-lg border border-gray-200 dark:border-[#2B3532] bg-white dark:bg-[#121816] hover:bg-gray-50 text-xs font-semibold text-gray-700 dark:text-gray-300 inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Share2 size={12} />
            <span>Copy Demo Link</span>
          </button>

          <Link
            href="/outreach"
            className="h-8 px-3.5 rounded-lg bg-[#171918] dark:bg-white text-white dark:text-[#171918] text-xs font-bold inline-flex items-center gap-1.5 shadow-xs hover:opacity-90"
          >
            <Send size={12} />
            <span>Send to Client</span>
          </Link>
        </div>
      </div>

      {/* Top Controls Toolbar */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Templates Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplate.id === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  isSelected
                    ? "bg-[#171918] dark:bg-white text-white dark:text-[#171918]"
                    : "bg-[#FAF9F6] dark:bg-[#121816] text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white border border-gray-100 dark:border-[#22302B]"
                }`}
              >
                {tmpl.name}
              </button>
            );
          })}
        </div>

        {/* Viewport Device Switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-gray-100 dark:bg-[#121816] border border-gray-200 dark:border-[#22302B]">
          <button
            onClick={() => setDeviceView("desktop")}
            className={`p-1.5 rounded-md transition-colors ${
              deviceView === "desktop" ? "bg-white dark:bg-[#151D1A] text-black dark:text-white shadow-2xs" : "text-gray-400"
            }`}
            title="Desktop 1440px"
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => setDeviceView("tablet")}
            className={`p-1.5 rounded-md transition-colors ${
              deviceView === "tablet" ? "bg-white dark:bg-[#151D1A] text-black dark:text-white shadow-2xs" : "text-gray-400"
            }`}
            title="Tablet 768px"
          >
            <Tablet size={14} />
          </button>
          <button
            onClick={() => setDeviceView("mobile")}
            className={`p-1.5 rounded-md transition-colors ${
              deviceView === "mobile" ? "bg-white dark:bg-[#151D1A] text-black dark:text-white shadow-2xs" : "text-gray-400"
            }`}
            title="Mobile 375px"
          >
            <Smartphone size={14} />
          </button>
        </div>
      </div>

      {/* Main Grid: Device Simulation Viewport (8 cols) + Customization Rail (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Center: Device Viewport Canvas */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center">
          <div
            className={`w-full transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-gray-300 dark:border-[#2B3532] bg-white dark:bg-black ${
              deviceView === "mobile"
                ? "max-w-[390px]"
                : deviceView === "tablet"
                ? "max-w-[768px]"
                : "max-w-full"
            }`}
          >
            {/* Browser Chrome Header */}
            <div className="h-9 bg-gray-100 dark:bg-[#151D1A] border-b border-gray-200 dark:border-[#22302B] px-3 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>

              <div className="px-3 py-0.5 rounded-md bg-white dark:bg-[#121816] border border-gray-200 dark:border-[#22302B] text-[10px] text-gray-600 dark:text-gray-300 font-mono truncate max-w-[280px]">
                https://{businessName.toLowerCase().replace(/[^a-z0-9]/g, "")}.in
              </div>

              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <span>⚡ 1.4s LCP</span>
              </div>
            </div>

            {/* Generated Website Mock Content */}
            <div className="overflow-y-auto max-h-[640px] text-gray-900 dark:text-gray-100 font-sans">
              {/* Site Navbar */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-900 bg-white dark:bg-black">
                <div className="font-extrabold text-base tracking-tight text-[#171918] dark:text-white">
                  {businessName}
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <span>Menu</span>
                  <span>About</span>
                  <span>Reviews</span>
                  <span>Contact</span>
                </div>
                <button
                  style={{ backgroundColor: selectedTemplate.primaryColor }}
                  className="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs shadow-xs"
                >
                  {ctaText}
                </button>
              </div>

              {/* Site Hero Banner */}
              <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-gray-900">
                <Image
                  src={selectedTemplate.heroImage}
                  alt={businessName}
                  fill
                  className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 text-white space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold w-fit">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span>{rating} Google Rating</span>
                    <span className="text-gray-300">({reviewsCount} reviews)</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight max-w-lg leading-tight">
                    {tagline}
                  </h2>

                  <p className="text-xs text-gray-200 flex items-center gap-1.5 pt-1">
                    <MapPin size={12} />
                    <span>{address}</span>
                  </p>
                </div>
              </div>

              {/* Features / Highlights Grid */}
              <div className="p-6 bg-gray-50 dark:bg-[#0E1312] space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-bold text-[#171918] dark:text-white">Why Our Guests Love Us</h3>
                  <p className="text-xs text-gray-500">Premium ingredients, warm atmosphere, and instant digital reservations.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#151D1A] border border-gray-100 dark:border-[#22302B] space-y-1">
                    <div className="font-bold text-gray-900 dark:text-white">Instant Table Booking</div>
                    <div className="text-[11px] text-gray-500">Zero wait times with verified WhatsApp confirmation.</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#151D1A] border border-gray-100 dark:border-[#22302B] space-y-1">
                    <div className="font-bold text-gray-900 dark:text-white">Curated Seasonal Specials</div>
                    <div className="text-[11px] text-gray-500">Fresh artisanal produce sourced daily from local farms.</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#151D1A] border border-gray-100 dark:border-[#22302B] space-y-1">
                    <div className="font-bold text-gray-900 dark:text-white">5-Star Hospitality</div>
                    <div className="text-[11px] text-gray-500">Ranked top 5 culinary destinations in New Delhi.</div>
                  </div>
                </div>
              </div>

              {/* Site Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-900 bg-white dark:bg-black text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Phone size={13} />
                  <span>{phone}</span>
                </div>
                <div>© {businessName} • All Rights Reserved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Rail: Business Parameters Customizer */}
        <div className="lg:col-span-4 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4.5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#22302B]">
            <h3 className="font-bold text-xs text-[#171918] dark:text-white">Client Customizer</h3>
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold inline-flex items-center gap-1"
            >
              {isGenerating ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
              <span>Regenerate</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-gray-200 dark:border-[#2B3532] bg-white dark:bg-[#121816] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Hero Tagline</label>
              <textarea
                rows={2}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-[#2B3532] bg-white dark:bg-[#121816] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Direct Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-gray-200 dark:border-[#2B3532] bg-white dark:bg-[#121816] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Call-To-Action</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-gray-200 dark:border-[#2B3532] bg-white dark:bg-[#121816] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Physical Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-gray-200 dark:border-[#2B3532] bg-white dark:bg-[#121816] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          {/* Commercial Upsell Angle Box */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
              <Sparkles size={13} className="text-blue-600" />
              <span>Agency Commercial Pitch</span>
            </div>
            <p className="text-[11px] text-blue-800 dark:text-blue-200 leading-relaxed">
              &quot;We built a working demo for {businessName} that loads in 1.4s on mobile with automated WhatsApp table booking. We can hand this over turnkey for ₹45,000.&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
