"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  type LucideIcon,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  Loader2,
  RefreshCcw,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { MetadataUpdater } from "@/components/metadata-updater";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  api,
  isApiNotFoundError,
  readApiErrorMessage,
  type AccountPack,
  type AccountSnapshot,
  type Brand,
} from "@/lib/api";
import { formatCompactNumber, formatDate } from "@/lib/format";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TOTAL_STEPS = 4;

type Step = 1 | 2 | 3 | 4;

interface IndustryOption {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

const INDUSTRY_OPTIONS: IndustryOption[] = [
  {
    value: "technology",
    label: "科技 / 软件",
    description: "适合 SaaS、AI 工具、开发者产品与消费电子。",
    icon: Sparkles,
  },
  {
    value: "ecommerce",
    label: "电商 / 品牌零售",
    description: "适合品牌种草、爆品上新、直播切片与转化素材。",
    icon: BriefcaseBusiness,
  },
  {
    value: "education",
    label: "教育 / 咨询",
    description: "适合知识付费、课程宣传、顾问服务与案例表达。",
    icon: Target,
  },
  {
    value: "local-services",
    label: "本地服务 / 生活消费",
    description: "适合餐饮、医美、运动、出行与门店经营场景。",
    icon: WalletCards,
  },
];

const VIDEO_STYLE_OPTIONS = [
  { value: "cinematic", label: "高级质感" },
  { value: "direct-response", label: "强转化脚本" },
  { value: "founder-story", label: "创始人表达" },
  { value: "ugc", label: "原生 UGC" },
];

const STEP_TITLES: Record<Step, string> = {
  1: "保存行业方向",
  2: "创建首个品牌",
  3: "确认试用额度",
  4: "进入控制台",
};

async function fetchAccountSnapshot() {
  const response = await api.account.get();
  return response.data;
}

async function saveIndustryPreference(industry: string) {
  const response = await api.account.updateProfile({ industry });
  return response.data;
}

async function createBrandRecord(payload: {
  name: string;
  industry: string;
  videoStyle?: string;
}) {
  const response = await api.brands.create(payload);
  return response.data;
}

function hasAccountSnapshotValue(snapshot: AccountSnapshot) {
  return (
    snapshot.packs.length > 0 ||
    snapshot.credits.total > 0 ||
    snapshot.credits.remaining > 0 ||
    snapshot.credits.used > 0 ||
    snapshot.currentPeriod.creditsConsumed > 0
  );
}

function formatPackTypeLabel(packType: string) {
  const normalized = packType.trim().toLowerCase();

  if (normalized.includes("trial")) {
    return "试用包";
  }

  if (normalized.includes("credit")) {
    return "额度包";
  }

  if (!normalized) {
    return "资源包";
  }

  return packType.replace(/[_-]+/g, " ");
}

function formatPackStatus(pack: AccountPack) {
  if (pack.expired) {
    return "已过期";
  }

  const normalized = pack.status.trim().toLowerCase();
  if (normalized.includes("active") || normalized.includes("paid")) {
    return "生效中";
  }
  if (normalized.includes("pending")) {
    return "待生效";
  }

  return pack.status || "未知状态";
}

function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card
      className={cn(
        "border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] text-white shadow-[0_24px_70px_-44px_rgba(56,189,248,0.45)]",
        className,
      )}
    >
      {children}
    </Card>
  );
}

function StepStatusItem({
  step,
  currentStep,
  title,
  description,
}: {
  step: Step;
  currentStep: Step;
  title: string;
  description: string;
}) {
  const complete = currentStep > step;
  const active = currentStep === step;

  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
          complete && "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
          active && "border-sky-400/40 bg-sky-500/15 text-sky-100",
          !complete && !active && "border-white/10 bg-white/[0.04] text-slate-400",
        )}
      >
        {complete ? <Check className="h-4 w-4" /> : step}
      </div>
      <div className="space-y-1">
        <div className={cn("text-sm font-semibold", active ? "text-white" : "text-slate-200")}>{title}</div>
        <p className="text-xs leading-5 text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function IndustryCard({
  option,
  selected,
  onSelect,
}: {
  option: IndustryOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = option.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group rounded-2xl border p-5 text-left transition-all duration-200",
        selected
          ? "border-sky-400/40 bg-sky-500/12 shadow-[0_20px_50px_-34px_rgba(56,189,248,0.9)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold text-white">{option.label}</div>
          <p className="mt-2 text-sm leading-6 text-slate-300/80">{option.description}</p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
            selected ? "border-sky-300/30 bg-sky-400/20 text-sky-100" : "border-white/10 bg-white/[0.04] text-slate-300",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </button>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</div>
          <div className="mt-3 text-2xl font-black tracking-tight text-white">{value}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-slate-100">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300/75">{hint}</p>
    </div>
  );
}

