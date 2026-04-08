"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Cpu,
  Film,
  Image as ImageIcon,
  LayoutGrid,
  Loader2,
  RefreshCw,
  Save,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { MetadataUpdater } from "@/components/metadata-updater";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  api,
  readApiErrorMessage,
  type Brand,
  type ContentItem,
  type ModelCapability,
  type OrgModelSettings,
  type PipelineModelOverridesRecord,
  type PipelineRecord,
} from "@/lib/api";

type PipelineOverrideCapability = keyof PipelineModelOverridesRecord;

type PipelineOverrideDraft = Record<PipelineOverrideCapability, string>;

interface BrandSettingsForm {
  name: string;
  industry: string;
  slogans: string;
  keywords: string;
  prohibitedWords: string;
  preferredDuration: string;
  aspectRatio: string;
}

interface BrandAssetsForm {
  logoUrl: string;
  referenceImages: string;
}

const ORG_DEFAULT_MODEL = "__org_default__";

const PIPELINE_OVERRIDE_META: Array<{
  key: PipelineOverrideCapability;
  label: string;
  description: string;
}> = [
  { key: "copy", label: "文案模型覆盖", description: "只影响该管线的视频文案与标题生成。" },
  { key: "frameEdit", label: "帧编辑模型覆盖", description: "只影响品牌换皮与参考帧改写阶段。" },
  { key: "videoGen", label: "视频生成模型覆盖", description: "只影响图生视频与片段生成阶段。" },
];

function splitMultiline(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinMultiline(value?: string[]) {
  return (value || []).join("\n");
}

function formatDateTime(value?: string) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatVideoStatus(video: ContentItem) {
  if (video.lifecycleStatus) {
    return video.lifecycleStatus;
  }

  return video.status || "unknown";
}

function getBrandInitials(name?: string) {
  const words = (name || "")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return "MC";
  }

  return words
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() || "")
    .join("");
}

function buildSettingsForm(brand: Brand): BrandSettingsForm {
  return {
    name: brand.name || "",
    industry: brand.industry || brand.category || "",
    slogans: joinMultiline(brand.slogans),
    keywords: joinMultiline(brand.keywords),
    prohibitedWords: joinMultiline(brand.prohibitedWords),
    preferredDuration: brand.preferredDuration ? String(brand.preferredDuration) : "",
    aspectRatio: brand.aspectRatio || "",
  };
}

function buildAssetsForm(brand: Brand): BrandAssetsForm {
  return {
    logoUrl: brand.logoUrl || "",
    referenceImages: joinMultiline(brand.referenceImages),
  };
}

function buildOverrideDrafts(pipelines: PipelineRecord[]) {
  return pipelines.reduce<Record<string, PipelineOverrideDraft>>((acc, pipeline) => {
    acc[pipeline.id] = {
      copy: pipeline.modelOverrides.copy || ORG_DEFAULT_MODEL,
      frameEdit: pipeline.modelOverrides.frameEdit || ORG_DEFAULT_MODEL,
      videoGen: pipeline.modelOverrides.videoGen || ORG_DEFAULT_MODEL,
    };
    return acc;
  }, {});
}

function findModelOption(
  settings: OrgModelSettings | null,
  capability: ModelCapability,
  modelId: string,
) {
  return settings?.availableModels[capability]?.find((item) => item.id === modelId) || null;
}

function BrandDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-white/10 bg-black/20">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/10 bg-black/20">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function BrandDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string | string[] }>();
  const brandId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sectionWarnings, setSectionWarnings] = useState<string[]>([]);

  const [brand, setBrand] = useState<Brand | null>(null);
  const [videos, setVideos] = useState<ContentItem[]>([]);
  const [videoTotal, setVideoTotal] = useState(0);
  const [pipelines, setPipelines] = useState<PipelineRecord[]>([]);
  const [modelSettings, setModelSettings] = useState<OrgModelSettings | null>(null);

  const [brandForm, setBrandForm] = useState<BrandSettingsForm>({
    name: "",
    industry: "",
    slogans: "",
    keywords: "",
    prohibitedWords: "",
    preferredDuration: "",
    aspectRatio: "",
  });
  const [assetsForm, setAssetsForm] = useState<BrandAssetsForm>({
    logoUrl: "",
    referenceImages: "",
  });
  const [overrideDrafts, setOverrideDrafts] = useState<Record<string, PipelineOverrideDraft>>({});

  const [savingBrand, setSavingBrand] = useState(false);
  const [savingAssets, setSavingAssets] = useState(false);
  const [savingPipelineId, setSavingPipelineId] = useState<string | null>(null);

  const applyBrandState = (nextBrand: Brand) => {
    setBrand(nextBrand);
    setBrandForm(buildSettingsForm(nextBrand));
    setAssetsForm(buildAssetsForm(nextBrand));
  };

  const loadWorkspace = async (options?: { silent?: boolean }) => {
    if (!brandId) {
      setError("缺少品牌 ID");
      setLoading(false);
      return;
    }

    if (options?.silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);
    setSectionWarnings([]);

    const warnings: string[] = [];

    try {
      const [brandResult, videoResult, pipelineResult, modelSettingsResult] = await Promise.allSettled([
        api.brand.get(brandId),
        api.videos.list({ brandId, page: 1, limit: 12 }),
        api.pipelines.list(),
        api.org.modelPreferences.get(),
      ]);

      if (brandResult.status !== "fulfilled") {
        throw brandResult.reason;
      }

      const nextBrand = brandResult.value.data as Brand;
      applyBrandState(nextBrand);

      if (videoResult.status === "fulfilled") {
        setVideos(videoResult.value.data.items);
        setVideoTotal(videoResult.value.data.total);
      } else {
        setVideos([]);
        setVideoTotal(0);
        warnings.push(readApiErrorMessage(videoResult.reason, "视频列表加载失败，已跳过该区块。"));
      }

      if (pipelineResult.status === "fulfilled") {
        const matchedPipelines = pipelineResult.value.data.filter((item) => item.brandId === brandId);
        setPipelines(matchedPipelines);
        setOverrideDrafts(buildOverrideDrafts(matchedPipelines));
      } else {
        setPipelines([]);
        setOverrideDrafts({});
        warnings.push(readApiErrorMessage(pipelineResult.reason, "品牌管线加载失败，模型覆盖暂不可编辑。"));
      }

      if (modelSettingsResult.status === "fulfilled") {
        setModelSettings(modelSettingsResult.value.data);
      } else {
        setModelSettings(null);
        warnings.push(readApiErrorMessage(modelSettingsResult.reason, "企业模型配置加载失败，已隐藏模型可选项。"));
      }

      setSectionWarnings(warnings);
    } catch (loadError) {
      setBrand(null);
      setVideos([]);
      setVideoTotal(0);
      setPipelines([]);
      setModelSettings(null);
      setOverrideDrafts({});
      setError(readApiErrorMessage(loadError, "品牌详情加载失败，请稍后重试。"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!brandId) {
      return;
    }

    void loadWorkspace();
  }, [brandId]);

  const totalVideos = brand?.videos || videoTotal;
  const completedVideos = useMemo(
    () => videos.filter((item) => item.status === "Completed" || item.lifecycleStatus === "completed").length,
    [videos],
  );
  const pipelineOverrideCount = useMemo(
    () =>
      pipelines.filter((item) =>
        Boolean(item.modelOverrides.copy || item.modelOverrides.frameEdit || item.modelOverrides.videoGen),
      ).length,
    [pipelines],
  );
  const completionRate = totalVideos > 0 ? Math.min(100, Math.round((completedVideos / totalVideos) * 100)) : 0;

  const handleSaveBrand = async () => {
    if (!brand) {
      return;
    }

    const name = brandForm.name.trim();
    if (!name) {
      toast.error("请输入品牌名称");
      return;
    }

    setSavingBrand(true);

    try {
      const parsedDuration = Number.parseInt(brandForm.preferredDuration, 10);
      const response = await api.brand.update(brand.id, {
        name,
        industry: brandForm.industry.trim(),
        assets: {
          logoUrl: brand.logoUrl || "",
          referenceImages: brand.referenceImages || [],
          slogans: splitMultiline(brandForm.slogans),
          keywords: splitMultiline(brandForm.keywords),
          prohibitedWords: splitMultiline(brandForm.prohibitedWords),
          colors: brand.colors || [],
          fonts: brand.fonts || [],
        },
        videoStyle: {
          preferredDuration: Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : undefined,
          aspectRatio: brandForm.aspectRatio.trim() || undefined,
          subtitleStyle: brand.subtitleStyle || {},
        },
      });

      applyBrandState(response.data);
      toast.success("品牌设置已保存");
    } catch (saveError) {
      toast.error(readApiErrorMessage(saveError, "品牌设置保存失败"));
    } finally {
      setSavingBrand(false);
    }
  };

  const handleSaveAssets = async () => {
    if (!brand) {
      return;
    }

    setSavingAssets(true);

    try {
      const response = await api.brand.update(brand.id, {
        assets: {
          logoUrl: assetsForm.logoUrl.trim(),
          referenceImages: splitMultiline(assetsForm.referenceImages),
          slogans: brand.slogans || [],
          keywords: brand.keywords || [],
          prohibitedWords: brand.prohibitedWords || [],
          colors: brand.colors || [],
          fonts: brand.fonts || [],
        },
      });

      applyBrandState(response.data);
      toast.success("品牌资产配置已保存");
    } catch (saveError) {
      toast.error(readApiErrorMessage(saveError, "品牌资产保存失败"));
    } finally {
      setSavingAssets(false);
    }
  };

  const handleSavePipelineOverride = async (pipelineId: string) => {
    const draft = overrideDrafts[pipelineId];
    if (!draft) {
      return;
    }

    setSavingPipelineId(pipelineId);

    try {
      const response = await api.pipelines.updateModelOverrides(pipelineId, {
        copy: draft.copy === ORG_DEFAULT_MODEL ? "" : draft.copy,
        frameEdit: draft.frameEdit === ORG_DEFAULT_MODEL ? "" : draft.frameEdit,
        videoGen: draft.videoGen === ORG_DEFAULT_MODEL ? "" : draft.videoGen,
      });

      setPipelines((current) =>
        current.map((item) => (item.id === pipelineId ? response.data : item)),
      );
      setOverrideDrafts((current) => ({
        ...current,
        [pipelineId]: {
          copy: response.data.modelOverrides.copy || ORG_DEFAULT_MODEL,
          frameEdit: response.data.modelOverrides.frameEdit || ORG_DEFAULT_MODEL,
          videoGen: response.data.modelOverrides.videoGen || ORG_DEFAULT_MODEL,
        },
      }));
      toast.success("管线模型覆盖已更新");
    } catch (saveError) {
      toast.error(readApiErrorMessage(saveError, "管线模型覆盖保存失败"));
    } finally {
      setSavingPipelineId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 pb-8">
        <MetadataUpdater title="品牌详情" />
        <BrandDetailSkeleton />
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="flex flex-col gap-8 pb-8">
        <MetadataUpdater title="品牌详情" />
        <ErrorState
          title="品牌详情加载失败"
          description={error || "未找到品牌工作区"}
          onRetry={() => void loadWorkspace()}
          className="border-white/10 bg-black/20"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in duration-500">
      <MetadataUpdater title={`${brand.name} · 品牌详情`} />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
            onClick={() => router.push("/dashboard/brands")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-lg font-semibold uppercase text-slate-100">
            {brand.logoUrl ? (
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${brand.logoUrl})` }}
                aria-label={`${brand.name} logo`}
                role="img"
              />
            ) : (
              getBrandInitials(brand.name)
            )}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-white">{brand.name}</h1>
              <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                {brand.industry || brand.category || "未分类"}
              </Badge>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-300/80">
              这里直接读取真实品牌、视频和管线数据，同时在品牌工作区内完成模型覆盖配置，不再使用任何演示数据。
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>创建时间：{formatDateTime(brand.createdAt)}</span>
              <span>更新时间：{formatDateTime(brand.updatedAt)}</span>
              <span>品牌 ID：{brand.id}</span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
          onClick={() => void loadWorkspace({ silent: true })}
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          刷新工作区
        </Button>
      </div>

      {sectionWarnings.length > 0 ? (
        <Card className="border-amber-500/20 bg-amber-500/10">
          <CardContent className="flex flex-col gap-2 p-4 text-sm text-amber-100">
            <div className="flex items-center gap-2 font-medium">
              <CircleAlert className="h-4 w-4" />
              以下区块未完全加载
            </div>
            {sectionWarnings.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-2 border border-white/10 bg-black/20 p-2">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            概览
          </TabsTrigger>
          <TabsTrigger value="assets" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            品牌资产
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <Film className="h-4 w-4" />
            最新视频
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            设置与模型覆盖
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-white/10 bg-black/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-200">品牌视频规模</CardTitle>
                <CardDescription>品牌工作区累计视频数量</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-white">{totalVideos}</div>
                <p className="mt-2 text-xs text-slate-400">当前页面展示最近 {videos.length} 条真实记录</p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-200">激活管线</CardTitle>
                <CardDescription>品牌绑定的可用生产管线</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-white">{pipelines.length}</div>
                <p className="mt-2 text-xs text-slate-400">其中 {pipelineOverrideCount} 条已设置专属模型覆盖</p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-200">完成进度</CardTitle>
                <CardDescription>按已加载视频估算完成率</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-semibold text-white">{completionRate}%</div>
                <Progress value={completionRate} className="h-2 bg-white/10" />
                <p className="text-xs text-slate-400">已完成 {completedVideos} / {Math.max(videos.length, completedVideos || 0)} 条</p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-200">品牌风格设定</CardTitle>
                <CardDescription>当前生效的生产参数</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                <div>时长：{brand.preferredDuration ? `${brand.preferredDuration}s` : "--"}</div>
                <div>画幅：{brand.aspectRatio || "--"}</div>
                <div>关键词：{brand.keywords?.length || 0} 个</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
            <Card className="border-white/10 bg-black/20">
              <CardHeader>
                <CardTitle>最近视频</CardTitle>
                <CardDescription>按品牌过滤的真实视频任务。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {videos.length === 0 ? (
                  <EmptyState
                    icon={Film}
                    title="这个品牌还没有视频任务"
                    description="在内容生产或批量任务创建后，这里会自动出现真实记录。"
                    className="border-white/10 bg-transparent"
                  />
                ) : (
                  videos.slice(0, 6).map((video) => (
                    <div
                      key={video.id}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-white">{video.title}</div>
                        <div className="text-xs text-slate-400">
                          创建于 {formatDateTime(video.createdAt || video.date)} · 消耗 {video.credits} credits
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-white/10 text-slate-200">
                          {formatVideoStatus(video)}
                        </Badge>
                        {video.outputVideoUrl ? (
                          <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                            已出片
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/20">
              <CardHeader>
                <CardTitle>管线快照</CardTitle>
                <CardDescription>当前品牌下的模板管线与生产偏好。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pipelines.length === 0 ? (
                  <EmptyState
                    icon={LayoutGrid}
                    title="尚未绑定管线"
                    description="创建管线后，这里会显示模板类型、分发策略和模型覆盖。"
                    className="border-white/10 bg-transparent"
                  />
                ) : (
                  pipelines.map((pipeline) => (
                    <div
                      key={pipeline.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium text-white">{pipeline.name}</div>
                          <div className="mt-1 text-xs text-slate-400">
                            {pipeline.type} · {pipeline.schedule.enabled ? `计划任务 ${pipeline.schedule.cron}` : "手动触发"}
                          </div>
                        </div>
                        <Badge variant="outline" className="border-white/10 text-slate-200">
                          {pipeline.status}
                        </Badge>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-slate-400">
                        <div>画幅：{pipeline.preferences.aspectRatio}</div>
                        <div>建议时长：{pipeline.preferences.preferredDuration}s</div>
                        <div>已生产：{pipeline.totalVideosProduced} 条</div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
            <Card className="border-white/10 bg-black/20">
              <CardHeader>
                <CardTitle>当前品牌资产</CardTitle>
                <CardDescription>真实读取品牌 Logo、参考图和策略词库。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="mb-3 text-sm font-medium text-white">Logo</div>
                  {brand.logoUrl ? (
                    <div
                      className="h-40 rounded-2xl border border-white/10 bg-cover bg-center"
                      style={{ backgroundImage: `url(${brand.logoUrl})` }}
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-400">
                      暂无 Logo 资源
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium text-white">参考图</div>
                  {brand.referenceImages && brand.referenceImages.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {brand.referenceImages.map((item) => (
                        <div key={item} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                          <div
                            className="aspect-[4/5] bg-cover bg-center"
                            style={{ backgroundImage: `url(${item})` }}
                          />
                          <div className="truncate border-t border-white/10 px-3 py-2 text-xs text-slate-400">{item}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-400">
                      暂未登记参考图 URL。
                    </div>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="text-xs text-slate-400">品牌口号</div>
                    <div className="mt-2 text-lg font-semibold text-white">{brand.slogans?.length || 0}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="text-xs text-slate-400">正向关键词</div>
                    <div className="mt-2 text-lg font-semibold text-white">{brand.keywords?.length || 0}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="text-xs text-slate-400">禁用词</div>
                    <div className="mt-2 text-lg font-semibold text-white">{brand.prohibitedWords?.length || 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/20">
              <CardHeader>
                <CardTitle>更新品牌资产</CardTitle>
                <CardDescription>保存后会写入真实品牌资产库，供管线与帧编辑阶段直接读取。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="logoUrl">Logo 资源 URL</Label>
                  <Input
                    id="logoUrl"
                    value={assetsForm.logoUrl}
                    onChange={(event) => setAssetsForm((current) => ({ ...current, logoUrl: event.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="referenceImages">参考图 URL（每行一条）</Label>
                  <Textarea
                    id="referenceImages"
                    rows={10}
                    value={assetsForm.referenceImages}
                    onChange={(event) => setAssetsForm((current) => ({ ...current, referenceImages: event.target.value }))}
                    placeholder={"https://example.com/ref-1.jpg\nhttps://example.com/ref-2.jpg"}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t border-white/10 px-6 py-4">
                <Button onClick={() => void handleSaveAssets()} disabled={savingAssets}>
                  {savingAssets ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  保存资产
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <Card className="border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle>品牌视频列表</CardTitle>
              <CardDescription>只展示当前品牌的真实生产任务，便于快速复盘。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {videos.length === 0 ? (
                <EmptyState
                  icon={Film}
                  title="还没有品牌视频"
                  description="当该品牌开始跑批量生产或单条任务后，这里会显示真实的任务记录。"
                  className="border-white/10 bg-transparent"
                />
              ) : (
                videos.map((video) => (
                  <div
                    key={video.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-white">{video.title}</h3>
                          <Badge variant="outline" className="border-white/10 text-slate-200">
                            {formatVideoStatus(video)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span>创建时间：{formatDateTime(video.createdAt || video.date)}</span>
                          <span>Credits：{video.credits}</span>
                          {video.taskType ? <span>类型：{video.taskType}</span> : null}
                        </div>
                        {video.outputVideoUrl ? (
                          <a
                            href={video.outputVideoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex text-xs text-emerald-300 underline-offset-4 hover:underline"
                          >
                            查看产出视频
                          </a>
                        ) : null}
                      </div>
                      <div className="text-xs text-slate-400">
                        {video.publishStatus ? `发布状态：${video.publishStatus}` : "尚未回传发布状态"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
            <Card className="border-white/10 bg-black/20">
              <CardHeader>
                <CardTitle>品牌生产设置</CardTitle>
                <CardDescription>这里的设置会直接影响内容生产、品牌换皮和文案生成。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="brandName">品牌名称</Label>
                    <Input
                      id="brandName"
                      value={brandForm.name}
                      onChange={(event) => setBrandForm((current) => ({ ...current, name: event.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="industry">行业分类</Label>
                    <Input
                      id="industry"
                      value={brandForm.industry}
                      onChange={(event) => setBrandForm((current) => ({ ...current, industry: event.target.value }))}
                      placeholder="食品饮料 / 美妆护肤 / 家居日用"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="preferredDuration">建议时长（秒）</Label>
                    <Input
                      id="preferredDuration"
                      value={brandForm.preferredDuration}
                      onChange={(event) => setBrandForm((current) => ({ ...current, preferredDuration: event.target.value }))}
                      placeholder="15"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="aspectRatio">建议画幅</Label>
                    <Input
                      id="aspectRatio"
                      value={brandForm.aspectRatio}
                      onChange={(event) => setBrandForm((current) => ({ ...current, aspectRatio: event.target.value }))}
                      placeholder="9:16"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="slogans">品牌口号（每行一条）</Label>
                  <Textarea
                    id="slogans"
                    rows={4}
                    value={brandForm.slogans}
                    onChange={(event) => setBrandForm((current) => ({ ...current, slogans: event.target.value }))}
                    placeholder={"更懂年轻人的精酿啤酒\n一口上头，分享快乐"}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="keywords">正向关键词（每行一条）</Label>
                  <Textarea
                    id="keywords"
                    rows={4}
                    value={brandForm.keywords}
                    onChange={(event) => setBrandForm((current) => ({ ...current, keywords: event.target.value }))}
                    placeholder={"自然发酵\n冰镇爽感\n麦芽香气"}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="prohibitedWords">禁用词（每行一条）</Label>
                  <Textarea
                    id="prohibitedWords"
                    rows={4}
                    value={brandForm.prohibitedWords}
                    onChange={(event) => setBrandForm((current) => ({ ...current, prohibitedWords: event.target.value }))}
                    placeholder={"包治百病\n绝对安全"}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t border-white/10 px-6 py-4">
                <Button onClick={() => void handleSaveBrand()} disabled={savingBrand}>
                  {savingBrand ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  保存品牌设置
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-white/10 bg-black/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-emerald-300" />
                  <CardTitle>管线模型覆盖</CardTitle>
                </div>
                <CardDescription>企业级默认模型在设置页维护，这里只做品牌管线级别的精准覆盖。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {modelSettings ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-slate-300">
                    <div className="font-medium text-white">企业默认模型</div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>文案：{findModelOption(modelSettings, "copy", modelSettings.preferences.copy)?.label || modelSettings.preferences.copy}</div>
                      <div>帧编辑：{findModelOption(modelSettings, "frameEdit", modelSettings.preferences.frameEdit)?.label || modelSettings.preferences.frameEdit}</div>
                      <div>视频生成：{findModelOption(modelSettings, "videoGen", modelSettings.preferences.videoGen)?.label || modelSettings.preferences.videoGen}</div>
                      <div>计费模式：{modelSettings.billingMode === "byok" ? "BYOK 无限" : "订阅配额"}</div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-400">
                    暂未获取到企业模型配置，当前无法编辑覆盖项。
                  </div>
                )}

                {pipelines.length === 0 ? (
                  <EmptyState
                    icon={LayoutGrid}
                    title="该品牌还没有管线"
                    description="先创建品牌管线，再为不同模板分别指定文案、帧编辑和视频生成模型。"
                    className="border-white/10 bg-transparent"
                  />
                ) : (
                  pipelines.map((pipeline) => {
                    const draft = overrideDrafts[pipeline.id] || {
                      copy: ORG_DEFAULT_MODEL,
                      frameEdit: ORG_DEFAULT_MODEL,
                      videoGen: ORG_DEFAULT_MODEL,
                    };

                    return (
                      <div
                        key={pipeline.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                      >
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="font-medium text-white">{pipeline.name}</div>
                            <div className="mt-1 text-xs text-slate-400">
                              模板类型：{pipeline.type} · 状态：{pipeline.status}
                            </div>
                          </div>
                          {pipeline.modelOverrides.copy || pipeline.modelOverrides.frameEdit || pipeline.modelOverrides.videoGen ? (
                            <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                              已覆盖
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-white/10 text-slate-300">
                              跟随企业默认
                            </Badge>
                          )}
                        </div>

                        <div className="mt-4 grid gap-4">
                          {PIPELINE_OVERRIDE_META.map((item) => {
                            const capabilityOptions = modelSettings?.availableModels[item.key as ModelCapability] || [];
                            const selectedModelId = draft[item.key];
                            const selectedOption = selectedModelId !== ORG_DEFAULT_MODEL
                              ? findModelOption(modelSettings, item.key as ModelCapability, selectedModelId)
                              : null;

                            return (
                              <div key={item.key} className="grid gap-2">
                                <Label>{item.label}</Label>
                                <Select
                                  value={selectedModelId}
                                  onValueChange={(value) =>
                                    setOverrideDrafts((current) => ({
                                      ...current,
                                      [pipeline.id]: {
                                        ...current[pipeline.id],
                                        [item.key]: value,
                                      },
                                    }))}
                                  disabled={!modelSettings}
                                >
                                  <SelectTrigger className="border-white/10 bg-black/20 text-slate-100">
                                    <SelectValue placeholder="选择模型" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={ORG_DEFAULT_MODEL}>跟随企业默认</SelectItem>
                                    {capabilityOptions.map((option) => (
                                      <SelectItem key={option.id} value={option.id} disabled={!option.available}>
                                        {option.label}{option.available ? "" : "（需 API Key）"}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-slate-400">
                                  {selectedModelId === ORG_DEFAULT_MODEL
                                    ? "当前跟随企业级默认模型。"
                                    : selectedOption?.description || "当前使用管线级模型覆盖。"}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                            保存后仅影响该管线，不会改动企业默认模型。
                          </div>
                          <Button
                            onClick={() => void handleSavePipelineOverride(pipeline.id)}
                            disabled={!modelSettings || savingPipelineId === pipeline.id}
                          >
                            {savingPipelineId === pipeline.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            保存覆盖
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
