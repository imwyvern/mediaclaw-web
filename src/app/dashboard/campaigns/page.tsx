"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Loader2,
  Plus,
  RefreshCw,
  Rocket,
  Target,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  api,
  readApiErrorMessage,
  type Brand,
  type CampaignRecord,
} from "@/lib/api";

const DEFAULT_FORM = {
  name: "",
  brandId: "",
  totalVideos: "6",
  startDate: "",
  endDate: "",
  platformsText: "抖音, 小红书",
  objective: "",
  description: "",
};

const STATUS_OPTIONS = [
  { value: "draft", label: "草稿" },
  { value: "scheduled", label: "已排期" },
  { value: "active", label: "进行中" },
  { value: "completed", label: "已完成" },
];

function splitCommaSeparated(value: string) {
  return value
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDateLabel(value?: string) {
  if (!value) {
    return "未设置";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getStatusBadgeClass(status: string) {
  const normalized = status.trim().toLowerCase();

  if (["active", "running", "live", "completed", "success"].includes(normalized)) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-100";
  }

  if (["scheduled", "queued", "pending", "draft"].includes(normalized)) {
    return "border-amber-500/20 bg-amber-500/10 text-amber-100";
  }

  if (["failed", "cancelled", "inactive"].includes(normalized)) {
    return "border-rose-500/20 bg-rose-500/10 text-rose-100";
  }

  return "border-slate-500/20 bg-slate-500/10 text-slate-200";
}

function upsertCampaign(list: CampaignRecord[], next: CampaignRecord) {
  const existing = list.find((item) => item.id === next.id);

  if (!existing) {
    return [next, ...list];
  }

  return list.map((item) => {
    if (item.id !== next.id) {
      return item;
    }

    return {
      ...item,
      ...next,
      brand: next.brand || item.brand,
      platforms: next.platforms.length > 0 ? next.platforms : item.platforms,
    };
  });
}

function CampaignCardSkeleton() {
  return (
    <Card className="flex flex-col border-white/10 bg-black/20">
      <CardHeader className="space-y-4 pb-3">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-7 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="mb-3 flex justify-between gap-4 text-sm">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
      <CardFooter className="border-t border-white/10 pt-4">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function CampaignsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsError, setBrandsError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const loadCampaigns = async (options?: { silent?: boolean }) => {
    if (options?.silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);
    setBrandsError(null);

    const [campaignsResult, brandsResult] = await Promise.allSettled([
      api.campaigns.list(),
      api.brand.list(),
    ]);

    if (campaignsResult.status === "fulfilled") {
      setCampaigns(campaignsResult.value.data);
    } else {
      setCampaigns([]);
      setError(readApiErrorMessage(campaignsResult.reason, "活动列表加载失败，请稍后重试。"));
    }

    if (brandsResult.status === "fulfilled") {
      setBrands(brandsResult.value.data);
    } else {
      setBrands([]);
      setBrandsError(readApiErrorMessage(brandsResult.reason, "品牌列表加载失败，创建活动暂不可用。"));
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    void loadCampaigns();
  }, []);

  const openCampaignDetails = async (campaign: CampaignRecord) => {
    setDetailOpen(true);
    setSelectedCampaign(campaign);
    setDetailLoading(true);
    setDetailError(null);

    try {
      const response = await api.campaigns.get(campaign.id);
      setSelectedCampaign(response.data);
    } catch (loadError) {
      setDetailError(readApiErrorMessage(loadError, "活动详情加载失败，请稍后重试。"));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!form.name.trim()) {
      toast.error("请输入活动名称");
      return;
    }

    if (!form.brandId) {
      toast.error("请选择所属品牌");
      return;
    }

    setCreateSubmitting(true);
    setCreateError(null);

    try {
      const response = await api.campaigns.create({
        name: form.name.trim(),
        brandId: form.brandId,
        totalVideos: Number(form.totalVideos) || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        platforms: splitCommaSeparated(form.platformsText),
        objective: form.objective.trim() || undefined,
        description: form.description.trim() || undefined,
      });

      setCampaigns((current) => upsertCampaign(current, response.data));
      setIsCreateOpen(false);
      setForm(DEFAULT_FORM);
      toast.success("活动已创建");
      void loadCampaigns({ silent: true });
    } catch (submitError) {
      setCreateError(readApiErrorMessage(submitError, "活动创建失败，请稍后重试。"));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleUpdateStatus = async (nextStatus: string) => {
    if (!selectedCampaign) {
      return;
    }

    setStatusUpdating(nextStatus);
    setDetailError(null);

    try {
      const response = await api.campaigns.update(selectedCampaign.id, { status: nextStatus });
      setSelectedCampaign(response.data);
      setCampaigns((current) => upsertCampaign(current, response.data));
      toast.success("活动状态已更新");
    } catch (updateError) {
      setDetailError(readApiErrorMessage(updateError, "状态更新失败，请稍后重试。"));
    } finally {
      setStatusUpdating(null);
    }
  };

  const createDisabled = Boolean(brandsError) || brands.length === 0;

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in duration-500">
      <MetadataUpdater title="营销活动" />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">营销活动</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
            从真实 campaign 接口读取活动进度，支持直接创建活动、查看详情并更新状态。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
            onClick={() => {
              void loadCampaigns({ silent: true });
            }}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            刷新活动
          </Button>
          <Button
            className="bg-white text-slate-950 hover:bg-slate-100"
            onClick={() => {
              setCreateError(null);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            新建活动
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <CampaignCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="活动列表加载失败"
          description={error}
          onRetry={() => {
            void loadCampaigns();
          }}
          className="border-white/10 bg-black/20"
        />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="还没有营销活动"
          description="创建你的第一条真实活动后，这里会展示进度、平台分发和执行状态。"
          actionLabel={createDisabled ? "刷新列表" : "创建第一个活动"}
          onAction={() => {
            if (createDisabled) {
              void loadCampaigns({ silent: true });
              return;
            }
            setCreateError(null);
            setIsCreateOpen(true);
          }}
          className="border-white/10 bg-black/20"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="group flex flex-col border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(6,10,18,0.98))] shadow-[0_28px_80px_-48px_rgba(59,130,246,0.35)]"
            >
              <CardHeader className="pb-3">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-slate-100">
                    {campaign.brand || "未绑定品牌"}
                  </Badge>
                  <Badge variant="outline" className={getStatusBadgeClass(campaign.status)}>
                    {campaign.status || "unknown"}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-white">{campaign.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-slate-400">
                  {campaign.objective || campaign.description || "活动目标将在详情中展示。"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6 pb-3">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-400">生成进度</span>
                    <span className="font-medium text-white">
                      {campaign.completed} / {campaign.totalVideos} 条
                    </span>
                  </div>
                  <Progress value={campaign.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-sm">
                  <div>
                    <div className="mb-1 flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      <Calendar className="mr-1 h-3.5 w-3.5" />
                      开始时间
                    </div>
                    <div className="font-medium text-slate-100">
                      {formatDateLabel(campaign.startDate)}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      <Target className="mr-1 h-3.5 w-3.5" />
                      分发平台
                    </div>
                    <div className="truncate font-medium text-slate-100">
                      {campaign.platforms.length > 0 ? campaign.platforms.join(" / ") : "未设置"}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-white/10 pt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-sky-100 hover:bg-white/[0.05] hover:text-white"
                  onClick={() => {
                    void openCampaignDetails(campaign);
                  }}
                >
                  查看详情
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-white/10 bg-slate-950 text-slate-100 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>创建营销活动</DialogTitle>
            <DialogDescription className="text-slate-400">
              提交到真实 campaign/create 接口，创建完成后会立即刷新列表。
            </DialogDescription>
          </DialogHeader>

          {brandsError ? (
            <ErrorState
              title="品牌列表加载失败"
              description={brandsError}
              onRetry={() => {
                void loadCampaigns({ silent: true });
              }}
              className="border-white/10 bg-black/20"
            />
          ) : brands.length === 0 ? (
            <EmptyState
              icon={Target}
              title="暂无可选品牌"
              description="请先创建品牌工作区，再绑定活动到真实品牌。"
              className="border-white/10 bg-black/20 py-12"
            />
          ) : (
            <div className="space-y-5 py-2">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">活动名称</Label>
                  <Input
                    id="campaign-name"
                    className="border-white/10 bg-white/[0.03]"
                    placeholder="例如：618 大促短视频矩阵"
                    value={form.name}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, name: event.target.value }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>所属品牌</Label>
                  <Select
                    value={form.brandId}
                    onValueChange={(value) => {
                      setForm((current) => ({ ...current, brandId: value ?? "" }));
                    }}
                  >
                    <SelectTrigger className="w-full border-white/10 bg-white/[0.03]">
                      <SelectValue placeholder="选择品牌" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="campaign-total-videos">目标视频数</Label>
                  <Input
                    id="campaign-total-videos"
                    type="number"
                    min="1"
                    className="border-white/10 bg-white/[0.03]"
                    value={form.totalVideos}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, totalVideos: event.target.value }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-start-date">开始日期</Label>
                  <Input
                    id="campaign-start-date"
                    type="date"
                    className="border-white/10 bg-white/[0.03]"
                    value={form.startDate}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, startDate: event.target.value }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-end-date">结束日期</Label>
                  <Input
                    id="campaign-end-date"
                    type="date"
                    className="border-white/10 bg-white/[0.03]"
                    value={form.endDate}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, endDate: event.target.value }));
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-platforms">分发平台</Label>
                <Input
                  id="campaign-platforms"
                  className="border-white/10 bg-white/[0.03]"
                  placeholder="用逗号分隔，例如：抖音, 小红书, 视频号"
                  value={form.platformsText}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, platformsText: event.target.value }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-objective">活动目标</Label>
                <Textarea
                  id="campaign-objective"
                  className="min-h-20 border-white/10 bg-white/[0.03]"
                  placeholder="例如：新品曝光、私域引流、直播预约"
                  value={form.objective}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, objective: event.target.value }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-description">活动说明</Label>
                <Textarea
                  id="campaign-description"
                  className="min-h-24 border-white/10 bg-white/[0.03]"
                  placeholder="补充素材方向、节奏安排或渠道说明"
                  value={form.description}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, description: event.target.value }));
                  }}
                />
              </div>

              {createError ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {createError}
                </div>
              ) : null}
            </div>
          )}

          <DialogFooter className="border-white/10 bg-slate-900/80">
            <Button
              variant="outline"
              className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
              onClick={() => {
                setIsCreateOpen(false);
              }}
            >
              取消
            </Button>
            <Button
              className="bg-white text-slate-950 hover:bg-slate-100"
              onClick={() => {
                void handleCreateCampaign();
              }}
              disabled={createSubmitting || createDisabled}
            >
              {createSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              创建活动
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setDetailError(null);
            setStatusUpdating(null);
          }
        }}
      >
        <DialogContent className="border-white/10 bg-slate-950 text-slate-100 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCampaign?.name || "活动详情"}</DialogTitle>
            <DialogDescription className="text-slate-400">
              详情和状态变更都直接读取真实 campaign 接口。
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4 py-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : detailError ? (
            <ErrorState
              title="活动详情加载失败"
              description={detailError}
              onRetry={() => {
                if (selectedCampaign) {
                  void openCampaignDetails(selectedCampaign);
                }
              }}
              className="border-white/10 bg-black/20"
            />
          ) : selectedCampaign ? (
            <div className="space-y-5 py-2">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-white/10 bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-base text-white">活动概览</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">品牌</span>
                      <span>{selectedCampaign.brand || "未绑定品牌"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">状态</span>
                      <Badge variant="outline" className={getStatusBadgeClass(selectedCampaign.status)}>
                        {selectedCampaign.status || "unknown"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">时间范围</span>
                      <span>
                        {formatDateLabel(selectedCampaign.startDate)}
                        {selectedCampaign.endDate ? ` - ${formatDateLabel(selectedCampaign.endDate)}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">目标视频数</span>
                      <span>{selectedCampaign.totalVideos}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-base text-white">执行进度</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
                      <span>已完成 {selectedCampaign.completed} 条</span>
                      <span>{selectedCampaign.progress}%</span>
                    </div>
                    <Progress value={selectedCampaign.progress} className="h-2" />
                    <div className="mt-4 text-sm text-slate-400">
                      分发平台：
                      {selectedCampaign.platforms.length > 0
                        ? selectedCampaign.platforms.join(" / ")
                        : "未设置"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-white/10 bg-black/20">
                <CardHeader>
                  <CardTitle className="text-base text-white">活动说明</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-[0.2em] text-slate-500">Objective</div>
                    <p>{selectedCampaign.objective || "暂未填写目标。"}</p>
                  </div>
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-[0.2em] text-slate-500">Description</div>
                    <p>{selectedCampaign.description || "暂未填写补充说明。"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-black/20">
                <CardHeader>
                  <CardTitle className="text-base text-white">更新状态</CardTitle>
                  <CardDescription className="text-slate-400">
                    调用真实 `campaign/update` 接口更新当前活动状态。
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  {STATUS_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedCampaign.status === option.value ? "default" : "outline"}
                      className={
                        selectedCampaign.status === option.value
                          ? "bg-white text-slate-950 hover:bg-slate-100"
                          : "border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
                      }
                      disabled={statusUpdating !== null}
                      onClick={() => {
                        void handleUpdateStatus(option.value);
                      }}
                    >
                      {statusUpdating === option.value ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {option.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {detailError ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {detailError}
                </div>
              ) : null}
            </div>
          ) : (
            <EmptyState
              icon={Rocket}
              title="暂无活动详情"
              description="请选择一条真实活动后重试。"
              className="border-white/10 bg-black/20 py-12"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
