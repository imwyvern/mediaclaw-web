import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
      <div>
        <Skeleton className="h-9 w-32 bg-white/5 rounded-xl mb-2" />
        <Skeleton className="h-5 w-64 bg-white/5 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-10 w-10 rounded-lg bg-white/5" />
                <Skeleton className="h-4 w-12 rounded bg-white/5" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 bg-white/5" />
                <Skeleton className="h-8 w-24 bg-white/5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-32 bg-white/5 rounded-lg" />
            <Skeleton className="h-5 w-20 bg-white/5 rounded-md" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-[#0b0f1a] border-white/10 shadow-none">
                <Skeleton className="h-32 w-full rounded-t-xl rounded-b-none bg-white/5" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-4 w-2/3 bg-white/5" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-3 w-16 bg-white/5" />
                    <Skeleton className="h-3 w-12 bg-white/5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <Skeleton className="h-6 w-24 bg-white/5" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-white/5 rounded-lg" />
              ))}
            </CardContent>
          </Card>

          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <Skeleton className="h-6 w-24 bg-white/5" />
            </CardHeader>
            <CardContent className="p-0">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 flex gap-4 items-start border-b border-white/5 last:border-0">
                  <Skeleton className="h-8 w-8 rounded-full bg-white/5 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full bg-white/5" />
                    <Skeleton className="h-3 w-24 bg-white/5" />
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
