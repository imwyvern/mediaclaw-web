import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BrandAssetsLoading() {
  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
      <div>
        <Skeleton className="h-10 w-40 bg-white/5 rounded-xl mb-2" />
        <Skeleton className="h-5 w-80 bg-white/5 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="w-full h-64 rounded-2xl bg-white/5" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-24 bg-white/5 rounded-md" />
              <Skeleton className="h-6 w-16 bg-white/5 rounded-full" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="bg-[#0b0f1a] border-white/10 shadow-none">
                  <div className="aspect-square bg-white/5 border-b border-white/5 flex items-center justify-center relative p-4">
                    <Skeleton className="w-12 h-12 bg-white/5 rounded-md" />
                    <Skeleton className="absolute top-2 left-2 h-5 w-16 bg-white/5 rounded-full" />
                  </div>
                  <CardContent className="p-3 space-y-2">
                    <Skeleton className="h-4 w-full bg-white/5" />
                    <Skeleton className="h-3 w-1/2 bg-white/5" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <Skeleton className="h-6 w-24 bg-white/5 mb-2" />
                <Skeleton className="h-4 w-32 bg-white/5" />
              </div>
              <Skeleton className="h-8 w-16 bg-white/5 rounded-md" />
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="space-y-3">
                <Skeleton className="h-3 w-16 bg-white/5" />
                <Skeleton className="h-6 w-32 bg-white/5" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-3 w-16 bg-white/5" />
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-24 bg-white/5 rounded-lg" />
                  <Skeleton className="h-8 w-24 bg-white/5 rounded-lg" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-3 w-16 bg-white/5" />
                <Skeleton className="h-20 w-full bg-white/5 rounded-lg" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-3 w-16 bg-white/5" />
                <Skeleton className="h-20 w-full bg-white/5 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
