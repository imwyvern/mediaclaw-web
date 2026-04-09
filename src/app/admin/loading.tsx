import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <Skeleton className="h-10 w-48 bg-white/5 rounded-xl mb-2" />
          <Skeleton className="h-5 w-64 bg-white/5 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28 bg-white/5 rounded-md" />
          <Skeleton className="h-10 w-32 bg-white/5 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardContent className="p-5 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full bg-white/5 shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20 bg-white/5" />
                <Skeleton className="h-6 w-16 bg-white/5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6 mt-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-32 bg-white/5 rounded-md" />
          <div className="flex gap-3">
            <Skeleton className="h-9 w-64 bg-white/5 rounded-md" />
            <Skeleton className="h-9 w-20 bg-white/5 rounded-md" />
          </div>
        </div>

        <div className="bg-[#0b0f1a] border border-white/10 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02] p-4">
            <Skeleton className="h-4 w-16 bg-white/5 col-span-2" />
            <Skeleton className="h-4 w-12 bg-white/5" />
            <Skeleton className="h-4 w-12 bg-white/5" />
            <Skeleton className="h-4 w-12 bg-white/5" />
            <Skeleton className="h-4 w-12 bg-white/5" />
            <Skeleton className="h-4 w-12 bg-white/5" />
          </div>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="grid grid-cols-7 border-b border-white/5 p-4 items-center">
              <Skeleton className="h-5 w-32 bg-white/5 col-span-2" />
              <Skeleton className="h-6 w-16 bg-white/5 rounded-full" />
              <Skeleton className="h-5 w-12 bg-white/5 justify-self-end" />
              <Skeleton className="h-5 w-16 bg-white/5 justify-self-end" />
              <Skeleton className="h-6 w-16 bg-white/5 rounded-full" />
              <Skeleton className="h-5 w-24 bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
