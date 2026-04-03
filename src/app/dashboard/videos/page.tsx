"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
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
import {
  api,
  readApiErrorMessage,
  type PaginatedResponse,
  type Video,
} from "@/lib/api";
import { formatCompactNumber, formatDate } from "@/lib/format";
import { normalizeVideoStatus } from "@/lib/video-status";
import { wsManager } from "@/lib/ws";

const PAGE_LIMIT = 20;

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
  const [error, setError] = useState<string | null>(null);
  const [videosPage, setVideosPage] = useState<PaginatedResponse<Video> | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setError(null);
      if (loading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const response = await api.videos.list({
          page,
          limit: PAGE_LIMIT,
          status: statusFilter !== "all" ? statusFilter : undefined,
        });

        if (cancelled) {
          return;
        }

        setVideosPage(response.data);
        setVideos(response.data.items);
      } catch (loadError) {
        if (!cancelled) {
          setError(readApiErrorMessage(loadError, "视频列表加载失败，请稍后重试。"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [page, reloadNonce, statusFilter]);

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

  const filteredVideos = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) {
      return videos;
    }

    return videos.filter((video) => (
      [video.title, video.brand].some((value) => value.toLowerCase().includes(keyword))
    ));
  }, [searchQuery, videos]);

  const summary = {
    total: videosPage?.total || 0,
    processing: videos.filter((video) => normalizeVideoStatus(video.lifecycleStatus || video.status) === "processing").length,
    completed: videos.filter((video) => {
      const status = normalizeVideoStatus(video.lifecycleStatus || video.status);
      return status === "completed" || status === "published" || status === "approved";
    }).length,
    failed: videos.filter((video) => normalizeVideoStatus(video.lifecycleStatus || video.status) === "failed").length,
  };
  const totalPages = Math.max(1, Math.ceil((videosPage?.total || 0) / PAGE_LIMIT));

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
              直接对接 `/api/v1/videos` 的真实分页结果，支持状态筛选、关键词过滤和详情跳转。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
            disabled={loading || refreshing}
            onClick={() => {
              setReloadNonce((current) => current + 1);
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
        <StatCard title="全部任务" value={formatCompactNumber(summary.total)} description="符合当前状态筛选的真实任务总数。" />
        <StatCard title="处理中" value={formatCompactNumber(summary.processing)} description="当前页中正在排队、渲染或后处理的任务。" />
        <StatCard title="已完成" value={formatCompactNumber(summary.completed)} description="当前页中已生成成片的视频任务。" />
        <StatCard title="失败" value={formatCompactNumber(summary.failed)} description="当前页中需要排查执行链路的任务。" />
      </div>

      <Card className="border-border/70 bg-card/70">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>视频列表</CardTitle>
              <CardDescription>详情页继续通过 `/api/v1/videos/:id` 拉取单条任务和迭代记录。</CardDescription>
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
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  if (!value) {
                    return;
                  }
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
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
            error={error}
            isEmpty={!loading && !error && filteredVideos.length === 0}
            loadingState={<TableSkeleton rows={6} columns={6} />}
            onRetry={() => {
              setReloadNonce((current) => current + 1);
            }}
            emptyState={
              <WarmEmptyState
                icon={Sparkles}
                title={searchQuery ? "当前页没有匹配的视频任务" : "还没有任何视频任务"}
                description={searchQuery
                  ? "换个关键词试试，或切换分页查看其它真实任务。"
                  : "提交第一条真实视频任务后，这里会开始展示进度、状态和输出结果。"}
                actionLabel={searchQuery ? "清空搜索" : "创建第一条视频"}
                onAction={() => {
                  if (searchQuery) {
                    setSearchQuery("");
                    return;
                  }
                  window.location.href = "/dashboard/videos/create";
                }}
              />
            }
          >
            <div className="mb-4 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                第 {page} / {totalPages} 页，共 {formatCompactNumber(videosPage?.total || 0)} 条
              </span>
              <span>关键词过滤只作用于当前页，状态筛选由后端分页接口执行。</span>
            </div>

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
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="space-y-2">
                          <Link href={`/dashboard/videos/${video.id}`} className="block truncate text-base font-semibold hover:text-primary">
                            {video.title}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{video.brand}</Badge>
                            <VideoStatusBadge status={video.lifecycleStatus || video.status} progress={video.progress} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em]">创建日期</div>
                            <div className="mt-1">{formatDate(video.createdAt || video.date)}</div>
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em]">消耗条数</div>
                            <div className="mt-1">{formatCompactNumber(video.credits)}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" render={<Link href={`/dashboard/videos/${video.id}`} />}>
                            查看详情
                          </Button>
                          {video.outputVideoUrl ? (
                            <Button variant="outline" className="flex-1" render={<a href={video.outputVideoUrl} target="_blank" rel="noreferrer" />}>
                              下载成片
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                当前每页 {PAGE_LIMIT} 条，服务端返回总数 {formatCompactNumber(videosPage?.total || 0)}。
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading || refreshing}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || loading || refreshing}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  下一页
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </DataState>
        </CardContent>
      </Card>
    </div>
  );
}
