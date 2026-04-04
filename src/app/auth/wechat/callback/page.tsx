"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { MetadataUpdater } from "@/components/metadata-updater";
import { api, readApiErrorMessage } from "@/lib/api";
import { setCookie } from "@/lib/cookies";
import { useAuthStore } from "@/lib/store";

function WechatAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    const code = searchParams.get("code")?.trim() || "";

    if (!code) {
      toast.error("微信授权失败，缺少 code");
      router.replace("/auth");
      return;
    }

    void (async () => {
      try {
        const response = await api.auth.wechatCallback(code);
        const { accessToken, refreshToken, user, isNewUser } = response.data;

        setCookie("auth_token", accessToken, 7);
        setCookie("refresh_token", refreshToken, 7);
        login(user, accessToken);

        toast.success(isNewUser ? "微信账号已创建并登录" : "微信登录成功");
        router.replace(isNewUser ? "/dashboard/onboarding" : "/dashboard");
      } catch (error) {
        toast.error(readApiErrorMessage(error, "微信登录失败，请稍后重试"));
        router.replace("/auth");
      }
    })();
  }, [login, router, searchParams]);

  return (
    <AuthLoadingShell />
  );
}

function AuthLoadingShell() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <MetadataUpdater title="微信登录中" description="正在完成微信授权登录。" />
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border/60 bg-card/95 px-10 py-12 text-center shadow-xl">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-foreground">正在完成微信登录</h1>
          <p className="text-sm text-muted-foreground">授权成功后会自动跳转到你的工作台。</p>
        </div>
      </div>
    </div>
  );
}

export default function WechatAuthCallbackPage() {
  return (
    <Suspense fallback={<AuthLoadingShell />}>
      <WechatAuthCallbackContent />
    </Suspense>
  );
}
