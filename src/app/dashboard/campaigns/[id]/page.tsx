"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Target,
  BarChart,
  Calendar as CalendarIcon,
  Video,
  Eye,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCompactNumber } from "@/lib/format";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CampaignDetail {
  id: string;
  name: string;
  status: string;
  budget: number;
  spent: number;
  videoCount: number;
  totalViews: number;
  startDate: string;
  endDate: string;
  platforms: string[];
  description: string;
  performance: Array<{ date: string; views: number; engagement: number }>;
  videos: Array<{ id: string; title: string; views: number; status: string }>;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/campaigns/${id}`);
        if (!res.ok) throw new Error("获取活动详情失败");
        const data = await res.json();
        setCampaign(data.data);
      } catch (err: any) {
        console.error(err);
        setError("无法加载活动详情");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-[#00e8b8]/20 text-[#00e8b8] border-none">进行中</Badge>;
      case "paused": return <Badge className="bg-yellow-500/20 text-yellow-400 border-none">已暂停</Badge>;
      case "completed": return <Badge className="bg-white/10 text-white/70 border-none">已结束</Badge>;
      default: return <Badge className="bg-white/10 text-white/70 border-none">未知</Badge>;
    }
  };

  if (loading) return null; // Let loading.tsx handle initial state

  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-[#f0f0f0]">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">出错了</h2>
        <p className="text-white/50 mb-6">{error}</p>
        <Button onClick={() => router.back()} variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
          返回列表
        </Button>
      </div>
    );
  }

  const roi = campaign.spent > 0 ? (campaign.totalViews / campaign.spent).toFixed(2) : "0";

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
              <h1 className="text-2xl font-bold tracking-tight text-white">{campaign.name}</h1>
              {getStatusBadge(campaign.status)}
            </div>
            <p className="text-sm text-white/50 flex items-center gap-4">
              <span>ID: {campaign.id}</span>
              <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5" /> {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold">¥</span>
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">预算消耗</p>
              <p className="text-xl font-black text-white">{formatCompactNumber(campaign.spent)} <span className="text-sm font-normal text-white/40">/ {formatCompactNumber(campaign.budget)}</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">关联视频</p>
              <p className="text-xl font-black text-white">{campaign.videoCount} <span className="text-sm font-normal text-white/40">个</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">累计播放</p>
              <p className="text-xl font-black text-white">{formatCompactNumber(campaign.totalViews)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#00e8b8]/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-[#00e8b8]" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">预计 ROI</p>
              <p className="text-xl font-black text-[#00e8b8]">{roi}x</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-2 border-b border-white/5 flex flex-row items-center gap-2">
              <BarChart className="w-5 h-5 text-[#00e8b8]" />
              <CardTitle className="text-base font-bold text-white">活动期间表现</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[350px]">
              {campaign.performance && campaign.performance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={campaign.performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCompactNumber} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0b0f1a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#00e8b8' }}
                    />
                    <Line type="monotone" dataKey="views" name="播放量" stroke="#00e8b8" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#00e8b8', stroke: '#0b0f1a', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">暂无趋势数据</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="text-base font-bold text-white">活动信息</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">目标描述</h4>
                <p className="text-sm text-white/80 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5">
                  {campaign.description || "无描述"}
                </p>
              </div>
              <div>
                <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">分发平台</h4>
                <div className="flex flex-wrap gap-2">
                  {campaign.platforms?.map(p => (
                    <Badge key={p} variant="outline" className="bg-white/5 border-white/10 font-normal px-2.5">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-white">关联视频</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-[#00e8b8] hover:text-[#00e8b8] hover:bg-[#00e8b8]/10" onClick={() => router.push('/dashboard/videos')}>
                查看全部
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {campaign.videos && campaign.videos.length > 0 ? (
                campaign.videos.map(v => (
                  <div key={v.id} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/videos/${v.id}`)}>
                    <h4 className="font-medium text-sm text-white/90 line-clamp-1 mb-2">{v.title}</h4>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">播放: {formatCompactNumber(v.views)}</span>
                      <span className="text-white/40 capitalize">{v.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-white/40 text-sm">暂无关联视频</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
