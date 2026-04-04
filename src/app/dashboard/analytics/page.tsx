"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Coins,
  Eye,
  Heart,
  MessageCircle,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CardGridSkeleton, DataState, WarmEmptyState } from "@/components/data-state";
import { ExportDialog, type ExportConfig } from "@/components/export-dialog";
import { MetadataUpdater } from "@/components/metadata-updater";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  api,
  readApiErrorMessage,
  type AnalyticsOverview,
  type AnalyticsTopVideo,
  type AnalyticsTrendPoint,
} from "@/lib/api";
import {
  formatCompactNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDuration,
  formatPercent,
} from "@/lib/format";
import { toast } from "sonner";

type TimeframeValue = "7d" | "30d" | "90d";
type TrendMetricKey = "totalVideos" | "views" | "creditsUsed" | "successRate";
type BenchmarkPayload = Record<string, unknown> | null;

interface SectionErrorState {
  overview: string | null;
  trends: string | null;
  topVideos: string | null;
  benchmark: string | null;
}

interface TrendMetricConfig {
  key: TrendMetricKey;
  label: string;
  description: string;
  stroke: string;
}

interface BenchmarkItem {
  label: string;
  value: string;
}

interface BenchmarkSectionData {
  title: string;
  items: BenchmarkItem[];
}

const TIMEFRAME_OPTIONS: Array<{ value: TimeframeValue; label: string }> = [
  { value: "7d", label: "最近 7 天" },
  { value: "30d", label: "最近 30 天" },
  { value: "90d", label: "最近 90 天" },
];

const TREND_METRICS: TrendMetricConfig[] = [
  {
    key: "totalVideos",
    label: "产出视频",
    description: "总出片量与完成量的走势。",
    stroke: "#38bdf8",
  },
  {
    key: "views",
    label: "播放量",
    description: "内容表现的真实播放反馈。",
    stroke: "#f59e0b",
  },
  {
    key: "creditsUsed",
    label: "消耗额度",
    description: "每个周期内实际消耗的额度。",
    stroke: "#34d399",
  },
  {
    key: "successRate",
    label: "成功率",
    description: "任务成功完成的比例。",
    stroke: "#a3e635",
  },
];

const BENCHMARK_LABELS: Record<string, string> = {
  avg: "平均值",
  average: "平均值",
  avgView: "平均播放",
  avgViews: "平均播放",
  avgLike: "平均点赞",
  avgLikes: "平均点赞",
  avgComment: "平均评论",
  avgComments: "平均评论",
  benchmark: "基准",
  comments: "评论",
  completedVideos: "已完成视频",
  competitor: "竞品",
  competitorMedian: "竞品中位数",
  cost: "成本",
  credits: "额度",
  creditsUsed: "已消耗额度",
  engagement: "互动率",
  engagementRate: "互动率",
  engagementScore: "互动评分",
  industry: "行业",
  industryAverage: "行业均值",
  likes: "点赞",
  median: "中位数",
  p50: "P50",
  p75: "P75",
  p90: "P90",
  percentile50: "P50",
  percentile75: "P75",
  percentile90: "P90",
  rate: "比率",
  sampleSize: "样本量",
  successRate: "成功率",
  totalVideos: "总视频数",
  value: "数值",
  views: "播放量",
};

const EMPTY_ERRORS: SectionErrorState = {
  overview: null,
  trends: null,
  topVideos: null,
  benchmark: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPrimitive(value: unknown): value is string | number | boolean {
  return ["string", "number", "boolean"].includes(typeof value);
}

function humanizeKey(value: string) {
  return value
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/[_.-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatFieldLabel(key: string) {
  return BENCHMARK_LABELS[key] || humanizeKey(key);
}

function formatScalarValue(key: string, value: string | number | boolean) {
  if (typeof value === "boolean") {
    return value ? "是" : "否";
  }

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}(T|\s)?/.test(value)) {
      return formatDateTime(value);
    }

    return value || "--";
  }

  const normalizedKey = key.toLowerCase();

  if (normalizedKey.includes("ms")) {
    return formatDuration(value / 1000);
  }

  if (normalizedKey.includes("minute") || normalizedKey.includes("minutes")) {
    return `${Number(value).toFixed(1).replace(/\.0$/, "")} 分钟`;
  }

  if (
    normalizedKey.includes("rate") ||
    normalizedKey.includes("ratio") ||
    normalizedKey.includes("percent") ||
    normalizedKey.includes("ctr") ||
    normalizedKey.includes("engagement")
  ) {
    return formatPercent(value);
  }

  if (
    normalizedKey.includes("cost") ||
    normalizedKey.includes("amount") ||
    normalizedKey.includes("price") ||
    normalizedKey.includes("revenue")
  ) {
    return formatCurrency(value);
  }

  return formatCompactNumber(value);
}

