"use client";

import { useEffect, useState } from "react";
import { Flame, Play, Search, TrendingUp, BarChart2, Video, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface ViralContent {
  id?: string;
  title: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  viralScore: number;
  thumbnailUrl: string;
  videoUrl?: string;
  discoveredAt: string;
}

export default function DiscoveryPage() {
  const [pool, setPool] = useState<ViralContent[]>([]);
  const [competitorHot, setCompetitorHot] = useState<ViralContent[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [platform, setPlatform] = useState("all");
  const [industry, setIndustry] = useState("tech");
  
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  const [remixModalOpen, setRemixModalOpen] = useState(false);
  const [remixing, setRemixing] = useState(false);
  const [remixResult, setRemixResult] = useState<any>(null);

  const fetchDiscoveryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [poolRes, compHotRes, trendsRes] = await Promise.all([
        fetch(`/api/v1/discovery/pool?limit=12&industry=${industry}`).catch(() => null),
        fetch(`/api/v1/competitors/hot`).catch(() => null),
        fetch(`/api/v1/competitors/trending`).catch(() => null)
      ]);

      // If backend is entirely unreachable or returns 502 Bad Gateway
      if (!poolRes?.ok) {
        throw new Error("无法连接到挖掘服务");
      }
      
      const poolData = await poolRes.json();
      const compHotData = compHotRes?.ok ? await compHotRes.json() : [];
      const trendsData = trendsRes?.ok ? await trendsRes.json() : [];

      setPool(Array.isArray(poolData) ? poolData : []);
      setCompetitorHot(Array.isArray(compHotData) ? compHotData : []);
      setTrends(Array.isArray(trendsData) ? trendsData : []);
    } catch (err: any) {
      console.error(err);
      setError("服务连接中...");
      // Ensure arrays remain empty on error, no mock data!
      setPool([]);
      setCompetitorHot([]);
      setTrends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoveryData();
  }, [platform, industry]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-[#00e8b8]";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatNumber = (num: number) => {
    if (!num) return "0";
    if (num >= 10000) return (num / 10000).toFixed(1) + "w";
    return num.toString();
  };

  const handleAnalyze = async (item: ViralContent) => {
    setAnalysisModalOpen(true);
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await fetch('/api/v1/discovery/analyze-viral-elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: item.videoUrl, title: item.title })
      });
      if (!res.ok) throw new Error("分析失败，后端服务不可用");
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      toast.error(err.message || "无法连接到分析服务");
      setAnalysisModalOpen(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRemix = async (item: ViralContent) => {
    setRemixModalOpen(true);
    setRemixing(true);
    setRemixResult(null);
    try {
      const res = await fetch('/api/v1/discovery/generate-remix-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: item.videoUrl, title: item.title })
      });
      if (!res.ok) throw new Error("混剪脚本生成失败，后端服务不可用");
      const data = await res.json();
      setRemixResult(data);
    } catch (err: any) {
      toast.error(err.message || "无法连接到混剪服务");
      setRemixModalOpen(false);
    } finally {
      setRemixing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 min-h-[calc(100vh-8rem)] text-[#f0f0f0]">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Flame className="w-8 h-8 text-[#00e8b8]" />
            爆款发现
          </h1>
          <p className="text-white/50 mt-1">实时追踪全网热点，AI 智能拆解爆款基因</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-xl border border-white/10">
          <Select value={platform} onValueChange={(v) => v && setPlatform(v)}>
            <SelectTrigger className="w-[120px] bg-transparent border-none focus:ring-0 text-white font-medium hover:bg-white/5">
              <SelectValue placeholder="平台" />
            </SelectTrigger>
            <SelectContent className="bg-[#0b0f1a] border-white/10 text-white">
              <SelectItem value="all">全平台</SelectItem>
              <SelectItem value="douyin">抖音</SelectItem>
              <SelectItem value="xhs">小红书</SelectItem>
              <SelectItem value="kuaishou">快手</SelectItem>
              <SelectItem value="bilibili">B站</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="w-px h-6 bg-white/10" />
          
          <Select value={industry} onValueChange={(val) => val && setIndustry(val)}>
            <SelectTrigger className="w-[120px] bg-transparent border-none focus:ring-0 text-white font-medium hover:bg-white/5">
              <SelectValue placeholder="行业" />
            </SelectTrigger>
            <SelectContent className="bg-[#0b0f1a] border-white/10 text-white">
              <SelectItem value="tech">科技数码</SelectItem>
              <SelectItem value="beauty">美妆个护</SelectItem>
              <SelectItem value="food">美食餐饮</SelectItem>
              <SelectItem value="edu">教育培训</SelectItem>
            </SelectContent>
          </Select>
          
          <Button size="icon" variant="ghost" className="rounded-lg hover:bg-white/10 text-white" onClick={fetchDiscoveryData}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        // Empty state is handled by loading.tsx when the page initially loads, 
        // but this spinner shows during filter changes
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-white/50">
          <Loader2 className="w-10 h-10 animate-spin text-[#00e8b8] mb-4" />
          <p>正在分析全网数据，挖掘爆款基因...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-white/5 rounded-2xl border border-white/10 border-dashed p-8 text-center">
          <AlertCircle className="w-12 h-12 text-[#00e8b8]/60 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">服务连接中...</h3>
          <p className="max-w-md text-white/50">智能挖掘引擎正在唤醒或等待网络连接。系统将在可用时自动获取最新的爆款数据内容。</p>
          <Button onClick={fetchDiscoveryData} variant="outline" className="mt-8 border-white/20 hover:bg-white/10 bg-transparent text-white">
            重新连接
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Feed: 爆款推荐池 */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-[#00e8b8]" />
                爆款推荐池
              </h2>
              <Badge variant="outline" className="bg-[#00e8b8]/10 text-[#00e8b8] border-[#00e8b8]/30 px-3 py-1">
                为您挖掘 {pool.length} 条爆款
              </Badge>
            </div>

            {pool.length === 0 ? (
              <div className="bg-white/5 rounded-2xl border border-white/10 border-dashed p-16 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-white/30" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">当前未发现爆款内容</h3>
                <p className="text-white/50 max-w-sm">
                  请尝试更换平台或行业过滤条件。智能引擎正在持续监控全网数据。
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {pool.map((item, idx) => (
                  <Card key={item.id || idx} className="bg-[#0b0f1a] border-white/10 overflow-hidden hover:border-[#00e8b8]/40 transition-all duration-300 group shadow-none hover:shadow-[0_0_30px_-5px_rgba(0,232,184,0.15)] flex flex-col">
                    <div className="relative aspect-video bg-black/50 overflow-hidden shrink-0 border-b border-white/5">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10 text-white/20 group-hover:scale-105 transition-transform duration-500">无封面</div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white border-white/10 font-medium">
                        {item.platform}
                      </Badge>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f1a] via-[#0b0f1a]/20 to-transparent opacity-90" />
                    </div>
                    
                    <CardContent className="p-5 pt-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-white/90 line-clamp-2 leading-snug mb-5 group-hover:text-[#00e8b8] transition-colors">{item.title}</h3>
                      
                      <div className="space-y-4 mt-auto">
                        <div>
                          <div className="flex justify-between text-xs mb-2 font-medium">
                            <span className="text-white/50">爆款指数 (Viral Score)</span>
                            <span className={`font-bold ${item.viralScore >= 80 ? "text-[#00e8b8]" : "text-yellow-500"}`}>{item.viralScore}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden ring-1 ring-white/5">
                            <div className={`h-full ${getScoreColor(item.viralScore)} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${item.viralScore}%` }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-white/50 bg-white/[0.03] rounded-lg p-3 border border-white/5">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-white/80 font-bold text-sm">{formatNumber(item.views)}</span>
                            <span className="text-[10px] uppercase tracking-wider">播放</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-white/80 font-bold text-sm">{formatNumber(item.likes)}</span>
                            <span className="text-[10px] uppercase tracking-wider">点赞</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-white/80 font-bold text-sm">{formatNumber(item.shares)}</span>
                            <span className="text-[10px] uppercase tracking-wider">分享</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-5 pt-0 flex gap-3 shrink-0">
                      <Button variant="secondary" className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10" onClick={() => handleAnalyze(item)}>
                        <BarChart2 className="w-4 h-4 mr-2 text-[#00e8b8]" /> 分析
                      </Button>
                      <Button className="flex-1 bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold shadow-[0_0_15px_rgba(0,232,184,0.3)] hover:shadow-[0_0_25px_rgba(0,232,184,0.5)] transition-shadow" onClick={() => handleRemix(item)}>
                        <Play className="w-4 h-4 mr-2" /> 混剪
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Competitors & Trends */}
          <div className="space-y-8">
            {/* Competitor Hot */}
            <Card className="bg-[#0b0f1a] border-white/10 shadow-none overflow-hidden">
              <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  竞品热门
                </CardTitle>
                <CardDescription className="text-white/50">实时追踪对标竞品动态</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {competitorHot.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center">
                    <TrendingUp className="w-8 h-8 text-white/20 mb-3" />
                    <p className="text-white/40 text-sm">暂无竞品数据</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[360px]">
                    <div className="flex flex-col">
                      {competitorHot.map((item, idx) => (
                        <div key={idx} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group">
                          <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-lg bg-white/5 shrink-0 overflow-hidden relative border border-white/10 group-hover:border-orange-400/50 transition-colors">
                              {item.thumbnailUrl && <img src={item.thumbnailUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h4 className="text-sm font-medium text-white/80 line-clamp-2 group-hover:text-orange-400 transition-colors mb-2 leading-snug">{item.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
                                <span className="bg-white/10 px-1.5 py-0.5 rounded">{item.platform}</span>
                                <span>{formatNumber(item.likes)} 赞</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Industry Trends */}
            <Card className="bg-[#0b0f1a] border-white/10 shadow-none overflow-hidden">
              <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-purple-400" />
                  行业趋势
                </CardTitle>
                <CardDescription className="text-white/50">近期热点关键词风向</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                {trends.length === 0 ? (
                  <div className="py-8 text-center text-white/40 text-sm">暂无趋势数据</div>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {trends.map((trend, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-white/5 hover:bg-[#00e8b8]/10 hover:text-[#00e8b8] hover:border-[#00e8b8]/30 transition-colors text-white/60 border-white/10 px-3 py-1.5 text-sm font-normal cursor-pointer">
                        # {trend.keyword || trend.title || "趋势词"}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
        </div>
      )}

      {/* Analysis Modal */}
      <Dialog open={analysisModalOpen} onOpenChange={setAnalysisModalOpen}>
        <DialogContent className="bg-[#0b0f1a] border-white/10 text-white max-w-2xl sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <BarChart2 className="text-[#00e8b8] w-6 h-6" />
              爆款基因分析
            </DialogTitle>
            <DialogDescription className="text-white/50">
              AI 深度拆解视频内容结构、情绪曲线与传播点
            </DialogDescription>
          </DialogHeader>
          
          <div className="min-h-[200px] flex flex-col justify-center items-center py-10">
            {analyzing ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-[#00e8b8] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BarChart2 className="w-6 h-6 text-[#00e8b8]/50" />
                  </div>
                </div>
                <p className="text-white/50 font-medium">正在调用 AI 分析引擎，提取核心爆款元素...</p>
              </div>
            ) : analysisResult ? (
              <div className="w-full text-left space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white/[0.02] p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <h4 className="font-bold text-[#00e8b8] mb-2 flex items-center gap-2">
                    <span>💡</span> 核心钩子 (Hook)
                  </h4>
                  <p className="text-white/70 text-sm leading-relaxed">{analysisResult.hook || "（分析结果将在此处展示）"}</p>
                </div>
                <div className="bg-white/[0.02] p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <h4 className="font-bold text-[#00e8b8] mb-2 flex items-center gap-2">
                    <span>📈</span> 情绪曲线
                  </h4>
                  <p className="text-white/70 text-sm leading-relaxed">{analysisResult.emotionCurve || "（分析结果将在此处展示）"}</p>
                </div>
                <div className="bg-white/[0.02] p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <h4 className="font-bold text-[#00e8b8] mb-2 flex items-center gap-2">
                    <span>🎯</span> 可复用模板
                  </h4>
                  <p className="text-white/70 text-sm leading-relaxed">{analysisResult.template || "（分析结果将在此处展示）"}</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-red-400/80">分析服务暂不可用，请稍后重试</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="border-t border-white/5 pt-4">
            <Button variant="ghost" onClick={() => setAnalysisModalOpen(false)} className="text-white/70 hover:text-white hover:bg-white/10">关闭</Button>
            {!analyzing && (
              <Button className="bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold px-6">
                应用此模板
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remix Modal */}
      <Dialog open={remixModalOpen} onOpenChange={setRemixModalOpen}>
        <DialogContent className="bg-[#0b0f1a] border-white/10 text-white max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Play className="text-[#00e8b8] w-6 h-6" />
              生成混剪 Brief
            </DialogTitle>
            <DialogDescription className="text-white/50">
              基于选定的爆款内容结合品牌素材
            </DialogDescription>
          </DialogHeader>
          
          <div className="min-h-[200px] flex flex-col justify-center items-center py-8">
            {remixing ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-[#00e8b8] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="w-6 h-6 text-[#00e8b8]/50" />
                  </div>
                </div>
                <p className="text-white/50 font-medium">正在生成混剪制作方案...</p>
              </div>
            ) : remixResult ? (
              <div className="w-full text-left space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[#00e8b8]/10 text-[#00e8b8] p-5 rounded-xl border border-[#00e8b8]/20 flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-lg mb-1">Brief 生成成功</h4>
                    <p className="text-sm opacity-80 leading-relaxed">已提取视频分镜逻辑，并结合品牌库素材完成初步匹配。</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <h4 className="font-medium text-white/50 text-xs mb-1 uppercase tracking-wider">预计时长</h4>
                    <p className="text-white/90 font-bold text-lg">35-45 <span className="text-sm font-normal text-white/50">秒</span></p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <h4 className="font-medium text-white/50 text-xs mb-1 uppercase tracking-wider">匹配素材</h4>
                    <p className="text-white/90 font-bold text-lg">12 <span className="text-sm font-normal text-white/50">段</span></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-red-400/80">生成服务暂不可用，请稍后重试</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="border-t border-white/5 pt-4 flex sm:justify-between w-full">
            <Button variant="ghost" onClick={() => setRemixModalOpen(false)} className="text-white/70 hover:text-white hover:bg-white/10">取消</Button>
            {!remixing && (
              <Button className="bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold px-6 shadow-[0_0_15px_rgba(0,232,184,0.2)]" onClick={() => setRemixModalOpen(false)}>
                去工作流创建视频 <Play className="w-4 h-4 ml-2" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
