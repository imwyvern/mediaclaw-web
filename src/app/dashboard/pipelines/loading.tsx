import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function PipelinesLoading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <Skeleton className="h-10 w-40 bg-white/5 rounded-xl mb-2" />
          <Skeleton className="h-5 w-80 bg-white/5 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32 bg-white/5 rounded-lg" />
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <Skeleton className="h-10 w-full sm:w-72 bg-white/5 rounded-lg" />
        <Skeleton className="h-10 w-24 bg-white/5 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardContent className="p-6">
              <div className="flex justify-between mb-4">
                <Skeleton className="h-6 w-16 bg-white/5 rounded-full" />
                <Skeleton className="h-6 w-6 bg-white/5 rounded-md" />
              </div>
              <Skeleton className="h-6 w-3/4 bg-white/5 mb-3" />
              <Skeleton className="h-4 w-1/4 bg-white/5 mb-8" />
              
              <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-12 bg-white/5" />
                  <Skeleton className="h-5 w-16 bg-white/5" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-12 bg-white/5" />
                  <Skeleton className="h-5 w-20 bg-white/5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
