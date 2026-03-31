"use client";

import { useEffect, useState } from "react";
import { Film, Activity, Users, Plus, Upload, ArrowUpRight, Clock, Loader2, PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, Video } from "@/lib/api";
import Link from "next/link";
import { MetadataUpdater } from "@/components/metadata-updater";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [recentVideos, setRecentVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overviewRes, videosRes] = await Promise.all([
          api.analytics.overview(),
          api.content.list({ limit: 5 })
        ]);
        setOverview(overviewRes.data);
        setRecentVideos(videosRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        // Fallback mock
        setRecentVideos([
          { id: "1", title: "Product_Demo_Final.mp4", status: "Completed", date: "2 hours ago", brand: "Acme Corp", credits: 5 },
          { id: "2", title: "Interview_Raw_Cam1.mov", status: "Processing", date: "5 hours ago", brand: "Global Inc", credits: 2 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const bandwidthData = Array.from({ length: 24 }).map((_, i) => ({
    height: Math.max(20, Math.random() * 100),
    usage: Math.floor(Math.random() * 500)
  }));

  if (loading && !overview) {
    return (
      <div className="flex flex-col gap-8 animate-in fade-in duration-500">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <div className="grid gap-8 lg:grid-cols-7">
          <Skeleton className="lg:col-span-4 h-[400px] w-full" />
          <Skeleton className="lg:col-span-3 h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <MetadataUpdater title="总览" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Monitor your content delivery and workspace metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Plus className="w-4 h-4 mr-2" /> New Project</Button>
          <Link href="/dashboard/videos/create">
            <Button><Upload className="w-4 h-4 mr-2" /> Upload Video</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Produced", value: overview?.totalVideos || "1,248", icon: Film, trend: "+12%", color: "text-primary" },
          { title: "Storage Usage", value: overview?.storageUsed || "8.4 TB", icon: Activity, trend: "+18%", color: "text-blue-500" },
          { title: "Avg. Views", value: overview?.avgViews || "45.2K", icon: Users, trend: "+8%", color: "text-orange-500" },
          { title: "Success Rate", value: overview?.successRate || "99.2%", icon: Clock, trend: "-1%", color: "text-emerald-500" },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color} group-hover:scale-110 transition-transform`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{stat.value}</div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-emerald-500">{stat.trend}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 overflow-hidden border-muted-foreground/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bandwidth Usage</CardTitle>
                <CardDescription>Daily bandwidth consumption across all CDNs.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">View Report <ArrowUpRight className="ml-1 w-3 h-3" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end gap-2 pt-6">
              {bandwidthData.map((data, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-sm cursor-pointer group relative" 
                  style={{ height: `${data.height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border whitespace-nowrap z-10">
                    {data.usage} GB
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:59</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-muted-foreground/10">
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
            <CardDescription>Latest processed videos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentVideos.length > 0 ? recentVideos.map((video, i) => (
                <div key={i} className="flex items-center group cursor-pointer">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mr-4 group-hover:bg-primary/10 transition-colors">
                    <PlayCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <Link href={`/dashboard/videos/${video.id}`} className="text-sm font-medium leading-none truncate hover:underline block">
                      {video.title}
                    </Link>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">{video.date} • {video.brand}</p>
                  </div>
                  <Badge variant={
                    video.status === "Completed" ? "default" : 
                    video.status === "Processing" ? "secondary" : 
                    "destructive"
                  } className="ml-auto text-[10px] h-5 px-1.5 font-bold uppercase">
                    {video.status}
                  </Badge>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Film className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-xs text-muted-foreground uppercase font-bold tracking-widest group" render={<Link href="/dashboard/content" />}>
              View all content <ArrowUpRight className="ml-1 w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

