"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Loader2, RefreshCw, Search, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { MetadataUpdater } from "@/components/metadata-updater";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  api,
  readApiErrorMessage,
  type Brand,
  type DiscoveryPoolItem,
  type DiscoveryViralAnalysis,
} from "@/lib/api";

import { DiscoveryAnalysisSheet } from "./discovery-analysis-sheet";
import { DiscoveryCard } from "./discovery-card";
import { DiscoveryEmptyState } from "./discovery-empty-state";
import { DiscoveryPageSkeleton } from "./discovery-page-skeleton";
import { type DiscoveryPlatformFilter, type DiscoverySortKey, sortDiscoveryItems } from "./discovery-utils";

const PLATFORM_OPTIONS: Array<{ value: DiscoveryPlatformFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "douyin", label: "抖音" },
  { value: "xhs", label: "小红书" },
  { value: "kuaishou", label: "快手" },
  { value: "bilibili", label: "B站" },
];

const SORT_OPTIONS: Array<{ value: DiscoverySortKey; label: string }> = [
  { value: "viralScore", label: "按 Viral Score" },
  { value: "time", label: "按时间" },
];

export function DiscoveryPageClient() {
  const router = useRouter();
  const [pool, setPool] = useState<DiscoveryPoolItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsReady, setBrandsReady] = useState(false);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<DiscoveryPlatformFilter>("all");
  const [sortBy, setSortBy] = useState<DiscoverySortKey>("viralScore");
  const [industryDraft, setIndustryDraft] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DiscoveryPoolItem | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisCache, setAnalysisCache] = useState<Record<string, DiscoveryViralAnalysis>>({});
  const [remixingContentId, setRemixingContentId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchBrands = async () => {
      try {
        const response = await api.brand.list();
        if (!active) {
          return;
        }

        setBrands(normalizeBrands(response.data));
        setBrandsError(null);
      } catch (error) {
        if (!active) {
          return;
        }

        setBrands([]);
        setBrandsError(readApiErrorMessage(error, "品牌列表同步失败，请稍后重试。"));
      } finally {
        if (active) {
          setBrandsReady(true);
        }
      }
    };

    void fetchBrands();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchPool = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const items = await getDiscoveryPool(industryFilter);
        if (!active) {
          return;
        }

        setPool(items);
      } catch (error) {
        if (!active) {
          return;
        }

        setPool([]);
        setErrorMessage(readErrorMessage(error, "推荐池加载失败，请稍后重试。"));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchPool();

    return () => {
      active = false;
    };
  }, [industryFilter]);

  const visibleItems = sortDiscoveryItems(
    pool.filter((item) => platformFilter === "all" || item.platform === platformFilter),
    sortBy,
  );
  const hasFilterState = Boolean(industryFilter) || platformFilter !== "all" || sortBy !== "viralScore";
  const selectedAnalysis = selectedItem ? analysisCache[selectedItem.contentId] ?? null : null;

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      const items = await getDiscoveryPool(industryFilter);
      setPool(items);
      setErrorMessage(null);
      toast.success("推荐池已刷新");
    } catch (error) {
      const message = readErrorMessage(error, "推荐池加载失败，请稍后重试。");
      if (pool.length === 0) {
        setErrorMessage(message);
      }
      toast.error("刷新失败", { description: message });
    } finally {
      setRefreshing(false);
    }
  };

  const handleIndustrySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextIndustry = industryDraft.trim();

    if (nextIndustry === industryFilter) {
      await handleRefresh();
      return;
    }

    setIndustryFilter(nextIndustry);
  };

  const handleResetFilters = () => {
    setPlatformFilter("all");
    setSortBy("viralScore");
    setIndustryDraft("");
    setIndustryFilter("");
  };

  const openAnalysis = async (item: DiscoveryPoolItem) => {
    setSelectedItem(item);
    setAnalysisOpen(true);
    setAnalysisError(null);

    if (analysisCache[item.contentId]) {
      return;
    }

    setAnalysisLoading(true);

    try {
      const response = await api.discovery.analyzeViral(item.contentId);
      setAnalysisCache((current) => ({
        ...current,
        [item.contentId]: response.data,
      }));
    } catch (error) {
      setAnalysisError(readErrorMessage(error, "AI 拆解暂时不可用，请稍后重试。"));
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleRetryAnalysis = async () => {
    if (!selectedItem) {
      return;
    }

    await openAnalysis(selectedItem);
  };

  const handleRemix = async (item: DiscoveryPoolItem) => {
    if (!brandsReady) {
      toast.info("品牌空间还在同步，请稍后再试。");
      return;
    }

    if (brandsError && brands.length === 0) {
      toast.error(brandsError);
      return;
    }

    if (brands.length === 0) {
      toast.error("请先创建品牌空间，再发起复刻。");
      router.push("/dashboard/brands");
      return;
    }

    setRemixingContentId(item.contentId);

    try {
      if (brands.length === 1) {
        const brand = brands[0];
        const response = await api.discovery.remix(item.contentId, brand.id);
        window.sessionStorage.setItem("mediaclaw.discovery.remixBrief", JSON.stringify(response.data));
        toast.success("已生成复刻简报，正在跳转创作页");
        router.push(`/dashboard/videos/create?source=discovery&contentId=${item.contentId}&brandId=${brand.id}`);
        return;
      }

      toast.info("已带入爆款来源，请先选择品牌后继续复刻。");
      router.push(`/dashboard/videos/create?source=discovery&contentId=${item.contentId}`);
    } catch (error) {
      toast.error("复刻简报生成失败", {
        description: readErrorMessage(error, "请稍后重试。"),
      });
    } finally {
      setRemixingContentId(null);
    }
  };

  if (loading) {
    return <DiscoveryPageSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <MetadataUpdater title="爆款发现" description="AI 自动追踪行业爆款，一键拆解并进入复刻流程。" />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-100">
            <Flame className="h-3.5 w-3.5" />
            爆款推荐池
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">爆款发现</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
              AI 自动追踪行业爆款，一键复刻。推荐池默认保留高潜力 P90 候选内容，适合直接进入脚本拆解与复刻生产。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            刷新推荐池
          </Button>
        </div>
      </div>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_28%),radial-gradient(circle_at_right,rgba(168,85,247,0.08),transparent_26%),rgba(2,6,23,0.78)] p-4 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.95)] sm:p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">Filter Stack</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={platformFilter === option.value ? "default" : "outline"}
                  className={
                    platformFilter === option.value
                      ? "bg-white text-slate-950 hover:bg-slate-100"
                      : "border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
                  }
                  onClick={() => setPlatformFilter(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid w-full gap-3 lg:max-w-[520px] lg:grid-cols-[minmax(0,1fr)_180px_auto]">
            <form onSubmit={handleIndustrySubmit} className="relative flex items-center gap-2 lg:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={industryDraft}
                onChange={(event) => setIndustryDraft(event.target.value)}
                placeholder="输入行业关键词，如 美妆 / 餐饮 / 3C"
                className="h-10 border-white/10 bg-black/20 pl-9 text-slate-100 placeholder:text-slate-500"
              />
              <Button type="submit" className="hidden lg:inline-flex bg-amber-400 text-slate-950 hover:bg-amber-300">
                应用
              </Button>
            </form>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as DiscoverySortKey)}>
              <SelectTrigger className="h-10 w-full border-white/10 bg-black/20 text-slate-100">
                <SelectValue placeholder="选择排序" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="h-10 border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
              onClick={handleResetFilters}
              disabled={!hasFilterState}
            >
              重置
            </Button>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-300/75">
          当前共 <span className="font-semibold text-white">{visibleItems.length}</span> 条可复刻内容
          {industryFilter ? <span className="ml-2 text-slate-500">行业：{industryFilter}</span> : null}
        </div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Dark Feed / Discovery Board</div>
      </div>

      {errorMessage && pool.length === 0 ? (
        <div className="rounded-[28px] border border-red-500/20 bg-red-500/5 p-8 shadow-[0_24px_64px_-42px_rgba(127,29,29,0.7)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-red-500/12 p-2 text-red-100 ring-1 ring-red-500/20">
                <TriangleAlert className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-white">推荐池暂时不可用</h2>
                <p className="max-w-xl text-sm leading-7 text-slate-300/80">{errorMessage}</p>
              </div>
            </div>
            <Button className="bg-white text-slate-950 hover:bg-slate-100" onClick={handleRefresh}>
              重新加载
            </Button>
          </div>
        </div>
      ) : visibleItems.length === 0 ? (
        <DiscoveryEmptyState
          filtered={pool.length > 0}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onResetFilters={pool.length > 0 ? handleResetFilters : undefined}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => (
            <DiscoveryCard
              key={item.contentId}
              item={item}
              remixLoading={remixingContentId === item.contentId}
              onAnalyze={openAnalysis}
              onRemix={handleRemix}
            />
          ))}
        </div>
      )}

      <DiscoveryAnalysisSheet
        open={analysisOpen}
        item={selectedItem}
        analysis={selectedAnalysis}
        loading={analysisLoading}
        errorMessage={analysisError}
        onOpenChange={setAnalysisOpen}
        onRetry={handleRetryAnalysis}
      />
    </div>
  );
}

async function getDiscoveryPool(industry?: string) {
  const response = await api.discovery.getPool({
    limit: 24,
    industry: industry || undefined,
  });

  return Array.isArray(response.data.items) ? response.data.items : [];
}

function normalizeBrands(data: Brand[] | Brand | null | undefined) {
  if (!data) {
    return [];
  }

  return Array.isArray(data) ? data : [data];
}

function readErrorMessage(error: unknown, fallback: string) {
  return readApiErrorMessage(error, fallback);
}
