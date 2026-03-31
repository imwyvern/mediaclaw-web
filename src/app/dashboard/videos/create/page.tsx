"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Upload, 
  Video, 
  Check, 
  ChevronRight, 
  Info, 
  Sparkles,
  Zap,
  Layout,
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { MetadataUpdater } from "@/components/metadata-updater";
import { api, Brand } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

export default function CreateVideoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [creationMode, setCreationMode] = useState<"upload" | "template">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [config, setConfig] = useState({
    count: 1,
    duration: 15,
    style: "modern",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.brand.list();
        if (res.data) {
          setBrands(Array.isArray(res.data) ? res.data : [res.data]);
        }
      } catch (err) {
        // Fallback mock
        setBrands([
          { id: "1", name: "Acme Corp", category: "Tech", pipelines: 2, videos: 12, logo: "" },
          { id: "2", name: "Global Inc", category: "Retail", pipelines: 1, videos: 5, logo: "" },
        ]);
      }
    };
    fetchBrands();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const calculateCredits = () => {
    return config.count * config.duration * 0.5;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.tasks.create({
        brandId: selectedBrand,
        mode: creationMode,
        config,
        credits: calculateCredits(),
      });
      toast.success("任务已提交");
      router.push("/dashboard/videos");
    } catch (err) {
      toast.error("创建失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      <MetadataUpdater title="新建视频任务" />
      
      <div className="flex items-center gap-4">
        <Link href="/dashboard/videos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新建视频生产任务</h1>
          <p className="text-muted-foreground">通过 AI 自动化生产符合品牌调性的短视频。</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between relative mb-12 after:content-[''] after:absolute after:top-1/2 after:left-0 after:right-0 after:h-0.5 after:bg-muted after:-z-10">
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s} 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 ${
              step === s ? "bg-primary border-primary text-primary-foreground" : 
              step > s ? "bg-emerald-500 border-emerald-500 text-white" : "bg-background border-muted text-muted-foreground"
            }`}
          >
            {step > s ? <Check className="w-5 h-5" /> : s}
          </div>
        ))}
      </div>

      {/* Step 1: Select Brand */}
      {step === 1 && (
        <Card className="animate-in slide-in-from-right-4 duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full w-6 h-6 p-0 flex items-center justify-center">1</Badge>
              选择品牌空间
            </CardTitle>
            <CardDescription>视频将自动应用该品牌的视觉资产（Logo、配色、字体）。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {brands.map((brand) => (
              <div 
                key={brand.id}
                onClick={() => setSelectedBrand(brand.id)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-primary/50 flex items-center gap-4 ${
                  selectedBrand === brand.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-muted"
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <Video className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{brand.name}</p>
                  <p className="text-xs text-muted-foreground uppercase">{brand.category}</p>
                </div>
                {selectedBrand === brand.id && <Check className="w-5 h-5 text-primary" />}
              </div>
            ))}
          </CardContent>
          <CardFooter className="justify-end border-t bg-muted/30 pt-6">
            <Button disabled={!selectedBrand} onClick={() => setStep(2)}>
              下一步 <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Content Source */}
      {step === 2 && (
        <Card className="animate-in slide-in-from-right-4 duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full w-6 h-6 p-0 flex items-center justify-center">2</Badge>
              素材来源
            </CardTitle>
            <CardDescription>您可以上传现有素材进行二次加工，或直接使用模版生成。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4 p-1 bg-muted rounded-lg">
              <Button 
                variant={creationMode === "upload" ? "secondary" : "ghost"} 
                className="flex-1 gap-2"
                onClick={() => setCreationMode("upload")}
              >
                <Upload size={18} /> 上传素材
              </Button>
              <Button 
                variant={creationMode === "template" ? "secondary" : "ghost"} 
                className="flex-1 gap-2"
                onClick={() => setCreationMode("template")}
              >
                <Layout size={18} /> 选模版
              </Button>
            </div>

            {creationMode === "upload" ? (
              <div className="border-2 border-dashed rounded-xl p-12 text-center space-y-4 hover:bg-muted/50 transition-colors cursor-pointer relative group">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-lg">{file ? file.name : "点击或拖拽上传视频素材"}</p>
                  <p className="text-sm text-muted-foreground">支持 MP4, MOV, AVI (最大 500MB)</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-[9/16] bg-muted rounded-lg border-2 hover:border-primary transition-all cursor-pointer flex items-center justify-center overflow-hidden relative group">
                    <Video className="w-8 h-8 text-muted-foreground" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-white text-xs font-medium">模版风格 {i}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between border-t bg-muted/30 pt-6">
            <Button variant="ghost" onClick={() => setStep(1)}>返回</Button>
            <Button disabled={creationMode === "upload" && !file} onClick={() => setStep(3)}>
              下一步 <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Parameters */}
      {step === 3 && (
        <Card className="animate-in slide-in-from-right-4 duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full w-6 h-6 p-0 flex items-center justify-center">3</Badge>
              设置生成参数
            </CardTitle>
            <CardDescription>调整 AI 生成的细节配置。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2">生成数量 <Info size={14} className="text-muted-foreground" /></Label>
                <span className="text-sm font-bold text-primary">{config.count} 条</span>
              </div>
              <Slider 
                value={[config.count]} 
                min={1} 
                max={50} 
                step={1} 
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setConfig({...config, count: val});
                }}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2">预估时长 <Info size={14} className="text-muted-foreground" /></Label>
                <span className="text-sm font-bold text-primary">{config.duration} 秒</span>
              </div>
              <Slider 
                value={[config.duration]} 
                min={5} 
                max={60} 
                step={5} 
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setConfig({...config, duration: val});
                }}
              />
            </div>

            <div className="space-y-4">
              <Label>内容风格</Label>
              <Select value={config.style} onValueChange={(v) => {
                if (v) setConfig({...config, style: v});
              }}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="选择风格" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">现代极简</SelectItem>
                  <SelectItem value="dynamic">动感十足</SelectItem>
                  <SelectItem value="cinematic">电影感</SelectItem>
                  <SelectItem value="vlog">Vlog 生活化</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t bg-muted/30 pt-6">
            <Button variant="ghost" onClick={() => setStep(2)}>返回</Button>
            <Button onClick={() => setStep(4)}>
              下一步 <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <Card className="animate-in zoom-in-95 duration-300">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>确认订单并提交</CardTitle>
            <CardDescription>提交后，后台将立即分配算力开始生产。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-xl p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">品牌空间</span>
                <span className="font-bold">{brands.find(b => b.id === selectedBrand)?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">生产模式</span>
                <span className="font-bold">{creationMode === "upload" ? "本地上传" : "模版生成"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">配置详情</span>
                <span className="font-bold">{config.count} 条 × {config.duration}s</span>
              </div>
              <div className="h-px bg-muted-foreground/10 my-2" />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-lg">
                  <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" /> 消耗算力点数
                </div>
                <span className="text-2xl font-black text-primary">{calculateCredits()} pts</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4 border-t bg-muted/30 pt-6">
            <div className="flex gap-4 w-full">
              <Button variant="ghost" className="flex-1 h-12" onClick={() => setStep(3)}>返回修改</Button>
              <Button 
                className="flex-[2] h-12 text-lg font-bold" 
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? "正在提交..." : "立即开始生产"}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Info size={10} /> 任务提交后不支持取消，请仔细核对配置。
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
