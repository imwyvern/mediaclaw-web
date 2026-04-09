import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <Skeleton className="h-10 w-40 bg-white/5 rounded-xl mb-2" />
          <Skeleton className="h-5 w-64 bg-white/5 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 bg-white/5 rounded-xl" />
          <Skeleton className="h-10 w-28 bg-white/5 rounded-xl" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-[#0b0f1a] border-white/10 shadow-none">
              <CardContent className="p-5 flex flex-col items-center">
                <Skeleton className="w-10 h-10 rounded-full bg-white/5 mb-3" />
                <Skeleton className="h-3 w-16 bg-white/5 mb-2" />
                <Skeleton className="h-8 w-24 bg-white/5 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-[#0b0f1a] border-white/10 shadow-none">
              <CardHeader className="pb-2 border-b border-white/5">
                <Skeleton className="h-5 w-32 bg-white/5" />
              </CardHeader>
              <CardContent className="p-4 h-[300px]">
                <Skeleton className="w-full h-full bg-white/5 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
