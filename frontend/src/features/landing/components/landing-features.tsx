import { Search, Send, MessageSquare, Briefcase, FileCode, BarChart3 } from "lucide-react";

const FEATURES = [
  {
    icon: Search,
    title: "Find Businesses",
    description: "Discover real opportunities with autonomous AI research and local density signals.",
  },
  {
    icon: Send,
    title: "Personalized Outreach",
    description: "Send relevant, human-like messages at scale tailored to specific performance gaps.",
  },
  {
    icon: MessageSquare,
    title: "Manage Conversations",
    description: "Handle replies, follow-ups, and calendar booking seamlessly without friction.",
  },
  {
    icon: Briefcase,
    title: "Convert to Clients",
    description: "Track pipeline stages and close deals backed by undeniable website audit evidence.",
  },
  {
    icon: FileCode,
    title: "Dev-Ready Handoffs",
    description: "Get complete project briefs with UI specifications, wireframes, and asset checklists.",
  },
  {
    icon: BarChart3,
    title: "Grow with Analytics",
    description: "Track outreach response rates, deal velocity, and recurring revenue milestones.",
  },
];

export function LandingFeatures() {
  return (
    <section id="solutions" className="py-20 bg-[#F8F6F0] dark:bg-[#0b0f0e] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE8E1] dark:bg-[#1a2420] border border-transparent dark:border-[#232f2a] text-xs font-bold text-[#171918] dark:text-[#e2e8f0] mb-3">
            Build • Automate • Grow
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#171918] dark:text-white">
            Discover real opportunities with AI research
          </h2>
          <p className="text-sm sm:text-base text-[#68717D] dark:text-[#94a3b8] mt-3">
            Everything you need to automate client acquisition and deliver world-class digital products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-xl bg-white dark:bg-[#151d1a] border border-[#E7E7E2] dark:border-[#22302b] shadow-2xs hover:shadow-xs hover:-translate-y-1 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F3F1EB] dark:bg-[#1a2420] text-[#151B1A] dark:text-emerald-400 flex items-center justify-center mb-4 border border-[#E7E7E2] dark:border-[#22302b]">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold text-[#171918] dark:text-white mb-2">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-[#68717D] dark:text-[#94a3b8] leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
