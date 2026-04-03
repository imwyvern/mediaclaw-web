"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Coins,
  Cpu,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DataState, TableSkeleton, WarmEmptyState } from "@/components/data-state";
import { MetadataUpdater } from "@/components/metadata-updater";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  api,
  isApiNotFoundError,
  readApiErrorMessage,
  type AccountSnapshot,
  type PaginatedResponse,
  type UsageDetailItem,
  type UsageSummary,
  type UsageTimeline,
} from "@/lib/api";
import {
  formatCompactNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/lib/format";

const PAGE_SIZE = 10;

function formatUsageTypeLabel(type: string) {
  switch (type) {
    case "brand_replace":
      return "品牌替换";
    case "remix":
      return "复刻混剪";
    case "new_content":
      return "新内容生成";
    default:
      return type || "未知类型";
  }
}

function StatCard({
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
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(6,10,18,0.98))] shadow-[0_24px_80px_-48px_rgba(14,165,233,0.35)]">
      <CardHeader className="pb-3">
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

export default function UsagePage() {
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryComingSoon, setSummaryComingSoon] = useState(false);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailComingSoon, setDetailComingSoon] = useState(false);
  const [account, setAccount] = useState<AccountSnapshot | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [timeline, setTimeline] = useState<UsageTimeline | null>(null);
  const [detail, setDetail] = useState<PaginatedResponse<UsageDetailItem> | null>(null);
  const [page, setPage] = useState(1);

  const loadSummary = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryComingSoon(false);

    try {
      const [accountResponse, usageResponse, timelineResponse] = await Promise.all([
        api.account.get(),
        api.account.usage(),
        api.account.usageTimeline(),
      ]);

      setAccount(accountResponse.data);
      setUsage(usageResponse.data);
      setTimeline(timelineResponse.data);
    } catch (error) {
      if (isApiNotFoundError(error)) {
        setAccount(null);
        setUsage(null);
        setTimeline(null);
        setSummaryComingSoon(true);
      } else {
        setSummaryError(readApiErrorMessage(error, "用量概览加载失败，请稍后重试。"));
      }
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadDetail = async (nextPage: number) => {
    setDetailLoading(true);
    setDetailError(null);
    setDetailComingSoon(false);

    try {
      const response = await api.account.usageDetail({ page: nextPage, limit: PAGE_SIZE });
      setDetail(response.data);
    } catch (error) {
      if (isApiNotFoundError(error)) {
        setDetail({ items: [], total: 0, page: nextPage, limit: PAGE_SIZE });
        setDetailComingSoon(true);
      } else {
        setDetailError(readApiErrorMessage(error, "消耗明细加载失败，请稍后重试。"));
      }
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void loadSummary();
  }, []);

  useEffect(() => {
    void loadDetail(page);
  }, [page]);

  const chartData = (timeline?.points || []).map((point) => ({
    label: formatDate(point.periodStart),
    credits: point.creditsConsumed,
    tokens: point.totalTokens,
    cost: point.tokenCost,
  }));

  const totalPages = detail ? Math.max(1, Math.ceil(detail.total / Math.max(detail.limit, 1))) : 1;
  const hasSummaryData = Boolean(account || usage || chartData.length > 0);
  const remainingCredits = account?.credits.remaining ?? 0;
  const totalCredits = account?.credits.total ?? 0;
  const monthlyUsedVideos = usage?.totals.videosGenerated ?? usage?.totals.recordCount ?? 0;
  const totalTokens = usage?.totals.totalTokens ?? 0;
  const estimatedCost = usage?.totals.estimatedCost ?? usage?.totals.tokenCost ?? 0;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <MetadataUpdater title="用量面板" />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-100">
            <TrendingUp className="h-3.5 w-3.5" />
            Usage & Cost
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">用量面板</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
              实时查看本月出片、额度消耗、Token 成本和趋势变化，帮助你更快定位产能与成本拐点。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
            onClick={() => {
              void loadSummary();
              void loadDetail(page);
            }}
            disabled={summaryLoading || detailLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${(summaryLoading || detailLoading) ? "animate-spin" : ""}`} />
            刷新数据
          </Button>
          <Button className="bg-white text-slate-950 hover:bg-slate-100" render={<Link href="/dashboard/billing" />}>
            购买额度
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <DataState
        loading={summaryLoading}
        error={summaryComingSoon ? null : summaryError}
        isEmpty={!summaryLoading && (summaryComingSoon || !hasSummaryData)}
        onRetry={() => {
          void loadSummary();
        }}
        emptyState={
          summaryComingSoon ? (
            <WarmEmptyState
              icon={Sparkles}
              title="用量面板即将上线"
              description="当前环境尚未开放用量概览接口，后端发布后这里会直接展示真实额度、Token 和成本曲线。"
              actionLabel="重新加载"
              onAction={() => {
                void loadSummary();
              }}
            />
          ) : (
            <WarmEmptyState
              icon={Sparkles}
              title="还没有可统计的用量数据"
              description="生成第一条真实视频后，这里会开始展示额度、Token 和成本曲线。"
              actionLabel="去创建视频"
              onAction={() => {
                window.location.href = "/dashboard/videos/create";
              }}
            />
          )
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="本月已用条数"
            value={formatCompactNumber(monthlyUsedVideos)}
            description="按成功写入用量记录统计，适合直接衡量当月真实出片量。"
            icon={Activity}
          />
          <StatCard
            title="总余额"
            value={formatCompactNumber(remainingCredits)}
            description={`当前剩余额度 ${formatCompactNumber(remainingCredits)}，总额度 ${formatCompactNumber(totalCredits)}。`}
            icon={Coins}
          />
          <StatCard
            title="LLM Token 消耗"
            value={formatCompactNumber(totalTokens)}
            description="包含输入与输出 Token，适合和模型成本、创作复杂度一起观察。"
            icon={Cpu}
          />
          <StatCard
            title="本月成本估算"
            value={formatCurrency(estimatedCost)}
            description="优先展示后端估算成本；若无单独估算，则回退到 Token 成本汇总。"
            icon={TrendingUp}
          />
        </div>

        <Card className="overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_30%),rgba(2,6,23,0.88)] shadow-[0_28px_90px_-56px_rgba(14,165,233,0.35)]">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-white">额度与成本趋势</CardTitle>
                <CardDescription className="text-slate-300/70">
                  基于 `/api/v1/account/usage/timeline` 的真实时间序列，当前粒度 {timeline?.granularity || "daily"}。
                </CardDescription>
              </div>
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Credits / Tokens / Cost</div>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <WarmEmptyState
                icon={TrendingUp}
                title="趋势数据还在积累中"
                description="当产生足够多的真实用量后，这里会显示额度、Token 和成本变化曲线。"
                actionLabel="查看 Billing"
                onAction={() => {
                  window.location.href = "/dashboard/billing";
                }}
              />
            ) : (
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={(value) => formatCompactNumber(value)}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) => formatCurrency(value)}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || payload.length === 0) {
                          return null;
                        }

                        const credits = Number(payload.find((item) => item.dataKey === "credits")?.value || 0);
                        const tokens = Number(payload.find((item) => item.dataKey === "tokens")?.value || 0);
                        const cost = Number(payload.find((item) => item.dataKey === "cost")?.value || 0);

                        return (
                          <div className="rounded-xl border border-white/10 bg-slate-950/95 p-4 text-xs shadow-2xl">
                            <div className="mb-3 font-semibold text-white">{label}</div>
                            <div className="space-y-2 text-slate-300">
                              <div className="flex items-center justify-between gap-4">
                                <span>额度消耗</span>
                                <span className="font-medium text-white">{formatCompactNumber(credits)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span>Token</span>
                                <span className="font-medium text-white">{formatCompactNumber(tokens)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span>成本</span>
                                <span className="font-medium text-white">{formatCurrency(cost)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="credits"
                      name="额度消耗"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 0, fill: "#38bdf8" }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="tokens"
                      name="Token"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0, fill: "#f59e0b" }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cost"
                      name="成本"
                      stroke="#34d399"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0, fill: "#34d399" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </DataState>

      <Card className="overflow-hidden border-border/70 bg-card/70">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>消耗明细</CardTitle>
              <CardDescription>
                每条真实消耗记录都会展示视频名、类型、额度、Token 和时间。建议配合 Billing 页面一起核对订单与消耗。
              </CardDescription>
            </div>
            <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Page {detail?.page || page} / {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataState
            loading={detailLoading}
            error={detailComingSoon ? null : detailError}
            isEmpty={!detailLoading && (detailComingSoon || (detail?.items.length || 0) === 0)}
            loadingState={<TableSkeleton rows={6} columns={5} />}
            onRetry={() => {
              void loadDetail(page);
            }}
            emptyState={
              detailComingSoon ? (
                <WarmEmptyState
                  icon={Sparkles}
                  title="消耗明细即将上线"
                  description="当前环境尚未开放用量明细接口，待后端发布后这里会自动展示每一条真实消耗账本。"
                  actionLabel="重新加载"
                  onAction={() => {
                    void loadDetail(page);
                  }}
                />
              ) : (
                <WarmEmptyState
                  icon={Sparkles}
                  title="还没有消耗记录"
                  description="当真实任务开始消耗额度后，这里会自动生成明细表，方便你逐条追溯。"
                  actionLabel="去生成第一条视频"
                  onAction={() => {
                    window.location.href = "/dashboard/videos/create";
                  }}
                />
              )
            }
          >
            <div className="overflow-hidden rounded-2xl border border-border/70">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>视频名</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>消耗条数</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(detail?.items || []).map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{item.videoTitle}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.brandName || "未关联品牌"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatUsageTypeLabel(item.type)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCompactNumber(item.creditsConsumed)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div>{formatCompactNumber(item.totalTokens)}</div>
                          <div className="text-xs text-muted-foreground">
                            成本 {formatCurrency(item.tokenCost)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(item.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                共 {detail?.total || 0} 条记录，当前显示 {(detail?.items.length || 0)} 条。
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || detailLoading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || detailLoading}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  下一页
                </Button>
              </div>
            </div>
          </DataState>
        </CardContent>
      </Card>
    </div>
  );
}
