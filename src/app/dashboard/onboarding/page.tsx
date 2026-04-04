"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  type LucideIcon,
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  Loader2,
  RefreshCcw,
  Sparkles,
  Target,
  Users,
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
  formatUserRoleLabel,
  readApiErrorMessage,
  type AccountPack,
  type AccountSnapshot,
  type Brand,
  type ClawHostInstanceRecord,
  type EnterpriseInviteRecord,
  type User,
} from "@/lib/api";
import { formatCompactNumber, formatDate } from "@/lib/format";
import {
  DEFAULT_OPENCLAW_INSTANCE_CONFIG,
  formatOpenClawStatus,
  hasOpenClawSkill,
  OPENCLAW_MEDIACLAW_CLIENT_SKILL_ID,
  OPENCLAW_MEDIACLAW_CLIENT_VERSION,
  resolveOpenClawClientName,
} from "@/lib/openclaw";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TOTAL_STEPS = 6;

type Step = 1 | 2 | 3 | 4 | 5 | 6;
type OpenClawPreference = "enable" | "skip";

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

const MEMBER_ROLE_OPTIONS = [
  { value: "admin", label: "企业管理员" },
  { value: "editor", label: "运营成员" },
  { value: "viewer", label: "员工" },
] as const;

const STEP_TITLES: Record<Step, string> = {
  1: "保存行业方向",
  2: "创建首个品牌",
  3: "邀请团队成员",
  4: "启用 OpenClaw",
  5: "确认试用额度",
  6: "进入控制台",
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
  const [openClawPreference, setOpenClawPreference] = useState<OpenClawPreference>("enable");
  const [openClawInstance, setOpenClawInstance] = useState<ClawHostInstanceRecord | null>(null);
  const [orgMembers, setOrgMembers] = useState<User[]>([]);
  const [pendingInvites, setPendingInvites] = useState<EnterpriseInviteRecord[]>([]);
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteRole, setInviteRole] = useState<(typeof MEMBER_ROLE_OPTIONS)[number]["value"]>("editor");

  const [accountSnapshot, setAccountSnapshot] = useState<AccountSnapshot | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [openClawLoading, setOpenClawLoading] = useState(true);
  const [openClawLoadError, setOpenClawLoadError] = useState<string | null>(null);
  const [teamLoading, setTeamLoading] = useState(Boolean(authUser?.orgId));
  const [teamError, setTeamError] = useState<string | null>(null);

  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [brandSubmitting, setBrandSubmitting] = useState(false);
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [openClawSubmitting, setOpenClawSubmitting] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [brandError, setBrandError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [openClawError, setOpenClawError] = useState<string | null>(null);

  const selectedIndustryOption = INDUSTRY_OPTIONS.find((item) => item.value === selectedIndustry) || null;
  const hasAccountData = accountSnapshot ? hasAccountSnapshotValue(accountSnapshot) : false;
  const mediaclawClientInstalled = hasOpenClawSkill(openClawInstance);
  const hasEnterpriseWorkspace = Boolean(authUser?.orgId);

  useEffect(() => {
    let cancelled = false;

    const loadInitialSnapshot = async () => {
      setAccountLoading(true);
      setAccountError(null);

      try {
        const snapshot = await fetchAccountSnapshot();
        if (!cancelled) {
          setAccountSnapshot(snapshot);
        }
      } catch (error) {
        if (!cancelled) {
          setAccountSnapshot(null);
          setAccountError(readApiErrorMessage(error, "账户额度加载失败，请稍后重试。"));
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

  useEffect(() => {
    let cancelled = false;

    const loadOpenClawInstance = async () => {
      setOpenClawLoading(true);
      setOpenClawLoadError(null);

      try {
        const response = await api.clawhost.list({ page: 1, limit: 1 });
        if (cancelled) {
          return;
        }

        const latestInstance = response.data.items[0] ?? null;
        setOpenClawInstance(latestInstance);
        if (latestInstance) {
          setOpenClawPreference("enable");
        }
      } catch (error) {
        if (!cancelled) {
          setOpenClawLoadError(readApiErrorMessage(error, "OpenClaw 状态加载失败，请稍后重试。"));
        }
      } finally {
        if (!cancelled) {
          setOpenClawLoading(false);
        }
      }
    };

    void loadOpenClawInstance();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadTeamSetup = async () => {
      if (!authUser?.orgId) {
        if (!cancelled) {
          setOrgMembers(authUser ? [authUser] : []);
          setPendingInvites([]);
          setTeamError(null);
          setTeamLoading(false);
        }
        return;
      }

      setTeamLoading(true);
      setTeamError(null);

      const [membersResult, invitesResult] = await Promise.allSettled([
        api.org.members(),
        api.auth.enterpriseInvites.list(),
      ]);

      if (cancelled) {
        return;
      }

      if (membersResult.status === "fulfilled") {
        setOrgMembers(membersResult.value.data);
      } else {
        setOrgMembers([]);
      }

      if (invitesResult.status === "fulfilled") {
        setPendingInvites(invitesResult.value.data);
      } else {
        setPendingInvites([]);
      }

      if (membersResult.status === "rejected" && invitesResult.status === "rejected") {
        setTeamError(readApiErrorMessage(membersResult.reason, "团队成员加载失败，请稍后重试。"));
      } else if (membersResult.status === "rejected") {
        setTeamError(readApiErrorMessage(membersResult.reason, "成员列表加载失败，请稍后重试。"));
      } else if (invitesResult.status === "rejected") {
        setTeamError(readApiErrorMessage(invitesResult.reason, "邀请记录加载失败，请稍后重试。"));
      } else {
        setTeamError(null);
      }

      setTeamLoading(false);
    };

    void loadTeamSetup();

    return () => {
      cancelled = true;
    };
  }, [authUser]);

  const refreshAccountSnapshot = async (notifyOnSuccess = false) => {
    setAccountLoading(true);
    setAccountError(null);

    try {
      const snapshot = await fetchAccountSnapshot();
      setAccountSnapshot(snapshot);
      if (notifyOnSuccess) {
        toast.success("账户额度已刷新");
      }
    } catch (error) {
      setAccountError(readApiErrorMessage(error, "账户额度加载失败，请稍后重试。"));
    } finally {
      setAccountLoading(false);
    }
  };

  const refreshTeamSetup = async (notifyOnSuccess = false) => {
    if (!hasEnterpriseWorkspace) {
      setOrgMembers(authUser ? [authUser] : []);
      setPendingInvites([]);
      return;
    }

    setTeamLoading(true);
    setTeamError(null);

    try {
      const [membersResponse, invitesResponse] = await Promise.all([
        api.org.members(),
        api.auth.enterpriseInvites.list(),
      ]);
      setOrgMembers(membersResponse.data);
      setPendingInvites(invitesResponse.data);
      if (notifyOnSuccess) {
        toast.success("团队成员信息已刷新");
      }
    } catch (error) {
      setTeamError(readApiErrorMessage(error, "团队成员加载失败，请稍后重试。"));
    } finally {
      setTeamLoading(false);
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
      setProfileError(readApiErrorMessage(error, "行业保存失败，请稍后重试。"));
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
      void refreshTeamSetup();
      void refreshAccountSnapshot();
    } catch (error) {
      setBrandError(readApiErrorMessage(error, "品牌创建失败，请稍后重试。"));
    } finally {
      setBrandSubmitting(false);
    }
  };

  const handleInviteMember = async () => {
    if (!hasEnterpriseWorkspace) {
      toast.message("当前账号未绑定企业空间", {
        description: "个人体验账号暂不需要邀请团队成员，可以直接继续下一步。",
      });
      return;
    }

    if (!invitePhone || invitePhone.length < 11) {
      setInviteError("请输入有效的团队成员手机号。");
      return;
    }

    setInviteSubmitting(true);
    setInviteError(null);

    try {
      const response = await api.auth.enterpriseInvites.invite({
        phone: invitePhone,
        role: inviteRole,
      });
      setPendingInvites((current) => [response.data, ...current.filter((item) => item.id !== response.data.id)]);
      setInvitePhone("");
      toast.success("邀请已发送", {
        description: `${invitePhone} 已收到企业加入邀请短信。`,
      });
    } catch (error) {
      setInviteError(readApiErrorMessage(error, "邀请成员失败，请稍后重试。"));
    } finally {
      setInviteSubmitting(false);
    }
  };

  const handleContinueFromTeam = async () => {
    if (hasEnterpriseWorkspace && orgMembers.length === 0 && pendingInvites.length === 0) {
      toast.message("当前还没有团队成员", {
        description: "你可以现在发送邀请，也可以稍后在管理员后台继续添加成员。",
      });
    }

    setStep(4);
  };

  const refreshOpenClawInstance = async (instanceId: string) => {
    const instanceResponse = await api.clawhost.get(instanceId);

    try {
      const statusResponse = await api.clawhost.status(instanceId);
      setOpenClawInstance({
        ...instanceResponse.data,
        status: statusResponse.data.status,
        healthStatus: statusResponse.data.healthStatus,
      });
    } catch {
      setOpenClawInstance(instanceResponse.data);
    }
  };

  const handleConfigureOpenClaw = async () => {
    if (openClawPreference === "skip") {
      setOpenClawError(null);
      setStep(5);
      return;
    }

    setOpenClawSubmitting(true);
    setOpenClawError(null);

    try {
      let instance = openClawInstance;

      if (!instance) {
        const created = await api.clawhost.create({
          clientName: resolveOpenClawClientName([
            createdBrand?.name,
            authUser?.orgId,
            authUser?.name,
            authUser?.phone,
          ]),
          config: DEFAULT_OPENCLAW_INSTANCE_CONFIG,
          deploymentMode: "byoc",
          requestedImChannel: "feishu",
        });
        instance = created.data;
        setOpenClawInstance(instance);
        toast.success("OpenClaw 实例已创建");
      }

      if (!hasOpenClawSkill(instance)) {
        await api.clawhost.installSkill(instance.instanceId, {
          skillId: OPENCLAW_MEDIACLAW_CLIENT_SKILL_ID,
          version: OPENCLAW_MEDIACLAW_CLIENT_VERSION,
        });
        toast.success("mediaclaw-client 技能已安装");
      }

      await refreshOpenClawInstance(instance.instanceId);
      setStep(5);
    } catch (error) {
      setOpenClawError(readApiErrorMessage(error, "OpenClaw 启用失败，请稍后重试。"));
    } finally {
      setOpenClawSubmitting(false);
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
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-xs font-medium text-fuchsia-100">
              <Users className="h-3.5 w-3.5" />
              Step 3
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              邀请你的团队成员
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
              企业管理员可以直接邀请运营和员工加入当前组织。这里会展示真实成员列表和待接受邀请，完成企业开通闭环。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!hasEnterpriseWorkspace ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5 text-sm leading-7 text-slate-300">
                当前账号还没有企业空间，团队邀请仅对企业注册用户开放。你可以继续后续步骤，或稍后升级为企业版后再邀请成员。
              </div>
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="space-y-2">
                    <Label htmlFor="invite-phone" className="text-slate-100">
                      成员手机号
                    </Label>
                    <Input
                      id="invite-phone"
                      placeholder="请输入要邀请的手机号"
                      className="h-12 border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
                      value={invitePhone}
                      onChange={(event) => {
                        setInvitePhone(event.target.value.replace(/\D/g, "").slice(0, 11));
                        if (inviteError) {
                          setInviteError(null);
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role" className="text-slate-100">
                      成员角色
                    </Label>
                    <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as typeof inviteRole)}>
                      <SelectTrigger id="invite-role" className="h-12 w-full border-white/10 bg-white/[0.04] text-white">
                        <SelectValue placeholder="选择角色" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEMBER_ROLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="gap-2" onClick={handleInviteMember} disabled={inviteSubmitting}>
                    {inviteSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                    发送邀请
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                    onClick={() => {
                      void refreshTeamSetup(true);
                    }}
                    disabled={teamLoading}
                  >
                    {teamLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                    刷新团队信息
                  </Button>
                </div>

                {inviteError ? (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-100">
                    {inviteError}
                  </div>
                ) : null}

                {teamError ? (
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-50">
                    {teamError}
                  </div>
                ) : null}

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white">当前组织成员</div>
                        <p className="mt-1 text-xs leading-5 text-slate-400">来自真实 `/api/v1/org/members` 数据。</p>
                      </div>
                      <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                        {orgMembers.length} 人
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {teamLoading ? (
                        <Skeleton className="h-24 w-full bg-white/10" />
                      ) : orgMembers.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm leading-6 text-slate-400">
                          当前还没有其他成员加入，发送邀请后会在这里看到他们。
                        </div>
                      ) : (
                        orgMembers.map((member) => (
                          <div key={member.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-white">{member.name || member.phone}</div>
                                <div className="mt-1 text-xs text-slate-400">{member.phone || "未填写手机号"}</div>
                              </div>
                              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                                {member.roleLabel}
                              </span>
                            </div>
                            <div className="mt-3 text-xs text-slate-400">
                              加入时间 {formatDate(member.createdAt || member.lastLoginAt)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white">待接受邀请</div>
                        <p className="mt-1 text-xs leading-5 text-slate-400">企业成员收到短信验证码后即可加入当前组织。</p>
                      </div>
                      <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                        {pendingInvites.length} 条
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {teamLoading ? (
                        <Skeleton className="h-24 w-full bg-white/10" />
                      ) : pendingInvites.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm leading-6 text-slate-400">
                          当前没有待接受邀请。你可以先邀请 1-2 位运营成员，后续在 Dashboard 里一起协作。
                        </div>
                      ) : (
                        pendingInvites.map((invite) => (
                          <div key={invite.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-white">{invite.phone}</div>
                                <div className="mt-1 text-xs text-slate-400">
                                  {invite.roleLabel} · {invite.status === "pending" ? "等待接受" : invite.status}
                                </div>
                              </div>
                              <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-100">
                                {formatDate(invite.expiresAt)}
                              </span>
                            </div>
                            <div className="mt-3 text-xs text-slate-400">
                              邀请时间 {formatDate(invite.invitedAt)} · 角色 {formatUserRoleLabel(invite.role)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="outline" size="lg" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]" onClick={() => setStep(2)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
              <Button size="lg" className="gap-2" onClick={() => void handleContinueFromTeam()}>
                <ChevronRight className="h-4 w-4" />
                继续下一步
              </Button>
            </div>
          </CardContent>
        </GlassCard>
      );
    }

    if (step === 4) {
      return (
        <GlassCard>
          <CardHeader className="pb-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-100">
              <Bot className="h-3.5 w-3.5" />
              Step 4
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              是否启用 AI 助手（OpenClaw）
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
              启用后会直接创建 OpenClaw 实例，并为它安装 `mediaclaw-client` 技能；如果你只想先用 Web 面板，也可以稍后在设置里再开通。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setOpenClawPreference("enable")}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-all duration-200",
                  openClawPreference === "enable"
                    ? "border-cyan-400/40 bg-cyan-500/12 shadow-[0_20px_50px_-34px_rgba(34,211,238,0.75)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold text-white">启用 OpenClaw（推荐）</div>
                    <p className="mt-2 text-sm leading-6 text-slate-300/80">
                      自动创建实例、安装客户端技能，并在后续设置页里持续查看运行状态与连接信息。
                    </p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-100">
                    <Bot className="h-5 w-5" />
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOpenClawPreference("skip")}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-all duration-200",
                  openClawPreference === "skip"
                    ? "border-white/25 bg-white/[0.08]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]",
                )}
              >
                <div className="text-base font-semibold text-white">暂不启用，仅用 Web 面板</div>
                <p className="mt-2 text-sm leading-6 text-slate-300/80">
                  继续使用当前控制台流程，不创建 OpenClaw 实例。后续仍可在设置页一键开通。
                </p>
              </button>
            </div>

            {openClawLoading ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-slate-300">
                正在检查当前账号下是否已有 OpenClaw 实例…
              </div>
            ) : null}

            {!openClawLoading && openClawInstance ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm uppercase tracking-[0.22em] text-emerald-200/80">OpenClaw Ready</div>
                    <div className="mt-2 text-2xl font-black tracking-tight text-white">{openClawInstance.clientName}</div>
                    <p className="mt-2 text-sm leading-6 text-emerald-50/80">
                      当前状态：{formatOpenClawStatus(openClawInstance.status)}
                      {mediaclawClientInstalled ? " · 已安装 mediaclaw-client" : " · 尚未安装 mediaclaw-client"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/15 px-3 py-2 text-xs text-emerald-50">
                    {openClawInstance.instanceId}
                  </div>
                </div>
              </div>
            ) : null}

            {!openClawLoading && !openClawInstance && openClawLoadError ? (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-50">
                {openClawLoadError}
              </div>
            ) : null}

            {openClawPreference === "enable" ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5 text-sm leading-7 text-slate-300">
                将按默认规格开通实例：CPU {DEFAULT_OPENCLAW_INSTANCE_CONFIG.cpu} · 内存 {DEFAULT_OPENCLAW_INSTANCE_CONFIG.memory} · 存储 {DEFAULT_OPENCLAW_INSTANCE_CONFIG.storage}。
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5 text-sm leading-7 text-slate-300">
                你当前选择仅使用 Web 面板，不会触发任何 OpenClaw 资源创建。
              </div>
            )}

            {openClawError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-100">
                {openClawError}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="outline" size="lg" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]" onClick={() => setStep(3)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
              <Button
                size="lg"
                className="gap-2"
                onClick={handleConfigureOpenClaw}
                disabled={openClawSubmitting || openClawLoading}
              >
                {openClawSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                {openClawPreference === "enable"
                  ? mediaclawClientInstalled
                    ? "继续下一步"
                    : "启用并继续"
                  : "跳过并继续"}
              </Button>
            </div>
          </CardContent>
        </GlassCard>
      );
    }

    if (step === 5) {
      return (
        <GlassCard>
          <CardHeader className="pb-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-100">
              <Coins className="h-3.5 w-3.5" />
              Step 5
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

            {!accountLoading && !accountSnapshot && accountError ? (
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
                {accountError ? (
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
                        hint="这是当前统计周期内的真实额度消耗，会随账户使用情况实时变化。"
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
              <Button variant="outline" size="lg" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]" onClick={() => setStep(4)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
              <Button size="lg" className="gap-2" onClick={() => setStep(6)} disabled={accountLoading || !accountSnapshot}>
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
            Step 6
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            环境已经准备好
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
            行业信息已保存，品牌已创建，团队邀请入口已就绪，OpenClaw 选择已确认，账户余额也已用真实快照确认。最后一步直接进入 `/dashboard`。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-5">
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
              label="团队成员"
              value={
                hasEnterpriseWorkspace
                  ? `${orgMembers.length} 人 / ${pendingInvites.length} 邀请`
                  : "个人空间"
              }
              hint={
                hasEnterpriseWorkspace
                  ? "成员列表和待接受邀请都来自真实组织接口。"
                  : "个人体验账号不需要团队协作配置。"
              }
              icon={Users}
            />
            <MetricCard
              label="OpenClaw"
              value={openClawPreference === "skip" ? "暂不启用" : formatOpenClawStatus(openClawInstance?.status)}
              hint={
                openClawPreference === "skip"
                  ? "当前账号将继续只使用 Web 控制台。"
                  : mediaclawClientInstalled
                    ? "已安装 mediaclaw-client，可在设置页继续管理。"
                    : "实例已记录，可稍后在设置页继续补齐。"
              }
              icon={Bot}
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
            <Button variant="outline" size="lg" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]" onClick={() => setStep(5)}>
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
      <MetadataUpdater title="欢迎加入" description="完成真实 onboarding，配置行业、品牌、OpenClaw 和试用额度。" />

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
                  title="团队成员"
                  description={
                    hasEnterpriseWorkspace
                      ? orgMembers.length > 0 || pendingInvites.length > 0
                        ? `已加入 ${orgMembers.length} 人，待接受邀请 ${pendingInvites.length} 个。`
                        : "当前还没有团队成员，可以继续邀请。"
                      : "当前为个人体验账号，无需配置企业团队。"
                  }
                />
                <StepStatusItem
                  step={4}
                  currentStep={step}
                  title="OpenClaw 助手"
                  description={
                    openClawPreference === "skip"
                      ? "当前选择仅使用 Web 面板。"
                      : openClawInstance
                        ? `${formatOpenClawStatus(openClawInstance.status)} · ${mediaclawClientInstalled ? "mediaclaw-client 已安装" : "等待安装技能"}`
                        : openClawLoading
                          ? "正在检查现有 OpenClaw 实例。"
                          : openClawLoadError || "等待你决定是否启用 OpenClaw。"
                  }
                />
                <StepStatusItem
                  step={5}
                  currentStep={step}
                  title="试用额度"
                  description={
                    accountSnapshot
                      ? `可用余额 ${formatCompactNumber(accountSnapshot.credits.remaining)}，资源包 ${formatCompactNumber(accountSnapshot.packs.length)} 个。`
                      : accountLoading
                        ? "正在拉取账户快照。"
                        : accountError || "等待拉取账户快照。"
                  }
                />
                <StepStatusItem
                  step={6}
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

                {!accountLoading && !accountSnapshot && accountError ? (
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