function collectNestedBenchmarkItems(source: Record<string, unknown>, depth = 0): BenchmarkItem[] {
  const items: BenchmarkItem[] = [];

  for (const [key, value] of Object.entries(source)) {
    if (isPrimitive(value)) {
      items.push({
        label: formatFieldLabel(key),
        value: formatScalarValue(key, value),
      });
      continue;
    }

    if (Array.isArray(value) && value.length > 0) {
      items.push({
        label: formatFieldLabel(key),
        value: `共 ${formatCompactNumber(value.length)} 项`,
      });
      continue;
    }

    if (depth < 1 && isRecord(value)) {
      const nested = collectNestedBenchmarkItems(value, depth + 1);
      items.push(
        ...nested.map((item) => ({
          label: `${formatFieldLabel(key)} · ${item.label}`,
          value: item.value,
        })),
      );
    }
  }

  return items;
}

function buildBenchmarkSections(payload: BenchmarkPayload) {
  if (!payload || !Object.keys(payload).length) {
    return [] as BenchmarkSectionData[];
  }

  const overviewItems: BenchmarkItem[] = [];
  const sections: BenchmarkSectionData[] = [];

  for (const [key, value] of Object.entries(payload)) {
    if (isPrimitive(value)) {
      overviewItems.push({
        label: formatFieldLabel(key),
        value: formatScalarValue(key, value),
      });
      continue;
    }

    if (Array.isArray(value)) {
      if (!value.length) {
        continue;
      }

      sections.push({
        title: formatFieldLabel(key),
        items: [{ label: "样本数", value: formatCompactNumber(value.length) }],
      });
      continue;
    }

    if (isRecord(value)) {
      const nestedItems = collectNestedBenchmarkItems(value).slice(0, 6);
      if (nestedItems.length) {
        sections.push({
          title: formatFieldLabel(key),
          items: nestedItems,
        });
      }
    }
  }

  if (overviewItems.length) {
    sections.unshift({
      title: "基准概览",
      items: overviewItems.slice(0, 6),
    });
  }

  return sections.slice(0, 4);
}

function getAverageProductionTimeLabel(overview: AnalyticsOverview | null) {
  if (!overview) {
    return "--";
  }

  if (overview.avgProductionTimeMs > 0) {
    return formatDuration(overview.avgProductionTimeMs / 1000);
  }

  if (overview.avgProductionTimeMinutes > 0) {
    return `${overview.avgProductionTimeMinutes.toFixed(1).replace(/\.0$/, "")} 分钟`;
  }

  return "--";
}

function formatTrendAxisValue(metric: TrendMetricKey, value: number) {
  if (metric === "successRate") {
    return formatPercent(value);
  }

  return formatCompactNumber(value);
}

function buildCsv(rows: Array<Record<string, string | number>>) {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const escapeCell = (value: string | number) => {
    const raw = `${value ?? ""}`;
    if (raw.includes(",") || raw.includes("\n") || raw.includes('"')) {
      return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
  };

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header] ?? "")).join(",")),
  ].join("\n");
}

function downloadTextFile(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Activity;
}) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] shadow-[0_28px_80px_-56px_rgba(56,189,248,0.45)]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardDescription className="text-xs uppercase tracking-[0.24em] text-slate-400">
              {title}
            </CardDescription>
            <CardTitle className="mt-3 text-3xl font-black tracking-tight text-white">
              {value}
            </CardTitle>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-slate-100">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-300/75">{description}</p>
      </CardContent>
    </Card>
  );
}

