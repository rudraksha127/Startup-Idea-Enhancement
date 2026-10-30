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
    <section id="solutions" className="py-20 bg-[#F8F6F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE8E1] text-xs font-bold text-[#171918] mb-3">
            Build • Automate • Grow
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#171918]">
            Discover real opportunities with AI research
          </h2>
          <p className="text-sm sm:text-base text-[#68717D] mt-3">
            Everything you need to automate client acquisition and deliver world-class digital products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs hover:shadow-xs hover:-translate-y-1 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F3F1EB] text-[#151B1A] flex items-center justify-center mb-4 border border-[#E7E7E2]">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold text-[#171918] mb-2">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-[#68717D] leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
