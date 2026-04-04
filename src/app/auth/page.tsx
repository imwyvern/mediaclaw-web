"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Loader2, Mail, ShieldCheck, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetadataUpdater } from "@/components/metadata-updater";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { setCookie } from "@/lib/cookies";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

export default function AuthPage() {
  const router = useRouter();
  const [isLoginSendingCode, setIsLoginSendingCode] = useState(false);
  const [isLoginVerifying, setIsLoginVerifying] = useState(false);
  const [isRegisterSendingCode, setIsRegisterSendingCode] = useState(false);
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);
  const [isWechatRedirecting, setIsWechatRedirecting] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(0);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [registerTimer, setRegisterTimer] = useState(0);
  const [registerForm, setRegisterForm] = useState({
    orgName: "",
    industry: "",
    adminPhone: "",
    code: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});

  const login = useAuthStore((state) => state.login);
  const isLoginBusy = isLoginSendingCode || isLoginVerifying;
  const isRegisterBusy = isRegisterSendingCode || isRegisterSubmitting;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) interval = setInterval(() => setTimer((value) => value - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (registerTimer > 0) interval = setInterval(() => setRegisterTimer((value) => value - 1), 1000);
    return () => clearInterval(interval);
  }, [registerTimer]);

  const startTimer = () => setTimer(60);
  const startRegisterTimer = () => setRegisterTimer(60);

  const updateRegisterForm = (field: keyof typeof registerForm, value: string) => {
    setRegisterForm((current) => ({ ...current, [field]: value }));
    if (registerErrors[field]) setRegisterErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSendCode = async (event?: React.FormEvent | React.MouseEvent) => {
    event?.preventDefault();
    if (!phone || phone.length < 11) {
      toast.error("请输入有效的手机号");
      return;
    }

    setIsLoginSendingCode(true);
    try {
      await api.auth.sendCode(phone);
      startTimer();
      toast.success(`验证码已发送至 ${phone}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "验证码发送失败，请稍后重试");
    } finally {
      setIsLoginSendingCode(false);
    }
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length !== 6) {
      toast.error("请输入6位验证码");
      return;
    }
    if (!phone || phone.length < 11) {
      toast.error("请输入有效的手机号");
      return;
    }

    setIsLoginVerifying(true);
    try {
      const res = await api.auth.verifyCode(phone, code);
      const { accessToken, refreshToken, user, isNewUser } = res.data;

      setCookie("auth_token", accessToken, 7);
      setCookie("refresh_token", refreshToken, 7);
      login(user, accessToken);

      toast.success(isNewUser ? "注册成功，欢迎使用！" : "欢迎回来！");
      router.push(isNewUser ? "/dashboard/onboarding" : "/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "验证码校验失败，请稍后重试");
    } finally {
      setIsLoginVerifying(false);
    }
  };

  const handleRegisterSendCode = async () => {
    if (!registerForm.adminPhone || registerForm.adminPhone.length < 11) {
      setRegisterErrors((current) => ({ ...current, adminPhone: "请输入有效的管理员手机号" }));
      return;
    }

    setIsRegisterSendingCode(true);
    try {
      await api.auth.sendCode(registerForm.adminPhone);
      startRegisterTimer();
      toast.success(`验证码已发送至 ${registerForm.adminPhone}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "企业验证码发送失败，请稍后重试");
    } finally {
      setIsRegisterSendingCode(false);
    }
  };

  const validateRegisterForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!registerForm.orgName.trim()) nextErrors.orgName = "请输入企业名称";
    if (!registerForm.industry) nextErrors.industry = "请选择所属行业";
    if (!registerForm.adminPhone || registerForm.adminPhone.length < 11) nextErrors.adminPhone = "请输入有效的管理员手机号";
    if (registerForm.code.length !== 6) nextErrors.code = "请输入6位验证码";
    if (!agreedToTerms) nextErrors.terms = "请先同意服务协议与隐私政策";

    setRegisterErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateRegisterForm()) return;

    setIsRegisterSubmitting(true);
    try {
      await api.auth.verifyCode(registerForm.adminPhone, registerForm.code);

      const res = await api.auth.registerEnterprise({
        orgName: registerForm.orgName.trim(),
        industry: registerForm.industry,
        adminPhone: registerForm.adminPhone,
      });
      const { accessToken, refreshToken, user } = res.data;

      setCookie("auth_token", accessToken, 7);
      setCookie("refresh_token", refreshToken, 7);
      login(user, accessToken);

      toast.success("企业空间创建成功");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "企业空间创建失败，请稍后重试");
    } finally {
      setIsRegisterSubmitting(false);
    }
  };

  const handleWeChatLogin = async () => {
    if (typeof window === "undefined") {
      return;
    }

    setIsWechatRedirecting(true);
    try {
      const redirectUri = `${window.location.origin}/auth/wechat/callback`;
      const response = await api.auth.getWechatLoginUrl(redirectUri, "mediaclaw-web");
      const loginUrl = response.data.redirectUrl || response.data.url;
      if (!loginUrl) {
        throw new Error("微信登录地址生成失败");
      }

      window.location.assign(loginUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "微信登录暂不可用");
      setIsWechatRedirecting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full bg-background lg:overflow-hidden">
      <MetadataUpdater title="登录 / 注册" description="登录您的 MediaClaw 账号，开启自动化视频生产。" />

      <div className="relative flex w-full flex-col items-center overflow-y-auto py-12 lg:w-[55%] lg:justify-center lg:py-10 xl:w-[60%]">
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-56 bg-gradient-to-b from-primary/[0.08] to-transparent lg:block" />
        <div className="pointer-events-none absolute left-[-12%] top-24 hidden h-72 w-72 rounded-full bg-primary/[0.08] blur-3xl lg:block" />

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-4 sm:px-6 lg:px-10">
          <div className="mb-8 flex items-center justify-center gap-3 text-2xl font-bold tracking-tight text-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Video size={24} />
            </div>
            MediaClaw
          </div>

          <div className="w-full rounded-[28px] border border-border/60 bg-card/95 p-4 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:p-6">
            <Tabs value={mode} className="w-full flex-col" onValueChange={(value) => setMode(value as "login" | "register")}>
              <TabsList className="mb-8 grid h-12 w-full grid-cols-2 rounded-xl border border-border/60 bg-muted/50 p-1">
                <TabsTrigger value="login" className="rounded-lg text-sm font-medium transition-all">
                  个人登录
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg text-sm font-medium transition-all">
                  企业空间开通
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <div className="mb-8 space-y-3">
                  <div className="inline-flex w-fit items-center rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
                    手机验证码登录
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">欢迎回来</h1>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      输入手机号即可完成验证登录，首次验证会自动创建个人账号并同步进入控制台。
                    </p>
                  </div>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      手机号码
                    </Label>
                    <div className="flex rounded-xl shadow-sm">
                      <div className="flex shrink-0 items-center justify-center rounded-l-xl border border-r-0 border-input bg-muted/40 px-3 text-sm text-muted-foreground">
                        +86
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="请输入手机号"
                        aria-invalid={phone.length > 0 && phone.length < 11}
                        className="h-11 w-full rounded-l-none focus-visible:ring-1 focus-visible:ring-primary"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-medium">
                      验证码
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id="code"
                        type="text"
                        placeholder="6位数字验证码"
                        aria-invalid={code.length > 0 && code.length < 6}
                        className="h-11 min-w-0 flex-1 rounded-xl font-mono tracking-[0.3em] focus-visible:ring-1 focus-visible:ring-primary"
                        maxLength={6}
                        value={code}
                        onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                        required
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-11 shrink-0 rounded-xl px-5"
                        disabled={isLoginSendingCode || timer > 0}
                        onClick={() => void handleSendCode()}
                      >
                        {isLoginSendingCode ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : timer > 0 ? (
                          `${timer}s`
                        ) : (
                          "获取验证码"
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="h-12 w-full text-base mt-2" disabled={isLoginBusy}>
                    {isLoginVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "验证并登录"}
                  </Button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">其他登录方式</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full text-foreground"
                  onClick={() => void handleWeChatLogin()}
                  disabled={isWechatRedirecting}
                >
                  <svg className="mr-2 h-5 w-5 fill-[#07C160]" viewBox="0 0 24 24">
                    <path d="M8.225 3.518c-4.482 0-8.117 3.257-8.117 7.276 0 2.21 1.107 4.183 2.85 5.568-.158.577-1.026 2.05-1.066 2.12-.04.07-.028.163.03.22.035.035.093.06.15.06h.058c.07 0 2.378-.455 3.322-.922.88.243 1.81.378 2.773.378.11 0 .22-.004.332-.01-4.14-.383-7.406-3.418-7.406-7.143 0-3.95 3.69-7.152 8.24-7.152 4.55 0 8.24 3.202 8.24 7.152 0 .546-.07 1.074-.202 1.577 1.07.72 1.83 1.765 2.14 2.96.26-.64.407-1.343.407-2.078 0-5.51-5.188-9.978-11.583-9.978zm10.375 7.97c-3.64 0-6.59 2.645-6.59 5.908 0 1.795.898 3.398 2.314 4.522-.128.47-.833 1.666-.865 1.723-.033.056-.023.132.025.178.028.028.075.048.122.048h.047c.057 0 1.93-.37 2.698-.75.714.198 1.47.307 2.25.307 3.64 0 6.59-2.645 6.59-5.908s-2.95-5.908-6.59-5.908z" />
                  </svg>
                  {isWechatRedirecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  微信登录
                </Button>
              </TabsContent>

              <TabsContent value="register" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <div className="mb-8 space-y-3">
                  <div className="inline-flex w-fit items-center rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
                    企业账号注册
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">创建企业空间</h1>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      为团队开通统一工作台，集中管理成员、素材与自动化工作流，提交完成后即可进入企业控制台。
                    </p>
                  </div>
                </div>

                <form className="space-y-6" onSubmit={handleRegister}>
                  <section className="space-y-3 rounded-xl border border-border/60 bg-muted/[0.18] p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-sm font-semibold tracking-tight text-foreground">企业信息</h2>
                        <p className="text-sm leading-6 text-muted-foreground">
                          先确认企业名称和行业，方便系统为你的空间初始化默认流程模板。
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgName" className={`text-sm font-medium ${registerErrors.orgName ? "text-destructive" : ""}`}>
                        企业名称 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="orgName"
                        placeholder="营业执照或品牌名称"
                        aria-invalid={Boolean(registerErrors.orgName)}
                        className={`h-11 w-full rounded-xl ${registerErrors.orgName ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-1 focus-visible:ring-primary"}`}
                        value={registerForm.orgName}
                        onChange={(event) => updateRegisterForm("orgName", event.target.value)}
                      />
                      {registerErrors.orgName && <p className="text-xs text-destructive">{registerErrors.orgName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry" className={`text-sm font-medium ${registerErrors.industry ? "text-destructive" : ""}`}>
                        所属行业 <span className="text-destructive">*</span>
                      </Label>
                      <Select value={registerForm.industry} onValueChange={(value) => updateRegisterForm("industry", value ?? "")}>
                        <SelectTrigger
                          aria-invalid={Boolean(registerErrors.industry)}
                          className={`h-11 w-full rounded-xl ${registerErrors.industry ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive" : "focus-visible:ring-1 focus-visible:ring-primary"}`}
                        >
                          <SelectValue placeholder="选择所属行业" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ecommerce">电商零售</SelectItem>
                          <SelectItem value="media">新媒体/广告</SelectItem>
                          <SelectItem value="education">教育培训</SelectItem>
                          <SelectItem value="game">游戏动漫</SelectItem>
                          <SelectItem value="other">其他</SelectItem>
                        </SelectContent>
                      </Select>
                      {registerErrors.industry && <p className="text-xs text-destructive">{registerErrors.industry}</p>}
                    </div>
                  </section>

                  <section className="space-y-3 rounded-xl border border-border/60 bg-background p-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-sm font-semibold tracking-tight text-foreground">管理员验证</h2>
                        <p className="text-sm leading-6 text-muted-foreground">
                          用管理员手机号完成短信验证，后续安全提醒与成员邀请都会关联到这个账号。
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminPhone" className={`text-sm font-medium ${registerErrors.adminPhone ? "text-destructive" : ""}`}>
                        管理员手机号 <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex rounded-xl shadow-sm">
                        <div
                          className={`flex shrink-0 items-center justify-center rounded-l-xl border border-r-0 px-3 text-sm ${
                            registerErrors.adminPhone
                              ? "border-destructive bg-destructive/5 text-destructive"
                              : "border-input bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          +86
                        </div>
                        <Input
                          id="adminPhone"
                          type="tel"
                          placeholder="管理员手机号"
                          aria-invalid={Boolean(registerErrors.adminPhone)}
                          className={`h-11 w-full rounded-l-none ${registerErrors.adminPhone ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-1 focus-visible:ring-primary"}`}
                          value={registerForm.adminPhone}
                          onChange={(event) => updateRegisterForm("adminPhone", event.target.value.replace(/\D/g, "").slice(0, 11))}
                        />
                      </div>
                      {registerErrors.adminPhone && <p className="text-xs text-destructive">{registerErrors.adminPhone}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registerCode" className={`text-sm font-medium ${registerErrors.code ? "text-destructive" : ""}`}>
                        验证码 <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex gap-3">
                        <Input
                          id="registerCode"
                          placeholder="6位数字验证码"
                          aria-invalid={Boolean(registerErrors.code)}
                          className={`h-11 min-w-0 flex-1 rounded-xl font-mono tracking-[0.3em] ${registerErrors.code ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-1 focus-visible:ring-primary"}`}
                          maxLength={6}
                          value={registerForm.code}
                          onChange={(event) => updateRegisterForm("code", event.target.value.replace(/\D/g, "").slice(0, 6))}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-11 shrink-0 rounded-xl px-5"
                          disabled={isRegisterSendingCode || registerTimer > 0}
                          onClick={() => void handleRegisterSendCode()}
                        >
                          {isRegisterSendingCode ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : registerTimer > 0 ? (
                            `${registerTimer}s`
                          ) : (
                            "获取验证码"
                          )}
                        </Button>
                      </div>
                      {registerErrors.code ? (
                        <p className="text-xs text-destructive">{registerErrors.code}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">验证码仅用于本次企业空间开通校验。</p>
                      )}
                    </div>
                  </section>

                  <section className="space-y-3 rounded-xl border border-border/60 bg-muted/[0.16] p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-sm font-semibold tracking-tight text-foreground">协议确认</h2>
                        <p className="text-sm leading-6 text-muted-foreground">
                          确认开通条款后即可创建企业工作区，系统会自动初始化基础成员权限和默认素材目录。
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/20 p-4">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => {
                          setAgreedToTerms(checked === true);
                          if (registerErrors.terms && checked) {
                            setRegisterErrors((current) => ({ ...current, terms: "" }));
                          }
                        }}
                        className={`mt-0.5 ${registerErrors.terms ? "border-destructive data-[state=checked]:bg-destructive" : ""}`}
                      />
                      <div className="grid gap-1.5">
                        <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          我已阅读并同意 <a href="#" className="text-primary hover:underline">服务协议</a> 和 <a href="#" className="text-primary hover:underline">隐私政策</a>
                        </label>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          提交后，系统将为您初始化企业工作区。
                        </p>
                        {registerErrors.terms && <p className="text-xs text-destructive mt-1">{registerErrors.terms}</p>}
                      </div>
                    </div>

                    <Button type="submit" className="h-12 w-full text-base" disabled={isRegisterBusy}>
                      {isRegisterSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "开通企业空间"}
                    </Button>
                  </section>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-zinc-950 p-12 text-zinc-50 lg:flex lg:w-[45%] lg:flex-col lg:justify-between xl:w-[40%]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20 opacity-30 mix-blend-overlay" />
        <div className="absolute right-0 top-0 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/4 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] -translate-x-1/3 translate-y-1/3 rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="relative z-10">
          <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-zinc-300 backdrop-blur-sm">
            MediaClaw Enterprise
          </div>
        </div>

        <div className="relative z-10 w-full max-w-xl">
          <div className="space-y-6">
            <h2 className="text-4xl font-semibold tracking-tight text-zinc-50 xl:text-5xl xl:leading-[1.1]">
              把脚本、素材与分发放进同一条视频生产线
            </h2>
            <p className="text-lg leading-relaxed text-zinc-300">
              为品牌和运营团队提供统一的工作台，从选题生成、视频批量生产到多平台一键发布，全流程在线协同。
            </p>
          </div>

          <div className="mt-12 grid gap-6">
            <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <div className="font-medium text-zinc-100">全自动化视频生产</div>
                <div className="text-sm text-zinc-400">从脚本生成到剪辑包装，减少重复人工操作。</div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <div className="font-medium text-zinc-100">多平台统一分发</div>
                <div className="text-sm text-zinc-400">一次配置即可发布到多个内容渠道与账号矩阵。</div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <div className="font-medium text-zinc-100">企业级算力保障</div>
                <div className="text-sm text-zinc-400">适合团队协作、批量任务和高频内容投放场景。</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-6 text-sm text-zinc-400">
          <a href="#" className="transition-colors hover:text-zinc-100">
            © 2026 MediaClaw
          </a>
          <a href="#" className="transition-colors hover:text-zinc-100">
            帮助中心
          </a>
          <a href="mailto:support@mediaclaw.com" className="flex items-center gap-1 transition-colors hover:text-zinc-100">
            <Mail className="h-4 w-4" />
            联系我们
          </a>
        </div>
      </div>
    </div>
  );
}
