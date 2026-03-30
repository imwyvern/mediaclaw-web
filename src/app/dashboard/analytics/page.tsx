"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, CheckCircle2, TrendingUp, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar } from "recharts";

const data = [
  { name: "Mon", videos: 12, views: 4000 },
  { name: "Tue", videos: 18, views: 3000 },
  { name: "Wed", videos: 25, views: 5000 },
  { name: "Thu", videos: 22, views: 4500 },
  { name: "Fri", videos: 30, views: 6000 },
  { name: "Sat", videos: 15, views: 8000 },
  { name: "Sun", videos: 10, views: 7000 },
];

const platformData = [
  { name: "TikTok", value: 45 },
  { name: "Instagram", value: 35 },
  { name: "YouTube", value: 15 },
  { name: "Twitter", value: 5 },
];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Detailed metrics on your video production and performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="7d">
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos Produced</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">132</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> +24% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1m 45s</div>
            <p className="text-xs text-muted-foreground mt-1">
              -12s improvement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on 132 renders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">37.5K</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> +145% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-7">
        <Card className="col-span-7 lg:col-span-5">
          <CardHeader>
            <CardTitle>Production Volume</CardTitle>
            <CardDescription>Daily video generation across all brands.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", borderRadius: "8px" }}
                    itemStyle={{ color: "var(--color-foreground)" }}
                  />
                  <Area type="monotone" dataKey="videos" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorVideos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-7 lg:col-span-2">
          <CardHeader>
            <CardTitle>Target Platforms</CardTitle>
            <CardDescription>Format distribution.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                  <RechartsTooltip cursor={{fill: 'var(--color-muted)', opacity: 0.4}} contentStyle={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", borderRadius: "8px" }} />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
