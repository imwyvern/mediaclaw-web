import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function VideoDetailLoading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-md bg-white/5 shrink-0" />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="h-8 w-64 bg-white/5 rounded-lg" />
              <Skeleton className="h-6 w-16 bg-white/5 rounded-full" />
            </div>
            <Skeleton className="h-4 w-48 bg-white/5 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="h-10 w-28 bg-white/5 rounded-md" />
          <Skeleton className="h-10 w-32 bg-white/5 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="w-full aspect-video rounded-2xl bg-white/5" />
          
          <div className="space-y-6">
            <Skeleton className="h-7 w-32 bg-white/5 rounded-md" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-[#0b0f1a] border-white/10 shadow-none">
                  <CardContent className="p-4 flex flex-col items-center">
                    <Skeleton className="w-5 h-5 rounded-full bg-white/5 mb-2" />
                    <Skeleton className="h-3 w-12 bg-white/5 mb-2" />
                    <Skeleton className="h-8 w-16 bg-white/5" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
              <CardHeader className="pb-2 border-b border-white/5">
                <Skeleton className="h-5 w-24 bg-white/5" />
              </CardHeader>
              <CardContent className="p-4 h-[250px]">
                <Skeleton className="w-full h-full bg-white/5 rounded-lg" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <Skeleton className="h-6 w-24 bg-white/5" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative border-l-2 border-white/10 ml-3 space-y-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="relative pl-6">
                    <Skeleton className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-white/5" />
                    <div className="pt-1.5 space-y-2">
                      <Skeleton className="h-4 w-20 bg-white/5" />
                      <Skeleton className="h-3 w-32 bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center justify-between">
              <Skeleton className="h-6 w-24 bg-white/5" />
              <Skeleton className="h-8 w-16 bg-white/5" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-16 bg-white/5" />
                <Skeleton className="h-24 w-full bg-white/5 rounded-xl" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-16 bg-white/5" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 bg-white/5 rounded-full" />
                  <Skeleton className="h-6 w-20 bg-white/5 rounded-full" />
                  <Skeleton className="h-6 w-12 bg-white/5 rounded-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 bg-white/5" />
                  <Skeleton className="h-6 w-20 bg-white/5 rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 bg-white/5" />
                  <Skeleton className="h-6 w-16 bg-white/5 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
