"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  GitMerge,
  Settings,
  Clock,
  Play,
  History,
  ThumbsUp,
  AlertCircle,
  RefreshCw,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface PipelineRun {
  id: string;
  date: string;
  videosProduced: number;
  successCount: number;
  failCount: number;
}

interface PipelineDetail {
  id: string;
  name: string;
  status: "active" | "paused";
  templateType: string;
  schedule: string;
  targetPlatforms: string[];
  params: any;
  feedback: { preferences: string[] };
  runs: PipelineRun[];
}

export default function PipelineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [pipeline, setPipeline] = useState<PipelineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/pipelines/${id}`);
        if (!res.ok) throw new Error("获取详情失败");
        const data = await res.json();
        setPipeline(data.data);
      } catch (err: any) {
        console.error(err);
        setError("无法加载管线详情");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) return null;

  if (error || !pipeline) {
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white/50 hover:text-white hover:bg-white/10 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-white">{pipeline.name}</h1>
              {getStatusBadge(pipeline.status)}
            </div>
            <p className="text-sm text-white/50 flex items-center gap-4">
              <span>ID: {pipeline.id}</span>
              <span className="flex items-center gap-1 uppercase"><GitMerge className="w-3.5 h-3.5" /> 模版 {pipeline.templateType}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
            <Settings className="w-4 h-4 mr-2" /> 配置
          </Button>
          <Button className="bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold px-6">
            <Play className="w-4 h-4 mr-2" /> 立即运行
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center gap-2">
              <Settings className="w-5 h-5 text-[#00e8b8]" />
              <CardTitle className="text-base font-bold text-white">运行配置</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70 uppercase tracking-wider">执行排期</label>
                  <Input value={pipeline.schedule} readOnly className="bg-white/5 border-white/10 text-white font-mono text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70 uppercase tracking-wider">目标分发平台</label>
                  <div className="flex gap-2 mt-2">
                    {pipeline.targetPlatforms?.map(p => (
                      <Badge key={p} variant="outline" className="bg-white/5 border-white/10 font-normal px-2.5">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70 uppercase tracking-wider">模版参数 JSON</label>
                <Textarea value={JSON.stringify(pipeline.params, null, 2)} readOnly className="bg-black/50 border-white/10 text-white/80 font-mono text-xs min-h-[150px]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center gap-2">
              <History className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-bold text-white">运行历史</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pipeline.runs && pipeline.runs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-white/50 uppercase bg-white/[0.02] border-b border-white/10">
                      <tr>
                        <th className="px-6 py-3">执行日期</th>
                        <th className="px-6 py-3 text-right">生成总数</th>
                        <th className="px-6 py-3 text-right">成功</th>
                        <th className="px-6 py-3 text-right">失败</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pipeline.runs.map((r) => (
                        <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="px-6 py-4 text-white/90">{new Date(r.date).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-medium">{r.videosProduced}</td>
                          <td className="px-6 py-4 text-right text-green-400">{r.successCount}</td>
                          <td className="px-6 py-4 text-right text-red-400">{r.failCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-white/40 text-sm">暂无运行历史</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-purple-400" />
                <CardTitle className="text-base font-bold text-white">模型偏好</CardTitle>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-500/10">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-sm text-white/50">系统会根据此管线过往产出的爆款视频数据，自动总结并沉淀生成偏好。</p>
              
              <div className="space-y-3">
                <h4 className="text-xs text-white/40 uppercase tracking-wider">已积累特征</h4>
                <div className="flex flex-col gap-2">
                  {pipeline.feedback?.preferences?.map((p, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-lg text-sm text-white/80">
                      {p}
                    </div>
                  )) || <div className="text-sm text-white/30 italic">正在积累中...</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
