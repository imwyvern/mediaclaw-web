import { Skeleton } from "@/components/ui/skeleton";

export default function VideosLoading() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Skeleton className="h-9 flex-1 max-w-sm" />
        <Skeleton className="h-9 w-48" />
      </div>

      <div className="rounded-md border bg-card">
        <div className="h-12 border-b px-4 flex items-center gap-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24 ml-auto" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 border-b px-4 flex items-center gap-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-10 w-16 rounded" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-6 w-20 rounded-full ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
