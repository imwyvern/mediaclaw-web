export function formatCompactNumber(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return "0";
  }

  const absolute = Math.abs(numeric);
  if (absolute >= 100000000) {
    return `${(numeric / 100000000).toFixed(1).replace(/\.0$/, "")}亿`;
  }

  if (absolute >= 10000) {
    return `${(numeric / 10000).toFixed(1).replace(/\.0$/, "")}万`;
  }

  return `${numeric}`;
}

export function formatCurrency(value: number | string | null | undefined, currency = "CNY") {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return "¥0.00";
  }

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function formatCurrencyFromCent(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return "¥0.00";
  }

  return formatCurrency(numeric / 100);
}

export function formatPercent(value: number | string | null | undefined, fractionDigits = 1) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return `0.${"0".repeat(fractionDigits)}%`;
  }

  return `${numeric.toFixed(fractionDigits)}%`;
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) {
    return "--";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) {
    return "--";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDuration(seconds: number | string | null | undefined) {
  const numeric = Number(valueOrZero(seconds));
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "--";
  }

  if (numeric < 60) {
    return `${Math.round(numeric)} 秒`;
  }

  const minutes = Math.floor(numeric / 60);
  const remainder = Math.round(numeric % 60);
  if (remainder === 0) {
    return `${minutes} 分钟`;
  }

  return `${minutes} 分 ${remainder} 秒`;
}

export function maskSecret(value: string | null | undefined, keepStart = 6, keepEnd = 4) {
  if (!value) {
    return "";
  }

  if (value.length <= keepStart + keepEnd) {
    return value;
  }

  return `${value.slice(0, keepStart)}${"*".repeat(Math.max(value.length - keepStart - keepEnd, 6))}${value.slice(-keepEnd)}`;
}

function valueOrZero(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}
