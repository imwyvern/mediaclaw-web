import { Flame, RefreshCw, SlidersHorizontal, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DiscoveryEmptyStateProps {
  filtered?: boolean;
  refreshing?: boolean;
  onRefresh: () => void;
  onResetFilters?: () => void;
}

export function DiscoveryEmptyState({
  filtered = false,
  refreshing = false,
  onRefresh,
  onResetFilters,
}: DiscoveryEmptyStateProps) {
  const title = filtered ? "当前筛选条件下还没有命中内容" : "系统正在为你的行业扫描爆款内容";
  const description = filtered
    ? "试试切换平台、清空行业条件，或者按时间排序看最近一批候选内容。"
    : "AI 会持续追踪行业热点，每 6 小时自动更新一轮推荐池。你也可以手动重新拉取最新结果。";

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_28%),rgba(2,6,23,0.78)] px-6 py-12 text-center shadow-[0_30px_80px_-45px_rgba(15,23,42,0.95)] sm:px-10">
      <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="absolute right-10 bottom-4 h-28 w-28 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative flex flex-col items-center gap-5">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.02]" />
          <div className="absolute inset-3 rounded-full border border-amber-400/15" />
          <div className="absolute inset-6 rounded-full border border-fuchsia-400/10" />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/12 text-amber-100 ring-1 ring-amber-400/20">
            {filtered ? <SlidersHorizontal className="h-8 w-8" /> : <Flame className="h-8 w-8" />}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              <Sparkles className="h-3.5 w-3.5" /> AI P90 甄选
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              <RefreshCw className="h-3.5 w-3.5" /> 6 小时自动更新
            </span>
          </div>
          <h3 className="text-2xl font-semibold tracking-tight text-white">{title}</h3>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-300/85">{description}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {filtered && onResetFilters ? (
            <Button variant="outline" className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]" onClick={onResetFilters}>
              清空筛选
            </Button>
          ) : null}
          <Button className="bg-amber-400 text-slate-950 hover:bg-amber-300" onClick={onRefresh}>
            <RefreshCw className={refreshing ? "animate-spin" : ""} />
            手动刷新
          </Button>
        </div>
      </div>
    </div>
  );
}
