import { Skeleton } from "@/components/ui/skeleton";

export function DiscoveryPageSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="space-y-3">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-4 w-[360px] max-w-full" />
      </div>

      <div className="rounded-[28px] border border-white/10 bg-card/50 p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-24 rounded-full" />
            ))}
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_180px] xl:max-w-[480px]">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[26px] border border-white/10 bg-card/70 p-4"
          >
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((__, metricIndex) => (
                  <Skeleton key={metricIndex} className="h-16 rounded-xl" />
                ))}
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 p-3">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-9 rounded-xl" />
                <Skeleton className="h-9 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
