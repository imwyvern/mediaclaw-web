import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function VideoListLoading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-40 bg-white/5 rounded-xl mb-2" />
          <Skeleton className="h-5 w-64 bg-white/5 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-28 bg-white/5 rounded-xl" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 w-full sm:w-64 bg-white/5 rounded-md" />
          <Skeleton className="h-10 w-full sm:w-[130px] bg-white/5 rounded-md" />
          <Skeleton className="h-10 w-full sm:w-[130px] bg-white/5 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-20 bg-white/5 rounded-md" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="bg-[#0b0f1a] border-white/10 shadow-none flex flex-col">
            <Skeleton className="h-40 w-full rounded-t-xl rounded-b-none bg-white/5" />
            <CardContent className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3 mb-6">
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-4 w-3/4 bg-white/5" />
              </div>
              <div className="flex justify-between border-t border-white/5 pt-3">
                <Skeleton className="h-8 w-12 bg-white/5" />
                <Skeleton className="h-8 w-16 bg-white/5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
