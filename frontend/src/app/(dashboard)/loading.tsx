export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-[#161f1b]/10 rounded-lg" />
          <div className="h-4 w-72 bg-[#161f1b]/5 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-[#161f1b]/10 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white rounded-xl border border-[#161f1b]/10 p-5 shadow-sm space-y-3">
            <div className="h-4 w-24 bg-[#161f1b]/10 rounded" />
            <div className="h-8 w-16 bg-[#161f1b]/10 rounded" />
            <div className="h-3 w-32 bg-[#161f1b]/5 rounded" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-white rounded-xl border border-[#161f1b]/10 p-6 shadow-sm" />
        <div className="h-80 bg-white rounded-xl border border-[#161f1b]/10 p-6 shadow-sm" />
      </div>
    </div>
  );
}

