"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Briefcase,
  Building2,
  LayoutGrid,
  Loader2,
  Plus,
  RefreshCw,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  api,
  readApiErrorMessage,
  type Brand,
} from "@/lib/api";

const DEFAULT_FORM = {
  name: "",
  category: "",
};

function upsertBrand(list: Brand[], next: Brand) {
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
      logo: next.logo || item.logo,
      logoUrl: next.logoUrl || item.logoUrl,
      colors: next.colors && next.colors.length > 0 ? next.colors : item.colors,
      fonts: next.fonts && next.fonts.length > 0 ? next.fonts : item.fonts,
    };
  });
}

function BrandCardSkeleton() {
  return (
    <Card className="flex flex-col border-white/10 bg-black/20">
      <CardHeader className="pb-4">
        <Skeleton className="mb-3 h-14 w-14 rounded-2xl" />
        <Skeleton className="mb-2 h-6 w-2/3" />
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-4 w-full" />
      </CardContent>
      <CardFooter className="border-t border-white/10 pt-4">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function BrandsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const loadBrands = async (options?: { silent?: boolean }) => {
    if (options?.silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await api.brand.list();
      setBrands(response.data);
    } catch (loadError) {
      setBrands([]);
      setError(readApiErrorMessage(loadError, "品牌列表加载失败，请稍后重试。"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBrands();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const resetCreateState = () => {
    setCreateError(null);
    setForm(DEFAULT_FORM);
    setLogoFile(null);
  };

  const handleCreateBrand = async () => {
    if (!form.name.trim()) {
      toast.error("请输入品牌名称");
      return;
    }

    setIsSubmitting(true);
    setCreateError(null);

    try {
      const response = await api.brand.create({
        name: form.name.trim(),
        category: form.category.trim() || undefined,
      });

      setBrands((current) => upsertBrand(current, response.data));

      if (logoFile) {
        try {
          await api.brand.uploadAsset(response.data.id, logoFile, "logo");
        } catch (uploadError) {
          toast.error(readApiErrorMessage(uploadError, "品牌已创建，但 Logo 上传失败。"));
        }
      }

      toast.success("品牌已创建");
      setIsCreateOpen(false);
      resetCreateState();
      void loadBrands({ silent: true });
    } catch (submitError) {
      setCreateError(readApiErrorMessage(submitError, "品牌创建失败，请稍后重试。"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in duration-500">
      <MetadataUpdater title="品牌管理" />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">品牌管理</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
            直接读取真实品牌工作区，支持创建品牌并调用 `asset/upload` 上传 Logo，不再展示任何开发假数据。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
            onClick={() => {
              void loadBrands({ silent: true });
            }}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            刷新品牌
          </Button>
          <Button
            className="bg-white text-slate-950 hover:bg-slate-100"
            onClick={() => {
              resetCreateState();
              setIsCreateOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            新建品牌
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <BrandCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="品牌列表加载失败"
          description={error}
          onRetry={() => {
            void loadBrands();
          }}
          className="border-white/10 bg-black/20"
        />
      ) : brands.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="还没有品牌工作区"
          description="创建你的第一个品牌后，这里会展示 Logo、配色、产能和视频规模。"
          actionLabel="创建第一个品牌"
          onAction={() => {
            resetCreateState();
            setIsCreateOpen(true);
          }}
          className="border-white/10 bg-black/20"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {brands.map((brand) => (
            <Card
              key={brand.id}
              className="group flex flex-col border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(6,10,18,0.98))] shadow-[0_28px_80px_-48px_rgba(16,185,129,0.35)]"
            >
              <CardHeader>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                    {brand.logoUrl ? (
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${brand.logoUrl})` }}
                        aria-label={`${brand.name} logo`}
                        role="img"
                      />
                    ) : (
                      <span className="text-lg font-bold uppercase text-slate-100">
                        {brand.logo || brand.name.slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-slate-100">
                    {brand.category || "未分类"}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-white">{brand.name}</CardTitle>
                <CardDescription className="text-slate-400">
                  {brand.videoStyle || brand.industry || "品牌资产和内容风格将随着真实配置自动同步。"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="mb-1 flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      <LayoutGrid className="mr-1 h-3.5 w-3.5" />
                      Pipelines
                    </div>
                    <div className="text-lg font-semibold text-white">{brand.pipelines}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="mb-1 flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      <Briefcase className="mr-1 h-3.5 w-3.5" />
                      Videos
                    </div>
                    <div className="text-lg font-semibold text-white">{brand.videos}</div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">配色数量</span>
                    <span>{brand.colors?.length ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">字体数量</span>
                    <span>{brand.fonts?.length ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">创建时间</span>
                    <span>{brand.createdAt ? new Date(brand.createdAt).toLocaleDateString("zh-CN") : "未记录"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-white/10 pt-4">
                <Button
                  variant="outline"
                  className="w-full border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
                  render={<Link href={`/dashboard/videos/create?brandId=${brand.id}`} />}
                >
                  基于该品牌创建视频
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-white/10 bg-slate-950 text-slate-100 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>创建品牌工作区</DialogTitle>
            <DialogDescription className="text-slate-400">
              创建时直接提交到真实品牌接口；如果选择 Logo，会继续调用 `asset/upload` 上传素材。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="brand-name">品牌名称</Label>
                <Input
                  id="brand-name"
                  className="border-white/10 bg-white/[0.03]"
                  placeholder="例如：MediaClaw Studio"
                  value={form.name}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, name: event.target.value }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-category">品牌分类</Label>
                <Input
                  id="brand-category"
                  className="border-white/10 bg-white/[0.03]"
                  placeholder="例如：SaaS、消费品牌、电商"
                  value={form.category}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, category: event.target.value }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-logo">品牌 Logo</Label>
                <Input
                  id="brand-logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="border-white/10 bg-white/[0.03]"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] || null;
                    setLogoFile(nextFile);
                  }}
                />
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-400">
                  {logoFile ? `已选择文件：${logoFile.name}` : "可选上传 PNG / JPG / SVG Logo，创建成功后会走真实 asset 上传接口。"}
                </div>
              </div>

              {createError ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {createError}
                </div>
              ) : null}
            </div>

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
                void handleCreateBrand();
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              创建品牌
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
