"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FileVideo,
  Play,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

import { DataState, TableSkeleton, WarmEmptyState } from "@/components/data-state";
import { VideoStatusBadge } from "@/components/dashboard/video-status-badge";
import { MetadataUpdater } from "@/components/metadata-updater";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, isApiNotFoundError, readApiErrorMessage, type Video } from "@/lib/api";
import { formatCompactNumber, formatDate } from "@/lib/format";
import { normalizeVideoStatus } from "@/lib/video-status";
import { wsManager } from "@/lib/ws";

const PAGE_LIMIT = 50;

function StatCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(6,10,18,0.98))] shadow-[0_24px_80px_-48px_rgba(14,165,233,0.35)]">
      <CardHeader className="pb-2">
        <CardDescription className="text-xs uppercase tracking-[0.24em] text-slate-400">
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black text-white">{value}</div>
        <p className="mt-2 text-sm text-slate-300/75">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function VideosPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadVideos = async (options?: { silent?: boolean }) => {
    if (options?.silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);
    setComingSoon(false);

    try {
      const response = await api.videos.list({ page: 1, limit: PAGE_LIMIT });
      setVideos(response.data.items);
    } catch (loadError) {
      if (isApiNotFoundError(loadError)) {
        setVideos([]);
        setComingSoon(true);
      } else {
        setError(readApiErrorMessage(loadError, "视频列表加载失败，请稍后重试。"));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadVideos();
  }, []);

  useEffect(() => {
    const offProgress = wsManager.on("video_progress", (payload) => {
      setVideos((current) => current.map((video) => (
        video.id === payload.videoId
          ? {
              ...video,
              progress: payload.progress,
              status: "Processing",
              lifecycleStatus: "processing",
            }
          : video
      )));
    });

    const offCompleted = wsManager.on("video_completed", (payload) => {
      setVideos((current) => current.map((video) => (
        video.id === payload.id
          ? {
              ...video,
              progress: 100,
              status: "Completed",
              lifecycleStatus: "completed",
              outputVideoUrl: payload.outputVideoUrl || video.outputVideoUrl,
            }
          : video
      )));
    });

    const offFailed = wsManager.on("video_failed", (payload) => {
      setVideos((current) => current.map((video) => (
        video.id === payload.id
          ? {
              ...video,
              progress: 0,
              status: "Failed",
              lifecycleStatus: "failed",
            }
          : video
      )));
    });

    return () => {
      offProgress();
      offCompleted();
      offFailed();
    };
  }, []);

  const filteredVideos = videos.filter((video) => {
    const normalizedStatus = normalizeVideoStatus(video.lifecycleStatus || video.status);
    const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;
    const keyword = searchQuery.trim().toLowerCase();
    const matchesKeyword = !keyword || [video.title, video.brand].some((value) => value.toLowerCase().includes(keyword));

    return matchesStatus && matchesKeyword;
  });

  const summary = {
    total: videos.length,
    processing: videos.filter((video) => normalizeVideoStatus(video.lifecycleStatus || video.status) === "processing").length,
    completed: videos.filter((video) => {
      const status = normalizeVideoStatus(video.lifecycleStatus || video.status);
      return status === "completed" || status === "published" || status === "approved";
    }).length,
    failed: videos.filter((video) => normalizeVideoStatus(video.lifecycleStatus || video.status) === "failed").length,
  };

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500">
      <MetadataUpdater title="我的视频" />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-100">
            <FileVideo className="h-3.5 w-3.5" />
            Video Factory
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">我的视频</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
              查看真实视频任务列表、生产进度和输出结果。状态与进度会直接跟随后端任务和 WebSocket 事件刷新。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
            disabled={loading || refreshing}
            onClick={() => {
              void loadVideos({ silent: true });
            }}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            刷新列表
          </Button>
          <Button className="bg-white text-slate-950 hover:bg-slate-100" render={<Link href="/dashboard/videos/create" />}>
            <Plus className="mr-2 h-4 w-4" />
            新建视频
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="全部任务" value={formatCompactNumber(summary.total)} description="真实任务总数，默认拉取最近 50 条。" />
        <StatCard title="处理中" value={formatCompactNumber(summary.processing)} description="正在排队、渲染或等待后处理的任务。" />
        <StatCard title="已完成" value={formatCompactNumber(summary.completed)} description="已可下载或进入后续审批/发布阶段的视频。" />
        <StatCard title="失败" value={formatCompactNumber(summary.failed)} description="需要排查输入素材或后端执行日志的任务。" />
      </div>

      <Card className="border-border/70 bg-card/70">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>视频列表</CardTitle>
              <CardDescription>来自 `/api/v1/videos` 的真实任务列表，支持关键词和状态筛选。</CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-[220px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索标题或品牌"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => value && setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="queued">排队中</SelectItem>
                  <SelectItem value="processing">处理中</SelectItem>
                  <SelectItem value="pending_review">待审核</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataState
            loading={loading}
            error={comingSoon ? null : error}
            isEmpty={!loading && !error && (comingSoon || filteredVideos.length === 0)}
            loadingState={<TableSkeleton rows={6} columns={6} />}
            onRetry={() => {
              void loadVideos();
            }}
            emptyState={
              comingSoon ? (
                <WarmEmptyState
                  icon={Sparkles}
                  title="视频库即将上线"
                  description="当前环境未开放视频列表接口，后端准备好后这里会直接展示真实任务和状态。"
                  actionLabel="重新加载"
                  onAction={() => {
                    void loadVideos();
                  }}
                />
              ) : (
                <WarmEmptyState
                  icon={Sparkles}
                  title={searchQuery || statusFilter !== "all" ? "没有匹配的视频任务" : "还没有任何视频任务"}
                  description={searchQuery || statusFilter !== "all"
                    ? "换个关键词或状态试试，真实任务列表会在这里即时刷新。"
                    : "提交第一条真实视频任务后，这里会开始展示进度、状态和输出结果。"}
                  actionLabel={searchQuery || statusFilter !== "all" ? "清空筛选" : "创建第一条视频"}
                  onAction={() => {
                    if (searchQuery || statusFilter !== "all") {
                      setSearchQuery("");
                      setStatusFilter("all");
                      return;
                    }

                    window.location.href = "/dashboard/videos/create";
                  }}
                />
              )
            }
          >
            <div className="hidden overflow-hidden rounded-2xl border border-border/70 md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>视频内容</TableHead>
                    <TableHead>品牌</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建日期</TableHead>
                    <TableHead>消耗条数</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVideos.map((video) => (
                    <TableRow key={video.id} className="hover:bg-muted/20">
                      <TableCell>
                        <Link href={`/dashboard/videos/${video.id}`} className="flex items-center gap-3 group/title">
                          <div className="flex h-10 w-16 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground transition-colors group-hover/title:border-primary/30 group-hover/title:bg-primary/5">
                            <Play className="h-4 w-4" />
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium group-hover/title:text-primary">{video.title}</div>
                            <div className="text-xs text-muted-foreground">ID: {video.id}</div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">{video.brand}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-[160px] space-y-2">
                          <VideoStatusBadge status={video.lifecycleStatus || video.status} progress={video.progress} />
                          {normalizeVideoStatus(video.lifecycleStatus || video.status) === "processing" && typeof video.progress === "number" ? (
                            <Progress value={video.progress} className="h-1.5" />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(video.createdAt || video.date)}</TableCell>
                      <TableCell className="font-medium">{formatCompactNumber(video.credits)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" render={<Link href={`/dashboard/videos/${video.id}`} />}>
                            查看
                          </Button>
                          {video.outputVideoUrl ? (
                            <Button variant="ghost" size="sm" render={<a href={video.outputVideoUrl} target="_blank" rel="noreferrer" />}>
                              下载
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-4 md:hidden">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden border-border/70 bg-background/50">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="relative flex h-16 w-24 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
                        <Play className="h-5 w-5 opacity-70" />
                        {normalizeVideoStatus(video.lifecycleStatus || video.status) === "processing" && typeof video.progress === "number" ? (
                          <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/10">
                            <div className="h-full bg-primary transition-all" style={{ width: `${video.progress}%` }} />
                          </div>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/dashboard/videos/${video.id}`} className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">{video.title}</div>
                            <div className="text-[11px] text-muted-foreground">{video.brand}</div>
                          </Link>
                          <VideoStatusBadge status={video.lifecycleStatus || video.status} progress={video.progress} className="shrink-0" />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{formatDate(video.createdAt || video.date)}</span>
                          <span>{formatCompactNumber(video.credits)} 条额度</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DataState>
        </CardContent>
      </Card>
    </div>
  );
}
