"use client";

import { type LucideIcon, Flame, Megaphone, PlayCircle, Rows3, Shapes, TriangleAlert, Volume2, WandSparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { type DiscoveryPoolItem, type DiscoveryViralAnalysis } from "@/lib/api";

import { formatDiscoveryDate, getPlatformPresentation, getScorePresentation } from "./discovery-utils";

interface DiscoveryAnalysisSheetProps {
  open: boolean;
  item: DiscoveryPoolItem | null;
  analysis: DiscoveryViralAnalysis | null;
  loading: boolean;
  errorMessage: string | null;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
}

interface AnalysisSectionProps {
  title: string;
  icon: LucideIcon;
  items?: string[];
  content?: string;
  danger?: boolean;
}

export function DiscoveryAnalysisSheet({
  open,
  item,
  analysis,
  loading,
  errorMessage,
  onOpenChange,
  onRetry,
}: DiscoveryAnalysisSheetProps) {
  const platform = item ? getPlatformPresentation(item.platform) : null;
  const scorePresentation = item ? getScorePresentation(item.viralScore) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-l border-white/10 bg-slate-950/95 p-0 text-slate-100 backdrop-blur sm:max-w-2xl"
      >
        <div className="relative">
          <div className="absolute -left-10 top-8 h-32 w-32 rounded-full bg-amber-400/12 blur-3xl" />
          <div className="absolute right-4 top-10 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <SheetHeader className="relative gap-4 border-b border-white/10 bg-white/[0.03] px-6 py-6">
            <div className="flex flex-wrap items-center gap-2">
              {platform ? <Badge className={cn("border-transparent font-medium", platform.badgeClass)}>{platform.label}</Badge> : null}
              {item && scorePresentation ? (
                <Badge className={cn("border-transparent font-medium", scorePresentation.chipClass)}>
                  Viral {Math.round(item.viralScore)}
                </Badge>
              ) : null}
              {item ? (
                <span className="text-xs text-slate-400">抓取于 {formatDiscoveryDate(item.discoveredAt)}</span>
              ) : null}
            </div>
            <div className="space-y-2">
              <SheetTitle className="pr-12 text-xl font-semibold leading-8 text-white">
                {item?.title || "爆款拆解"}
              </SheetTitle>
              <SheetDescription className="max-w-xl text-sm leading-6 text-slate-400">
                {analysis?.summary || "AI 将根据当前爆款内容的结构、视觉和互动特征，生成可复用的拆解报告。"}
              </SheetDescription>
            </div>
          </SheetHeader>
        </div>

        <div className="space-y-5 px-6 py-6">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <Skeleton className="mb-3 h-4 w-32 bg-white/10" />
                  <Skeleton className="mb-2 h-4 w-full bg-white/10" />
                  <Skeleton className="mb-2 h-4 w-[88%] bg-white/10" />
                  <Skeleton className="h-4 w-[72%] bg-white/10" />
                </div>
              ))}
            </div>
          ) : errorMessage ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-red-500/12 p-2 text-red-200">
                  <TriangleAlert className="h-4 w-4" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-white">拆解报告生成失败</p>
                  <p className="text-sm leading-6 text-slate-300/80">{errorMessage}</p>
                  <Button
                    variant="outline"
                    className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
                    onClick={onRetry}
                  >
                    重新生成
                  </Button>
                </div>
              </div>
            </div>
          ) : analysis ? (
            <>
              <AnalysisSection title="Summary 摘要" icon={WandSparkles} content={analysis.summary} />
              <AnalysisSection title="Hooks 前 3 秒钩子" icon={PlayCircle} items={analysis.hooks} />
              <AnalysisSection title="Narrative Beats 叙事节拍" icon={Rows3} items={analysis.narrativeBeats} />
              <AnalysisSection title="Visual Motifs 视觉元素" icon={Shapes} items={analysis.visualMotifs} />
              <AnalysisSection title="Audio Cues 音频线索" icon={Volume2} items={analysis.audioCues} />
              <AnalysisSection title="CTA Style" icon={Megaphone} content={analysis.ctaStyle} />
              <AnalysisSection title="Risks 风险提示" icon={TriangleAlert} items={analysis.risks} danger />
            </>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-slate-300/80">
              选择一条爆款内容后，即可在这里查看结构拆解、开场钩子和风险提示。
            </div>
          )}

          {analysis?.source ? (
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-slate-400">
              <Flame className="h-3.5 w-3.5 text-amber-300" />
              数据来源：{analysis.source} {analysis.model ? `· ${analysis.model}` : ""}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AnalysisSection({ title, icon: Icon, items, content, danger = false }: AnalysisSectionProps) {
  const hasItems = Array.isArray(items) && items.length > 0;
  const hasContent = Boolean(content);

  return (
    <section
      className={cn(
        "rounded-2xl border bg-white/[0.03] p-5",
        danger ? "border-red-500/20" : "border-white/10",
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full ring-1",
            danger
              ? "bg-red-500/12 text-red-200 ring-red-500/20"
              : "bg-white/[0.04] text-slate-100 ring-white/10",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-medium text-white">{title}</h3>
          <p className="text-xs text-slate-500">可直接用于脚本拆解与二创策略</p>
        </div>
      </div>

      {hasContent ? <p className="text-sm leading-7 text-slate-200/90">{content}</p> : null}

      {hasItems ? (
        <div className="space-y-2">
          {items.map((entry, index) => (
            <div
              key={`${title}-${index}`}
              className={cn(
                "flex gap-3 rounded-xl border px-3 py-3 text-sm leading-6",
                danger
                  ? "border-red-500/10 bg-red-500/[0.04] text-slate-100"
                  : "border-white/8 bg-black/10 text-slate-200/90",
              )}
            >
              <span className="mt-0.5 text-xs text-slate-500">{String(index + 1).padStart(2, "0")}</span>
              <span>{entry}</span>
            </div>
          ))}
        </div>
      ) : null}

      {!hasItems && !hasContent ? (
        <p className="text-sm text-slate-500">当前模型没有返回这一部分内容。</p>
      ) : null}
    </section>
  );
}
