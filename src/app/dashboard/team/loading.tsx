import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TeamLoading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <Skeleton className="h-10 w-48 bg-white/5 rounded-xl mb-2" />
          <Skeleton className="h-5 w-80 bg-white/5 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32 bg-white/5 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            <Skeleton className="h-10 w-full sm:w-72 bg-white/5 rounded-lg" />
            <Skeleton className="h-10 w-24 bg-white/5 rounded-lg" />
          </div>

          <div className="bg-[#0b0f1a] border border-white/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-6 border-b border-white/10 bg-white/[0.02] p-4">
              <Skeleton className="h-4 w-12 bg-white/5 col-span-2" />
              <Skeleton className="h-4 w-12 bg-white/5" />
              <Skeleton className="h-4 w-12 bg-white/5" />
              <Skeleton className="h-4 w-12 bg-white/5" />
              <Skeleton className="h-4 w-12 bg-white/5" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-6 border-b border-white/5 p-4 items-center">
                <div className="col-span-2 flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full bg-white/5 shrink-0" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-24 bg-white/5" />
                    <Skeleton className="h-3 w-32 bg-white/5" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 bg-white/5 rounded-full" />
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-10 bg-white/5 rounded-full" />
                  <Skeleton className="h-5 w-12 bg-white/5 rounded-full" />
                </div>
                <Skeleton className="h-4 w-10 bg-white/5 justify-self-end" />
                <Skeleton className="h-4 w-12 bg-white/5 justify-self-end mr-4" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <Skeleton className="h-6 w-32 bg-white/5 mb-2" />
              <Skeleton className="h-4 w-48 bg-white/5" />
            </CardHeader>
            <CardContent className="p-0">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 border-b border-white/5 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-24 bg-white/5" />
                    <Skeleton className="h-5 w-12 bg-white/5 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-white/5" />
                    <Skeleton className="h-4 w-3/4 bg-white/5" />
                  </div>
                </div>
              ))}
              <div className="p-4">
                <Skeleton className="h-10 w-full bg-white/5 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
