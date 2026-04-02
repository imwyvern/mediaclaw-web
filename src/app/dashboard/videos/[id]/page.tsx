"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  Download,
  FileText,
  Film,
  History,
  Link2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { DataState, TableSkeleton, WarmEmptyState } from "@/components/data-state";
import { VideoStatusBadge, normalizeVideoStatus } from "@/components/dashboard/video-status-badge";
import { MetadataUpdater } from "@/components/metadata-updater";
import { VideoPlayer } from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, readApiErrorMessage, type VideoDetail, type VideoIteration } from "@/lib/api";
import { formatCompactNumber, formatDateTime } from "@/lib/format";

function DetailMetric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-bold text-white">{value}</div>
      {hint ? <p className="mt-2 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

function getVideoPlayerStatus(video: VideoDetail | null) {
  if (!video) {
    return "Processing" as const;
  }

  const normalized = normalizeVideoStatus(video.lifecycleStatus || video.status);
  if ((normalized === "completed" || normalized === "approved" || normalized === "published") && video.outputVideoUrl) {
    return "Ready" as const;
  }

  if (normalized === "failed") {
    return "Failed" as const;
  }

  return "Processing" as const;
}

function getMetadataSummary(video: VideoDetail | null) {
  const metadata = video?.metadata && typeof video.metadata === "object"
    ? (video.metadata as Record<string, unknown>)
    : {};

  return {
    prompt: typeof metadata.prompt === "string" ? metadata.prompt : "",
    style: typeof metadata.style === "string" ? metadata.style : "--",
    duration: typeof metadata.duration === "number" ? `${metadata.duration} 秒` : "--",
    count: typeof metadata.count === "number" ? `${metadata.count} 条` : "--",
    sourceMode: typeof metadata.mode === "string"
      ? metadata.mode
      : typeof video?.taskType === "string"
        ? video.taskType
        : "--",
  };
}

export default function VideoDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const videoId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [iterations, setIterations] = useState<VideoIteration[]>([]);
  const [iterationsLoading, setIterationsLoading] = useState(false);
  const [iterationsLoaded, setIterationsLoaded] = useState(false);
  const [iterationsError, setIterationsError] = useState<string | null>(null);

  const loadDetail = async (options?: { silent?: boolean }) => {
    if (!videoId) {
      setLoading(false);
      setError("缺少视频 ID，无法加载详情。");
      return;
    }

    if (options?.silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await api.videos.get(videoId);
      setVideo(response.data);
    } catch (loadError) {
      setError(readApiErrorMessage(loadError, "视频详情加载失败，请稍后重试。"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadIterations = async (options?: { silent?: boolean }) => {
    if (!videoId) {
      return;
    }

    if (!options?.silent) {
      setIterationsLoading(true);
    }
    setIterationsError(null);

    try {
      const response = await api.videos.iterations(videoId);
      setIterations(response.data);
      setIterationsLoaded(true);
    } catch (loadError) {
      setIterationsError(readApiErrorMessage(loadError, "迭代日志加载失败，请稍后重试。"));
      setIterationsLoaded(true);
    } finally {
      setIterationsLoading(false);
    }
  };

  useEffect(() => {
    void loadDetail();
  }, [videoId]);

  useEffect(() => {
    if (activeTab === "iterations" && !iterationsLoaded && !iterationsLoading) {
      void loadIterations();
    }
  }, [activeTab, iterationsLoaded, iterationsLoading, videoId]);

  const metadata = useMemo(() => getMetadataSummary(video), [video]);
  const normalizedStatus = normalizeVideoStatus(video?.lifecycleStatus || video?.status);
  const timeline = video?.timeline || [];

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500">
      <MetadataUpdater title={video?.title || "视频详情"} />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-100">
            <Film className="h-3.5 w-3.5" />
            Production Detail
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{video?.title || "视频详情"}</h1>
              {video ? <VideoStatusBadge status={video.lifecycleStatus || video.status} progress={video.progress} /> : null}
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
              任务 ID: {videoId || "--"}
              {video?.createdAt ? ` · 创建于 ${formatDateTime(video.createdAt)}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
            onClick={() => router.push("/dashboard/videos")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
          <Button
            variant="outline"
            className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
            disabled={loading || refreshing}
            onClick={() => {
              void loadDetail({ silent: true });
              if (activeTab === "iterations") {
                void loadIterations({ silent: true });
              }
            }}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            刷新数据
          </Button>
          {video?.outputVideoUrl ? (
            <Button className="bg-white text-slate-950 hover:bg-slate-100" render={<a href={video.outputVideoUrl} target="_blank" rel="noreferrer" />}>
              <Download className="mr-2 h-4 w-4" />
              下载成片
            </Button>
          ) : null}
        </div>
      </div>

      <DataState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && !video}
        loadingState={<TableSkeleton rows={4} columns={4} />}
        onRetry={() => {
          void loadDetail();
        }}
        emptyState={
          <WarmEmptyState
            icon={Sparkles}
            title="这条视频暂时不可用"
            description="后端还没有返回这条任务的详情，稍后刷新或回到列表重新进入。"
            actionLabel="返回视频列表"
            onAction={() => router.push("/dashboard/videos")}
          />
        }
      >
        {video ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(6,10,18,0.98))] shadow-[0_24px_80px_-48px_rgba(14,165,233,0.35)]">
                <CardContent className="p-4 sm:p-6">
                  <VideoPlayer
                    src={video.outputVideoUrl}
                    status={getVideoPlayerStatus(video)}
                    className="min-h-[320px] rounded-2xl"
                  />
                </CardContent>
              </Card>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="h-auto w-full justify-start gap-2 bg-transparent p-0">
                  <TabsTrigger value="overview" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-slate-200 data-[state=active]:border-sky-400/50 data-[state=active]:bg-sky-500/10 data-[state=active]:text-sky-100">
                    概览
                  </TabsTrigger>
                  <TabsTrigger value="iterations" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-slate-200 data-[state=active]:border-sky-400/50 data-[state=active]:bg-sky-500/10 data-[state=active]:text-sky-100">
                    迭代日志
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0 space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <DetailMetric label="当前状态" value={normalizedStatus === "processing" ? `${Math.round(video.progress || 0)}%` : normalizedStatus} hint="状态由真实任务生命周期映射而来。" />
                    <DetailMetric label="消耗额度" value={`${formatCompactNumber(video.credits)} 条`} hint="来自任务详情和账单统计。" />
                    <DetailMetric label="LLM Tokens" value={formatCompactNumber(video.tokens || 0)} hint="用于估算脚本和推理成本。" />
                    <DetailMetric label="品牌" value={video.brand || "--"} hint={video.brandId ? `Brand ID: ${video.brandId}` : undefined} />
                  </div>

                  <Card className="border-border/70 bg-card/70">
                    <CardHeader>
                      <CardTitle>任务信息</CardTitle>
                      <CardDescription>这里展示后端返回的关键任务参数和时间线摘要。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">总体进度</span>
                          <span className="font-semibold text-foreground">{Math.round(video.progress || 0)}%</span>
                        </div>
                        <Progress value={Math.max(0, Math.min(100, video.progress || 0))} />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">基础信息</div>
                          <div className="mt-4 space-y-3 text-sm">
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-muted-foreground">创建时间</span>
                              <span className="text-right font-medium">{formatDateTime(video.createdAt || video.date)}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-muted-foreground">最近更新</span>
                              <span className="text-right font-medium">{formatDateTime(video.updatedAt)}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-muted-foreground">完成时间</span>
                              <span className="text-right font-medium">{formatDateTime(video.completedAt)}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-muted-foreground">任务类型</span>
                              <span className="text-right font-medium">{video.taskType || video.type || "--"}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-muted-foreground">审批状态</span>
                              <span className="text-right font-medium">{video.approvalStatus || "--"}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-muted-foreground">发布状态</span>
                              <span className="text-right font-medium">{video.publishStatus || "--"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">生成参数</div>
                          <div className="mt-4 space-y-3 text-sm">
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-muted-foreground">生成模式</span>
                              <span className="text-right font-medium">{metadata.sourceMode}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-muted-foreground">内容风格</span>
                              <span className="text-right font-medium">{metadata.style}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-muted-foreground">目标时长</span>
                              <span className="text-right font-medium">{metadata.duration}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-muted-foreground">生成数量</span>
                              <span className="text-right font-medium">{metadata.count}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-muted-foreground">素材链接</span>
                              {video.sourceVideoUrl ? (
                                <a
                                  href={video.sourceVideoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="max-w-[60%] truncate text-right font-medium text-sky-300 hover:text-sky-200"
                                >
                                  {video.sourceVideoUrl}
                                </a>
                              ) : (
                                <span className="text-right font-medium">--</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                          <FileText className="h-4 w-4 text-sky-300" />
                          创作 Brief
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300/85">
                          {metadata.prompt || "后端当前未返回 prompt 字段，任务已创建但 brief 尚未同步到详情接口。"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="iterations" className="mt-0">
                  <Card className="border-border/70 bg-card/70">
                    <CardHeader>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <CardTitle>迭代日志</CardTitle>
                          <CardDescription>独立调用 `/api/v1/videos/:id/iterations`，展示每次状态变更和版本输出。</CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
                          disabled={iterationsLoading}
                          onClick={() => {
                            void loadIterations();
                          }}
                        >
                          <RefreshCw className={`mr-2 h-4 w-4 ${iterationsLoading ? "animate-spin" : ""}`} />
                          刷新日志
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <DataState
                        loading={iterationsLoading}
                        error={iterationsError}
                        isEmpty={!iterationsLoading && iterationsLoaded && iterations.length === 0}
                        loadingState={<TableSkeleton rows={5} columns={4} />}
                        onRetry={() => {
                          void loadIterations();
                        }}
                        emptyState={
                          <WarmEmptyState
                            icon={History}
                            title="还没有迭代日志"
                            description="后端尚未记录这条任务的状态流转，稍后刷新即可看到完整轨迹。"
                            actionLabel="重新拉取"
                            onAction={() => {
                              void loadIterations();
                            }}
                          />
                        }
                      >
                        <div className="space-y-4">
                          {iterations.map((item, index) => (
                            <div key={item.id || `${item.timestamp || "entry"}-${index}`} className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-2">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <VideoStatusBadge status={item.status} progress={item.progress} />
                                    <span className="text-xs text-muted-foreground">{formatDateTime(item.timestamp)}</span>
                                  </div>
                                  <div className="text-base font-semibold text-foreground">{item.label}</div>
                                  <p className="text-sm leading-6 text-slate-300/80">
                                    {item.message || "当前阶段没有附加说明，后端只返回了状态变化信息。"}
                                  </p>
                                </div>
                                {item.outputVideoUrl ? (
                                  <Button variant="ghost" size="sm" className="justify-start text-sky-300 hover:text-sky-200" render={<a href={item.outputVideoUrl} target="_blank" rel="noreferrer" />}>
                                    <Download className="mr-2 h-4 w-4" />
                                    下载该版本
                                  </Button>
                                ) : null}
                              </div>
                              <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>进度</span>
                                  <span>{Math.round(item.progress || 0)}%</span>
                                </div>
                                <Progress value={Math.max(0, Math.min(100, item.progress || 0))} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </DataState>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card className="border-border/70 bg-card/70">
                <CardHeader>
                  <CardTitle>任务摘要</CardTitle>
                  <CardDescription>用于快速查看这条视频的关键生产信息。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">状态</span>
                    <VideoStatusBadge status={video.lifecycleStatus || video.status} progress={video.progress} />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">标题</span>
                    <span className="max-w-[60%] text-right font-medium">{video.title}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">品牌</span>
                    <span className="text-right font-medium">{video.brand || "--"}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">额度消耗</span>
                    <span className="text-right font-medium">{formatCompactNumber(video.credits)} 条</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">LLM Tokens</span>
                    <span className="text-right font-medium">{formatCompactNumber(video.tokens || 0)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/70">
                <CardHeader>
                  <CardTitle>时间线概览</CardTitle>
                  <CardDescription>直接使用视频详情接口返回的 timeline 数据。</CardDescription>
                </CardHeader>
                <CardContent>
                  {timeline.length > 0 ? (
                    <div className="space-y-4">
                      {timeline.slice(0, 5).map((item, index) => (
                        <div key={item.id || `${item.timestamp || "timeline"}-${index}`} className="flex gap-3">
                          <div className="mt-1 rounded-full border border-sky-500/30 bg-sky-500/10 p-2 text-sky-200">
                            <Clock3 className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="font-medium text-foreground">{item.label}</div>
                              <VideoStatusBadge status={item.status} progress={item.progress} className="scale-[0.95]" />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.timestamp)}</p>
                            {item.message ? <p className="mt-2 text-sm text-slate-300/80">{item.message}</p> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <WarmEmptyState
                      icon={Clock3}
                      title="时间线尚未生成"
                      description="后端还没有返回任务流转记录，等处理开始后这里会自动丰富。"
                    />
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/70">
                <CardHeader>
                  <CardTitle>快捷动作</CardTitle>
                  <CardDescription>围绕真实任务数据提供常见操作。</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <Button variant="outline" className="justify-start border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]" onClick={() => setActiveTab("iterations")}>
                    <History className="mr-2 h-4 w-4" />
                    查看完整迭代日志
                  </Button>
                  {video.sourceVideoUrl ? (
                    <Button variant="outline" className="justify-start border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]" render={<a href={video.sourceVideoUrl} target="_blank" rel="noreferrer" />}>
                      <Link2 className="mr-2 h-4 w-4" />
                      打开素材来源
                    </Button>
                  ) : null}
                  {video.outputVideoUrl ? (
                    <Button variant="outline" className="justify-start border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]" render={<a href={video.outputVideoUrl} target="_blank" rel="noreferrer" />}>
                      <Download className="mr-2 h-4 w-4" />
                      打开最新成片
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </DataState>
    </div>
  );
}
