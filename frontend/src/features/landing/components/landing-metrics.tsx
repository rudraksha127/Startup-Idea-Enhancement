export function LandingMetrics() {
  return (
    <section className="border-y border-[#E7E7E2] bg-[#F3F1EB] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4 Big Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-b border-[#E7E7E2] pb-8 mb-8">
          <div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#171918]">10K+</div>
            <div className="text-xs text-[#68717D] font-medium mt-1">Businesses Analyzed</div>
          </div>
          <div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#171918]">500+</div>
            <div className="text-xs text-[#68717D] font-medium mt-1">Qualified Leads / Month</div>
          </div>
          <div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#171918]">200+</div>
            <div className="text-xs text-[#68717D] font-medium mt-1">Websites Delivered</div>
          </div>
          <div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#171918]">98%</div>
            <div className="text-xs text-[#68717D] font-medium mt-1">Positive Response Rate</div>
          </div>
        </div>

        {/* Brand Logos: Google, Meta, Stripe, Notion, Vercel, Supabase */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-[#68717D] text-xs font-semibold">
          <span className="text-[11px] uppercase tracking-wider text-[#828a84] font-medium">
            Trusted by growing businesses
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm">
            <span className="flex items-center gap-1.5 hover:text-[#171918] transition-colors font-bold">
              Google
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#171918] transition-colors font-bold">
              Meta
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#171918] transition-colors font-bold">
              Stripe
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#171918] transition-colors font-bold">
              Notion
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#171918] transition-colors font-bold">
              Vercel
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#171918] transition-colors font-bold">
              Supabase
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
