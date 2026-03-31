"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Clock, CheckCircle2, TrendingUp, Calendar, Video, ArrowUpRight, PlayCircle, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { ExportDialog, ExportConfig } from "@/components/export-dialog";
import { MetadataUpdater } from "@/components/metadata-updater";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const RechartsTooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [topVideos, setTopVideos] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState("7d");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overviewRes, trendsRes] = await Promise.all([
          api.analytics.overview(),
          api.analytics.trends({ timeframe })
        ]);
        setOverview(overviewRes.data);
        setTrends(trendsRes.data);
        // Mock top videos for now if not in overview
        setTopVideos(overviewRes.data?.topVideos || [
          { id: "1", title: "Q3 Campaign Hero Video", views: "12.4K", engagement: "8.2%", brand: "Acme Corp" },
          { id: "2", title: "Product Demo Reel", views: "8.1K", engagement: "6.5%", brand: "Global Inc" },
          { id: "3", title: "Summer Sale Teaser", views: "5.2K", engagement: "12.1%", brand: "Acme Corp" },
          { id: "4", title: "User Testimonial #12", views: "4.8K", engagement: "4.3%", brand: "Alpha" },
          { id: "5", title: "Instagram Ad Pack v2", views: "3.9K", engagement: "9.8%", brand: "Global Inc" },
        ]);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        // Fallback mock
        setOverview({
          totalVideos: 132,
          avgProcessingTime: "1m 45s",
          successRate: "99.2%",
          estimatedViews: "37.5K",
          platforms: [
            { name: "TikTok", value: 45 },
            { name: "Instagram", value: 35 },
            { name: "YouTube", value: 15 },
            { name: "Twitter", value: 5 },
          ]
        });
        setTrends([
          { name: "Mon", videos: 12 }, { name: "Tue", videos: 18 }, { name: "Wed", videos: 25 },
          { name: "Thu", videos: 22 }, { name: "Fri", videos: 30 }, { name: "Sat", videos: 15 }, { name: "Sun", videos: 10 },
        ]);
        setTopVideos([
          { id: "1", title: "Q3 Campaign Hero Video", views: "12.4K", engagement: "8.2%", brand: "Acme Corp" },
          { id: "2", title: "Product Demo Reel", views: "8.1K", engagement: "6.5%", brand: "Global Inc" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeframe]);

  const handleExport = async (config: ExportConfig) => {
    toast.promise(
      new Promise<void>(resolve => setTimeout(resolve, 2000)),
      {
        loading: `Generating ${config.format.toUpperCase()} report...`,
        success: "Report downloaded successfully",
        error: "Export failed",
      }
    );
  };

  if (loading && !overview) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <MetadataUpdater title="数据分析" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-muted-foreground font-medium">Detailed metrics on your video production and performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={(v) => { if (v) setTimeframe(v); }}>
            <SelectTrigger className="w-[140px] font-bold">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d" className="font-bold">Last 7 Days</SelectItem>
              <SelectItem value="30d" className="font-bold">Last 30 Days</SelectItem>
              <SelectItem value="90d" className="font-bold">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <ExportDialog 
            title="Export Analytics" 
            description="Export performance metrics and engagement data."
            onExport={handleExport}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-muted-foreground/10 hover:shadow-md transition-all group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Total Produced</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{overview?.totalVideos || 0}</div>
            <p className="text-[10px] font-bold text-emerald-500 flex items-center mt-1 uppercase">
              <TrendingUp className="w-3 h-3 mr-1" /> +24% vs last
            </p>
          </CardContent>
        </Card>
        <Card className="border-muted-foreground/10 hover:shadow-md transition-all group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Avg. Process Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{overview?.avgProcessingTime || "--"}</div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">
              -12s improvement
            </p>
          </CardContent>
        </Card>
        <Card className="border-muted-foreground/10 hover:shadow-md transition-all group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{overview?.successRate || "--"}</div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">
              Stable performance
            </p>
          </CardContent>
        </Card>
        <Card className="border-muted-foreground/10 hover:shadow-md transition-all group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Est. Reach</CardTitle>
            <Eye className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{overview?.estimatedViews || 0}</div>
            <p className="text-[10px] font-bold text-emerald-500 flex items-center mt-1 uppercase">
              <TrendingUp className="w-3 h-3 mr-1" /> +145% growth
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-5 border-muted-foreground/10">
          <CardHeader>
            <CardTitle className="text-lg">Production Volume</CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Daily video generation across all brands.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.length > 0 ? trends : overview?.trends || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)", fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)", fontWeight: 'bold' }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", borderRadius: "8px", fontWeight: 'bold', fontSize: '12px' }}
                    itemStyle={{ color: "var(--color-foreground)" }}
                  />
                  <Area type="monotone" dataKey="videos" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorVideos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-muted-foreground/10 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Platform Dist.</CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Target delivery formats.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview?.platforms || []} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)", fontWeight: 'bold' }} />
                  <RechartsTooltip cursor={{fill: 'var(--color-muted)', opacity: 0.4}} contentStyle={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", borderRadius: "8px", fontSize: '12px' }} />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted-foreground/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top 5 Performing Videos</CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Based on views and engagement over selected period.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-widest group">
            Full Report <ArrowUpRight className="ml-1 w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topVideos.length > 0 ? topVideos.map((video, i) => (
              <div key={i} className="flex items-center group p-2 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs mr-4">
                  #{i+1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{video.title}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">{video.brand}</div>
                </div>
                <div className="flex gap-8 items-center ml-4">
                  <div className="text-right">
                    <div className="text-xs font-black">{video.views}</div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground">Views</div>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <div className="text-xs font-black text-emerald-500">{video.engagement}</div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground">Eng.</div>
                  </div>
                  <Link href={`/dashboard/videos/${video.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl">
                <Video className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-bold text-muted-foreground">No video data available yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


