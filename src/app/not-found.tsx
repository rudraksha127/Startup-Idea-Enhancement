import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f6f0] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md w-full bg-white border border-[#161f1b]/15 rounded-2xl p-8 shadow-sm">
        <span className="text-xs uppercase tracking-widest font-semibold text-[#828a84] bg-[#f3f1eb] px-3 py-1 rounded-full">
          Error 404
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#101413] mt-4 mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-[#555956] mb-6">
          The requested page could not be located in your AgencyOS workspace.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0d251f] text-white text-sm font-medium hover:bg-[#15392e] transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#161f1b]/15 text-[#101413] text-sm font-medium hover:bg-[#f3f1eb] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}

