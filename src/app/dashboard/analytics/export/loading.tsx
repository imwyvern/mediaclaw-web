import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AnalyticsExportLoading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-md bg-white/5 shrink-0" />
          <div>
            <Skeleton className="h-8 w-48 bg-white/5 rounded-lg mb-2" />
            <Skeleton className="h-4 w-64 bg-white/5 rounded" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <Skeleton className="h-5 w-32 bg-white/5" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-20 bg-white/5" />
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-xl" />)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 bg-white/5" />
                  <Skeleton className="h-10 w-full bg-white/5 rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 bg-white/5" />
                  <Skeleton className="h-10 w-full bg-white/5 rounded-md" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-16 bg-white/5" />
                <Skeleton className="h-16 w-full bg-white/5 rounded-xl" />
              </div>
              <Skeleton className="h-12 w-full bg-white/5 rounded-md mt-6" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none h-full">
            <CardHeader className="pb-4 border-b border-white/5">
              <Skeleton className="h-5 w-32 bg-white/5" />
            </CardHeader>
            <CardContent className="p-0">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded bg-white/5" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 bg-white/5" />
                      <Skeleton className="h-3 w-24 bg-white/5" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16 bg-white/5 rounded-md" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
