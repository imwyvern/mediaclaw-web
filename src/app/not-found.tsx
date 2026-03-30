"use client";

import Link from "next/link";
import { Video, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary animate-bounce">
            <Video size={40} />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-7xl font-black tracking-tighter text-primary">404</h1>
          <h2 className="text-2xl font-bold tracking-tight">页面未找到</h2>
          <p className="text-muted-foreground">
            抱歉，您访问的页面不存在或已被移除。请检查链接地址是否正确。
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button variant="outline" className="flex-1 gap-2" render={<Link href="/" />}>
            <ArrowLeft size={18} /> 返回首页
          </Button>
          <Button className="flex-1 gap-2" render={<Link href="/dashboard" />}>
            <Home size={18} /> 回到工作台
          </Button>
        </div>
      </div>
      
      <footer className="absolute bottom-8 text-sm text-muted-foreground">
        © 2026 MediaClaw Video Infrastructure
      </footer>
    </div>
  );
}
