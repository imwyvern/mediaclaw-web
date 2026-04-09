"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Video, ArrowRight, Smartphone, Mail, Lock, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { setCookie } from "@/lib/cookies";

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [loading, setLoading] = useState(false);
  
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSendCode = () => {
    if (!phone) {
      toast.error("请输入手机号");
      return;
    }
    toast.success("验证码已发送");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = loginMethod === "phone" 
      ? { type: "phone", phone, code }
      : { type: "email", email, password };

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("登录失败，请检查您的凭证");
      }

      const data = await res.json();
      
      if (data.token) {
        setCookie("auth_token", data.token, 7);
      }
      
      toast.success("登录成功");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "登录请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex flex-col justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00e8b8] rounded-full blur-[150px] opacity-10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[150px] opacity-10 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <Link href="/" className="flex items-center gap-3 font-black text-xl tracking-tight text-white mb-10 hover:scale-105 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-[#00e8b8] flex items-center justify-center text-[#0b0f1a]">
            <Video className="w-6 h-6" />
          </div>
          MediaClaw
        </Link>

        <div className="w-full max-w-md bg-white/[0.02] border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">欢迎回来</h2>
            <p className="text-white/50 text-sm">登录 MediaClaw 控制台继续您的创作</p>
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl mb-8 border border-white/10">
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${loginMethod === 'phone' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white/80'}`}
              onClick={() => setLoginMethod('phone')}
            >
              验证码登录
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${loginMethod === 'email' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white/80'}`}
              onClick={() => setLoginMethod('email')}
            >
              密码登录
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {loginMethod === "phone" ? (
              <>
                <div className="relative group">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#00e8b8] transition-colors" />
                  <Input 
                    type="tel"
                    placeholder="请输入手机号" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" 
                  />
                </div>
                <div className="flex gap-3">
                  <div className="relative group flex-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#00e8b8] transition-colors" />
                    <Input 
                      placeholder="验证码" 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="pl-10 h-12 bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" 
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={handleSendCode} className="h-12 border-white/10 bg-white/5 text-white hover:bg-white/10">
                    获取验证码
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#00e8b8] transition-colors" />
                  <Input 
                    type="email"
                    placeholder="邮箱地址" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" 
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#00e8b8] transition-colors" />
                  <Input 
                    type="password"
                    placeholder="请输入密码" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" 
                  />
                </div>
              </>
            )}

            <Button type="submit" disabled={loading} className="w-full h-12 bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold text-base mt-2 shadow-[0_0_20px_rgba(0,232,184,0.15)] group">
              {loading ? "登录中..." : "登录"} 
              {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <p className="text-center text-sm text-white/40 mt-8">
            还没有账号？{" "}
            <Link href="/auth/register" className="text-[#00e8b8] hover:text-white transition-colors font-medium">
              立即注册
            </Link>
          </p>
        </div>
        
        <p className="text-white/30 text-xs mt-12 text-center">
          登录即代表您同意 MediaClaw 的 <Link href="/terms" className="hover:text-white transition-colors">服务条款</Link> 与 <Link href="/privacy" className="hover:text-white transition-colors">隐私政策</Link>
        </p>
      </div>
    </div>
  );
}
