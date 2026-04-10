import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DistributionLoading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <Skeleton className="h-10 w-40 bg-white/5 rounded-xl mb-2" />
          <Skeleton className="h-5 w-80 bg-white/5 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-28 bg-white/5 rounded-md" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardContent className="p-4 flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-full bg-white/5 shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 bg-white/5" />
                <Skeleton className="h-6 w-16 bg-white/5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-[140px] bg-white/5 rounded-md" />
          <Skeleton className="h-10 w-[140px] bg-white/5 rounded-md" />
        </div>
        <Skeleton className="h-10 w-64 bg-white/5 rounded-md" />
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className="w-[300px] flex flex-col shrink-0">
              <div className="flex justify-between items-center p-3 border-b-2 border-white/10 mb-4">
                <Skeleton className="h-5 w-20 bg-white/5" />
                <Skeleton className="h-5 w-8 bg-white/5 rounded-full" />
              </div>
              <div className="flex-1 flex flex-col gap-4">
                {[1, 2, 3].map((card) => (
                  <Card key={card} className="bg-[#0b0f1a] border-white/10 shadow-none">
                    <CardContent className="p-3 space-y-3">
                      <div className="flex gap-3">
                        <Skeleton className="w-16 h-12 bg-white/5 rounded shrink-0" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full bg-white/5" />
                          <Skeleton className="h-4 w-2/3 bg-white/5" />
                        </div>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-2">
                        <Skeleton className="h-5 w-20 bg-white/5 rounded-full" />
                        <Skeleton className="h-4 w-12 bg-white/5" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
