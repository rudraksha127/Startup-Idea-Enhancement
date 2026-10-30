import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingFooter() {
  return (
    <>
      {/* Pre-footer Call to Action */}
      <section className="bg-[#151B1A] text-white py-16 border-t border-[#202927]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#A7F3D0]">
            Autonomous Agency OS
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to put your agency client acquisition on autopilot?
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
            Join modern web development agencies finding, auditing, and closing high-ticket clients with zero manual prospecting.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="h-11 px-6 rounded-lg bg-white text-[#151B1A] font-bold text-xs inline-flex items-center gap-1.5 shadow-md hover:bg-gray-100 transition-colors"
            >
              <span>Get Started Free</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/login"
              className="h-11 px-6 rounded-lg border border-white/20 text-white font-semibold text-xs inline-flex items-center gap-1.5 hover:bg-white/10 transition-colors"
            >
              <span>Sign In to Workspace</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer id="resources" className="border-t border-[#E7E7E2] bg-[#F3F1EB] py-8 text-xs text-[#68717D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#171918]">AgencyOS</span>
            <span>·</span>
            <span>Find Clients. Close Projects. You Build. We Handle the Rest.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-[#171918] transition-colors">
              Login
            </Link>
            <Link href="/dashboard" className="hover:text-[#171918] transition-colors">
              Operations Dashboard
            </Link>
            <span className="text-[#828a84]">© 2026 AgencyOS. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
