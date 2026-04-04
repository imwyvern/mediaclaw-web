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
  readApiErrorMessage,
  type AccountSnapshot,
  type ConversationModelUsage,
  type ConversationUsageDetailItem,
  type ConversationUsageSummary,
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
  formatPercent,
} from "@/lib/format";

const PAGE_SIZE = 10;
const CONVERSATION_PAGE_SIZE = 8;

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

function formatConversationIntent(intent: string) {
  switch (intent) {
    case "order":
      return "下单";
    case "query":
      return "查询";
    case "review":
      return "审核";
    case "chat":
    default:
      return "对话";
  }
}

function formatQuotaWarningLevel(level: ConversationUsageSummary["quota"]["warningLevel"]) {
  switch (level) {
    case "exceeded":
      return "已超过月含量";
    case "warning":
      return "接近月含量";
    case "normal":
    default:
      return "使用正常";
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
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [conversationLoading, setConversationLoading] = useState(true);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [conversationDetailLoading, setConversationDetailLoading] = useState(true);
  const [conversationDetailError, setConversationDetailError] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountSnapshot | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [timeline, setTimeline] = useState<UsageTimeline | null>(null);
  const [detail, setDetail] = useState<PaginatedResponse<UsageDetailItem> | null>(null);
  const [page, setPage] = useState(1);
  const [conversationSummary, setConversationSummary] = useState<ConversationUsageSummary | null>(null);
  const [conversationBreakdown, setConversationBreakdown] = useState<ConversationModelUsage[]>([]);
  const [conversationDetail, setConversationDetail] = useState<PaginatedResponse<ConversationUsageDetailItem> | null>(null);
  const [conversationPage, setConversationPage] = useState(1);

  const loadSummary = async () => {
    setSummaryLoading(true);
    setSummaryError(null);

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
      setAccount(null);
      setUsage(null);
      setTimeline(null);
      setSummaryError(readApiErrorMessage(error, "用量概览加载失败，请稍后重试。"));
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadDetail = async (nextPage: number) => {
    setDetailLoading(true);
    setDetailError(null);

    try {
      const response = await api.account.usageDetail({ page: nextPage, limit: PAGE_SIZE });
      setDetail(response.data);
    } catch (error) {
      setDetail({ items: [], total: 0, page: nextPage, limit: PAGE_SIZE });
      setDetailError(readApiErrorMessage(error, "消耗明细加载失败，请稍后重试。"));
    } finally {
      setDetailLoading(false);
    }
  };

  const loadConversationSummary = async () => {
    setConversationLoading(true);
    setConversationError(null);

    try {
      const [summaryResponse, breakdownResponse] = await Promise.all([
        api.usage.conversationSummary(),
        api.usage.modelBreakdown(),
      ]);

      setConversationSummary(summaryResponse.data);
      setConversationBreakdown(
        breakdownResponse.data.length > 0
          ? breakdownResponse.data
          : summaryResponse.data.byModel,
      );
    } catch (error) {
      setConversationSummary(null);
      setConversationBreakdown([]);
      setConversationError(readApiErrorMessage(error, "对话 Token 汇总加载失败，请稍后重试。"));
    } finally {
      setConversationLoading(false);
    }
  };

  const loadConversationDetail = async (nextPage: number) => {
    setConversationDetailLoading(true);
    setConversationDetailError(null);

    try {
      const response = await api.usage.conversationDetail({
        page: nextPage,
        limit: CONVERSATION_PAGE_SIZE,
      });
      setConversationDetail(response.data);
    } catch (error) {
      setConversationDetail({ items: [], total: 0, page: nextPage, limit: CONVERSATION_PAGE_SIZE });
      setConversationDetailError(readApiErrorMessage(error, "对话明细加载失败，请稍后重试。"));
    } finally {
      setConversationDetailLoading(false);
    }
  };

  useEffect(() => {
    void loadSummary();
    void loadConversationSummary();
  }, []);

  useEffect(() => {
    void loadDetail(page);
  }, [page]);

  useEffect(() => {
    void loadConversationDetail(conversationPage);
  }, [conversationPage]);

  const chartData = (timeline?.points || []).map((point) => ({
    label: formatDate(point.periodStart),
    credits: point.creditsConsumed,
    tokens: point.totalTokens,
    cost: point.tokenCost,
  }));

  const totalPages = detail ? Math.max(1, Math.ceil(detail.total / Math.max(detail.limit, 1))) : 1;
  const conversationTotalPages = conversationDetail
    ? Math.max(1, Math.ceil(conversationDetail.total / Math.max(conversationDetail.limit, 1)))
    : 1;
  const hasSummaryData = Boolean(account || usage || chartData.length > 0);
  const remainingCredits = account?.credits.remaining ?? 0;
  const totalCredits = account?.credits.total ?? 0;
  const monthlyUsedVideos = usage?.totals.videosGenerated ?? usage?.totals.recordCount ?? 0;
  const totalTokens = usage?.totals.totalTokens ?? 0;
  const estimatedCost = usage?.totals.estimatedCost ?? usage?.totals.tokenCost ?? 0;
  const conversationQuota = conversationSummary?.quota;
  const conversationQuotaPercent = conversationQuota?.isUnlimited ? 0 : conversationQuota?.usageRate ?? 0;
  const topConversationModels = conversationBreakdown.slice(0, 4);

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
              void loadConversationSummary();
              void loadConversationDetail(conversationPage);
            }}
            disabled={summaryLoading || detailLoading || conversationLoading || conversationDetailLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${(summaryLoading || detailLoading || conversationLoading || conversationDetailLoading) ? "animate-spin" : ""}`} />
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
        error={summaryError}
        isEmpty={!summaryLoading && !summaryError && !hasSummaryData}
        onRetry={() => {
          void loadSummary();
        }}
        emptyState={
          <WarmEmptyState
            icon={Sparkles}
            title="还没有可统计的用量数据"
            description="生成第一条真实视频后，这里会开始展示额度、Token 和成本曲线。"
            actionLabel="去创建视频"
            onAction={() => {
              window.location.href = "/dashboard/videos/create";
            }}
          />
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

      <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(12,18,32,0.96),rgba(5,9,18,0.98))] shadow-[0_28px_90px_-56px_rgba(245,158,11,0.35)]">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-white">本月对话 Token 用量</CardTitle>
              <CardDescription className="text-slate-300/70">
                这里直接读取 `/api/v1/usage/conversation-summary`、`/conversation-detail` 和 `/model-breakdown` 的真实数据。
              </CardDescription>
            </div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
              {conversationSummary?.period.resetDay ? `Reset Day ${conversationSummary.period.resetDay}` : "Conversation"}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <DataState
            loading={conversationLoading}
            error={conversationError}
            isEmpty={!conversationLoading && !conversationError && !conversationSummary}
            onRetry={() => {
              void loadConversationSummary();
            }}
            emptyState={
              <WarmEmptyState
                icon={Cpu}
                title="还没有对话 Token 记录"
                description="当 OpenClaw 或 Skill 开始上报会话消耗后，这里会显示配额、模型占比和明细。"
                actionLabel="刷新数据"
                onAction={() => {
                  void loadConversationSummary();
                }}
              />
            }
          >
            <div className="grid gap-4 lg:grid-cols-4">
              <StatCard
                title="本月已用 Token"
                value={formatCompactNumber(conversationSummary?.totals.totalTokens ?? 0)}
                description={`输入 ${formatCompactNumber(conversationSummary?.totals.inputTokens ?? 0)} / 输出 ${formatCompactNumber(conversationSummary?.totals.outputTokens ?? 0)}`}
                icon={Cpu}
              />
              <StatCard
                title="会话记录数"
                value={formatCompactNumber(conversationSummary?.totals.records ?? 0)}
                description="每次 Skill / OpenClaw 会话上报会累计到本月记录数。"
                icon={Sparkles}
              />
              <StatCard
                title="月含量进度"
                value={conversationQuota?.isUnlimited
                  ? "无限制"
                  : `${formatCompactNumber(conversationQuota?.used ?? 0)} / ${formatCompactNumber(conversationQuota?.total ?? 0)}`}
                description={formatQuotaWarningLevel(conversationQuota?.warningLevel ?? "normal")}
                icon={TrendingUp}
              />
              <StatCard
                title="预估成本"
                value={formatCurrency(conversationSummary?.totals.estimatedCost ?? 0)}
                description={conversationQuota?.isUnlimited ? "BYOK 模式下仅做透明追踪，不计入平台含量。" : "仅用于透明展示，不会阻断对话。"}
                icon={Coins}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Token 配额进度</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {conversationQuota?.isUnlimited
                      ? "当前组织为 BYOK / 无限模式，不做硬限制。"
                      : `已使用 ${formatPercent(conversationQuotaPercent)}，剩余 ${formatCompactNumber(conversationQuota?.remaining ?? 0)} tokens。`}
                  </div>
                </div>
                <div className="text-xs font-medium text-slate-300">
                  {conversationQuota?.isUnlimited ? "Unlimited" : formatQuotaWarningLevel(conversationQuota?.warningLevel ?? "normal")}
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${
                    (conversationQuota?.warningLevel ?? "normal") === "exceeded"
                      ? "bg-rose-500"
                      : (conversationQuota?.warningLevel ?? "normal") === "warning"
                        ? "bg-amber-400"
                        : "bg-sky-400"
                  }`}
                  style={{ width: `${Math.min(conversationQuota?.isUnlimited ? 18 : conversationQuotaPercent, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr)]">
              <Card className="border-white/10 bg-black/20">
                <CardHeader>
                  <CardTitle className="text-base text-white">模型分布</CardTitle>
                  <CardDescription className="text-slate-400">
                    当前统计周期内，各模型的真实 Token 消耗与占比。
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topConversationModels.length === 0 ? (
                    <WarmEmptyState
                      icon={Cpu}
                      title="暂无模型分布"
                      description="当有对话用量写入后，这里会自动展示模型占比。"
                    />
                  ) : (
                    topConversationModels.map((item) => (
                      <div key={item.model} className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-sm font-medium text-white">{item.model}</div>
                            <div className="text-xs text-slate-400">
                              {formatCompactNumber(item.records)} 条记录 · 成本 {formatCurrency(item.estimatedCost)}
                            </div>
                          </div>
                          <div className="text-right text-sm font-medium text-white">
                            {formatCompactNumber(item.totalTokens)}
                            <div className="text-xs font-normal text-slate-400">
                              {formatPercent(item.usageRate)}
                            </div>
                          </div>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min(item.usageRate, 100)}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-black/20">
                <CardHeader>
                  <CardTitle className="text-base text-white">配额提示</CardTitle>
                  <CardDescription className="text-slate-400">
                    80% 会触发提醒，100% 以上仍不阻断，仅提示升级或切换 BYOK。
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  <div className="rounded-xl border border-white/10 bg-zinc-950/70 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500">当前状态</div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      {formatQuotaWarningLevel(conversationQuota?.warningLevel ?? "normal")}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      {conversationQuota?.isUnlimited
                        ? "无限模式不会触发超额提醒。"
                        : "提醒状态会按账期缓存，避免同一周期重复骚扰。"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-zinc-950/70 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500">统计周期</div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      {formatDate(conversationSummary?.period.startAt)} - {formatDate(conversationSummary?.period.endAt)}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      重置日为每月 {conversationSummary?.period.resetDay ?? 1} 号，超额只做 soft limit 提醒。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DataState>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 bg-card/70">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>对话明细</CardTitle>
              <CardDescription>
                每次 Skill / OpenClaw 上报的会话都会记录模型、输入输出 Token、意图和时间，便于核对真实对话开销。
              </CardDescription>
            </div>
            <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Page {conversationDetail?.page || conversationPage} / {conversationTotalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataState
            loading={conversationDetailLoading}
            error={conversationDetailError}
            isEmpty={!conversationDetailLoading && !conversationDetailError && (conversationDetail?.items.length || 0) === 0}
            loadingState={<TableSkeleton rows={6} columns={5} />}
            onRetry={() => {
              void loadConversationDetail(conversationPage);
            }}
            emptyState={
              <WarmEmptyState
                icon={Cpu}
                title="还没有对话明细"
                description="当客户端开始调用 track-conversation 后，这里会逐条展示对话消耗。"
                actionLabel="刷新数据"
                onAction={() => {
                  void loadConversationDetail(conversationPage);
                }}
              />
            }
          >
            <div className="overflow-hidden rounded-2xl border border-border/70">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>会话</TableHead>
                    <TableHead>意图</TableHead>
                    <TableHead>模型</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(conversationDetail?.items || []).map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{item.sessionId || item.id}</div>
                          <div className="text-xs text-muted-foreground">
                            成本 {formatCurrency(item.estimatedCost)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatConversationIntent(item.intent)}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{item.model}</TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div>{formatCompactNumber(item.totalTokens)}</div>
                          <div className="text-xs text-muted-foreground">
                            输入 {formatCompactNumber(item.inputTokens)} / 输出 {formatCompactNumber(item.outputTokens)}
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
                共 {conversationDetail?.total || 0} 条记录，当前显示 {(conversationDetail?.items.length || 0)} 条。
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={conversationPage <= 1 || conversationDetailLoading}
                  onClick={() => setConversationPage((current) => Math.max(1, current - 1))}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={conversationPage >= conversationTotalPages || conversationDetailLoading}
                  onClick={() => setConversationPage((current) => Math.min(conversationTotalPages, current + 1))}
                >
                  下一页
                </Button>
              </div>
            </div>
          </DataState>
        </CardContent>
      </Card>

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
            error={detailError}
            isEmpty={!detailLoading && !detailError && (detail?.items.length || 0) === 0}
            loadingState={<TableSkeleton rows={6} columns={5} />}
            onRetry={() => {
              void loadDetail(page);
            }}
            emptyState={
              <WarmEmptyState
                icon={Sparkles}
                title="还没有消耗记录"
                description="当真实任务开始消耗额度后，这里会自动生成明细表，方便你逐条追溯。"
                actionLabel="去生成第一条视频"
                onAction={() => {
                  window.location.href = "/dashboard/videos/create";
                }}
              />
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
