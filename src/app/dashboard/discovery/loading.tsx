import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DiscoveryLoading() {
  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-48 mb-3 bg-white/5 rounded-xl" />
          <Skeleton className="h-5 w-64 bg-white/5 rounded-lg" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 bg-white/5 rounded-xl" />
          <Skeleton className="h-10 w-28 bg-white/5 rounded-xl" />
          <Skeleton className="h-10 w-10 bg-white/5 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-32 bg-white/5 rounded-lg" />
            <Skeleton className="h-6 w-24 bg-white/5 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-[#0b0f1a] border-white/10 shadow-none">
                <Skeleton className="h-48 w-full rounded-t-xl rounded-b-none bg-white/5" />
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-full bg-white/5" />
                    <Skeleton className="h-5 w-3/4 bg-white/5" />
                  </div>
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-3 w-full bg-white/5" />
                    <Skeleton className="h-10 w-full bg-white/5 rounded-lg mt-3" />
                  </div>
                </CardContent>
                <div className="px-5 pb-5 flex gap-3">
                  <Skeleton className="h-10 w-1/2 bg-white/5 rounded-lg" />
                  <Skeleton className="h-10 w-1/2 bg-white/5 rounded-lg" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <Skeleton className="h-6 w-32 bg-white/5 mb-2" />
              <Skeleton className="h-4 w-48 bg-white/5" />
            </CardHeader>
            <CardContent className="p-0">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 flex gap-3 border-b border-white/5 last:border-0">
                  <Skeleton className="h-16 w-16 rounded-md bg-white/5 shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-4 w-full bg-white/5" />
                    <Skeleton className="h-4 w-2/3 bg-white/5" />
                    <Skeleton className="h-3 w-24 bg-white/5 mt-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <Skeleton className="h-6 w-24 bg-white/5 mb-2" />
              <Skeleton className="h-4 w-40 bg-white/5" />
            </CardHeader>
            <CardContent className="p-5 flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-7 w-20 bg-white/5 rounded-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
