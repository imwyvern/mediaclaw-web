"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  CreditCard,
  Package,
  Play,
  RefreshCw,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";

import { DataState, TableSkeleton, WarmEmptyState } from "@/components/data-state";
import { MetadataUpdater } from "@/components/metadata-updater";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  api,
  readApiErrorMessage,
  type AccountSnapshot,
  type BillingInvoiceRecord,
  type ConversationUsageSummary,
  type PaginatedResponse,
  type PaymentOrder,
  type PaymentProduct,
  type UsageDetailItem,
  type UsageSummary,
} from "@/lib/api";
import { formatCompactNumber, formatCurrency, formatDate, formatDateTime, formatPercent } from "@/lib/format";
import {
  findProductForPack,
  getPaymentStatusLabel,
  getPackUsagePercent,
  isFailedPaymentStatus,
  isPaidPaymentStatus,
  resolveOrderAmount,
  sortPaymentProducts,
} from "@/lib/payment";

const ORDER_PAGE_SIZE = 10;
const USAGE_PAGE_SIZE = 8;

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Coins;
}) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(6,10,18,0.98))] shadow-[0_24px_80px_-48px_rgba(56,189,248,0.35)]">
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

function OrderStatusBadge({ status }: { status: string }) {
  if (isPaidPaymentStatus(status)) {
    return (
      <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        {getPaymentStatusLabel(status)}
      </Badge>
    );
  }

  if (isFailedPaymentStatus(status)) {
    return (
      <Badge variant="destructive" className="border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20">
        <AlertCircle className="mr-1 h-3 w-3" />
        {getPaymentStatusLabel(status)}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
      <RefreshCw className="mr-1 h-3 w-3" />
      {getPaymentStatusLabel(status)}
    </Badge>
  );
}

export default function BillingPage() {
  const [topLoading, setTopLoading] = useState(true);
  const [topError, setTopError] = useState<string | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [account, setAccount] = useState<AccountSnapshot | null>(null);
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [conversationSummary, setConversationSummary] = useState<ConversationUsageSummary | null>(null);
  const [products, setProducts] = useState<PaymentProduct[]>([]);
  const [orders, setOrders] = useState<PaginatedResponse<PaymentOrder> | null>(null);
  const [usageDetail, setUsageDetail] = useState<PaginatedResponse<UsageDetailItem> | null>(null);
  const [invoices, setInvoices] = useState<PaginatedResponse<BillingInvoiceRecord> | null>(null);

  const loadTopSection = useCallback(async () => {
    setTopLoading(true);
    setTopError(null);

    try {
      const [accountResponse, usageSummaryResponse, productsResponse, conversationResponse] = await Promise.all([
        api.account.get(),
        api.billing.usageSummary(),
        api.payment.products(),
        api.usage.conversationSummary(),
      ]);
      setAccount(accountResponse.data);
      setUsageSummary(usageSummaryResponse.data);
      setProducts(sortPaymentProducts(productsResponse.data));
      setConversationSummary(conversationResponse.data);
    } catch (error) {
      setConversationSummary(null);
      setTopError(readApiErrorMessage(error, "账单概览加载失败，请稍后重试。"));
    } finally {
      setTopLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const response = await api.payment.orders({ page: 1, limit: ORDER_PAGE_SIZE });
      setOrders(response.data);
    } catch (error) {
      setOrdersError(readApiErrorMessage(error, "订单记录加载失败，请稍后重试。"));
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadUsageDetail = useCallback(async () => {
    setUsageLoading(true);
    setUsageError(null);

    try {
      const response = await api.account.usageDetail({ page: 1, limit: USAGE_PAGE_SIZE });
      setUsageDetail(response.data);
    } catch (error) {
      setUsageError(readApiErrorMessage(error, "消耗记录加载失败，请稍后重试。"));
    } finally {
      setUsageLoading(false);
    }
  }, []);

  const loadInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    setInvoicesError(null);

    try {
      const response = await api.billing.invoices({ page: 1, limit: ORDER_PAGE_SIZE });
      setInvoices(response.data);
    } catch (error) {
      setInvoicesError(readApiErrorMessage(error, "发票记录加载失败，请稍后重试。"));
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([
      loadTopSection(),
      loadOrders(),
      loadUsageDetail(),
      loadInvoices(),
    ]);
    setRefreshing(false);
  }, [loadInvoices, loadOrders, loadTopSection, loadUsageDetail]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const productMap = new Map(products.map((product) => [product.id, product]));
  const activePacks = (account?.packs || [])
    .filter((pack) => !pack.expired)
    .sort((left, right) => {
      const leftTime = new Date(left.purchasedAt || 0).getTime();
      const rightTime = new Date(right.purchasedAt || 0).getTime();
      return rightTime - leftTime;
    });
  const pendingOrders = (orders?.items || []).filter((order) => !isPaidPaymentStatus(order.status) && !isFailedPaymentStatus(order.status));
  const totalBalance = account?.credits.remaining ?? 0;
  const totalCredits = account?.credits.total ?? 0;
  const monthlyUsed = usageSummary?.totals.creditsConsumed ?? account?.currentPeriod.creditsConsumed ?? 0;
  const estimatedCost = usageSummary?.totals.estimatedCost ?? usageSummary?.totals.tokenCost ?? 0;
  const conversationQuota = conversationSummary?.quota;
  const conversationQuotaPercent = conversationQuota?.isUnlimited ? 0 : conversationQuota?.usageRate ?? 0;
  const recentInvoiceAmount = (invoices?.items || []).reduce((total, invoice) => total + invoice.amount, 0);
  const bestValueProductId = products.reduce<string | null>((bestId, product) => {
    if (product.unitCredits <= 0) {
      return bestId;
    }

    if (!bestId) {
      return product.id;
    }

    const bestProduct = products.find((item) => item.id === bestId);
    if (!bestProduct || bestProduct.unitCredits <= 0) {
      return product.id;
    }

    const currentUnitPrice = product.price / product.unitCredits;
    const bestUnitPrice = bestProduct.price / bestProduct.unitCredits;
    return currentUnitPrice < bestUnitPrice ? product.id : bestId;
  }, null);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <MetadataUpdater title="账单与额度" />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-100">
            <WalletCards className="h-3.5 w-3.5" />
            Billing & Credits
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">账单与额度</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
              直接读取真实余额、资源包、订单、发票和消耗账本，支付成功后额度会自动回流到账户余额。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
            disabled={refreshing}
            onClick={() => {
              void refreshAll();
            }}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            刷新账单
          </Button>
          <Button variant="outline" className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]" render={<Link href="/dashboard/subscription" />}>
            订阅方案
          </Button>
        </div>
      </div>

      <DataState
        loading={topLoading}
        error={topError}
        isEmpty={!topLoading && !topError && !account && products.length === 0}
        onRetry={() => {
          void loadTopSection();
        }}
        emptyState={
          <WarmEmptyState
            icon={Sparkles}
            title="你的账本还没开始运转"
            description="首笔充值完成后，这里会开始展示余额、资源包和支付历史。"
            actionLabel="去购买额度"
            onAction={() => {
              window.location.href = "/dashboard/billing/checkout";
            }}
          />
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="当前可用余额"
            value={formatCompactNumber(totalBalance)}
            description={`总额度 ${formatCompactNumber(totalCredits)}，可直接用于真实视频生产。`}
            icon={Coins}
          />
          <SummaryCard
            title="本月已消耗"
            value={formatCompactNumber(monthlyUsed)}
            description={`本月估算 Token 成本 ${formatCurrency(estimatedCost)}。`}
            icon={Zap}
          />
          <SummaryCard
            title="生效资源包"
            value={formatCompactNumber(activePacks.length)}
            description={`待支付订单 ${formatCompactNumber(pendingOrders.length)} 笔。`}
            icon={Package}
          />
          <SummaryCard
            title="近期开票金额"
            value={formatCurrency(recentInvoiceAmount)}
            description={`本月互动式消耗完成率 ${formatPercent(usageSummary?.totals.recordCount ? (monthlyUsed / Math.max(totalCredits || monthlyUsed, 1)) * 100 : 0)}。`}
            icon={CreditCard}
          />
        </div>

        {usageSummary?.byType?.length ? (
          <div className="grid gap-4 xl:grid-cols-3">
            {usageSummary.byType.slice(0, 3).map((item) => (
              <Card key={item.id} className="border-border/70 bg-card/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{formatUsageTypeLabel(item.type || item.name)}</CardTitle>
                  <CardDescription>来自 `/api/v1/billing/usage-summary` 的真实聚合。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>消耗条数</span>
                    <span className="font-medium text-foreground">{formatCompactNumber(item.creditsConsumed)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Token 成本</span>
                    <span className="font-medium text-foreground">{formatCurrency(item.tokenCost)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>记录数</span>
                    <span className="font-medium text-foreground">{formatCompactNumber(item.recordCount)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {conversationSummary ? (
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.94),rgba(5,10,20,0.98))]">
            <CardHeader>
              <CardTitle className="text-white">对话 Token 用量</CardTitle>
              <CardDescription className="text-slate-300/70">
                按本月对话会话的真实消耗统计。当前阶段只做透明追踪与提醒，不会因为超额而阻断对话。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">本月已用</div>
                  <div className="mt-3 text-2xl font-bold text-white">
                    {formatCompactNumber(conversationSummary.totals.totalTokens)}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    共 {formatCompactNumber(conversationSummary.totals.records)} 次会话
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">月含量</div>
                  <div className="mt-3 text-2xl font-bold text-white">
                    {conversationQuota?.isUnlimited ? "无限制" : formatCompactNumber(conversationQuota?.total ?? 0)}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {conversationQuota?.isUnlimited ? "BYOK 模式由你自己的 Key 承担成本" : "超额只提醒，不阻断"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">当前状态</div>
                  <div className="mt-3 text-2xl font-bold text-white">
                    {conversationQuota?.warningLevel === "exceeded"
                      ? "已超额"
                      : conversationQuota?.warningLevel === "warning"
                        ? "接近上限"
                        : "正常"}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    80% 触发提醒，100% 建议升级套餐或切换 BYOK
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">预估成本</div>
                  <div className="mt-3 text-2xl font-bold text-white">
                    {formatCurrency(conversationSummary.totals.estimatedCost)}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    仅用于透明展示模型成本结构
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">配额进度</div>
                    <div className="text-xs text-slate-400">
                      {conversationQuota?.isUnlimited
                        ? "无限模式下不做 Token 配额限制。"
                        : `已使用 ${formatPercent(conversationQuotaPercent)}，剩余 ${formatCompactNumber(conversationQuota?.remaining ?? 0)} tokens。`}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
                    render={<Link href="/dashboard/usage" />}
                  >
                    查看明细
                  </Button>
                </div>
                <Progress value={conversationQuota?.isUnlimited ? 18 : Math.min(conversationQuotaPercent, 100)} className="h-3 bg-white/10" />
                <div className="grid gap-2 md:grid-cols-3">
                  {(conversationSummary.byModel || []).slice(0, 3).map((item) => (
                    <div key={item.model} className="rounded-xl border border-white/10 bg-zinc-950/70 p-3">
                      <div className="text-sm font-medium text-white">{item.model}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        {formatCompactNumber(item.totalTokens)} tokens · {formatPercent(item.usageRate)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_30%),rgba(2,6,23,0.88)] shadow-[0_28px_90px_-56px_rgba(14,165,233,0.35)]">
            <CardHeader>
              <CardTitle className="text-white">我的资源包</CardTitle>
              <CardDescription className="text-slate-300/70">
                从账户账本读取真实剩余额度与消耗比例，适合快速判断当前产能余量。
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activePacks.length === 0 ? (
                <WarmEmptyState
                  icon={Package}
                  title="还没有生效中的资源包"
                  description="完成第一笔购买后，这里会列出每个资源包的余额与使用进度。"
                  actionLabel="立即购买"
                  onAction={() => {
                    window.location.href = "/dashboard/billing/checkout";
                  }}
                />
              ) : (
                <div className="space-y-4">
                  {activePacks.map((pack) => {
                    const product = findProductForPack(products, pack);

                    return (
                      <div key={pack.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-semibold text-white">
                                {product?.name || pack.packType}
                              </h3>
                              <Badge variant="secondary" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                                {pack.status || "active"}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-slate-300/70">
                              {product?.description || "该资源包已成功入账，可直接抵扣视频生成消耗。"}
                            </p>
                          </div>
                          <div className="text-right text-sm text-slate-300/80">
                            <div>{formatDate(pack.purchasedAt)}</div>
                            <div>{pack.expiresAt ? `到期：${formatDate(pack.expiresAt)}` : "永久有效"}</div>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                            <span>剩余 {formatCompactNumber(pack.remainingCredits)}</span>
                            <span>{formatCompactNumber(pack.usedCredits)} / {formatCompactNumber(pack.totalCredits)}</span>
                          </div>
                          <Progress value={getPackUsagePercent(pack)} className="h-2 bg-white/10" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/70">
            <CardHeader>
              <CardTitle>购买更多视频包</CardTitle>
              <CardDescription>
                视频包列表直接来自 `/api/v1/payment/products`，价格与条数以真实商品配置为准。
              </CardDescription>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <WarmEmptyState
                  icon={Sparkles}
                  title="还没有可购买的视频包"
                  description="商品配置接通后，这里会自动展示所有可售的视频额度包。"
                />
              ) : (
                <div className="space-y-4">
                  {products.map((product) => {
                    const isPopular = product.id === bestValueProductId;
                    const unitPrice = product.unitCredits > 0 ? product.price / product.unitCredits : product.price;

                    return (
                      <div
                        key={product.id}
                        className={`rounded-2xl border p-4 transition-all ${isPopular ? "border-sky-500/30 bg-sky-500/10" : "border-border/70 bg-background/40"}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">{product.name}</h3>
                              {isPopular ? <Badge className="border-none bg-sky-500 text-slate-950">推荐</Badge> : null}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{product.description || "适合补充视频生产额度。"}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-white">{formatCurrency(product.price)}</div>
                            <div className="text-xs text-slate-400">
                              {formatCurrency(unitPrice)} / 条
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-slate-200">
                            <Play className="h-4 w-4 fill-current text-sky-300" />
                            {formatCompactNumber(product.unitCredits)} 条视频额度
                          </div>
                          <Button className="bg-white text-slate-950 hover:bg-slate-100" render={<Link href={`/dashboard/billing/checkout?product=${product.id}`} />}>
                            立即购买
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DataState>

      <Card className="overflow-hidden border-border/70 bg-card/70">
        <CardHeader>
          <CardTitle>订单记录</CardTitle>
          <CardDescription>
            最近的支付订单来自 `/api/v1/payment/orders`，进入 Checkout 后会继续轮询订单状态。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataState
            loading={ordersLoading}
            error={ordersError}
            isEmpty={!ordersLoading && !ordersError && (orders?.items.length || 0) === 0}
            loadingState={<TableSkeleton rows={6} columns={5} />}
            onRetry={() => {
              void loadOrders();
            }}
            emptyState={
              <WarmEmptyState
                icon={CreditCard}
                title="还没有支付订单"
                description="当你创建第一笔购买订单后，这里会展示订单号、金额和支付状态。"
                actionLabel="创建订单"
                onAction={() => {
                  window.location.href = "/dashboard/billing/checkout";
                }}
              />
            }
          >
            <div className="overflow-hidden rounded-2xl border border-border/70">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>订单号</TableHead>
                    <TableHead>商品</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(orders?.items || []).map((order) => {
                    const product = order.productId ? productMap.get(order.productId) : undefined;

                    return (
                      <TableRow key={order.id} className="hover:bg-muted/20">
                        <TableCell className="font-mono text-xs text-muted-foreground">{order.orderId}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{product?.name || order.productId || "视频包"}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatCompactNumber((product?.unitCredits || 0) * Math.max(order.quantity, 1))} 条额度
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(resolveOrderAmount(order, productMap))}</TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </DataState>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 bg-card/70">
        <CardHeader>
          <CardTitle>发票记录</CardTitle>
          <CardDescription>
            从 `/api/v1/billing/invoices` 读取真实开票历史，方便和订单、消耗账本进行交叉核对。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataState
            loading={invoicesLoading}
            error={invoicesError}
            isEmpty={!invoicesLoading && !invoicesError && (invoices?.items.length || 0) === 0}
            loadingState={<TableSkeleton rows={4} columns={5} />}
            onRetry={() => {
              void loadInvoices();
            }}
            emptyState={
              <WarmEmptyState
                icon={CreditCard}
                title="还没有开票记录"
                description="当产生首笔可开票订单后，这里会开始沉淀发票编号、金额和状态。"
              />
            }
          >
            <div className="overflow-hidden rounded-2xl border border-border/70">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>发票号</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>开票时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(invoices?.items || []).map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono text-xs text-muted-foreground">{invoice.number}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                          {invoice.status || "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateTime(invoice.issuedAt || invoice.paidAt || invoice.dueAt)}</TableCell>
                      <TableCell>
                        {invoice.downloadUrl ? (
                          <Button variant="ghost" size="sm" render={<a href={invoice.downloadUrl} target="_blank" rel="noreferrer" />}>
                            查看
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">待生成</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DataState>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 bg-card/70">
        <CardHeader>
          <CardTitle>消耗记录</CardTitle>
          <CardDescription>
            从 `/api/v1/account/usage/detail` 读取真实消耗明细，方便对照余额与任务消耗来源。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataState
            loading={usageLoading}
            error={usageError}
            isEmpty={!usageLoading && !usageError && (usageDetail?.items.length || 0) === 0}
            loadingState={<TableSkeleton rows={6} columns={5} />}
            onRetry={() => {
              void loadUsageDetail();
            }}
            emptyState={
              <WarmEmptyState
                icon={Sparkles}
                title="还没有额度消耗记录"
                description="当你开始生成真实视频后，这里会自动沉淀每一条消耗账本。"
                actionLabel="去生成视频"
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
                    <TableHead>视频 / 任务</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>消耗条数</TableHead>
                    <TableHead>Token 成本</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(usageDetail?.items || []).map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{item.videoTitle}</div>
                          <div className="text-xs text-muted-foreground">{item.brandName || item.brandId || "未关联品牌"}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatUsageTypeLabel(item.type)}</TableCell>
                      <TableCell>{formatCompactNumber(item.creditsConsumed)}</TableCell>
                      <TableCell>{formatCurrency(item.tokenCost)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateTime(item.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DataState>
        </CardContent>
      </Card>
    </div>
  );
}
