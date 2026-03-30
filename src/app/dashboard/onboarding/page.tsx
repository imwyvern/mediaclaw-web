"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, 
  ChevronRight, 
  Upload, 
  Video, 
  Sparkles, 
  Building2, 
  User, 
  LayoutGrid, 
  ArrowRight,
  PartyPopper,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState<"individual" | "enterprise" | null>(null);
  const [loading, setLoading] = useState(false);

  const nextStep = () => {
    if (step === 4) {
      router.push("/dashboard");
      return;
    }
    setStep(step + 1);
    if (step === 3) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const skip = () => router.push("/dashboard");

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center py-12 px-4">
      <div className="max-w-3xl w-full">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4 px-1">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Step {step} of 4</span>
            <Button variant="ghost" size="sm" onClick={skip} className="text-muted-foreground">跳过</Button>
          </div>
          <Progress value={(step / 4) * 100} className="h-2" />
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight">欢迎加入 MediaClaw!</h1>
              <p className="text-xl text-muted-foreground">首先，请选择最适合您的使用场景</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card 
                className={`cursor-pointer transition-all border-2 hover:border-primary/50 ${plan === "individual" ? "border-primary bg-primary/5 shadow-md shadow-primary/10" : ""}`}
                onClick={() => setPlan("individual")}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                    <User size={32} />
                  </div>
                  <h3 className="text-xl font-bold">个人创作者</h3>
                  <p className="text-muted-foreground">灵活的按需计费，适合自由职业者与视频博主。</p>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-all border-2 hover:border-primary/50 ${plan === "enterprise" ? "border-primary bg-primary/5 shadow-md shadow-primary/10" : ""}`}
                onClick={() => setPlan("enterprise")}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                    <Building2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold">企业/团队</h3>
                  <p className="text-muted-foreground">强大的协作功能，适合内容矩阵与营销机构。</p>
                </CardContent>
              </Card>
            </div>
            <Button size="lg" className="w-full h-14 text-lg" disabled={!plan} onClick={nextStep}>
              下一步 <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step 2: Brand */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight">创建您的首个品牌</h1>
              <p className="text-xl text-muted-foreground">我们将基于此为您定制生成的视频风格</p>
            </div>
            <Card>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <Label>品牌 Logo</Label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer group">
                      <Upload className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-medium">上传</span>
                    </div>
                    <div className="flex-1 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">点击或拖拽上传</p>
                      <p>支持 PNG, SVG (建议 512x512px)</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="b-name">品牌名称</Label>
                    <Input id="b-name" placeholder="例如：MediaClaw Official" className="h-12" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="b-ind">行业分类</Label>
                    <Select>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="选择行业" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">科技/软件</SelectItem>
                        <SelectItem value="fashion">时尚/美妆</SelectItem>
                        <SelectItem value="food">餐饮/美食</SelectItem>
                        <SelectItem value="travel">旅游/户外</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-4">
              <Button size="lg" variant="outline" className="flex-1 h-14" onClick={() => setStep(1)}>返回</Button>
              <Button size="lg" className="flex-[2] h-14" onClick={nextStep}>确认并继续</Button>
            </div>
          </div>
        )}

        {/* Step 3: Free Trial */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight">体验自动化生产</h1>
              <p className="text-xl text-muted-foreground">上传一段视频素材，看看 AI 能为你做什么</p>
            </div>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto text-primary-foreground shadow-lg shadow-primary/20">
                  <Video size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">上传待处理素材</h3>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    上传您的产品展示、访谈或口播素材，我们将自动为您生成符合品牌调性的爆款短视频。
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button size="lg" className="px-12 h-14 relative overflow-hidden group">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={() => {
                      setLoading(true);
                      setTimeout(() => {
                        setLoading(false);
                        nextStep();
                      }, 3000);
                    }} />
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2 w-5 h-5" />}
                    {loading ? "正在处理中..." : "选择视频文件"}
                  </Button>
                </div>
                {loading && <p className="text-sm font-medium text-primary animate-pulse italic">AI 正在根据品牌风格解析视频并生成预览...</p>}
              </CardContent>
            </Card>
            <div className="text-center">
              <Button variant="link" className="text-muted-foreground" onClick={skip}>暂不尝试，直接进入控制台</Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500 text-center py-12">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-emerald-500/20 mb-8">
              <Check size={48} strokeWidth={3} />
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tight">太棒了，准备就绪!</h1>
              <p className="text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
                您的账号已配置完成。现在，您可以开始批量生产属于您的品牌爆款视频了。
              </p>
            </div>
            <div className="grid gap-4 max-w-sm mx-auto pt-8">
              <Button size="lg" className="h-14 text-lg" onClick={nextStep}>
                进入我的控制台 <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="h-14 text-lg" render={<a href="https://docs.mediaclaw.com" target="_blank" />}>
                查看快速入门文档
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
