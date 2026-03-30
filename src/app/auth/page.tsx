"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Video, ArrowRight, Loader2, Phone, ShieldCheck, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(0);
  const [mode, setMode] = useState<"login" | "register">("login");

  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const startTimer = () => setTimer(60);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 11) {
      toast.error("请输入有效的手机号");
      return;
    }
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      setStep("code");
      startTimer();
      toast.success("验证码已发送至 " + phone);
    }, 1000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("请输入6位验证码");
      return;
    }
    setIsLoading(true);
    // Mock login
    setTimeout(() => {
      login({ 
        id: "usr_1", 
        name: phone.slice(-4), 
        email: "", 
        phone, 
        role: "user" 
      }, "mock_token");
      setIsLoading(false);
      toast.success("欢迎回来！");
      router.push("/dashboard/onboarding");
    }, 1500);
  };

  const handleWeChatLogin = () => {
    setIsLoading(true);
    toast.info("正在跳转至微信授权...");
    
    // Mock OAuth Redirect
    setTimeout(() => {
      // Simulate callback with URL params
      const mockWeChatCode = "wechat_code_123";
      toast.success("微信授权成功！");
      
      // Mock login with WeChat
      setTimeout(() => {
        login({ 
          id: "usr_wechat", 
          name: "微信用户", 
          email: "", 
          phone: "", 
          role: "user",
          wechatId: "wx_openid_123"
        }, "mock_wechat_token");
        setIsLoading(false);
        router.push("/dashboard/onboarding");
      }, 1000);
    }, 1500);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-24 w-full max-w-xl mx-auto lg:mx-0">
        <div className="flex items-center gap-2 font-bold text-xl mb-12">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <Video size={18} />
          </div>
          MediaClaw
        </div>

        <Tabs defaultValue="login" className="w-full" onValueChange={(v) => setMode(v as any)}>
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/50">
            <TabsTrigger value="login" className="text-sm">个人登录</TabsTrigger>
            <TabsTrigger value="register" className="text-sm">企业注册</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-3xl font-bold tracking-tight">手机号登录</CardTitle>
                <CardDescription className="text-base">验证即注册，未注册手机号验证后将自动创建账号。</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0 pt-4">
                {step === "phone" ? (
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">手机号码</Label>
                      <div className="flex">
                        <div className="flex items-center justify-center px-4 border border-r-0 border-input rounded-l-md bg-muted text-muted-foreground text-sm">
                          +86
                        </div>
                        <Input 
                          id="phone" 
                          type="tel" 
                          placeholder="请输入手机号" 
                          className="rounded-l-none text-lg h-12"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 text-base mt-2" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "获取验证码"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerify} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="code">验证码</Label>
                        <button 
                          type="button" 
                          onClick={() => setStep("phone")}
                          className="text-xs text-primary hover:underline"
                        >
                          更换手机号
                        </button>
                      </div>
                      <Input 
                        id="code" 
                        type="text" 
                        placeholder="请输入6位验证码" 
                        className="text-center text-2xl tracking-[0.5em] h-14 font-mono"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        required
                        autoFocus
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 text-base mt-2" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "验证并登录"}
                    </Button>
                    <div className="text-center">
                      <Button 
                        variant="link" 
                        type="button" 
                        disabled={timer > 0 || isLoading}
                        onClick={handleSendCode}
                        className="text-sm"
                      >
                        {timer > 0 ? `${timer}秒后重发` : "重新获取验证码"}
                      </Button>
                    </div>
                  </form>
                )}

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">其他登录方式</span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12 border-[#07C160] text-[#07C160] hover:bg-[#07C160] hover:text-white transition-colors"
                  onClick={handleWeChatLogin}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24">
                    <path d="M8.225 3.518c-4.482 0-8.117 3.257-8.117 7.276 0 2.21 1.107 4.183 2.85 5.568-.158.577-1.026 2.05-1.066 2.12-.04.07-.028.163.03.22.035.035.093.06.15.06h.058c.07 0 2.378-.455 3.322-.922.88.243 1.81.378 2.773.378.11 0 .22-.004.332-.01-4.14-.383-7.406-3.418-7.406-7.143 0-3.95 3.69-7.152 8.24-7.152 4.55 0 8.24 3.202 8.24 7.152 0 .546-.07 1.074-.202 1.577 1.07.72 1.83 1.765 2.14 2.96.26-.64.407-1.343.407-2.078 0-5.51-5.188-9.978-11.583-9.978zm10.375 7.97c-3.64 0-6.59 2.645-6.59 5.908 0 1.795.898 3.398 2.314 4.522-.128.47-.833 1.666-.865 1.723-.033.056-.023.132.025.178.028.028.075.048.122.048h.047c.057 0 1.93-.37 2.698-.75.714.198 1.47.307 2.25.307 3.64 0 6.59-2.645 6.59-5.908s-2.95-5.908-6.59-5.908z"/>
                  </svg>
                  微信扫码登录
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-3xl font-bold tracking-tight">申请企业空间</CardTitle>
                <CardDescription className="text-base">享受更强大的算力支持与团队协作功能。</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0 pt-4">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">企业名称</Label>
                    <Input id="orgName" placeholder="例如：某某科技有限公司" className="h-12" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">所属行业</Label>
                    <Select>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="请选择行业" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ecommerce">电商零售</SelectItem>
                        <SelectItem value="media">新媒体/广告</SelectItem>
                        <SelectItem value="education">教育培训</SelectItem>
                        <SelectItem value="game">游戏动漫</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPhone">管理员手机号</Label>
                    <Input id="adminPhone" type="tel" placeholder="请输入手机号" className="h-12" required />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input placeholder="验证码" className="h-12" />
                    </div>
                    <Button variant="outline" type="button" className="h-12 px-4 whitespace-nowrap">
                      获取验证码
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="terms" />
                    <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground">
                      我已阅读并同意 <a href="#" className="text-primary hover:underline">《服务协议》</a> 和 <a href="#" className="text-primary hover:underline">《隐私政策》</a>
                    </label>
                  </div>
                  <Button type="button" className="w-full h-12 text-base mt-4" onClick={() => toast.success("申请已提交，我们将尽快与您联系")}>
                    提交注册申请
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <p>没有账号？ <button onClick={() => {}} className="text-primary font-medium hover:underline">立即注册</button></p>
          ) : (
            <p>已有企业账号？ <button onClick={() => {}} className="text-primary font-medium hover:underline">点此登录</button></p>
          )}
        </div>
      </div>
      
      <div className="hidden lg:flex bg-primary/5 flex-col justify-between p-12 border-l relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div />
        <div className="max-w-md mx-auto relative z-10">
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>全自动化视频生产</span>
            </div>
            <div className="flex items-center gap-2 text-primary font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>多平台一键分发</span>
            </div>
            <div className="flex items-center gap-2 text-primary font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>企业级算力保障</span>
            </div>
          </div>
          <blockquote className="space-y-6">
            <p className="text-3xl font-medium leading-snug tracking-tight">
              "MediaClaw 为我们的新媒体矩阵提效了 300% 以上，是目前市面上最专业的视频基建方案。"
            </p>
            <footer className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-muted border overflow-hidden relative">
                <Image src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" fill className="object-cover" />
              </div>
              <div>
                <div className="font-semibold">张经理</div>
                <div className="text-sm text-muted-foreground">某知名电商代运营 负责人</div>
              </div>
            </footer>
          </blockquote>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground z-10">
          <a href="#" className="hover:text-foreground transition-colors">条款</a>
          <a href="#" className="hover:text-foreground transition-colors">隐私</a>
          <a href="#" className="hover:text-foreground transition-colors">帮助</a>
        </div>
      </div>
    </div>
  );
}