function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6">
      <CardGridSkeleton count={4} />
      <Card className="border-white/10 bg-slate-950/70">
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-white/10" />
          <Skeleton className="h-4 w-72 bg-white/10" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[320px] w-full bg-white/10" />
        </CardContent>
      </Card>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <Card className="border-white/10 bg-slate-950/70">
          <CardHeader>
            <Skeleton className="h-6 w-40 bg-white/10" />
            <Skeleton className="h-4 w-80 bg-white/10" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full bg-white/10" />
            ))}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-slate-950/70">
          <CardHeader>
            <Skeleton className="h-6 w-32 bg-white/10" />
            <Skeleton className="h-4 w-48 bg-white/10" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full bg-white/10" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<TimeframeValue>("7d");
  const [trendMetric, setTrendMetric] = useState<TrendMetricKey>("totalVideos");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrendPoint[]>([]);
  const [topVideos, setTopVideos] = useState<AnalyticsTopVideo[]>([]);
  const [benchmark, setBenchmark] = useState<BenchmarkPayload>(null);
  const [errors, setErrors] = useState<SectionErrorState>(EMPTY_ERRORS);

  const requestIdRef = useRef(0);

  const loadAnalytics = async (nextTimeframe: TimeframeValue) => {
    const requestId = ++requestIdRef.current;
    const hasCachedData = Boolean(
      overview || trends.length || topVideos.length || (benchmark && Object.keys(benchmark).length),
    );

    if (!hasCachedData) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setErrors(EMPTY_ERRORS);

    try {
      const [overviewResult, trendsResult, topResult, benchmarkResult] = await Promise.allSettled([
        api.analytics.overview(),
        api.analytics.trends({ timeframe: nextTimeframe }),
        api.analytics.top({ limit: 5 }),
        api.analytics.benchmark(),
      ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      const nextErrors: SectionErrorState = { ...EMPTY_ERRORS };
      const failedMessages: string[] = [];

      if (overviewResult.status === "fulfilled") {
        setOverview(overviewResult.value.data);
      } else {
        const message = readApiErrorMessage(overviewResult.reason, "概览数据加载失败，请稍后重试。");
        setOverview(null);
        nextErrors.overview = message;
        failedMessages.push(message);
      }

      if (trendsResult.status === "fulfilled") {
        setTrends(trendsResult.value.data);
      } else {
        const message = readApiErrorMessage(trendsResult.reason, "趋势数据加载失败，请稍后重试。");
        setTrends([]);
        nextErrors.trends = message;
        failedMessages.push(message);
      }

      if (topResult.status === "fulfilled") {
        setTopVideos(topResult.value.data);
      } else {
        const message = readApiErrorMessage(topResult.reason, "Top 视频加载失败，请稍后重试。");
        setTopVideos([]);
        nextErrors.topVideos = message;
        failedMessages.push(message);
      }

      if (benchmarkResult.status === "fulfilled") {
        setBenchmark(benchmarkResult.value.data ?? null);
      } else {
        const message = readApiErrorMessage(benchmarkResult.reason, "Benchmark 数据加载失败，请稍后重试。");
        setBenchmark(null);
        nextErrors.benchmark = message;
        failedMessages.push(message);
      }

      setErrors(nextErrors);

      if (failedMessages.length > 0) {
        toast.error(failedMessages.length >= 3 ? "数据分析加载失败" : "部分分析数据更新失败", {
          description: failedMessages[0],
        });
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      const message = readApiErrorMessage(error, "数据分析加载失败，请稍后重试。");
      setOverview(null);
      setTrends([]);
      setTopVideos([]);
      setBenchmark(null);
      setErrors({
        overview: message,
        trends: message,
        topVideos: message,
        benchmark: message,
      });
      toast.error("数据分析加载失败", { description: message });
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  // loadAnalytics also powers manual refresh/retry actions, so keep the effect keyed by timeframe only.
  useEffect(() => {
    void loadAnalytics(timeframe);
  }, [timeframe]); // eslint-disable-line react-hooks/exhaustive-deps

  const benchmarkSections = buildBenchmarkSections(benchmark);
  const hasBenchmarkData = benchmarkSections.length > 0;
  const hasOverviewData = Boolean(
    overview &&
      (
        overview.totalVideos > 0 ||
        overview.creditsUsed > 0 ||
        overview.successRate > 0 ||
        overview.performance.views > 0 ||
        overview.performance.likes > 0 ||
        overview.performance.comments > 0
      ),
  );
  const hasAnyAnalytics = hasOverviewData || trends.length > 0 || topVideos.length > 0 || hasBenchmarkData;
  const pageError = !hasAnyAnalytics
    ? errors.overview || errors.trends || errors.topVideos || errors.benchmark
    : null;
  const activeMetric = TREND_METRICS.find((item) => item.key === trendMetric) || TREND_METRICS[0];
  const chartData = trends.map((point) => ({
    label: formatDate(point.periodStart),
    totalVideos: point.totalVideos,
    completedVideos: point.completedVideos,
    creditsUsed: point.creditsUsed,
    views: point.views,
    successRate: point.successRate,
  }));

  const handleExport = async (config: ExportConfig) => {
    const exportTimeframe = ["7d", "30d", "90d"].includes(config.dateRange)
      ? (config.dateRange as TimeframeValue)
      : timeframe;

    try {
      const [overviewResponse, trendsResponse, topResponse, benchmarkResponse] = await Promise.all([
        api.analytics.overview(),
        api.analytics.trends({ timeframe: exportTimeframe }),
        api.analytics.top({ limit: 20 }),
        api.analytics.benchmark(),
      ]);

      const exportPayload = {
        exportedAt: new Date().toISOString(),
        timeframe: exportTimeframe,
        overview: overviewResponse.data,
        trends: trendsResponse.data,
        topVideos: topResponse.data,
        benchmark: benchmarkResponse.data,
      };

      if (config.format === "json") {
        downloadTextFile(
          `analytics-${exportTimeframe}-${Date.now()}.json`,
          JSON.stringify(exportPayload, null, 2),
          "application/json;charset=utf-8",
        );
        return;
      }

      const csvRows = topResponse.data.map((video) => ({
        id: video.taskId || video.id,
        title: video.title,
        brand: video.brandName,
        views: video.views,
        likes: video.likes,
        comments: video.comments,
        engagementScore: video.engagementScore,
        completedAt: video.completedAt ? formatDateTime(video.completedAt) : "--",
      }));

      downloadTextFile(
        `analytics-top-videos-${exportTimeframe}-${Date.now()}.csv`,
        buildCsv(csvRows),
        "text/csv;charset=utf-8",
      );

      if (config.format === "xlsx") {
        toast.info("当前未引入 Excel 导出依赖，已回退为 CSV 下载。");
      }
    } catch (error) {
      throw new Error(readApiErrorMessage(error, "导出失败，请稍后重试。"));
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <MetadataUpdater title="数据分析" />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-100">
            <BarChart3 className="h-3.5 w-3.5" />
            Realtime Analytics
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">数据分析</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
              所有概览、趋势、Top 视频和 Benchmark 均来自真实 API，帮助你直接观察出片效率与内容表现。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={timeframe} onValueChange={(value) => value && setTimeframe(value as TimeframeValue)}>
            <SelectTrigger className="w-[140px] border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.06]">
              <SelectValue placeholder="时间范围" />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
            onClick={() => {
              void loadAnalytics(timeframe);
            }}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${(loading || refreshing) ? "animate-spin" : ""}`} />
            刷新数据
          </Button>

          <ExportDialog
            title="导出分析数据"
            description="导出当前数据分析结果，JSON 会包含完整结构，CSV 会输出 Top 视频榜单。"
            onExport={handleExport}
          />

          <Button
            className="bg-white text-slate-950 hover:bg-slate-100"
            render={<Link href="/dashboard/videos" />}
          >
            查看视频库
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <DataState
        loading={loading}
        error={pageError}
        isEmpty={!loading && !pageError && !hasAnyAnalytics}
        onRetry={() => {
          void loadAnalytics(timeframe);
        }}
        loadingState={<AnalyticsPageSkeleton />}
        emptyState={
          <WarmEmptyState
            icon={Sparkles}
            title="分析数据还在积累中"
            description="当第一批真实视频产生出片、消耗和表现记录后，这里会自动生成趋势图与排行榜。"
            actionLabel="去创建视频"
            onAction={() => {
              window.location.assign("/dashboard/videos/create");
            }}
          />
        }
      >
        <DataState
          loading={false}
          error={errors.overview}
          isEmpty={!errors.overview && !hasOverviewData}
          onRetry={() => {
            void loadAnalytics(timeframe);
          }}
          emptyState={
            <WarmEmptyState
              icon={Activity}
              title="概览数据还没开始回传"
              description="当真实任务进入生产与消费链路后，这里会展示额度、成功率与平均生产时长。"
            />
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="累计产出"
              value={formatCompactNumber(overview?.totalVideos ?? 0)}
              description="来自 `/api/v1/analytics/overview` 的总视频产出统计。"
              icon={BarChart3}
            />
            <SummaryCard
              title="已消耗额度"
              value={formatCompactNumber(overview?.creditsUsed ?? 0)}
              description="用于衡量当前账户在真实视频生产中的额度消耗规模。"
              icon={Coins}
            />
            <SummaryCard
              title="成功率"
              value={formatPercent(overview?.successRate ?? 0)}
              description="基于真实任务结果统计，可直接反映生成链路稳定性。"
              icon={CheckCircle2}
            />
            <SummaryCard
              title="平均生产时长"
              value={getAverageProductionTimeLabel(overview)}
              description="优先展示毫秒级平均时长，缺失时回退到分钟维度。"
              icon={Clock3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-white/10 bg-white/[0.03] shadow-[0_24px_60px_-48px_rgba(56,189,248,0.32)]">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">总播放量</div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {formatCompactNumber(overview?.performance.views ?? 0)}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-sky-100">
                  <Eye className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/[0.03] shadow-[0_24px_60px_-48px_rgba(52,211,153,0.25)]">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">总点赞</div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {formatCompactNumber(overview?.performance.likes ?? 0)}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-emerald-100">
                  <Heart className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/[0.03] shadow-[0_24px_60px_-48px_rgba(245,158,11,0.28)]">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">总评论</div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {formatCompactNumber(overview?.performance.comments ?? 0)}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-amber-100">
                  <MessageCircle className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </DataState>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
          <DataState
            loading={false}
            error={errors.trends}
            isEmpty={!errors.trends && chartData.length === 0}
            onRetry={() => {
              void loadAnalytics(timeframe);
            }}
            emptyState={
              <WarmEmptyState
                icon={TrendingUp}
                title="趋势数据还在积累中"
                description="当前时间范围内还没有足够的真实分析样本，后续会自动绘制走势。"
              />
            }
          >
            <Card className="overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_30%),rgba(2,6,23,0.92)] shadow-[0_28px_90px_-56px_rgba(56,189,248,0.35)]">
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle className="text-white">趋势表现</CardTitle>
                    <CardDescription className="text-slate-300/70">
                      {activeMetric.description} 当前区间：{TIMEFRAME_OPTIONS.find((item) => item.value === timeframe)?.label}。
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TREND_METRICS.map((metric) => (
                      <Button
                        key={metric.key}
                        variant={trendMetric === metric.key ? "secondary" : "outline"}
                        size="sm"
                        className={trendMetric === metric.key
                          ? "border-transparent bg-white text-slate-950 hover:bg-slate-100"
                          : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]"
                        }
                        onClick={() => setTrendMetric(metric.key)}
                      >
                        {metric.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.16)" />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        tickFormatter={(value: number) => formatTrendAxisValue(trendMetric, Number(value))}
                        width={72}
                      />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: "rgba(2, 6, 23, 0.96)",
                          borderColor: "rgba(148, 163, 184, 0.16)",
                          borderRadius: "14px",
                          color: "#e2e8f0",
                        }}
                        labelStyle={{ color: "#e2e8f0", fontWeight: 700 }}
                        formatter={(value, name) => {
                          const numericValue = Number(value || 0);
                          const dataKey = String(name || "");
                          if (dataKey === "completedVideos") {
                            return [formatCompactNumber(numericValue), "完成视频"];
                          }

                          const matchedMetric = TREND_METRICS.find((item) => item.key === dataKey);
                          return [
                            matchedMetric
                              ? formatTrendAxisValue(matchedMetric.key, numericValue)
                              : formatCompactNumber(numericValue),
                            matchedMetric?.label || dataKey,
                          ];
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey={trendMetric}
                        stroke={activeMetric.stroke}
                        strokeWidth={3}
                        dot={{ fill: activeMetric.stroke, r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      {trendMetric === "totalVideos" ? (
                        <Line
                          type="monotone"
                          dataKey="completedVideos"
                          stroke="#cbd5e1"
                          strokeWidth={2}
                          strokeDasharray="6 4"
                          dot={false}
                        />
                      ) : null}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </DataState>

          <DataState
            loading={false}
            error={errors.benchmark}
            isEmpty={!errors.benchmark && !hasBenchmarkData}
            onRetry={() => {
              void loadAnalytics(timeframe);
            }}
            emptyState={
              <WarmEmptyState
                icon={Sparkles}
                title="数据采集中"
                description="Benchmark 接口当前还没有可展示的对标样本，后端产生有效数据后会自动显示。"
              />
            }
          >
            <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] shadow-[0_28px_90px_-56px_rgba(15,118,110,0.28)]">
              <CardHeader>
                <CardTitle className="text-white">Benchmark</CardTitle>
                <CardDescription className="text-slate-300/70">
                  对标指标来自 `/api/v1/analytics/benchmark`，当后端返回结构变化时页面会自适应展示。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {benchmarkSections.map((section) => (
                  <div key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-3 text-sm font-semibold text-white">{section.title}</div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {section.items.map((item) => (
                        <div key={`${section.title}-${item.label}`} className="rounded-xl border border-white/8 bg-black/20 p-3">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                            {item.label}
                          </div>
                          <div className="mt-2 text-lg font-bold text-slate-100">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </DataState>
        </div>

        <DataState
          loading={false}
          error={errors.topVideos}
          isEmpty={!errors.topVideos && topVideos.length === 0}
          onRetry={() => {
            void loadAnalytics(timeframe);
          }}
          emptyState={
            <WarmEmptyState
              icon={Sparkles}
              title="还没有 Top 视频榜单"
              description="等第一批真实视频产生表现数据后，这里会自动按播放与互动排出最强内容。"
              actionLabel="去视频库"
              onAction={() => {
                window.location.assign("/dashboard/videos");
              }}
            />
          }
        >
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] shadow-[0_28px_90px_-56px_rgba(245,158,11,0.22)]">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-white">Top 视频榜</CardTitle>
                <CardDescription className="text-slate-300/70">
                  榜单直接来自 `/api/v1/analytics/top`，按真实表现指标排序。
                </CardDescription>
              </div>
              <Button variant="outline" className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]" render={<Link href="/dashboard/videos" />}>
                查看全部视频
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {topVideos.map((video, index) => (
                <div
                  key={`${video.taskId || video.id}-${index}`}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05] lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-black text-white">
                      #{index + 1}
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-base font-semibold text-white">{video.title}</div>
                      <div className="text-sm text-slate-300/75">{video.brandName || "未关联品牌"}</div>
                      <div className="text-xs text-slate-500">
                        完成时间 {video.completedAt ? formatDateTime(video.completedAt) : "--"}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px] lg:grid-cols-4">
                    <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">播放量</div>
                      <div className="mt-2 text-lg font-bold text-slate-100">{formatCompactNumber(video.views)}</div>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">点赞</div>
                      <div className="mt-2 text-lg font-bold text-slate-100">{formatCompactNumber(video.likes)}</div>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">评论</div>
                      <div className="mt-2 text-lg font-bold text-slate-100">{formatCompactNumber(video.comments)}</div>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">互动评分</div>
                      <div className="mt-2 text-lg font-bold text-slate-100">{formatPercent(video.engagementScore)}</div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="self-start text-slate-200 hover:bg-white/[0.08] hover:text-white lg:self-center"
                    render={<Link href={`/dashboard/videos/${video.taskId || video.id}`} />}
                  >
                    查看详情
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </DataState>
      </DataState>
    </div>
  );
}
