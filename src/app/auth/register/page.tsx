"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Video, ArrowRight, Smartphone, Mail, Lock, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { setCookie } from "@/lib/cookies";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password, company })
      });

      if (!res.ok) {
        throw new Error("注册失败，可能账号已存在");
      }

      const data = await res.json();
      
      if (data.token) {
        setCookie("auth_token", data.token, 7);
      }
      
      toast.success("注册成功！欢迎使用 MediaClaw");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "注册请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex flex-col justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00e8b8] rounded-full blur-[150px] opacity-10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[150px] opacity-10 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <Link href="/" className="flex items-center gap-3 font-black text-xl tracking-tight text-white mb-10 hover:scale-105 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-[#00e8b8] flex items-center justify-center text-[#0b0f1a]">
            <Video className="w-6 h-6" />
          </div>
          MediaClaw
        </Link>

        <div className="w-full max-w-md bg-white/[0.02] border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">创建账号</h2>
            <p className="text-white/50 text-sm">开始您的 AI 品牌占位与爆款内容之旅</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#00e8b8] transition-colors" />
              <Input 
                type="text"
                placeholder="手机号或邮箱" 
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
                className="pl-10 h-12 bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" 
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#00e8b8] transition-colors" />
              <Input 
                type="password"
                placeholder="设置密码" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 h-12 bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" 
              />
            </div>

            <div className="relative group">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#00e8b8] transition-colors" />
              <Input 
                type="text"
                placeholder="公司或品牌名称（选填）" 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="pl-10 h-12 bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" 
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold text-base mt-2 shadow-[0_0_20px_rgba(0,232,184,0.15)] group">
              {loading ? "注册中..." : "免费注册"} 
              {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <p className="text-center text-sm text-white/40 mt-8">
            已有账号？{" "}
            <Link href="/auth/login" className="text-[#00e8b8] hover:text-white transition-colors font-medium">
              直接登录
            </Link>
          </p>
        </div>
        
        <p className="text-white/30 text-xs mt-12 text-center">
          注册即代表您同意 MediaClaw 的 <Link href="/terms" className="hover:text-white transition-colors">服务条款</Link> 与 <Link href="/privacy" className="hover:text-white transition-colors">隐私政策</Link>
        </p>
      </div>
    </div>
  );
}
