import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PipelineDetailLoading() {
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
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="h-10 w-28 bg-white/5 rounded-md" />
          <Skeleton className="h-10 w-32 bg-white/5 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <Skeleton className="h-5 w-24 bg-white/5" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-16 bg-white/5" />
                  <Skeleton className="h-10 w-full bg-white/5 rounded-md" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24 bg-white/5" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-6 w-16 bg-white/5 rounded-full" />
                    <Skeleton className="h-6 w-16 bg-white/5 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-20 bg-white/5" />
                <Skeleton className="h-32 w-full bg-white/5 rounded-md" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <Skeleton className="h-5 w-24 bg-white/5" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-4 border-b border-white/10 p-4">
                <Skeleton className="h-4 w-24 bg-white/5" />
                <Skeleton className="h-4 w-16 bg-white/5 justify-self-end" />
                <Skeleton className="h-4 w-12 bg-white/5 justify-self-end" />
                <Skeleton className="h-4 w-12 bg-white/5 justify-self-end" />
              </div>
              {[1, 2, 3].map(i => (
                <div key={i} className="grid grid-cols-4 border-b border-white/5 p-4">
                  <Skeleton className="h-4 w-32 bg-white/5" />
                  <Skeleton className="h-4 w-8 bg-white/5 justify-self-end" />
                  <Skeleton className="h-4 w-6 bg-white/5 justify-self-end" />
                  <Skeleton className="h-4 w-6 bg-white/5 justify-self-end" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <Skeleton className="h-5 w-24 bg-white/5" />
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-4 w-full bg-white/5" />
              <Skeleton className="h-4 w-3/4 bg-white/5" />
              <div className="space-y-3 pt-4">
                <Skeleton className="h-3 w-16 bg-white/5" />
                <Skeleton className="h-10 w-full bg-white/5 rounded-md" />
                <Skeleton className="h-10 w-full bg-white/5 rounded-md" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
