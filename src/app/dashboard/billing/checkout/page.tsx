"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { DataState, TableSkeleton, WarmEmptyState } from "@/components/data-state";
import { MetadataUpdater } from "@/components/metadata-updater";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  api,
  readApiErrorMessage,
  type PaginatedResponse,
  type PaymentOrder,
  type PaymentProduct,
} from "@/lib/api";
import { formatCompactNumber, formatCurrency, formatDateTime } from "@/lib/format";
import {
  findPaymentProduct,
  getPaymentStatusLabel,
  isFailedPaymentStatus,
  isPaidPaymentStatus,
  resolveOrderAmount,
  sortPaymentProducts,
} from "@/lib/payment";

const ORDER_PAGE_SIZE = 6;
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productQuery = searchParams.get("product");
  const legacyPackQuery = searchParams.get("pack");

  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [products, setProducts] = useState<PaymentProduct[]>([]);
  const [orders, setOrders] = useState<PaginatedResponse<PaymentOrder> | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"wechat_native" | "alipay">("wechat_native");
  const [step, setStep] = useState<"select" | "pay" | "success" | "failed">("select");
  const [creating, setCreating] = useState(false);
  const [polling, setPolling] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<PaymentOrder | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const loadProducts = async () => {
    setProductsLoading(true);
    setProductsError(null);

    try {
      const response = await api.payment.products();
      const nextProducts = sortPaymentProducts(response.data);
      setProducts(nextProducts);
    } catch (error) {
      setProductsError(readApiErrorMessage(error, "支付商品加载失败，请稍后重试。"));
    } finally {
      setProductsLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const response = await api.payment.orders({ page: 1, limit: ORDER_PAGE_SIZE });
      setOrders(response.data);
    } catch (error) {
      setOrdersError(readApiErrorMessage(error, "最近订单加载失败，请稍后重试。"));
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
    void loadOrders();
  }, []);

  useEffect(() => {
    if (products.length === 0) {
      return;
    }

    const matched = findPaymentProduct(products, productQuery) || findPaymentProduct(products, legacyPackQuery) || products[0];
    setSelectedProductId((current) => {
      if (productQuery || legacyPackQuery) {
        return matched?.id || "";
      }

      if (current && products.some((product) => product.id === current)) {
        return current;
      }

      return matched?.id || "";
    });
  }, [legacyPackQuery, productQuery, products]);

  const productMap = new Map(products.map((product) => [product.id, product]));
  const selectedProduct = products.find((product) => product.id === selectedProductId) || null;

  const checkCurrentOrderStatus = async (options?: { silent?: boolean }) => {
    if (!currentOrder?.orderId) {
      return;
    }

    try {
      const response = await api.payment.status(currentOrder.orderId);
      const nextOrder = response.data;
      setCurrentOrder(nextOrder);

      if (isPaidPaymentStatus(nextOrder.status)) {
        setStep("success");
        setPolling(false);
        setPaymentError(null);
        toast.success("支付成功，额度已到账。", { id: `payment-${nextOrder.orderId}` });
        void loadOrders();
        return;
      }

      if (isFailedPaymentStatus(nextOrder.status)) {
        setStep("failed");
        setPolling(false);
        setPaymentError(`订单当前状态为“${getPaymentStatusLabel(nextOrder.status)}”。`);
        void loadOrders();
        return;
      }

      if (!options?.silent) {
        toast.message(`当前订单状态：${getPaymentStatusLabel(nextOrder.status)}`);
      }
    } catch (error) {
      const message = readApiErrorMessage(error, "订单状态查询失败，请稍后重试。");
      setPaymentError(message);
      if (!options?.silent) {
        toast.error(message);
      }
    }
  };

  useEffect(() => {
    if (step !== "pay" || !currentOrder?.orderId) {
      return;
    }

    let cancelled = false;
    setPolling(true);
    setPaymentError(null);

    const poll = async () => {
      if (cancelled) {
        return;
      }

      try {
        const response = await api.payment.status(currentOrder.orderId);
        if (cancelled) {
          return;
        }

        const nextOrder = response.data;
        setCurrentOrder(nextOrder);

        if (isPaidPaymentStatus(nextOrder.status)) {
          setStep("success");
          setPolling(false);
          toast.success("支付成功，额度已到账。", { id: `payment-${nextOrder.orderId}` });
          void loadOrders();
          return;
        }

        if (isFailedPaymentStatus(nextOrder.status)) {
          setStep("failed");
          setPolling(false);
          setPaymentError(`订单当前状态为“${getPaymentStatusLabel(nextOrder.status)}”。`);
          void loadOrders();
        }
      } catch (error) {
        if (!cancelled) {
          setPaymentError(readApiErrorMessage(error, "订单状态轮询失败，请稍后手动刷新。"));
        }
      }
    };

    void poll();
    const intervalId = window.setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setPolling(false);
        setPaymentError("支付状态确认超时，你可以稍后继续刷新订单状态。");
      }
    }, POLL_TIMEOUT_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [currentOrder?.orderId, step]);

  const handleCheckout = async () => {
    if (!selectedProduct) {
      toast.error("请先选择一个可购买的视频包。");
      return;
    }

    setCreating(true);
    setPaymentError(null);

    try {
      const response = await api.payment.create({
        productId: selectedProduct.id,
        productType: selectedProduct.productType,
        paymentMethod,
        quantity: 1,
      });

      const nextOrder = response.data;
      setCurrentOrder(nextOrder);
      setStep("pay");

      if (nextOrder.payUrl) {
        const popup = window.open(nextOrder.payUrl, "_blank", "noopener,noreferrer");
        if (!popup) {
          toast.warning("浏览器拦截了收银台弹窗，请点击页面中的“打开收银台”按钮继续支付。");
        }
      } else {
        toast.error("未拿到收银台链接，请稍后重试。");
      }

      void loadOrders();
    } catch (error) {
      const message = readApiErrorMessage(error, "创建支付订单失败，请稍后重试。");
      setPaymentError(message);
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  if (step === "success" && selectedProduct) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 animate-in zoom-in duration-500">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">支付成功</h1>
          <p className="text-muted-foreground">
            已为你的账户充值 {formatCompactNumber(selectedProduct.unitCredits)} 条视频额度。
          </p>
          <p className="text-xs text-muted-foreground">订单号：{currentOrder?.orderId || "--"}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/billing")}>查看账单</Button>
          <Button onClick={() => router.push("/dashboard/videos/create")}>开始制作视频</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-500">
      <MetadataUpdater title="购买额度" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (step === "pay") {
                setStep("select");
                setPolling(false);
                setPaymentError(null);
              } else {
                router.back();
              }
            }}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">购买视频额度</h1>
            <p className="text-muted-foreground">创建真实支付订单，跳转收银台后自动轮询订单状态。</p>
          </div>
        </div>

        <Button variant="outline" className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]" render={<Link href="/dashboard/billing" />}>
          返回 Billing
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <DataState
            loading={productsLoading}
            error={productsError}
            isEmpty={!productsLoading && products.length === 0}
            onRetry={() => {
              void loadProducts();
            }}
            emptyState={
              <WarmEmptyState
                icon={Sparkles}
                title="暂无可购买商品"
                description="等支付商品配置完成后，这里会自动展示真实视频包。"
                actionLabel="返回 Billing"
                onAction={() => {
                  window.location.href = "/dashboard/billing";
                }}
              />
            }
          >
            {step === "select" ? (
              <Card className="border-white/10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_30%),rgba(2,6,23,0.88)] shadow-[0_28px_90px_-56px_rgba(14,165,233,0.35)]">
                <CardHeader>
                  <CardTitle className="text-white">选择视频包</CardTitle>
                  <CardDescription className="text-slate-300/70">
                    商品列表来自 `/api/v1/payment/products`，支持兼容旧链接中的 `pack` 参数。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedProductId} onValueChange={setSelectedProductId} className="grid gap-4 sm:grid-cols-2">
                    {products.map((product, index) => {
                      const unitPrice = product.unitCredits > 0 ? product.price / product.unitCredits : product.price;
                      const isRecommended = index === 1 || index === 2;

                      return (
                        <div key={product.id}>
                          <RadioGroupItem value={product.id} id={product.id} className="peer sr-only" />
                          <Label
                            htmlFor={product.id}
                            className="relative flex cursor-pointer flex-col justify-between rounded-2xl border-2 border-white/10 bg-white/[0.04] p-6 text-left transition-all hover:border-white/20 hover:bg-white/[0.07] peer-data-[state=checked]:border-sky-400 peer-data-[state=checked]:bg-sky-500/10 [&:has([data-state=checked])]:border-sky-400"
                          >
                            {isRecommended ? (
                              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-none bg-sky-500 text-slate-950">
                                推荐
                              </Badge>
                            ) : null}
                            <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                                {product.name}
                              </p>
                              <p className="text-3xl font-black text-white">{formatCompactNumber(product.unitCredits)}</p>
                              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">视频额度</p>
                            </div>
                            <div className="mt-6 space-y-1">
                              <p className="text-2xl font-black text-sky-100">{formatCurrency(product.price)}</p>
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                {formatCurrency(unitPrice)} / 条
                              </p>
                            </div>
                            <p className="mt-4 text-xs leading-6 text-slate-300/75">
                              {product.description || "适合补充生产额度，支付成功后自动入账。"}
                            </p>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </CardContent>
                <CardFooter className="border-t border-white/10 bg-white/[0.02] px-6 py-4">
                  <div className="flex items-center gap-2 text-xs text-slate-300/70">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    支付订单由 `/api/v1/payment/create` 创建，成功后自动通过 `/api/v1/payment/status/:orderNo` 确认到账。
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <Card className="border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_32%),rgba(2,6,23,0.92)] shadow-[0_28px_90px_-56px_rgba(56,189,248,0.38)]">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-white">完成支付</CardTitle>
                      <CardDescription className="text-slate-300/70">
                        订单已创建，当前会持续轮询支付状态。你也可以手动重新打开收银台。
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                      {currentOrder ? getPaymentStatusLabel(currentOrder.status) : "待支付"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 py-2">
                  <div className="flex gap-3 rounded-xl bg-white/[0.04] p-1">
                    <Button
                      variant={paymentMethod === "wechat_native" ? "secondary" : "ghost"}
                      className="flex-1 gap-2 text-white"
                      onClick={() => setPaymentMethod("wechat_native")}
                      disabled
                    >
                      微信支付
                    </Button>
                    <Button
                      variant={paymentMethod === "alipay" ? "secondary" : "ghost"}
                      className="flex-1 gap-2 text-white"
                      onClick={() => setPaymentMethod("alipay")}
                      disabled
                    >
                      支付宝
                    </Button>
                  </div>

                  <div className="flex flex-col items-center gap-6">
                    <div className="relative flex h-72 w-72 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white p-4 shadow-2xl">
                      <QrCode className="h-56 w-56 text-slate-950" />
                      {polling ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 text-slate-900 animate-in fade-in">
                          <Loader2 className="mb-4 h-10 w-10 animate-spin text-sky-500" />
                          <p className="text-sm font-black uppercase tracking-[0.28em] text-sky-600">Waiting for payment</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-2 text-center">
                      <p className="text-3xl font-black text-white">
                        {selectedProduct ? formatCurrency(selectedProduct.price) : "--"}
                      </p>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        订单号 {currentOrder?.orderId || "--"}
                      </p>
                      <p className="text-sm text-slate-300/70">
                        收银台会在新标签页打开，支付完成后此页自动更新状态。
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                      <Button
                        variant="outline"
                        className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
                        disabled={!currentOrder?.payUrl}
                        onClick={() => {
                          if (currentOrder?.payUrl) {
                            window.open(currentOrder.payUrl, "_blank", "noopener,noreferrer");
                          }
                        }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        打开收银台
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
                        disabled={!currentOrder || polling}
                        onClick={() => {
                          void checkCurrentOrderStatus();
                        }}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        刷新状态
                      </Button>
                    </div>

                    {paymentError ? (
                      <div className="w-full rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                        {paymentError}
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )}
          </DataState>
        </div>

        <div className="space-y-6">
          <Card className="border-border/70 bg-card/70">
            <CardHeader>
              <CardTitle className="text-lg">订单摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium">{selectedProduct?.name || "请选择商品"}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedProduct ? `${formatCompactNumber(selectedProduct.unitCredits)} 条视频额度` : "选择后会展示真实价格与条数"}
                  </p>
                </div>
                <div className="text-right font-bold text-white">
                  {selectedProduct ? formatCurrency(selectedProduct.price) : "--"}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">支付方式</span>
                <span className="font-medium">{paymentMethod === "wechat_native" ? "微信支付" : "支付宝"}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-xs font-black uppercase tracking-[0.24em] text-muted-foreground">Total Amount</span>
                <span className="text-2xl font-black text-white">
                  {selectedProduct ? formatCurrency(selectedProduct.price) : "--"}
                </span>
              </div>
              {step === "select" ? (
                <Button className="mt-4 h-12 w-full text-lg font-bold shadow-md shadow-primary/20" onClick={handleCheckout} disabled={!selectedProduct || creating}>
                  {creating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  创建订单并支付
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/70 bg-card/70">
            <CardHeader>
              <CardTitle className="text-lg">最近订单</CardTitle>
              <CardDescription>来自 `/api/v1/payment/orders` 的最近支付记录。</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <DataState
                loading={ordersLoading}
                error={ordersError}
                isEmpty={!ordersLoading && (orders?.items.length || 0) === 0}
                loadingState={<TableSkeleton rows={4} columns={2} />}
                onRetry={() => {
                  void loadOrders();
                }}
                emptyState={
                  <WarmEmptyState
                    icon={Sparkles}
                    title="还没有历史订单"
                    description="创建第一笔支付订单后，这里会显示最近的支付状态与时间。"
                  />
                }
              >
                <Table>
                  <TableBody>
                    {(orders?.items || []).map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/30">
                        <TableCell className="py-3">
                          <div className="font-bold text-xs">{order.orderId}</div>
                          <div className="text-[10px] text-muted-foreground font-medium">
                            {formatDateTime(order.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <div className="font-black text-xs text-foreground">
                            {formatCurrency(resolveOrderAmount(order, productMap))}
                          </div>
                          <Badge variant="secondary" className="mt-1 border-white/10 bg-white/5 text-[9px] uppercase text-slate-200 hover:bg-white/10">
                            {getPaymentStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DataState>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
