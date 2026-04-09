"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Video,
  Download,
  Edit2,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  BarChart2,
  Save,
  X,
  Share2,
  ThumbsUp,
  MessageCircle,
  Eye,
  Flame
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatCompactNumber } from "@/lib/format";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface VideoDetail {
  id: string;
  title: string;
  caption: string;
  hashtags: string[];
  platform: string;
  status: "draft" | "processing" | "ready" | "pushed" | "published";
  viralScore: number;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  publishedAt?: string;
  metrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    history: Array<{ date: string; views: number; engagement: number }>;
  };
}

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/content/${id}`);
        if (!res.ok) throw new Error("获取视频详情失败");
        const data = await res.json();
        setVideo(data.data);
        setEditCaption(data.data.caption || "");
      } catch (err: any) {
        console.error(err);
        setError("无法加载视频详情，请稍后重试");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVideo();
  }, [id]);

  const handleSaveCaption = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: editCaption }),
      });
      if (!res.ok) throw new Error("保存失败");
      
      const data = await res.json();
      setVideo(prev => prev ? { ...prev, caption: editCaption } : null);
      setIsEditing(false);
      toast.success("文案已更新");
    } catch (err: any) {
      toast.error(err.message || "更新文案失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-[#00e8b8]/20 text-[#00e8b8] border-none font-normal">已发布</Badge>;
      case "pushed": return <Badge className="bg-blue-500/20 text-blue-400 border-none font-normal">已推送</Badge>;
      case "ready": return <Badge className="bg-purple-500/20 text-purple-400 border-none font-normal">待发布</Badge>;
      case "processing": return <Badge className="bg-yellow-500/20 text-yellow-400 border-none font-normal">处理中</Badge>;
      default: return <Badge className="bg-white/10 text-white/70 border-none font-normal">草稿</Badge>;
    }
  };

  const timelineSteps = [
    { key: "created", label: "已创建", icon: Video },
    { key: "processing", label: "处理中", icon: Clock },
    { key: "ready", label: "准备就绪", icon: CheckCircle2 },
    { key: "pushed", label: "已推送", icon: Send },
    { key: "published", label: "已发布", icon: BarChart2 },
  ];

  const getStepStatus = (stepIndex: number, currentStatus: string) => {
    const statuses = ["draft", "processing", "ready", "pushed", "published"];
    const currentIndex = statuses.indexOf(currentStatus);
    // draft maps to created
    const mappedCurrentIndex = currentIndex === 0 ? 0 : currentIndex;
    
    if (stepIndex < mappedCurrentIndex) return "completed";
    if (stepIndex === mappedCurrentIndex) return "active";
    return "pending";
  };

  if (loading) {
    // Relying on loading.tsx generally, but just in case
    return null;
  }

  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-[#f0f0f0]">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">出错了</h2>
        <p className="text-white/50 mb-6">{error}</p>
        <Button onClick={() => router.back()} variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
          返回上一页
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-8rem)] text-[#f0f0f0] animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white/50 hover:text-white hover:bg-white/10 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-white line-clamp-1">{video.title || "未命名视频任务"}</h1>
              {getStatusBadge(video.status)}
            </div>
            <p className="text-sm text-white/50">ID: {video.id} · 创建于 {new Date(video.createdAt).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
            <Download className="w-4 h-4 mr-2" /> 下载视频
          </Button>
          {video.status !== 'published' && (
            <Button className="bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold px-6">
              <Send className="w-4 h-4 mr-2" /> 立即发布
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Video & Performance */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Video Player */}
          <div className="bg-black border border-white/10 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center shadow-[0_0_50px_-15px_rgba(0,232,184,0.1)] group">
            {video.videoUrl ? (
              <video src={video.videoUrl} poster={video.thumbnailUrl} controls className="w-full h-full object-contain" />
            ) : video.thumbnailUrl ? (
              <>
                <img src={video.thumbnailUrl} className="w-full h-full object-cover opacity-60" alt="" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#00e8b8]/20 backdrop-blur-md flex items-center justify-center border border-[#00e8b8]/50 text-[#00e8b8] cursor-pointer hover:scale-110 transition-transform">
                    <Video className="w-6 h-6" />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-white/20 flex flex-col items-center gap-2">
                <Video className="w-10 h-10" />
                <span>视频尚未准备就绪</span>
              </div>
            )}
          </div>

          {/* Performance Metrics (If Published) */}
          {video.status === 'published' && video.metrics && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#00e8b8]" /> 数据表现
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Eye className="w-5 h-5 text-blue-400 mb-2" />
                    <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">播放量</p>
                    <p className="text-2xl font-bold">{formatCompactNumber(video.metrics.views)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <ThumbsUp className="w-5 h-5 text-red-400 mb-2" />
                    <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">点赞数</p>
                    <p className="text-2xl font-bold">{formatCompactNumber(video.metrics.likes)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <MessageCircle className="w-5 h-5 text-green-400 mb-2" />
                    <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">评论数</p>
                    <p className="text-2xl font-bold">{formatCompactNumber(video.metrics.comments)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Share2 className="w-5 h-5 text-purple-400 mb-2" />
                    <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">分享数</p>
                    <p className="text-2xl font-bold">{formatCompactNumber(video.metrics.shares)}</p>
                  </CardContent>
                </Card>
              </div>

              {video.metrics.history && video.metrics.history.length > 0 && (
                <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
                  <CardHeader className="pb-2 border-b border-white/5">
                    <CardTitle className="text-base font-medium text-white/80">播放量趋势</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={video.metrics.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCompactNumber} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0b0f1a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          itemStyle={{ color: '#00e8b8' }}
                        />
                        <Line type="monotone" dataKey="views" stroke="#00e8b8" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#00e8b8', stroke: '#0b0f1a', strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Metadata & Status */}
        <div className="space-y-8">
          
          {/* Status Timeline */}
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="text-base font-bold text-white">发布进度</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative border-l-2 border-white/10 ml-3 space-y-6">
                {timelineSteps.map((step, index) => {
                  const status = getStepStatus(index, video.status);
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="relative pl-6">
                      <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        status === 'completed' ? 'bg-[#00e8b8] border-[#00e8b8] text-[#0b0f1a]' :
                        status === 'active' ? 'bg-[#0b0f1a] border-[#00e8b8] text-[#00e8b8]' :
                        'bg-[#0b0f1a] border-white/10 text-white/30'
                      } transition-colors duration-300`}>
                        {status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <div className="pt-1.5">
                        <h4 className={`text-sm font-medium ${status === 'pending' ? 'text-white/40' : 'text-white/90'}`}>
                          {step.label}
                        </h4>
                        {status === 'completed' && index === 0 && (
                          <p className="text-xs text-white/40 mt-1">{new Date(video.createdAt).toLocaleString()}</p>
                        )}
                        {status === 'completed' && index === timelineSteps.length - 1 && video.publishedAt && (
                          <p className="text-xs text-white/40 mt-1">{new Date(video.publishedAt).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Metadata Panel */}
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-white">文案与属性</CardTitle>
              {!isEditing && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 text-[#00e8b8] hover:text-[#00e8b8] hover:bg-[#00e8b8]/10">
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> 编辑
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Caption */}
              <div>
                <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">发布文案</h4>
                {isEditing ? (
                  <div className="space-y-3">
                    <Textarea 
                      value={editCaption} 
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="bg-white/5 border-white/10 text-white min-h-[120px] focus-visible:ring-[#00e8b8]/50"
                      placeholder="在此输入视频文案..."
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditCaption(video.caption || ""); }} className="text-white/50 hover:text-white">
                        <X className="w-4 h-4 mr-1" /> 取消
                      </Button>
                      <Button size="sm" onClick={handleSaveCaption} disabled={saving} className="bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold">
                        <Save className="w-4 h-4 mr-1" /> 保存
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    {video.caption || <span className="text-white/30 italic">未设置文案</span>}
                  </p>
                )}
              </div>

              {/* Hashtags */}
              <div>
                <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">话题标签</h4>
                <div className="flex flex-wrap gap-2">
                  {video.hashtags && video.hashtags.length > 0 ? (
                    video.hashtags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="bg-white/5 hover:bg-white/10 text-white/70 border-white/10 font-normal">
                        # {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-white/30 italic">暂无话题</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div>
                  <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">发布平台</h4>
                  <Badge variant="outline" className="bg-white/5 text-white border-white/10 font-normal">
                    {video.platform || "未指定"}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">爆款指数</h4>
                  <div className={`inline-flex items-center font-bold text-lg ${video.viralScore >= 80 ? 'text-[#00e8b8]' : 'text-yellow-500'}`}>
                    <Flame className="w-4 h-4 mr-1" />
                    {video.viralScore || 0}
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
