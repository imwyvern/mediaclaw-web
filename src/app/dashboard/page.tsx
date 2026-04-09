"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Video,
  PlaySquare,
  UploadCloud,
  MessageSquare,
  Briefcase,
  Flame,
  PlusCircle,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileVideo,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCompactNumber } from "@/lib/format";

interface OverviewStats {
  totalVideos: number;
  totalVideosTrend: number;
  monthCreated: number;
  monthCreatedTrend: number;
  monthPublished: number;
  monthPublishedTrend: number;
  monthViews: number;
  monthViewsTrend: number;
}

interface RecentVideo {
  id: string;
  title: string;
  status: string;
  viralScore: number;
  thumbnailUrl: string;
  platform?: string;
  createdAt: string;
}

interface ActivityEvent {
  id: string;
  type: "video_completed" | "video_published" | "comment_received";
  description: string;
  timestamp: string;
}

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, videosRes] = await Promise.all([
        fetch("/api/v1/analytics/overview").catch(() => null),
        fetch("/api/v1/content?limit=6&sort=-createdAt").catch(() => null)
      ]);

      if (!statsRes?.ok || !videosRes?.ok) {
        throw new Error("服务暂时不可用，请稍后重试");
      }

      const statsData = await statsRes.json();
      const videosData = await videosRes.json();

      setStats(statsData.data || {
        totalVideos: 0, totalVideosTrend: 0,
        monthCreated: 0, monthCreatedTrend: 0,
        monthPublished: 0, monthPublishedTrend: 0,
        monthViews: 0, monthViewsTrend: 0
      });
      setRecentVideos(Array.isArray(videosData.data) ? videosData.data : []);
      setActivities(statsData.activities || []); // Assuming activities come from overview API
    } catch (err: any) {
      console.error(err);
      setError("服务连接中...");
      // Empty state fallbacks
      setStats(null);
      setRecentVideos([]);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const renderTrend = (value: number) => {
    if (value > 0) {
      return (
        <span className="flex items-center text-xs font-medium text-[#00e8b8]">
          <TrendingUp className="w-3 h-3 mr-1" /> +{value}%
        </span>
      );
    }
    if (value < 0) {
      return (
        <span className="flex items-center text-xs font-medium text-red-500">
          <TrendingDown className="w-3 h-3 mr-1" /> {value}%
        </span>
      );
    }
    return <span className="text-xs font-medium text-white/40">无变化</span>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-[#00e8b8]/20 text-[#00e8b8] border-none">已发布</Badge>;
      case "ready": return <Badge className="bg-blue-500/20 text-blue-400 border-none">待发布</Badge>;
      case "processing": return <Badge className="bg-yellow-500/20 text-yellow-400 border-none">处理中</Badge>;
      default: return <Badge className="bg-white/10 text-white/70 border-none">草稿</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "video_completed": return <CheckCircle2 className="w-4 h-4 text-[#00e8b8]" />;
      case "video_published": return <UploadCloud className="w-4 h-4 text-blue-400" />;
      case "comment_received": return <MessageSquare className="w-4 h-4 text-purple-400" />;
      default: return <Clock className="w-4 h-4 text-white/50" />;
    }
  };

  if (loading) {
    // Show empty state if loading takes a moment, but loading.tsx usually handles it.
    // In case of client re-fetch, we can show a placeholder or let the UI handle it.
  }

  return (
    <div className="flex flex-col gap-8 min-h-[calc(100vh-8rem)] text-[#f0f0f0]">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-1">概览</h1>
        <p className="text-white/50">掌握核心数据，快速开启内容创作</p>
      </div>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 border-dashed p-12 text-center">
          <AlertCircle className="w-12 h-12 text-[#00e8b8]/60 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">服务连接中...</h3>
          <p className="text-white/50 max-w-md">仪表盘数据暂时无法获取。正在尝试重新连接，请稍后...</p>
          <Button onClick={fetchDashboardData} variant="outline" className="mt-8 border-white/20 hover:bg-white/10 bg-transparent text-white">
            重新加载
          </Button>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[#0b0f1a] border-white/10 shadow-none hover:border-white/20 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <FileVideo className="w-5 h-5 text-white/70" />
                  </div>
                  {renderTrend(stats?.totalVideosTrend || 0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/50 mb-1">总视频数</p>
                  <h3 className="text-3xl font-black text-white">{formatCompactNumber(stats?.totalVideos || 0)}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0b0f1a] border-white/10 shadow-none hover:border-white/20 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#00e8b8]/10 flex items-center justify-center">
                    <PlusCircle className="w-5 h-5 text-[#00e8b8]" />
                  </div>
                  {renderTrend(stats?.monthCreatedTrend || 0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/50 mb-1">本月生产</p>
                  <h3 className="text-3xl font-black text-white">{formatCompactNumber(stats?.monthCreated || 0)}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0b0f1a] border-white/10 shadow-none hover:border-white/20 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5 text-blue-400" />
                  </div>
                  {renderTrend(stats?.monthPublishedTrend || 0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/50 mb-1">本月发布</p>
                  <h3 className="text-3xl font-black text-white">{formatCompactNumber(stats?.monthPublished || 0)}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0b0f1a] border-white/10 shadow-none hover:border-white/20 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <PlaySquare className="w-5 h-5 text-purple-400" />
                  </div>
                  {renderTrend(stats?.monthViewsTrend || 0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/50 mb-1">本月播放量</p>
                  <h3 className="text-3xl font-black text-white">{formatCompactNumber(stats?.monthViews || 0)}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#00e8b8]" />
                  近期视频
                </h2>
                <Link href="/dashboard/videos" className="text-sm text-white/50 hover:text-[#00e8b8] flex items-center gap-1 transition-colors">
                  查看全部 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {recentVideos.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-12 text-center">
                  <Video className="w-10 h-10 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 mb-2">暂无视频数据</p>
                  <p className="text-sm text-white/40 mb-6">创建您的第一个视频任务，开始提升品牌曝光</p>
                  <Link href="/dashboard/videos/create">
                    <Button className="bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold">
                      <PlusCircle className="w-4 h-4 mr-2" /> 创建任务
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentVideos.map((video) => (
                    <Link href={`/dashboard/videos/${video.id}`} key={video.id} className="block group">
                      <Card className="bg-[#0b0f1a] border-white/10 overflow-hidden hover:border-[#00e8b8]/40 transition-all duration-300 h-full">
                        <div className="relative aspect-video bg-white/5 border-b border-white/5 overflow-hidden">
                          {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 group-hover:scale-105 transition-transform duration-500">无封面</div>
                          )}
                          <div className="absolute top-2 left-2">{getStatusBadge(video.status)}</div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold text-white/90 text-sm line-clamp-2 mb-3 group-hover:text-[#00e8b8] transition-colors">{video.title}</h3>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/40">{new Date(video.createdAt).toLocaleDateString()}</span>
                            <span className="flex items-center font-medium text-white/60">
                              <Flame className={`w-3 h-3 mr-1 ${video.viralScore >= 80 ? 'text-[#00e8b8]' : 'text-yellow-500'}`} />
                              {video.viralScore}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-8">
              {/* Quick Actions */}
              <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
                <CardHeader className="pb-4 border-b border-white/5">
                  <CardTitle className="text-lg text-white">快捷操作</CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 gap-3">
                  <Link href="/dashboard/videos/create">
                    <Button variant="outline" className="w-full justify-start h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-[#00e8b8] transition-colors">
                      <PlusCircle className="w-5 h-5 mr-3 text-[#00e8b8]" /> 
                      <span className="font-medium">创建混剪任务</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/discovery">
                    <Button variant="outline" className="w-full justify-start h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-orange-400 transition-colors">
                      <Flame className="w-5 h-5 mr-3 text-orange-400" /> 
                      <span className="font-medium">查看平台爆款</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/brands">
                    <Button variant="outline" className="w-full justify-start h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-purple-400 transition-colors">
                      <Briefcase className="w-5 h-5 mr-3 text-purple-400" /> 
                      <span className="font-medium">管理品牌资产</span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Activity Feed */}
              <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
                <CardHeader className="pb-4 border-b border-white/5">
                  <CardTitle className="text-lg text-white">最新动态</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {activities.length === 0 ? (
                    <div className="p-8 text-center text-white/40 text-sm">暂无最新动态</div>
                  ) : (
                    <div className="flex flex-col">
                      {activities.map((activity, idx) => (
                        <div key={activity.id || idx} className="p-4 border-b border-white/5 last:border-0 flex gap-4 items-start hover:bg-white/5 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/80 leading-snug">{activity.description}</p>
                            <p className="text-xs text-white/40 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
