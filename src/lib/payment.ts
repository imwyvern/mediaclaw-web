import type { AccountPack, PaymentOrder, PaymentProduct } from "@/lib/api";

const PAID_STATUSES = new Set(["paid", "success", "completed"]);
const FAILED_STATUSES = new Set(["failed", "expired", "refunded", "cancelled"]);

export function sortPaymentProducts(products: PaymentProduct[]) {
  return [...products]
    .filter((product) => product.unitCredits > 0)
    .sort((left, right) => {
      if (left.unitCredits !== right.unitCredits) {
        return left.unitCredits - right.unitCredits;
      }

      return left.price - right.price;
    });
}

export function findPaymentProduct(products: PaymentProduct[], query?: string | null) {
  if (!query) {
    return undefined;
  }

  return products.find((product) => product.id === query || product.packType === query);
}

export function findProductForPack(products: PaymentProduct[], pack?: AccountPack | null) {
  if (!pack) {
    return undefined;
  }

  return products.find((product) => product.id === pack.packType || product.packType === pack.packType);
}

export function getPaymentStatusLabel(status: string) {
  const normalized = status.trim().toLowerCase();

  if (PAID_STATUSES.has(normalized)) {
    return "已支付";
  }

  if (FAILED_STATUSES.has(normalized)) {
    if (normalized === "expired") {
      return "已过期";
    }

    if (normalized === "refunded") {
      return "已退款";
    }

    if (normalized === "cancelled") {
      return "已取消";
    }

    return "支付失败";
  }

  if (normalized === "pending") {
    return "待支付";
  }

  return status || "未知状态";
}

export function isPaidPaymentStatus(status: string) {
  return PAID_STATUSES.has(status.trim().toLowerCase());
}

export function isFailedPaymentStatus(status: string) {
  return FAILED_STATUSES.has(status.trim().toLowerCase());
}

export function resolveOrderAmount(order: PaymentOrder, productMap?: Map<string, PaymentProduct>) {
  const rawAmount = Number(order.amount || 0);
  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    return 0;
  }

  const product = order.productId ? productMap?.get(order.productId) : undefined;
  const quantity = Math.max(Number(order.quantity || 1), 1);

  if (product?.unitAmount && Math.abs(rawAmount - product.unitAmount * quantity) < 0.0001) {
    return rawAmount / 100;
  }

  if (rawAmount >= 10000) {
    return rawAmount / 100;
  }

  return rawAmount;
}

export function getPackUsagePercent(pack: AccountPack) {
  if (pack.totalCredits <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (pack.usedCredits / pack.totalCredits) * 100));
}