function PackCard({ pack }: { pack: AccountPack }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{formatPackTypeLabel(pack.packType)}</div>
          <div className="mt-1 text-xs text-slate-400">
            购买时间 {formatDate(pack.purchasedAt)}
            {pack.expiresAt ? ` · 到期 ${formatDate(pack.expiresAt)}` : " · 无固定到期日"}
          </div>
        </div>
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            pack.expired
              ? "border-white/10 bg-white/[0.06] text-slate-300"
              : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
          )}
        >
          {formatPackStatus(pack)}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">剩余</div>
          <div className="mt-1 text-lg font-semibold text-white">{formatCompactNumber(pack.remainingCredits)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">总量</div>
          <div className="mt-1 text-lg font-semibold text-white">{formatCompactNumber(pack.totalCredits)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">已用</div>
          <div className="mt-1 text-lg font-semibold text-white">{formatCompactNumber(pack.usedCredits)}</div>
        </div>
      </div>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <Skeleton className="h-3 w-20 bg-white/10" />
            <Skeleton className="mt-4 h-8 w-24 bg-white/10" />
            <Skeleton className="mt-3 h-4 w-full bg-white/10" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <Skeleton className="h-4 w-32 bg-white/10" />
        <Skeleton className="mt-4 h-20 w-full bg-white/10" />
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const authToken = useAuthStore((state) => state.token);
  const syncLogin = useAuthStore((state) => state.login);

  const [step, setStep] = useState<Step>(1);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandStyle, setBrandStyle] = useState("");
  const [createdBrand, setCreatedBrand] = useState<Brand | null>(null);

  const [accountSnapshot, setAccountSnapshot] = useState<AccountSnapshot | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountComingSoon, setAccountComingSoon] = useState(false);

  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [brandSubmitting, setBrandSubmitting] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [brandError, setBrandError] = useState<string | null>(null);

  const selectedIndustryOption = INDUSTRY_OPTIONS.find((item) => item.value === selectedIndustry) || null;
  const hasAccountData = accountSnapshot ? hasAccountSnapshotValue(accountSnapshot) : false;

  useEffect(() => {
    let cancelled = false;

    const loadInitialSnapshot = async () => {
      setAccountLoading(true);
      setAccountError(null);
      setAccountComingSoon(false);

      try {
        const snapshot = await fetchAccountSnapshot();
        if (!cancelled) {
          setAccountSnapshot(snapshot);
        }
      } catch (error) {
        if (!cancelled) {
          if (isApiNotFoundError(error)) {
            setAccountSnapshot(null);
            setAccountComingSoon(true);
          } else {
            setAccountError(readApiErrorMessage(error, "账户额度加载失败，请稍后重试。"));
          }
        }
      } finally {
        if (!cancelled) {
          setAccountLoading(false);
        }
      }
    };

    void loadInitialSnapshot();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshAccountSnapshot = async (notifyOnSuccess = false) => {
    setAccountLoading(true);
    setAccountError(null);
    setAccountComingSoon(false);

    try {
      const snapshot = await fetchAccountSnapshot();
      setAccountSnapshot(snapshot);
      if (notifyOnSuccess) {
        toast.success("账户额度已刷新");
      }
    } catch (error) {
      if (isApiNotFoundError(error)) {
        setAccountComingSoon(true);
      } else {
        setAccountError(readApiErrorMessage(error, "账户额度加载失败，请稍后重试。"));
      }
    } finally {
      setAccountLoading(false);
    }
  };

  const goToDashboard = () => {
    setNavigating(true);
    router.replace("/dashboard");
  };

  const handleSaveIndustry = async () => {
    if (!selectedIndustry) {
      setProfileError("请选择一个行业方向后再继续。");
      return;
    }

    setProfileSubmitting(true);
    setProfileError(null);

    try {
      const updatedUser = await saveIndustryPreference(selectedIndustry);
      if (authToken) {
        syncLogin(updatedUser, authToken);
      }
      toast.success("行业信息已保存");
      setStep(2);
    } catch (error) {
      setProfileError(isApiNotFoundError(error) ? "行业配置接口即将上线，当前环境暂时无法保存。" : readApiErrorMessage(error, "行业保存失败，请稍后重试。"));
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleCreateBrand = async () => {
    if (createdBrand) {
      setStep(3);
      return;
    }

    if (!brandName.trim()) {
      setBrandError("请输入品牌名称后再继续。");
      return;
    }

    if (!selectedIndustry) {
      setBrandError("请先完成行业选择。");
      setStep(1);
      return;
    }

    setBrandSubmitting(true);
    setBrandError(null);

    try {
      const brand = await createBrandRecord({
        name: brandName.trim(),
        industry: selectedIndustry,
        videoStyle: brandStyle || undefined,
      });
      setCreatedBrand(brand);
      setBrandName(brand.name);
      toast.success("品牌已创建");
      setStep(3);
      void refreshAccountSnapshot();
    } catch (error) {
      setBrandError(isApiNotFoundError(error) ? "品牌初始化接口即将上线，当前环境暂时无法创建品牌。" : readApiErrorMessage(error, "品牌创建失败，请稍后重试。"));
    } finally {
      setBrandSubmitting(false);
    }
  };

  const renderPrimaryContent = () => {
    if (step === 1) {
      return (
        <GlassCard>
          <CardHeader className="pb-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-100">
              <Sparkles className="h-3.5 w-3.5" />
              Step 1
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              先告诉我们你的行业方向
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
              这一步会真实写入账号资料，后续的爆款发现、脚本策略和品牌默认参数都会围绕这个行业展开。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {INDUSTRY_OPTIONS.map((option) => (
                <IndustryCard
                  key={option.value}
                  option={option}
                  selected={selectedIndustry === option.value}
                  onSelect={() => setSelectedIndustry(option.value)}
                />
              ))}
            </div>

            {selectedIndustryOption ? (
              <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-4 text-sm text-sky-50">
                已选择 <span className="font-semibold">{selectedIndustryOption.label}</span>，点击继续后会立即调用真实接口保存。
              </div>
            ) : null}

            {profileError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-100">
                {profileError}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
              <Button variant="ghost" className="text-slate-300 hover:bg-white/5 hover:text-white" onClick={goToDashboard}>
                稍后完成
              </Button>
              <Button size="lg" className="gap-2" onClick={handleSaveIndustry} disabled={!selectedIndustry || profileSubmitting}>
                {profileSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                保存并继续
              </Button>
            </div>
          </CardContent>
        </GlassCard>
      );
    }

    if (step === 2) {
      return (
        <GlassCard>
          <CardHeader className="pb-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-100">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              Step 2
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              创建你的首个品牌工作区
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
              这里不再保留上传 logo 的假流程，提交后会直接调用 `api.brands.create()` 创建真实品牌。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-slate-300">
              当前行业：<span className="font-semibold text-white">{selectedIndustryOption?.label || "未选择"}</span>
            </div>

            {createdBrand ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm uppercase tracking-[0.22em] text-emerald-200/80">Brand Created</div>
                    <div className="mt-2 text-2xl font-black tracking-tight text-white">{createdBrand.name}</div>
                    <p className="mt-2 text-sm leading-6 text-emerald-50/80">
                      品牌已落库。继续下一步即可查看账户已下发的试用额度与余额。
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-500/15 text-emerald-50">
                    <Check className="h-5 w-5" />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="mt-4 px-0 text-emerald-100 hover:bg-transparent hover:text-white"
                  onClick={() => {
                    setCreatedBrand(null);
                    setBrandError(null);
                  }}
                >
                  重新创建一个品牌
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="brand-name" className="text-slate-100">
                    品牌名称
                  </Label>
                  <Input
                    id="brand-name"
                    placeholder="例如：MediaClaw Labs"
                    className="h-12 border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
                    value={brandName}
                    onChange={(event) => setBrandName(event.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="brand-style" className="text-slate-100">
                    默认内容风格
                  </Label>
                  <Select value={brandStyle} onValueChange={(value) => setBrandStyle(value ?? "") }>
                    <SelectTrigger id="brand-style" className="h-12 w-full border-white/10 bg-white/[0.04] text-white">
                      <SelectValue placeholder="可选：先给品牌一个默认视频风格" />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_STYLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {brandError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-100">
                {brandError}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="outline" size="lg" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
              <Button size="lg" className="gap-2" onClick={handleCreateBrand} disabled={brandSubmitting}>
                {brandSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                {createdBrand ? "继续下一步" : "创建品牌并继续"}
              </Button>
            </div>
          </CardContent>
        </GlassCard>
      );
    }

    if (step === 3) {
      return (
        <GlassCard>
          <CardHeader className="pb-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-100">
              <Coins className="h-3.5 w-3.5" />
              Step 3
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              确认你的试用包与账户余额
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
              这一步只展示真实账户快照，数据直接来自 `api.account.get()`，不再模拟上传或处理流程。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {accountLoading && !accountSnapshot ? <AccountSkeleton /> : null}

            {accountComingSoon && !accountSnapshot ? (
              <EmptyState
                icon={WalletCards}
                title="试用额度即将上线"
                description="当前环境尚未开放账户快照接口，后端发布后这里会直接展示真实试用包和余额。"
                actionLabel="重新拉取"
                onAction={() => {
                  void refreshAccountSnapshot(true);
                }}
                className="border-white/10 bg-white/[0.04]"
              />
            ) : !accountLoading && !accountSnapshot && accountError ? (
              <ErrorState
                title="额度加载失败"
                description={accountError}
                onRetry={() => {
                  void refreshAccountSnapshot(true);
                }}
                className="border-white/10 bg-white/[0.04]"
              />
            ) : null}

            {accountSnapshot ? (
              <div className="space-y-5">
                {accountComingSoon ? (
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-50">
                    当前环境尚未开放账户快照接口，页面会在接口发布后自动切换为真实余额视图。
                  </div>
                ) : accountError ? (
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-50">
                    最新一次刷新失败，当前仍展示上一次成功拉取的账户数据。错误信息：{accountError}
                  </div>
                ) : null}

                {hasAccountData ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-3">
                      <MetricCard
                        label="可用余额"
                        value={formatCompactNumber(accountSnapshot.credits.remaining)}
                        hint={`总额度 ${formatCompactNumber(accountSnapshot.credits.total)}，已使用 ${formatCompactNumber(accountSnapshot.credits.used)}。`}
                        icon={Coins}
                      />
                      <MetricCard
                        label="当前周期消耗"
                        value={formatCompactNumber(accountSnapshot.currentPeriod.creditsConsumed)}
                        hint="这是当前统计周期内的真实额度消耗，不是 mock 演示数字。"
                        icon={Target}
                      />
                      <MetricCard
                        label="资源包数量"
                        value={formatCompactNumber(accountSnapshot.packs.length)}
                        hint="展示的是账户当前返回的全部资源包记录。"
                        icon={WalletCards}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">账户资源包</h3>
                          <p className="text-sm text-slate-400">如果后端已下发试用包，你会在这里看到真实记录。</p>
                        </div>
                        <Button
                          variant="outline"
                          className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                          onClick={() => {
                            void refreshAccountSnapshot(true);
                          }}
                          disabled={accountLoading}
                        >
                          {accountLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                          刷新余额
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {accountSnapshot.packs.map((pack) => (
                          <PackCard key={pack.id} pack={pack} />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <EmptyState
                    icon={WalletCards}
                    title="当前还没有可展示的试用额度"
                    description="账号信息已拉取成功，但账户快照里暂时没有资源包或余额。你可以刷新重试，或者直接进入控制台继续后续配置。"
                    actionLabel="重新拉取"
                    onAction={() => {
                      void refreshAccountSnapshot(true);
                    }}
                    className="border-white/10 bg-white/[0.04]"
                  />
                )}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="outline" size="lg" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]" onClick={() => setStep(2)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
              <Button size="lg" className="gap-2" onClick={() => setStep(4)} disabled={accountLoading || (!accountSnapshot && !accountComingSoon)}>
                <ChevronRight className="h-4 w-4" />
                继续
              </Button>
            </div>
          </CardContent>
        </GlassCard>
      );
    }

    return (
      <GlassCard>
        <CardHeader className="pb-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-100">
            <Check className="h-3.5 w-3.5" />
            Step 4
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            环境已经准备好
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
            行业信息已保存，品牌已创建，账户余额也已用真实快照确认。最后一步直接进入 `/dashboard`。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="行业方向"
              value={selectedIndustryOption?.label || "未设置"}
              hint="已通过真实账号资料更新接口提交。"
              icon={Sparkles}
            />
            <MetricCard
              label="品牌工作区"
              value={createdBrand?.name || "未创建"}
              hint="当前 onboarding 已调用品牌创建接口完成初始化。"
              icon={BriefcaseBusiness}
            />
            <MetricCard
              label="当前余额"
              value={formatCompactNumber(accountSnapshot?.credits.remaining ?? 0)}
              hint="这里显示的是离开 onboarding 前最后一次读取到的账户余额。"
              icon={Coins}
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5 text-sm leading-7 text-slate-300">
            下一步建议：先去 <span className="font-semibold text-white">Brands</span> 完善视觉资产，再到 <span className="font-semibold text-white">Discovery</span> 找到可复刻样本，最后在 <span className="font-semibold text-white">Videos</span> 发起首个任务。
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" size="lg" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]" onClick={() => setStep(3)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
            <Button size="lg" className="gap-2" onClick={goToDashboard} disabled={navigating}>
              {navigating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              进入控制台
            </Button>
          </div>
        </CardContent>
      </GlassCard>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_36%,#020617_100%)] text-white">
      <MetadataUpdater title="欢迎加入" description="完成真实 onboarding，配置行业、品牌和试用额度。" />

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-300">
              Dashboard Onboarding
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">配置你的生成工作台</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
                这里不再走演示流程。每一步都直接操作真实账号数据，完成后就能进入主控制台继续工作。
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">当前账号</div>
            <div className="mt-2 text-lg font-semibold text-white">{authUser?.name || authUser?.phone || "MediaClaw User"}</div>
            <div className="mt-1 text-xs text-slate-400">完成配置后将跳转到 `/dashboard`。</div>
          </div>
        </div>

        <GlassCard className="overflow-hidden">
          <CardContent className="px-5 py-5 sm:px-6">
            <Progress value={(step / TOTAL_STEPS) * 100} className="gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-slate-400">
                <span>
                  Step {step} / {TOTAL_STEPS}
                </span>
                <span>{STEP_TITLES[step]}</span>
              </div>
            </Progress>
          </CardContent>
        </GlassCard>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">{renderPrimaryContent()}</div>

          <div className="space-y-6">
            <GlassCard>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">执行摘要</CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-400">
                  只展示这次 onboarding 已确认或已写入的数据状态。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <StepStatusItem
                  step={1}
                  currentStep={step}
                  title="行业方向"
                  description={selectedIndustryOption?.label || "尚未选择行业方向。"}
                />
                <StepStatusItem
                  step={2}
                  currentStep={step}
                  title="品牌工作区"
                  description={createdBrand?.name || "尚未创建首个品牌。"}
                />
                <StepStatusItem
                  step={3}
                  currentStep={step}
                  title="试用额度"
                  description={
                    accountSnapshot
                      ? `可用余额 ${formatCompactNumber(accountSnapshot.credits.remaining)}，资源包 ${formatCompactNumber(accountSnapshot.packs.length)} 个。`
                      : accountLoading
                        ? "正在拉取账户快照。"
                        : accountComingSoon
                          ? "账户快照接口即将上线。"
                          : accountError || "等待拉取账户快照。"
                  }
                />
                <StepStatusItem
                  step={4}
                  currentStep={step}
                  title="进入控制台"
                  description="完成最后确认后直接跳转到 dashboard。"
                />
              </CardContent>
            </GlassCard>

            <GlassCard>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">账户快照</CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-400">
                  侧栏也复用真实 `api.account.get()` 数据，方便在任意步骤确认余额。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {accountLoading && !accountSnapshot ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full bg-white/10" />
                    <Skeleton className="h-16 w-full bg-white/10" />
                  </div>
                ) : null}

                {accountComingSoon && !accountSnapshot ? (
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-4 text-sm leading-6 text-amber-50">
                    账户快照接口即将上线，后端发布后这里会直接显示真实余额与资源包数量。
                  </div>
                ) : !accountLoading && !accountSnapshot && accountError ? (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-4 text-sm leading-6 text-red-100">
                    {accountError}
                  </div>
                ) : null}

                {accountSnapshot ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">剩余额度</div>
                      <div className="mt-2 text-3xl font-black tracking-tight text-white">
                        {formatCompactNumber(accountSnapshot.credits.remaining)}
                      </div>
                      <div className="mt-2 text-sm text-slate-400">
                        总额度 {formatCompactNumber(accountSnapshot.credits.total)} · 已用 {formatCompactNumber(accountSnapshot.credits.used)}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">资源包</div>
                      <div className="mt-2 text-2xl font-black tracking-tight text-white">
                        {formatCompactNumber(accountSnapshot.packs.length)}
                      </div>
                      <div className="mt-2 text-sm text-slate-400">
                        {hasAccountData ? "账户已返回真实可用快照。" : "当前快照为空，但已经确认接口可达。"}
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
