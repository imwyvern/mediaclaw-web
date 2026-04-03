"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Check,
  Coins,
  CreditCard,
  Package,
  RefreshCw,
  Sparkles,
  TrendingUp,
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
  isApiNotFoundError,
  readApiErrorMessage,
  type AccountPack,
  type AccountSnapshot,
  type PaginatedResponse,
  type PaymentOrder,
  type PaymentProduct,
  type UsageSummary,
} from "@/lib/api";
import { formatCompactNumber, formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import {
  findProductForPack,
  getPackUsagePercent,
  getPaymentStatusLabel,
  isPaidPaymentStatus,
  resolveOrderAmount,
  sortPaymentProducts,
} from "@/lib/payment";

const ORDER_PAGE_SIZE = 10;

function StatCard({
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
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(6,10,18,0.98))] shadow-[0_24px_80px_-48px_rgba(59,130,246,0.35)]">
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

function ActivePackCard({ pack, product }: { pack: AccountPack; product?: PaymentProduct }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">{product?.name || pack.packType}</h3>
            <Badge variant="secondary" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
              {pack.status || "active"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-300/70">
            {product?.description || "该资源包已入账，可直接抵扣视频生成额度。"}
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
}

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productsComingSoon, setProductsComingSoon] = useState(false);
  const [ordersComingSoon, setOrdersComingSoon] = useState(false);
  const [accountComingSoon, setAccountComingSoon] = useState(false);
  const [usageComingSoon, setUsageComingSoon] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountSnapshot | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [products, setProducts] = useState<PaymentProduct[]>([]);
  const [orders, setOrders] = useState<PaginatedResponse<PaymentOrder> | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setOrdersError(null);
    setProductsComingSoon(false);
    setOrdersComingSoon(false);
    setAccountComingSoon(false);
    setUsageComingSoon(false);

    const results = await Promise.allSettled([
      api.account.get(),
      api.account.usage(),
      api.payment.products(),
      api.payment.orders({ page: 1, limit: ORDER_PAGE_SIZE }),
    ]);

    const [accountResult, usageResult, productsResult, ordersResult] = results;
    const fatalErrors: string[] = [];

    if (accountResult.status === "fulfilled") {
      setAccount(accountResult.value.data);
    } else if (isApiNotFoundError(accountResult.reason)) {
      setAccount(null);
      setAccountComingSoon(true);
    } else {
      setAccount(null);
      fatalErrors.push(readApiErrorMessage(accountResult.reason, "订阅账户数据加载失败，请稍后重试。"));
    }

    if (usageResult.status === "fulfilled") {
      setUsage(usageResult.value.data);
    } else if (isApiNotFoundError(usageResult.reason)) {
      setUsage(null);
      setUsageComingSoon(true);
    } else {
      setUsage(null);
    }

    if (productsResult.status === "fulfilled") {
      setProducts(sortPaymentProducts(productsResult.value.data));
    } else if (isApiNotFoundError(productsResult.reason)) {
      setProducts([]);
      setProductsComingSoon(true);
    } else {
      setProducts([]);
      fatalErrors.push(readApiErrorMessage(productsResult.reason, "订阅方案加载失败，请稍后重试。"));
    }

    if (ordersResult.status === "fulfilled") {
      setOrders(ordersResult.value.data);
    } else if (isApiNotFoundError(ordersResult.reason)) {
      setOrders({ items: [], total: 0, page: 1, limit: ORDER_PAGE_SIZE });
      setOrdersComingSoon(true);
    } else {
      setOrders(null);
      setOrdersError(readApiErrorMessage(ordersResult.reason, "账单记录加载失败，请稍后重试。"));
    }

    if (fatalErrors.length > 0) {
      setError(fatalErrors[0]);
    }

    setLoading(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const productMap = new Map(products.map((product) => [product.id, product]));
  const activePacks = (account?.packs || [])
    .filter((pack) => !pack.expired)
    .sort((left, right) => new Date(right.purchasedAt || 0).getTime() - new Date(left.purchasedAt || 0).getTime());
  const currentPack = activePacks[0] || null;
  const lastPaidOrder = (orders?.items || []).find((order) => isPaidPaymentStatus(order.status)) || null;
  const currentProduct = findProductForPack(products, currentPack) || (lastPaidOrder?.productId ? productMap.get(lastPaidOrder.productId) : undefined) || null;
  const monthlyVideos = usage?.totals.videosGenerated ?? usage?.totals.recordCount ?? 0;
  const monthlyCredits = usage?.totals.creditsConsumed ?? 0;
  const monthlyTokens = usage?.totals.totalTokens ?? 0;
  const monthlyCost = usage?.totals.estimatedCost ?? usage?.totals.tokenCost ?? 0;
  const remainingCredits = account?.credits.remaining ?? 0;
  const currentUsagePercent = currentPack ? getPackUsagePercent(currentPack) : 0;
  const pageComingSoon = !account && products.length === 0 && (accountComingSoon || productsComingSoon);

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-500">
      <MetadataUpdater title="订阅与方案" />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-100">
            <CreditCard className="h-3.5 w-3.5" />
            Subscription View
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">订阅与方案</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300/80 sm:text-base">
              当前后端已开放资源包、余额、用量和订单接口。本页据此展示你的当前方案、可升级路径与真实用量，不再展示伪造的卡片和自动续费状态。
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
          disabled={loading}
          onClick={() => {
            void loadData();
          }}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          刷新方案
        </Button>
      </div>

      <DataState
        loading={loading}
        error={pageComingSoon ? null : error}
        isEmpty={!loading && (pageComingSoon || (!error && !account && products.length === 0))}
        onRetry={() => {
          void loadData();
        }}
        emptyState={
          pageComingSoon ? (
            <WarmEmptyState
              icon={Sparkles}
              title="订阅面板即将上线"
              description="当前环境尚未开放订阅账户或方案接口，后端发布后这里会直接展示真实方案、资源包和账单。"
              actionLabel="重新加载"
              onAction={() => {
                void loadData();
              }}
            />
          ) : (
            <WarmEmptyState
              icon={Sparkles}
              title="还没有可展示的方案数据"
              description="完成第一笔购买后，这里会自动展示当前方案、用量和升级路径。"
              actionLabel="去 Billing"
              onAction={() => {
                window.location.href = "/dashboard/billing";
              }}
            />
          )
        }
      >
        {usageComingSoon ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            当前环境尚未开放用量汇总接口，本月用量与成本将在后端发布后自动补齐。
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="当前方案"
            value={currentProduct?.name || "未激活"}
            description={currentPack ? `当前生效资源包剩余 ${formatCompactNumber(currentPack.remainingCredits)} 条额度。` : "还没有生效中的资源包，可直接购买。"}
            icon={Package}
          />
          <StatCard
            title="总余额"
            value={formatCompactNumber(remainingCredits)}
            description="余额来自真实账户账本，会随着支付成功和任务消耗实时变化。"
            icon={Coins}
          />
          <StatCard
            title="本月已用条数"
            value={formatCompactNumber(monthlyVideos)}
            description={`累计消耗 ${formatCompactNumber(monthlyCredits)} 条额度，用于衡量当前月产能。`}
            icon={Zap}
          />
          <StatCard
            title="本月成本估算"
            value={formatCurrency(monthlyCost)}
            description={`累计 Token ${formatCompactNumber(monthlyTokens)}，当前估算成本自动来自后端用量汇总。`}
            icon={TrendingUp}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_30%),rgba(2,6,23,0.9)] shadow-[0_28px_90px_-56px_rgba(59,130,246,0.4)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-white">当前方案</CardTitle>
                  <CardDescription className="text-slate-300/70">
                    基于账户资源包和最近已支付订单推导当前生效方案。
                  </CardDescription>
                </div>
                <Badge className="border-none bg-sky-500 text-slate-950">
                  {currentPack ? "已生效" : "待购买"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">当前账单模式</div>
                    <div className="mt-3 text-3xl font-black text-white">按包计费</div>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300/75">
                      当前前端已对接的是视频额度包、消耗账本与支付订单。企业平台月订阅 API 暂未开放，因此升级/降级以切换购买不同额度包为主。
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-300/80">
                    <div>最近支付：{lastPaidOrder ? formatDate(lastPaidOrder.paidAt || lastPaidOrder.createdAt) : "--"}</div>
                    <div>用量周期：{usage?.period.endAt ? `至 ${formatDate(usage.period.endAt)}` : "按实时累计"}</div>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                    <span>当前包使用进度</span>
                    <span>{currentPack ? `${formatCompactNumber(currentPack.usedCredits)} / ${formatCompactNumber(currentPack.totalCredits)}` : "--"}</span>
                  </div>
                  <Progress value={currentUsagePercent} className="h-2 bg-white/10" />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button className="bg-white text-slate-950 hover:bg-slate-100" render={<Link href="/dashboard/billing" />}>
                  查看 Billing
                </Button>
                <Button variant="outline" className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]" render={<Link href="/dashboard/usage" />}>
                  打开用量面板
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/70">
            <CardHeader>
              <CardTitle>生效中的资源包</CardTitle>
              <CardDescription>
                每个资源包都来自真实账户账本，可直接看到余额和使用进度。
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activePacks.length === 0 ? (
                accountComingSoon ? (
                  <WarmEmptyState
                    icon={Package}
                    title="资源包视图即将上线"
                    description="当前环境尚未开放账户资源包接口，后端发布后这里会直接显示真实剩余条数与进度。"
                    actionLabel="重新加载"
                    onAction={() => {
                      void loadData();
                    }}
                  />
                ) : (
                  <WarmEmptyState
                    icon={Package}
                    title="还没有生效中的资源包"
                    description="完成第一笔购买后，这里会显示每个资源包的剩余条数和使用进度。"
                    actionLabel="去购买"
                    onAction={() => {
                      window.location.href = "/dashboard/billing/checkout";
                    }}
                  />
                )
              ) : (
                <div className="space-y-4">
                  {activePacks.map((pack) => (
                    <ActivePackCard key={pack.id} pack={pack} product={findProductForPack(products, pack)} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 bg-card/70">
          <CardHeader>
            <CardTitle>可升级 / 降级方案</CardTitle>
            <CardDescription>
              商品列表来自 `/api/v1/payment/products`。点击后会跳转到真实 Checkout 流程创建订单。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              productsComingSoon ? (
                <WarmEmptyState
                  icon={Sparkles}
                  title="方案列表即将上线"
                  description="当前环境尚未开放支付商品接口，后端发布后这里会直接展示真实资源包与升级路径。"
                  actionLabel="重新加载"
                  onAction={() => {
                    void loadData();
                  }}
                />
              ) : (
                <WarmEmptyState
                  icon={Sparkles}
                  title="还没有可切换的方案"
                  description="支付商品配置完成后，这里会自动展示所有资源包。"
                />
              )
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {products.map((product) => {
                  const unitPrice = product.unitCredits > 0 ? product.price / product.unitCredits : product.price;
                  const isCurrent = Boolean(currentProduct && currentProduct.id === product.id);
                  const currentCredits = currentProduct?.unitCredits || 0;
                  const ctaLabel = isCurrent
                    ? "当前方案"
                    : product.unitCredits >= currentCredits
                      ? "升级到此方案"
                      : "切换为更轻量方案";

                  return (
                    <Card key={product.id} className={`relative flex flex-col ${isCurrent ? "border-sky-500 ring-1 ring-sky-500/40" : "border-border/70"}`}>
                      {isCurrent ? (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-none bg-sky-500 text-slate-950">
                          当前方案
                        </Badge>
                      ) : null}
                      <CardHeader>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription className="min-h-[40px] text-xs">{product.description || "适合按需补充视频生产额度。"}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
                          <span className="text-sm text-muted-foreground">/ 包</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCompactNumber(product.unitCredits)} 条视频额度
                        </div>
                        <div className="text-xs text-muted-foreground">
                          单条约 {formatCurrency(unitPrice)}
                        </div>
                        <ul className="space-y-2">
                          {[
                            `${formatCompactNumber(product.unitCredits)} 条真实可用额度`,
                            "支付成功后自动入账",
                            "可直接用于后续视频生成",
                          ].map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-xs">
                              <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardContent className="pt-0">
                        <Button
                          variant={isCurrent ? "secondary" : "outline"}
                          className="w-full"
                          disabled={isCurrent}
                          render={<Link href={`/dashboard/billing/checkout?product=${product.id}`} />}
                        >
                          {ctaLabel}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70 bg-card/70">
          <CardHeader>
            <CardTitle>最近账单记录</CardTitle>
            <CardDescription>
              使用真实订单列表展示最近付款状态与金额，便于和 Billing 页面交叉核对。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataState
              loading={loading}
              error={ordersComingSoon ? null : ordersError}
              isEmpty={!loading && (ordersComingSoon || (orders?.items.length || 0) === 0)}
              loadingState={<TableSkeleton rows={5} columns={4} />}
              emptyState={
                ordersComingSoon ? (
                  <WarmEmptyState
                    icon={CreditCard}
                    title="账单记录即将上线"
                    description="当前环境尚未开放订单历史接口，后端发布后这里会直接展示最近付款状态与金额。"
                    actionLabel="重新加载"
                    onAction={() => {
                      void loadData();
                    }}
                  />
                ) : (
                  <WarmEmptyState
                    icon={CreditCard}
                    title="还没有账单记录"
                    description="当产生第一笔支付订单后，这里会自动沉淀成历史账单。"
                  />
                )
              }
            >
              <div className="overflow-hidden rounded-2xl border border-border/70">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>订单号</TableHead>
                      <TableHead>商品</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(orders?.items || []).map((order) => {
                      const product = order.productId ? productMap.get(order.productId) : undefined;

                      return (
                        <TableRow key={order.id} className="hover:bg-muted/20">
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-mono text-xs text-muted-foreground">{order.orderId}</div>
                              <div className="text-sm font-medium">{formatCurrency(resolveOrderAmount(order, productMap))}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{product?.name || order.productId || "视频包"}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatCompactNumber((product?.unitCredits || 0) * Math.max(order.quantity, 1))} 条额度
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                              {getPaymentStatusLabel(order.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTime(order.paidAt || order.createdAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </DataState>
          </CardContent>
        </Card>
      </DataState>
    </div>
  );
}
