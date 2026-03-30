"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Film, Activity, Users, Plus, Upload, MoreHorizontal, ArrowUpRight, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Monitor your content delivery and workspace metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Plus className="w-4 h-4 mr-2" /> New Project</Button>
          <Button><Upload className="w-4 h-4 mr-2" /> Upload Video</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Videos", value: "1,248", icon: Film, trend: "+12%", color: "text-primary" },
          { title: "Bandwidth (30d)", value: "8.4 TB", icon: Activity, trend: "+18%", color: "text-blue-500" },
          { title: "Unique Viewers", value: "45.2K", icon: Users, trend: "+8%", color: "text-orange-500" },
          { title: "Avg. Rendering", value: "1m 45s", icon: Clock, trend: "-12s", color: "text-emerald-500" },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className={stat.trend.startsWith("+") ? "text-emerald-500" : "text-emerald-500"}>
                  {stat.trend}
                </span> 
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 overflow-hidden">
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
              {Array.from({ length: 24 }).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-sm cursor-pointer group relative" 
                  style={{ height: `${Math.max(20, Math.random() * 100)}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border whitespace-nowrap z-10">
                    {Math.floor(Math.random() * 500)} GB
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

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
            <CardDescription>Latest processed videos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { id: "1", name: "Product_Demo_Final.mp4", status: "Ready", time: "2 hours ago", dur: "04:12" },
                { id: "2", name: "Interview_Raw_Cam1.mov", status: "Processing", time: "5 hours ago", dur: "--:--" },
                { id: "3", name: "Tutorial_Setup.mp4", status: "Ready", time: "1 day ago", dur: "12:45" },
                { id: "4", name: "Social_Ad_Campaign.mp4", status: "Failed", time: "2 days ago", dur: "00:30" }
              ].map((video, i) => (
                <div key={i} className="flex items-center group cursor-pointer" onClick={() => {}}>
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mr-4 group-hover:bg-primary/10 transition-colors">
                    <Film className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <Link href={`/dashboard/videos/${video.id}`} className="text-sm font-medium leading-none truncate hover:underline block">
                      {video.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{video.time} • {video.dur}</p>
                  </div>
                  <Badge variant={
                    video.status === "Ready" ? "default" : 
                    video.status === "Processing" ? "secondary" : 
                    "destructive"
                  } className="ml-auto">
                    {video.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-xs text-muted-foreground">
              <Link href="/dashboard/videos">View all videos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
