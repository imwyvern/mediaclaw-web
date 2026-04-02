"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Info,
  Layout,
  Link2,
  Sparkles,
  Video,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { DataState, WarmEmptyState } from "@/components/data-state";
import { MetadataUpdater } from "@/components/metadata-updater";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { api, readApiErrorMessage, type AccountSnapshot, type Brand } from "@/lib/api";
import { formatCompactNumber } from "@/lib/format";

const resolveSliderValue = (value: number | readonly number[]) => (Array.isArray(value) ? value[0] : value);

export default function CreateVideoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [account, setAccount] = useState<AccountSnapshot | null>(null);
  const [sourceMode, setSourceMode] = useState<"reference" | "template">("reference");
  const [form, setForm] = useState({
    brandId: "",
    title: "",
    prompt: "",
    referenceUrl: "",
    templateId: "",
    count: 1,
    duration: 15,
    style: "modern",
  });

  const loadBaseData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [brandsResponse, accountResponse] = await Promise.all([
        api.brands.list(),
        api.account.get().catch(() => ({ data: null as AccountSnapshot | null })),
      ]);

      setBrands(brandsResponse.data);
      setAccount(accountResponse.data);
    } catch (loadError) {
      setError(readApiErrorMessage(loadError, "创建视频前置数据加载失败，请稍后重试。"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBaseData();
  }, []);

  const estimatedCredits = form.count;
  const remainingCredits = account?.credits.remaining ?? 0;
  const selectedBrand = brands.find((brand) => brand.id === form.brandId) || null;

  const validateCurrentStep = () => {
    if (step === 1 && !form.brandId) {
      toast.error("请先选择一个品牌空间。");
      return false;
    }

    if (step === 2) {
      if (sourceMode === "reference" && !form.referenceUrl.trim()) {
        toast.error("请填写参考视频 URL。");
        return false;
      }

      if (sourceMode === "template" && !form.templateId.trim()) {
        toast.error("请输入模板 ID。");
        return false;
      }
    }

    if (step === 3) {
      if (!form.title.trim()) {
        toast.error("请填写视频标题。");
        return false;
      }

      if (!form.prompt.trim()) {
        toast.error("请填写创作 brief。");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    setStep((current) => Math.min(4, current + 1));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.videos.create({
        brandId: form.brandId,
        title: form.title,
        prompt: form.prompt,
        mode: sourceMode,
        taskType: sourceMode === "template" ? "template_generation" : "brand_replace",
        sourceVideoUrl: sourceMode === "reference" ? form.referenceUrl : undefined,
        templateId: sourceMode === "template" ? form.templateId : undefined,
        metadata: {
          count: form.count,
          duration: form.duration,
          style: form.style,
        },
      });

      toast.success("视频任务已创建，正在进入详情页。");
      router.push(`/dashboard/videos/${response.data.id}`);
    } catch (submitError) {
      toast.error(readApiErrorMessage(submitError, "创建视频任务失败，请稍后重试。"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 animate-in fade-in duration-500">
      <MetadataUpdater title="新建视频任务" />

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/dashboard/videos" />}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">新建视频任务</h1>
          <p className="text-muted-foreground">用真实 API 创建生产任务，成功后直接跳转到任务详情页。</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(6,10,18,0.98))] p-5 shadow-[0_24px_80px_-48px_rgba(14,165,233,0.35)]">
        <div className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
          <span>创建进度</span>
          <span>Step {step} / 4</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className={`flex h-11 items-center justify-center rounded-xl border text-sm font-semibold ${step === item ? "border-sky-400 bg-sky-500/10 text-sky-100" : step > item ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-white/10 bg-white/[0.04] text-slate-400"}`}>
              {step > item ? <Check className="h-4 w-4" /> : item}
            </div>
          ))}
        </div>
      </div>

      <DataState
        loading={loading}
        error={error}
        isEmpty={!loading && brands.length === 0}
        onRetry={() => {
          void loadBaseData();
        }}
        emptyState={
          <WarmEmptyState
            icon={Sparkles}
            title="还没有可用的品牌空间"
            description="先创建品牌，再回来发起真实视频任务。"
            actionLabel="去 Onboarding"
            onAction={() => {
              window.location.href = "/dashboard/onboarding";
            }}
          />
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {step === 1 ? (
              <Card className="animate-in slide-in-from-right-4 duration-300">
                <CardHeader>
                  <CardTitle>选择品牌空间</CardTitle>
                  <CardDescription>视频会自动继承品牌名称、行业和视觉资产。</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  {brands.map((brand) => (
                    <div
                      key={brand.id}
                      onClick={() => setForm((current) => ({ ...current, brandId: brand.id }))}
                      className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${form.brandId === brand.id ? "border-sky-400 bg-sky-500/10" : "border-border/70 hover:border-sky-500/30 hover:bg-muted/20"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
                          <Video className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold">{brand.name}</div>
                          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            {brand.industry || brand.category || "未分类"}
                          </div>
                        </div>
                        {form.brandId === brand.id ? <Check className="h-5 w-5 text-sky-400" /> : null}
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="justify-end border-t bg-muted/30 pt-6">
                  <Button disabled={!form.brandId} onClick={handleNext}>
                    下一步 <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ) : null}

            {step === 2 ? (
              <Card className="animate-in slide-in-from-right-4 duration-300">
                <CardHeader>
                  <CardTitle>设置素材来源</CardTitle>
                  <CardDescription>当前前端接的是任务创建 API，因此这里使用可直接提交给后端的真实字段。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-3 rounded-xl bg-muted/50 p-1">
                    <Button variant={sourceMode === "reference" ? "secondary" : "ghost"} className="flex-1 gap-2" onClick={() => setSourceMode("reference")}>
                      <Link2 className="h-4 w-4" />
                      参考视频 URL
                    </Button>
                    <Button variant={sourceMode === "template" ? "secondary" : "ghost"} className="flex-1 gap-2" onClick={() => setSourceMode("template")}>
                      <Layout className="h-4 w-4" />
                      模板生成
                    </Button>
                  </div>

                  {sourceMode === "reference" ? (
                    <div className="space-y-2">
                      <Label htmlFor="reference-url">参考视频 URL</Label>
                      <Input
                        id="reference-url"
                        placeholder="https://example.com/reference-video.mp4"
                        value={form.referenceUrl}
                        onChange={(event) => setForm((current) => ({ ...current, referenceUrl: event.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">会作为 `sourceVideoUrl` 提交给 `/api/v1/videos`。</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="template-id">模板 ID</Label>
                      <Input
                        id="template-id"
                        placeholder="b9-product-showcase"
                        value={form.templateId}
                        onChange={(event) => setForm((current) => ({ ...current, templateId: event.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">模板 ID 会写入任务元数据，适合模板化生产。</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-between border-t bg-muted/30 pt-6">
                  <Button variant="ghost" onClick={() => setStep(1)}>返回</Button>
                  <Button onClick={handleNext}>
                    下一步 <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ) : null}

            {step === 3 ? (
              <Card className="animate-in slide-in-from-right-4 duration-300">
                <CardHeader>
                  <CardTitle>填写创作 Brief</CardTitle>
                  <CardDescription>这些字段会直接传递给后端任务，用于生成标题、Prompt 和元数据。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">视频标题</Label>
                    <Input
                      id="title"
                      placeholder="例如：祛斑精华 15 秒种草短片"
                      value={form.title}
                      onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt">创作 Brief</Label>
                    <Textarea
                      id="prompt"
                      className="min-h-[120px]"
                      placeholder="说明视频目标、风格、卖点、镜头节奏和品牌要求。"
                      value={form.prompt}
                      onChange={(event) => setForm((current) => ({ ...current, prompt: event.target.value }))}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">生成数量 <Info className="h-4 w-4 text-muted-foreground" /></Label>
                      <span className="text-sm font-bold text-primary">{form.count} 条</span>
                    </div>
                    <Slider value={[form.count]} min={1} max={10} step={1} onValueChange={(value) => setForm((current) => ({ ...current, count: resolveSliderValue(value) || 1 }))} />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">目标时长 <Info className="h-4 w-4 text-muted-foreground" /></Label>
                      <span className="text-sm font-bold text-primary">{form.duration} 秒</span>
                    </div>
                    <Slider value={[form.duration]} min={5} max={60} step={5} onValueChange={(value) => setForm((current) => ({ ...current, duration: resolveSliderValue(value) || 15 }))} />
                  </div>

                  <div className="space-y-2">
                    <Label>内容风格</Label>
                    <Select value={form.style} onValueChange={(value) => value && setForm((current) => ({ ...current, style: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择风格" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">现代极简</SelectItem>
                        <SelectItem value="dynamic">动感快节奏</SelectItem>
                        <SelectItem value="cinematic">电影感</SelectItem>
                        <SelectItem value="vlog">Vlog 生活化</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="justify-between border-t bg-muted/30 pt-6">
                  <Button variant="ghost" onClick={() => setStep(2)}>返回</Button>
                  <Button onClick={handleNext}>
                    下一步 <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ) : null}

            {step === 4 ? (
              <Card className="animate-in zoom-in-95 duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>确认并创建任务</CardTitle>
                  <CardDescription>确认后会真实调用 `POST /api/v1/videos` 创建任务。</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 rounded-2xl bg-muted/50 p-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">品牌空间</span>
                      <span className="font-bold">{selectedBrand?.name || "--"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">任务模式</span>
                      <span className="font-bold">{sourceMode === "reference" ? "参考视频复刻" : "模板生成"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">视频标题</span>
                      <span className="max-w-[60%] truncate text-right font-bold">{form.title}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">生成参数</span>
                      <span className="font-bold">{form.count} 条 × {form.duration}s</span>
                    </div>
                    <div className="my-2 h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-lg font-bold">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        预计消耗
                      </div>
                      <span className="text-2xl font-black text-primary">{formatCompactNumber(estimatedCredits)} 条额度</span>
                    </div>
                    {remainingCredits > 0 ? (
                      <p className="text-xs text-muted-foreground">当前账户余额：{formatCompactNumber(remainingCredits)} 条额度</p>
                    ) : null}
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-4 border-t bg-muted/30 pt-6">
                  <div className="flex w-full gap-4">
                    <Button variant="ghost" className="flex-1" onClick={() => setStep(3)}>返回修改</Button>
                    <Button className="flex-[2]" disabled={submitting} onClick={handleSubmit}>
                      {submitting ? "正在创建..." : "立即开始生产"}
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">提交后会立即返回任务详情页，后续进度在列表和详情页实时更新。</p>
                </CardFooter>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card className="border-border/70 bg-card/70">
              <CardHeader>
                <CardTitle>任务预览</CardTitle>
                <CardDescription>侧边栏实时反映本次将提交到后端的关键字段。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">品牌</span>
                  <span className="font-medium">{selectedBrand?.name || "未选择"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">模式</span>
                  <span className="font-medium">{sourceMode === "reference" ? "reference" : "template"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">标题</span>
                  <span className="max-w-[60%] truncate text-right font-medium">{form.title || "未填写"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">风格</span>
                  <span className="font-medium">{form.style}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">生成数量</span>
                  <span className="font-medium">{form.count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">目标时长</span>
                  <span className="font-medium">{form.duration}s</span>
                </div>
              </CardContent>
            </Card>

            {remainingCredits > 0 && remainingCredits < estimatedCredits ? (
              <Card className="border-amber-500/20 bg-amber-500/10">
                <CardHeader>
                  <CardTitle className="text-amber-100">额度提醒</CardTitle>
                  <CardDescription className="text-amber-50/80">
                    当前余额小于预计消耗，建议先去 Billing 购买更多额度。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full border-amber-500/20 bg-transparent text-amber-50 hover:bg-amber-500/10" render={<Link href="/dashboard/billing" />}>
                    前往 Billing
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </DataState>
    </div>
  );
}
