"use client";

import { useEffect, useState, useRef } from "react";
import {
  Briefcase,
  UploadCloud,
  FileImage,
  FileText,
  MoreVertical,
  Trash2,
  Edit2,
  Save,
  Eye,
  AlertCircle,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface BrandAsset {
  id: string;
  name: string;
  type: "logo" | "product" | "guideline" | "other";
  url: string;
  uploadedAt: string;
}

interface BrandConfig {
  name: string;
  colors: string[];
  toneOfVoice: string;
  targetAudience: string;
  description?: string;
}

export default function BrandAssetsPage() {
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [config, setConfig] = useState<BrandConfig>({ name: "", colors: [], toneOfVoice: "", targetAudience: "" });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Drag drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Config editing state
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [editConfig, setEditConfig] = useState<BrandConfig>({ name: "", colors: [], toneOfVoice: "", targetAudience: "" });
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    fetchBrandData();
  }, []);

  const fetchBrandData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/brand");
      if (!res.ok) throw new Error("获取品牌数据失败");
      const data = await res.json();
      
      setConfig(data.data.config || { name: "", colors: [], toneOfVoice: "", targetAudience: "" });
      setEditConfig(data.data.config || { name: "", colors: [], toneOfVoice: "", targetAudience: "" });
      setAssets(Array.isArray(data.data.assets) ? data.data.assets : []);
    } catch (err: any) {
      console.error(err);
      setError("服务连接中...");
      setConfig({ name: "Demo Brand", colors: ["#00e8b8", "#0b0f1a"], toneOfVoice: "专业、极客", targetAudience: "科技爱好者" });
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await fetch("/api/v1/brand", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editConfig),
      });
      if (!res.ok) throw new Error("保存失败");
      
      setConfig(editConfig);
      setIsEditingConfig(false);
      toast.success("品牌配置已更新");
    } catch (err: any) {
      toast.error(err.message || "更新配置失败");
    } finally {
      setSavingConfig(false);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files);
    }
  };

  const uploadFiles = async (files: FileList) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    
    const toastId = toast.loading(`正在上传 ${files.length} 个文件...`);
    try {
      const res = await fetch("/api/v1/brand/assets", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("上传失败");
      
      toast.success("上传成功", { id: toastId });
      fetchBrandData(); // refresh list
    } catch (err: any) {
      toast.error(err.message || "文件上传失败，后端服务不可用", { id: toastId });
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "logo": return <Briefcase className="w-5 h-5 text-purple-400" />;
      case "product": return <FileImage className="w-5 h-5 text-blue-400" />;
      case "guideline": return <FileText className="w-5 h-5 text-orange-400" />;
      default: return <FileImage className="w-5 h-5 text-white/50" />;
    }
  };

  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case "logo": return "品牌 Logo";
      case "product": return "产品素材";
      case "guideline": return "视觉规范";
      default: return "其他资产";
    }
  };

  return (
    <div className="flex flex-col gap-8 min-h-[calc(100vh-8rem)] text-[#f0f0f0]">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-1 flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-[#00e8b8]" />
          品牌资产
        </h1>
        <p className="text-white/50">管理品牌核心资料，统一视频输出的视觉与调性规范</p>
      </div>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 border-dashed p-12 text-center">
          <AlertCircle className="w-12 h-12 text-[#00e8b8]/60 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">服务连接中...</h3>
          <p className="text-white/50 max-w-md">无法获取品牌资产库。正在尝试重新连接，请稍后...</p>
          <Button onClick={fetchBrandData} variant="outline" className="mt-8 border-white/20 hover:bg-white/10 bg-transparent text-white">
            重新加载
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Asset Grid & Upload */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Upload Zone */}
            <div 
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                isDragging ? "border-[#00e8b8] bg-[#00e8b8]/5" : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
              <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                <UploadCloud className={`w-8 h-8 ${isDragging ? "text-[#00e8b8]" : "text-white/40"}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">点击或拖拽上传资产</h3>
              <p className="text-white/50 text-sm max-w-sm mx-auto mb-6">
                支持 PNG, JPG, SVG, MP4, PDF 格式。建议上传高清 Logo、产品白底图及设计规范文档。
              </p>
              <Button onClick={() => fileInputRef.current?.click()} className="bg-white/10 text-white hover:bg-white/20 border border-white/10">
                选择文件
              </Button>
            </div>

            {/* Asset Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">资产库</h2>
                <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70">
                  {assets.length} 个文件
                </Badge>
              </div>

              {assets.length === 0 ? (
                <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
                  <FileImage className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50">当前资产库为空，请上传品牌资料</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {assets.map((asset) => (
                    <Card key={asset.id} className="bg-[#0b0f1a] border-white/10 overflow-hidden group">
                      <div className="aspect-square bg-white/5 relative flex items-center justify-center border-b border-white/5 p-4">
                        {asset.url ? (
                          <img src={asset.url} alt={asset.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                        ) : (
                          getAssetIcon(asset.type)
                        )}
                        <div className="absolute top-2 left-2">
                          <Badge variant="outline" className="bg-[#0b0f1a]/80 backdrop-blur-md border-white/10 text-xs px-2 py-0 text-white/80">
                            {getAssetTypeLabel(asset.type)}
                          </Badge>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 bg-[#0b0f1a]/80 backdrop-blur-md text-white border border-white/10 hover:bg-white/20">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#0b0f1a] border-white/10 text-white">
                              <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" /> 预览
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer">
                                <Trash2 className="w-4 h-4 mr-2" /> 删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <p className="font-medium text-sm text-white/90 truncate" title={asset.name}>{asset.name}</p>
                        <p className="text-xs text-white/40 mt-1">{new Date(asset.uploadedAt).toLocaleDateString()}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Brand Config Panel */}
          <div className="space-y-6">
            <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
              <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white">品牌配置</CardTitle>
                  <CardDescription className="text-white/50 mt-1">AI 创作的全局基准</CardDescription>
                </div>
                {!isEditingConfig && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingConfig(true)} className="h-8 text-[#00e8b8] hover:text-[#00e8b8] hover:bg-[#00e8b8]/10">
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> 编辑
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {isEditingConfig ? (
                  <div className="space-y-5 animate-in fade-in">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/70">品牌名称</label>
                      <Input 
                        value={editConfig.name} 
                        onChange={(e) => setEditConfig({...editConfig, name: e.target.value})} 
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/70">品牌颜色 (Hex)</label>
                      <div className="flex gap-2">
                        {editConfig.colors.map((color, i) => (
                          <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-md px-2 py-1">
                            <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                            <Input 
                              value={color}
                              onChange={(e) => {
                                const newColors = [...editConfig.colors];
                                newColors[i] = e.target.value;
                                setEditConfig({...editConfig, colors: newColors});
                              }}
                              className="w-20 h-7 text-xs bg-transparent border-none p-0 focus-visible:ring-0"
                            />
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="h-9 w-9 bg-white/5 border-white/10 hover:bg-white/10 p-0"
                          onClick={() => setEditConfig({...editConfig, colors: [...editConfig.colors, "#ffffff"]})}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/70">品牌语调 (Tone of Voice)</label>
                      <Textarea 
                        value={editConfig.toneOfVoice} 
                        onChange={(e) => setEditConfig({...editConfig, toneOfVoice: e.target.value})} 
                        className="bg-white/5 border-white/10 text-white min-h-[80px] focus-visible:ring-[#00e8b8]/50"
                        placeholder="例如：专业、亲和、幽默..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/70">目标受众 (Target Audience)</label>
                      <Textarea 
                        value={editConfig.targetAudience} 
                        onChange={(e) => setEditConfig({...editConfig, targetAudience: e.target.value})} 
                        className="bg-white/5 border-white/10 text-white min-h-[80px] focus-visible:ring-[#00e8b8]/50"
                        placeholder="描述品牌的目标受众画像..."
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                      <Button variant="ghost" onClick={() => { setIsEditingConfig(false); setEditConfig(config); }} className="text-white/50 hover:text-white">
                        取消
                      </Button>
                      <Button onClick={handleSaveConfig} disabled={savingConfig} className="bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold">
                        <Save className="w-4 h-4 mr-2" /> 保存配置
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">品牌名称</h4>
                      <p className="font-bold text-lg text-white/90">{config.name || "未设置"}</p>
                    </div>
                    <div>
                      <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">品牌颜色</h4>
                      <div className="flex gap-3">
                        {config.colors && config.colors.length > 0 ? (
                          config.colors.map((color, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
                              <div className="w-4 h-4 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: color }} />
                              <span className="text-xs text-white/70 font-mono">{color}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-white/30 italic">未设置</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">品牌语调</h4>
                      <p className="text-sm text-white/80 bg-white/[0.02] p-3 rounded-lg border border-white/5 leading-relaxed">
                        {config.toneOfVoice || <span className="text-white/30 italic">未设置</span>}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">目标受众</h4>
                      <p className="text-sm text-white/80 bg-white/[0.02] p-3 rounded-lg border border-white/5 leading-relaxed">
                        {config.targetAudience || <span className="text-white/30 italic">未设置</span>}
                      </p>
                    </div>
                  </div>
                )}
                
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
