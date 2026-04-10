"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GitMerge,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Activity,
  Settings,
  Clock,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCompactNumber } from "@/lib/format";
import { toast } from "sonner";

interface Pipeline {
  id: string;
  name: string;
  templateType: string;
  status: "active" | "paused";
  videoCount: number;
  lastRunDate: string;
}

export default function PipelinesPage() {
  const router = useRouter();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPipeline, setNewPipeline] = useState({
    name: "", templateType: "b7", brandConfig: "", schedule: "0 0 * * *"
  });

  const fetchPipelines = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/pipelines");
      if (!res.ok) throw new Error("获取管线列表失败");
      const data = await res.json();
      setPipelines(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      console.error(err);
      setError("服务连接中...");
      setPipelines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/v1/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPipeline)
      });
      if (!res.ok) throw new Error("创建失败");
      
      toast.success("分发管线创建成功");
      setCreateOpen(false);
      setNewPipeline({ name: "", templateType: "b7", brandConfig: "", schedule: "0 0 * * *" });
      fetchPipelines();
    } catch (err: any) {
      toast.error(err.message || "创建管线请求失败");
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-[#00e8b8]/20 text-[#00e8b8] border-none font-normal">运行中</Badge>;
      case "paused": return <Badge className="bg-yellow-500/20 text-yellow-400 border-none font-normal">已暂停</Badge>;
      default: return <Badge className="bg-white/10 text-white/70 border-none font-normal">未知</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-8rem)] text-[#f0f0f0] animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-1 flex items-center gap-3">
            <GitMerge className="w-8 h-8 text-[#00e8b8]" />
            管线管理
          </h1>
          <p className="text-white/50">配置自动化内容生产流，批量生成多账号矩阵视频</p>
        </div>
        
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold px-6">
              <Plus className="w-4 h-4 mr-2" /> 创建管线
          </DialogTrigger>
          <DialogContent className="bg-[#0b0f1a] border-white/10 text-white sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-[#00e8b8]" /> 创建生产管线
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">管线名称</label>
                <Input required value={newPipeline.name} onChange={e => setNewPipeline({...newPipeline, name: e.target.value})} className="bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" placeholder="例如：春季新品混剪矩阵" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">模版类型</label>
                <Select value={newPipeline.templateType} onValueChange={v => v && setNewPipeline({...newPipeline, templateType: v})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-[#00e8b8]/50">
                    <SelectValue placeholder="选择模版" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0b0f1a] border-white/10 text-white">
                    <SelectItem value="b7">B7 - 爆款混剪</SelectItem>
                    <SelectItem value="b9">B9 - 口播数字人</SelectItem>
                    <SelectItem value="b10">B10 - 图文转视频</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">执行排期 (Cron / 描述)</label>
                <Input required value={newPipeline.schedule} onChange={e => setNewPipeline({...newPipeline, schedule: e.target.value})} className="bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" placeholder="例如：每天上午 10 点" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">品牌预设参数</label>
                <Input value={newPipeline.brandConfig} onChange={e => setNewPipeline({...newPipeline, brandConfig: e.target.value})} className="bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" placeholder="关联品牌资源..." />
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

      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input placeholder="搜索管线名称..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#00e8b8]/50" />
        </div>
        <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
          <Filter className="w-4 h-4 mr-2" /> 筛选
        </Button>
      </div>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 border-dashed p-12 text-center">
          <AlertCircle className="w-12 h-12 text-[#00e8b8]/60 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">服务连接中...</h3>
          <p className="text-white/50 max-w-md">无法获取管线列表。正在尝试重新连接，请稍后...</p>
          <Button onClick={fetchPipelines} variant="outline" className="mt-8 border-white/20 hover:bg-white/10 bg-transparent text-white">重新加载</Button>
        </div>
      ) : pipelines.length === 0 && !loading ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 border-dashed p-16 text-center">
          <GitMerge className="w-16 h-16 text-white/20 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">暂无管线</h3>
          <p className="text-white/50 max-w-sm mb-8">创建您的第一条管线，实现内容生成的自动化流水线。</p>
          <Button onClick={() => setCreateOpen(true)} className="bg-white/10 text-white hover:bg-white/20 border border-white/10">创建管线</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pipelines.map((pipeline) => (
            <Link key={pipeline.id} href={`/dashboard/pipelines/${pipeline.id}`} className="block group">
              <Card className="bg-[#0b0f1a] border-white/10 shadow-none hover:border-[#00e8b8]/40 transition-colors h-full flex flex-col relative overflow-hidden">
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      {getStatusBadge(pipeline.status)}
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-white/30 hover:text-white hover:bg-white/10 -mr-2 -mt-2">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00e8b8] transition-colors line-clamp-1">{pipeline.name}</h3>
                    <div className="flex items-center gap-2 mb-6">
                      <Badge variant="outline" className="bg-white/5 text-white/60 border-white/10 text-[10px] px-1.5 py-0 uppercase">
                        {pipeline.templateType}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4 mt-auto">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> 产出视频</p>
                      <p className="font-bold text-white/90">{formatCompactNumber(pipeline.videoCount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> 最近运行</p>
                      <p className="font-bold text-white/90 text-sm">{pipeline.lastRunDate ? new Date(pipeline.lastRunDate).toLocaleDateString() : '尚未运行'}</p>
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
