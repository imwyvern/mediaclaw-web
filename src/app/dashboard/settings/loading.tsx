import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="border-b border-white/5 pb-6">
        <Skeleton className="h-10 w-40 bg-white/5 rounded-xl mb-2" />
        <Skeleton className="h-5 w-80 bg-white/5 rounded-lg" />
      </div>

      <div className="flex gap-2 mb-2">
        <Skeleton className="h-10 w-32 bg-white/5 rounded-lg" />
        <Skeleton className="h-10 w-32 bg-white/5 rounded-lg" />
        <Skeleton className="h-10 w-32 bg-white/5 rounded-lg" />
        <Skeleton className="h-10 w-32 bg-white/5 rounded-lg" />
      </div>

      <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
        <CardHeader className="pb-4 border-b border-white/5">
          <Skeleton className="h-6 w-32 bg-white/5 mb-2" />
          <Skeleton className="h-4 w-64 bg-white/5" />
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="flex items-center gap-6">
            <Skeleton className="w-20 h-20 rounded-xl bg-white/5" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-32 bg-white/5 rounded-md" />
              <Skeleton className="h-3 w-48 bg-white/5" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 bg-white/5" />
              <Skeleton className="h-10 w-full bg-white/5 rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 bg-white/5" />
              <Skeleton className="h-10 w-full bg-white/5 rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
