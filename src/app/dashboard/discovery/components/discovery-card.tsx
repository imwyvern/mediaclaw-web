"use client";

import {
  ArrowUpRight,
  Heart,
  Loader2,
  MessageCircle,
  Play,
  Share2,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type DiscoveryPoolItem } from "@/lib/api";

import {
  clampScore,
  formatCompactNumber,
  formatDiscoveryDate,
  getPlatformPresentation,
  getScorePresentation,
} from "./discovery-utils";

interface DiscoveryCardProps {
  item: DiscoveryPoolItem;
  remixLoading?: boolean;
  onAnalyze: (item: DiscoveryPoolItem) => void;
  onRemix: (item: DiscoveryPoolItem) => void;
}

const METRICS = [
  { key: "views", label: "播放", icon: Play },
  { key: "likes", label: "点赞", icon: Heart },
  { key: "comments", label: "评论", icon: MessageCircle },
  { key: "shares", label: "分享", icon: Share2 },
] as const;

export function DiscoveryCard({ item, remixLoading = false, onAnalyze, onRemix }: DiscoveryCardProps) {
  const platform = getPlatformPresentation(item.platform);
  const score = clampScore(item.viralScore);
  const scorePresentation = getScorePresentation(item.viralScore);
  const scoreRingStyle = {
    background: `conic-gradient(${scorePresentation.ringColor} ${score * 3.6}deg, rgba(148, 163, 184, 0.14) 0deg)`,
  } as const;

  return (
    <Card className="group overflow-hidden rounded-[26px] border border-white/10 bg-slate-950/72 shadow-[0_24px_64px_-36px_rgba(15,23,42,0.95)] transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_32px_80px_-42px_rgba(15,23,42,1)]">
      <CardContent className="relative flex h-full flex-col gap-4 p-4">
        <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b", platform.surfaceClass)} />

        <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
          {item.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.85))] text-slate-200">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">等待缩略图同步</p>
                  <p className="text-xs text-slate-400">推荐池已收录内容结构</p>
                </div>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <Badge className={cn("border-transparent font-medium", platform.badgeClass)}>{platform.label}</Badge>
            <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur">
              {formatDiscoveryDate(item.discoveredAt)}
            </span>
          </div>

          {item.contentUrl ? (
            <a
              href={item.contentUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute right-3 top-12 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white/85 backdrop-blur transition hover:bg-black/70 hover:text-white"
              aria-label="打开原视频"
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-3">
            <span className="inline-flex max-w-[70%] items-center rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur">
              {item.industry || "跨行业热点"}
            </span>
            <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] text-white/75 backdrop-blur">
              ID {item.videoId}
            </span>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col gap-4">
          <div className="space-y-2">
            <h3 className="line-clamp-2 text-lg font-semibold leading-7 text-white">{item.title}</h3>
            <p className="text-sm text-slate-300/80">@{item.author}</p>
          </div>

          <div className="grid grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            {METRICS.map(({ key, label, icon: Icon }) => (
              <div key={key} className="rounded-xl bg-black/15 px-2 py-2.5">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-100">
                  {formatCompactNumber(item[key])}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="space-y-2">
              <div className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Viral Score</div>
              <div className="flex items-center gap-2">
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", scorePresentation.chipClass)}>
                  {scorePresentation.label}
                </span>
                <span className="text-sm text-slate-300">{score}/100</span>
              </div>
            </div>

            <div className="relative h-16 w-16 rounded-full p-[6px]" style={scoreRingStyle}>
              <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white shadow-inner shadow-black/40">
                {score}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="outline"
              className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
              onClick={() => onAnalyze(item)}
            >
              拆解
            </Button>
            <Button className="bg-white text-slate-950 hover:bg-slate-100" onClick={() => onRemix(item)} disabled={remixLoading}>
              {remixLoading ? <Loader2 className="animate-spin" /> : null}
              复刻
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
