import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CampaignDetailLoading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardContent className="p-5 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full bg-white/5 shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-16 bg-white/5" />
                <Skeleton className="h-6 w-24 bg-white/5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none h-full">
            <CardHeader className="pb-2 border-b border-white/5">
              <Skeleton className="h-5 w-32 bg-white/5" />
            </CardHeader>
            <CardContent className="p-4 h-[350px]">
              <Skeleton className="w-full h-full bg-white/5 rounded-lg" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <Skeleton className="h-5 w-24 bg-white/5" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-3 w-16 bg-white/5" />
                <Skeleton className="h-20 w-full bg-white/5 rounded-lg" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-3 w-16 bg-white/5" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 bg-white/5 rounded-full" />
                  <Skeleton className="h-6 w-20 bg-white/5 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <Skeleton className="h-5 w-24 bg-white/5" />
            </CardHeader>
            <CardContent className="p-0">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border-b border-white/5 space-y-3">
                  <Skeleton className="h-4 w-3/4 bg-white/5" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16 bg-white/5" />
                    <Skeleton className="h-3 w-12 bg-white/5" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
