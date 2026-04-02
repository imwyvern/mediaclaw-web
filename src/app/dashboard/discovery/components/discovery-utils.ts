import { type DiscoveryPlatform, type DiscoveryPoolItem } from "@/lib/api";

export type DiscoveryPlatformFilter = DiscoveryPlatform | "all";
export type DiscoverySortKey = "viralScore" | "time";

type PlatformPresentation = {
  label: string;
  badgeClass: string;
  surfaceClass: string;
  accent: string;
};

type ScorePresentation = {
  label: string;
  ringColor: string;
  chipClass: string;
  textClass: string;
};

const PLATFORM_PRESENTATION: Record<DiscoveryPlatform, PlatformPresentation> = {
  douyin: {
    label: "抖音",
    badgeClass: "bg-rose-500/18 text-rose-100 ring-1 ring-rose-400/25",
    surfaceClass: "from-rose-500/22 via-rose-500/8 to-transparent",
    accent: "#f43f5e",
  },
  xhs: {
    label: "小红书",
    badgeClass: "bg-red-500/18 text-red-100 ring-1 ring-red-400/25",
    surfaceClass: "from-red-500/22 via-red-500/8 to-transparent",
    accent: "#ef4444",
  },
  kuaishou: {
    label: "快手",
    badgeClass: "bg-orange-500/20 text-orange-50 ring-1 ring-orange-400/25",
    surfaceClass: "from-orange-500/22 via-orange-500/8 to-transparent",
    accent: "#f97316",
  },
  bilibili: {
    label: "B站",
    badgeClass: "bg-sky-500/18 text-sky-100 ring-1 ring-sky-400/25",
    surfaceClass: "from-sky-500/22 via-sky-500/8 to-transparent",
    accent: "#38bdf8",
  },
};

const SCORE_PRESENTATION = {
  low: {
    label: "观察中",
    ringColor: "#71717a",
    chipClass: "bg-zinc-500/14 text-zinc-200 ring-1 ring-zinc-400/15",
    textClass: "text-zinc-200",
  },
  medium: {
    label: "上升段",
    ringColor: "#f59e0b",
    chipClass: "bg-amber-500/14 text-amber-100 ring-1 ring-amber-400/15",
    textClass: "text-amber-100",
  },
  high: {
    label: "高潜力",
    ringColor: "#22c55e",
    chipClass: "bg-emerald-500/14 text-emerald-100 ring-1 ring-emerald-400/15",
    textClass: "text-emerald-100",
  },
  elite: {
    label: "爆款候选",
    ringColor: "#a855f7",
    chipClass: "bg-violet-500/14 text-violet-100 ring-1 ring-violet-400/15",
    textClass: "text-violet-100",
  },
} satisfies Record<string, ScorePresentation>;

export function getPlatformPresentation(platform: DiscoveryPlatform) {
  return PLATFORM_PRESENTATION[platform];
}

export function clampScore(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getScorePresentation(value?: number) {
  const score = clampScore(value);

  if (score < 30) {
    return SCORE_PRESENTATION.low;
  }

  if (score < 60) {
    return SCORE_PRESENTATION.medium;
  }

  if (score < 90) {
    return SCORE_PRESENTATION.high;
  }

  return SCORE_PRESENTATION.elite;
}

export function formatCompactNumber(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 100000000) {
    return `${trimTrailingZero((value / 100000000).toFixed(1))}亿`;
  }

  if (absoluteValue >= 10000) {
    return `${trimTrailingZero((value / 10000).toFixed(1))}万`;
  }

  return new Intl.NumberFormat("zh-CN").format(value);
}

export function formatDiscoveryDate(value?: string) {
  if (!value) {
    return "待同步";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "待同步";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
  }).format(date);
}

export function sortDiscoveryItems(items: DiscoveryPoolItem[], sortBy: DiscoverySortKey) {
  return [...items].sort((left, right) => {
    if (sortBy === "time") {
      return getTimestamp(right.discoveredAt) - getTimestamp(left.discoveredAt);
    }

    return (
      clampScore(right.viralScore) - clampScore(left.viralScore) ||
      getTimestamp(right.discoveredAt) - getTimestamp(left.discoveredAt)
    );
  });
}

function getTimestamp(value?: string) {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function trimTrailingZero(value: string) {
  return value.replace(/\.0$/, "");
}
