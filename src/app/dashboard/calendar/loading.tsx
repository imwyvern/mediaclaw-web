import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function CalendarLoading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <Skeleton className="h-10 w-40 bg-white/5 rounded-xl mb-2" />
          <Skeleton className="h-5 w-80 bg-white/5 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-[140px] bg-white/5 rounded-md" />
          <Skeleton className="h-10 w-28 bg-white/5 rounded-md" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <Skeleton className="h-7 w-32 bg-white/5 rounded-md" />
          <Skeleton className="h-9 w-24 bg-white/5 rounded-lg" />
          <Skeleton className="h-9 w-20 bg-white/5 rounded-md" />
        </div>
        <Skeleton className="h-10 w-[140px] bg-white/5 rounded-lg" />
      </div>

      {/* Grid */}
      <div className="rounded-2xl border border-white/10 bg-[#0b0f1a] overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02]">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="py-3 flex justify-center">
              <Skeleton className="h-4 w-12 bg-white/5" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="min-h-[120px] p-2 border border-white/5 bg-white/[0.02]">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-6 w-6 rounded-full bg-white/5" />
                {i % 4 === 0 && <Skeleton className="h-5 w-10 rounded-full bg-white/5" />}
              </div>
              <div className="space-y-2 mt-4">
                {i % 3 === 0 && <Skeleton className="h-4 w-full bg-white/5 rounded" />}
                {i % 5 === 0 && <Skeleton className="h-4 w-3/4 bg-white/5 rounded" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
