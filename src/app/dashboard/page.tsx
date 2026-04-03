"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Clock,
  Eye,
  Film,
  PlayCircle,
  Target,
  Upload,
} from "lucide-react";

import { MetadataUpdater } from "@/components/metadata-updater";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type AnalyticsOverview, type DataOverview } from "@/lib/api";
import { formatCompactNumber, formatDateTime, formatPercent } from "@/lib/format";
import { normalizeVideoStatus } from "@/lib/video-status";

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Film;
  iconClassName: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconClassName} group-hover:scale-110 transition-transform`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black">{value}</div>
        <p className="mt-1 text-[10px] uppercase font-bold text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function getStatusVariant(status: string) {
  const normalized = normalizeVideoStatus(status);
  if (normalized === "completed" || normalized === "published" || normalized === "approved") {
    return "default" as const;
  }
  if (normalized === "processing" || normalized === "queued") {
    return "secondary" as const;
  }
  return "destructive" as const;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<DataOverview | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [dataOverviewRes, analyticsRes] = await Promise.all([
        api.data.overview(),
        api.analytics.overview(),
      ]);
      setOverview(dataOverviewRes.data);
      setAnalytics(analyticsRes.data);
    } catch (loadError) {
      console.error("Failed to fetch dashboard data:", loadError);
      setError("首页数据加载失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const activity = overview?.activity || [];
  const recentVideos = overview?.recentVideos || [];
  const maxMetric = activity.reduce(
    (max, item) => Math.max(max, item.totalViews, item.totalVideos),
    0,
  );
  const activityBars = activity.map((item) => ({
    ...item,
    height:
      maxMetric > 0
        ? Math.max(14, Math.round((Math.max(item.totalViews, item.totalVideos) / maxMetric) * 100))
        : 14,
  }));

  if (loading && !overview) {
    return (
      <div className="flex flex-col gap-8 animate-in fade-in duration-500">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-7">
          <Skeleton className="lg:col-span-4 h-[400px] w-full" />
          <Skeleton className="lg:col-span-3 h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="flex flex-col gap-8 animate-in fade-in duration-500">
        <MetadataUpdater title="总览" />
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col gap-4 py-10">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <div>
              <Button onClick={() => void loadData()}>重新加载</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <MetadataUpdater title="总览" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">监控真实生产、播放表现和最近任务状态。</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/videos/create">
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </Link>
        </div>
      </div>

      {error ? (
        <Card className="border-amber-500/20 bg-amber-500/10">
          <CardContent className="flex items-center gap-3 py-4 text-sm text-amber-100">
            <AlertCircle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Produced"
          value={formatCompactNumber(overview?.summary.totalVideos)}
          description={`近 ${overview?.windowDays || 30} 天累计任务`}
          icon={Film}
          iconClassName="text-primary"
        />
        <MetricCard
          title="Total Views"
          value={formatCompactNumber(overview?.summary.totalViews)}
          description={`跟踪视频 ${formatCompactNumber(overview?.summary.trackedVideos)} 条`}
          icon={Eye}
          iconClassName="text-blue-500"
        />
        <MetricCard
          title="Avg. Views"
          value={formatCompactNumber(overview?.summary.averageViewsPerVideo)}
          description={`互动率 ${formatPercent(overview?.summary.engagementRate)}`}
          icon={BarChart3}
          iconClassName="text-orange-500"
        />
        <MetricCard
          title="Success Rate"
          value={formatPercent(analytics?.successRate ?? overview?.summary.successRate)}
          description={`已完成 ${formatCompactNumber(overview?.summary.completedVideos)} 条`}
          icon={Target}
          iconClassName="text-emerald-500"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 overflow-hidden border-muted-foreground/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>14 Day Activity</CardTitle>
                <CardDescription>真实任务和播放趋势，来自 `/api/v1/data/overview`。</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" render={<Link href="/dashboard/analytics" />}>
                View Report <ArrowUpRight className="ml-1 w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end gap-2 pt-6">
              {activityBars.map((item) => (
                <div
                  key={item.date}
                  className="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-sm cursor-pointer group relative"
                  style={{ height: `${item.height}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border whitespace-nowrap z-10">
                    {formatCompactNumber(item.totalViews)} views / {formatCompactNumber(item.totalVideos)} tasks
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
              <span>{activityBars[0]?.date.slice(5) || "--"}</span>
              <span>{activityBars[Math.floor(activityBars.length / 2)]?.date.slice(5) || "--"}</span>
              <span>{activityBars.at(-1)?.date.slice(5) || "--"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-muted-foreground/10">
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
            <CardDescription>最近 5 条真实视频任务。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentVideos.length > 0 ? recentVideos.map((video) => (
                <div key={video.id} className="flex items-center group cursor-pointer">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mr-4 group-hover:bg-primary/10 transition-colors">
                    <PlayCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <Link href={`/dashboard/videos/${video.id}`} className="text-sm font-medium leading-none truncate hover:underline block">
                      {video.title}
                    </Link>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">
                      {formatDateTime(video.createdAt || video.date)} • {video.brand}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(video.lifecycleStatus || video.status)} className="ml-auto text-[10px] h-5 px-1.5 font-bold uppercase">
                    {video.status}
                  </Badge>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">还没有最近任务</p>
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-xs text-muted-foreground uppercase font-bold tracking-widest group" render={<Link href="/dashboard/videos" />}>
              View all videos <ArrowUpRight className="ml-1 w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
