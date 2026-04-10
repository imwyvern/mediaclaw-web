"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Target,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Activity,
  Play,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { formatCompactNumber } from "@/lib/format";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "completed";
  videoCount: number;
  totalViews: number;
  roi: number;
  startDate: string;
  endDate: string;
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "", budget: "", startDate: "", endDate: "", platforms: "抖音,小红书", description: ""
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/campaigns");
      if (!res.ok) throw new Error("获取活动列表失败");
      const data = await res.json();
      setCampaigns(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      console.error(err);
      setError("服务连接中...");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/v1/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCampaign)
      });
      if (!res.ok) throw new Error("创建失败");
      
      toast.success("营销活动创建成功");
      setCreateOpen(false);
      setNewCampaign({ name: "", budget: "", startDate: "", endDate: "", platforms: "抖音,小红书", description: "" });
      fetchCampaigns();
    } catch (err: any) {
      toast.error(err.message || "创建活动请求失败");
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-[#00e8b8]/20 text-[#00e8b8] border-none font-normal">进行中</Badge>;
      case "paused": return <Badge className="bg-yellow-500/20 text-yellow-400 border-none font-normal">已暂停</Badge>;
      case "completed": return <Badge className="bg-white/10 text-white/70 border-none font-normal">已结束</Badge>;
      default: return <Badge className="bg-white/10 text-white/70 border-none font-normal">未知</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-8rem)] text-[#f0f0f0] animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-1 flex items-center gap-3">
            <Target className="w-8 h-8 text-[#00e8b8]" />
            营销活动
          </h1>
          <p className="text-white/50">管理品牌 Campaign，追踪跨平台传播矩阵的数据转化与 ROI</p>
        </div>
        
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold px-6">
              <Plus className="w-4 h-4 mr-2" /> 创建活动
            </DialogTrigger>
          <DialogContent className="bg-[#0b0f1a] border-white/10 text-white sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-[#00e8b8]" /> 创建营销活动
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">活动名称</label>
                <Input required value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} className="bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" placeholder="例如：2026 夏季新品发布矩阵" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">开始日期</label>
                  <Input type="date" required value={newCampaign.startDate} onChange={e => setNewCampaign({...newCampaign, startDate: e.target.value})} className="bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">结束日期</label>
                  <Input type="date" required value={newCampaign.endDate} onChange={e => setNewCampaign({...newCampaign, endDate: e.target.value})} className="bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">活动预算 (¥)</label>
                  <Input type="number" required value={newCampaign.budget} onChange={e => setNewCampaign({...newCampaign, budget: e.target.value})} className="bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" placeholder="10000" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">目标平台</label>
                  <Input value={newCampaign.platforms} onChange={e => setNewCampaign({...newCampaign, platforms: e.target.value})} className="bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" placeholder="抖音,小红书..." />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">活动目标描述</label>
                <Input value={newCampaign.description} onChange={e => setNewCampaign({...newCampaign, description: e.target.value})} className="bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" placeholder="描述核心受众和预期结果..." />
              </div>
              <DialogFooter className="pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} className="text-white/50 hover:text-white">取消</Button>
                <Button type="submit" disabled={creating} className="bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold px-6">
                  {creating ? "创建中..." : "确认创建"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input placeholder="搜索活动名称..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#00e8b8]/50" />
        </div>
        <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
          <Filter className="w-4 h-4 mr-2" /> 筛选
        </Button>
      </div>

      {/* List */}
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 border-dashed p-12 text-center">
          <AlertCircle className="w-12 h-12 text-[#00e8b8]/60 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">服务连接中...</h3>
          <p className="text-white/50 max-w-md">无法获取活动列表。正在尝试重新连接，请稍后...</p>
          <Button onClick={fetchCampaigns} variant="outline" className="mt-8 border-white/20 hover:bg-white/10 bg-transparent text-white">重新加载</Button>
        </div>
      ) : campaigns.length === 0 && !loading ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 border-dashed p-16 text-center">
          <Target className="w-16 h-16 text-white/20 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">暂无营销活动</h3>
          <p className="text-white/50 max-w-sm mb-8">创建您的第一个活动，系统化管理多账号矩阵的流量分发和效果回收。</p>
          <Button onClick={() => setCreateOpen(true)} className="bg-white/10 text-white hover:bg-white/20 border border-white/10">创建活动</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/dashboard/campaigns/${campaign.id}`} className="block group">
              <Card className="bg-[#0b0f1a] border-white/10 shadow-none hover:border-[#00e8b8]/40 transition-colors h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00e8b8]/0 via-[#00e8b8]/50 to-[#00e8b8]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      {getStatusBadge(campaign.status)}
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-white/30 hover:text-white hover:bg-white/10 -mr-2 -mt-2">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00e8b8] transition-colors line-clamp-1">{campaign.name}</h3>
                    <p className="text-xs text-white/40 font-medium mb-6">
                      {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 mt-auto">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1"><Play className="w-3 h-3" /> 视频</p>
                      <p className="font-bold text-white/90">{campaign.videoCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> 播放</p>
                      <p className="font-bold text-white/90">{formatCompactNumber(campaign.totalViews)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> ROI</p>
                      <p className={`font-bold ${campaign.roi >= 1.5 ? 'text-[#00e8b8]' : campaign.roi >= 1 ? 'text-white/90' : 'text-yellow-500'}`}>
                        {campaign.roi}x
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
