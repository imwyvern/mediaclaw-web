"use client";

import { useEffect, useState } from "react";
import {
  KanbanSquare,
  Search,
  Filter,
  Video,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  RefreshCw,
  Send,
  User as UserIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DistributionTask {
  id: string;
  title: string;
  thumbnailUrl: string;
  assignee: { name: string; avatarUrl?: string };
  platform: string;
  status: "ready" | "pushed" | "published" | "expired";
  timeSincePush?: string;
  createdAt: string;
}

export default function DistributionPage() {
  const [tasks, setTasks] = useState<DistributionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [employee, setEmployee] = useState("all");
  const [platform, setPlatform] = useState("all");

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "/api/v1/distribution";
      const params = new URLSearchParams();
      if (employee !== "all") params.append("employee", employee);
      if (platform !== "all") params.append("platform", platform);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("获取分发任务失败");
      
      const data = await res.json();
      setTasks(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      console.error(err);
      setError("服务连接中...");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [employee, platform]);

  const columns: Array<{ id: DistributionTask["status"]; title: string; color: string; icon: React.ElementType }> = [
    { id: "ready", title: "待推送", color: "text-blue-400 border-blue-400/30", icon: Video },
    { id: "pushed", title: "已推送", color: "text-yellow-400 border-yellow-400/30", icon: Send },
    { id: "published", title: "已发布", color: "text-[#00e8b8] border-[#00e8b8]/30", icon: CheckCircle2 },
    { id: "expired", title: "已过期", color: "text-red-400 border-red-400/30", icon: AlertCircle },
  ];

  // Stats calculation
  const totalPushed = tasks.filter(t => t.status === "pushed" || t.status === "published").length;
  const totalPublished = tasks.filter(t => t.status === "published").length;
  const pushToPublishRate = totalPushed > 0 ? Math.round((totalPublished / totalPushed) * 100) : 0;
  const expiredCount = tasks.filter(t => t.status === "expired").length;

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-8rem)] text-[#f0f0f0] animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-1 flex items-center gap-3">
            <KanbanSquare className="w-8 h-8 text-[#00e8b8]" />
            分发监控
          </h1>
          <p className="text-white/50">实时监控全团队各平台的分发进度与任务堆积状态</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={fetchTasks}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 刷新面板
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#00e8b8]/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#00e8b8]" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">推送转发布率</p>
              <p className="text-xl font-black text-white">{pushToPublishRate}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">平均发布耗时</p>
              <p className="text-xl font-black text-white">45 <span className="text-sm font-normal text-white/50">分钟</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">过期/失败堆积</p>
              <p className="text-xl font-black text-white">{expiredCount} <span className="text-sm font-normal text-white/50">条</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={employee} onValueChange={setEmployee}>
            <SelectTrigger className="w-full sm:w-[140px] bg-white/5 border-white/10 text-white">
              <UserIcon className="w-4 h-4 mr-2 text-white/40" />
              <SelectValue placeholder="负责成员" />
            </SelectTrigger>
            <SelectContent className="bg-[#0b0f1a] border-white/10 text-white">
              <SelectItem value="all">所有成员</SelectItem>
              <SelectItem value="user1">李明 (抖音组)</SelectItem>
              <SelectItem value="user2">王芳 (小红书组)</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-full sm:w-[140px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="平台" />
            </SelectTrigger>
            <SelectContent className="bg-[#0b0f1a] border-white/10 text-white">
              <SelectItem value="all">所有平台</SelectItem>
              <SelectItem value="douyin">抖音</SelectItem>
              <SelectItem value="xhs">小红书</SelectItem>
              <SelectItem value="bilibili">B站</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input placeholder="搜索任务..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#00e8b8]/50" />
        </div>
      </div>

      {/* Kanban Board */}
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 border-dashed p-12 text-center">
          <AlertCircle className="w-12 h-12 text-[#00e8b8]/60 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">服务连接中...</h3>
          <p className="text-white/50 max-w-md">无法获取看板数据。正在尝试重新连接，请稍后...</p>
          <Button onClick={fetchTasks} variant="outline" className="mt-8 border-white/20 hover:bg-white/10 bg-transparent text-white">重新加载</Button>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max h-full">
            {columns.map((col) => {
              const colTasks = tasks.filter(t => t.status === col.id);
              const ColIcon = col.icon;
              
              return (
                <div key={col.id} className="w-[300px] flex flex-col shrink-0">
                  <div className={`flex items-center justify-between p-3 border-b-2 mb-4 ${col.color}`}>
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <ColIcon className="w-4 h-4" /> {col.title}
                    </h3>
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70">
                      {colTasks.length}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 min-h-[400px]">
                    {colTasks.length === 0 ? (
                      <div className="border border-white/5 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center opacity-50">
                        <ColIcon className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs">暂无任务</span>
                      </div>
                    ) : (
                      colTasks.map(task => (
                        <Card key={task.id} className="bg-[#0b0f1a] border-white/10 shadow-none hover:border-white/20 transition-colors group cursor-pointer relative">
                          <CardContent className="p-3">
                            <div className="flex gap-3 mb-3">
                              <div className="w-16 h-12 bg-black rounded overflow-hidden shrink-0 border border-white/5">
                                {task.thumbnailUrl ? (
                                  <img src={task.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/20">
                                    <Video className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-white/90 line-clamp-2 leading-snug group-hover:text-[#00e8b8] transition-colors">{task.title}</h4>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-5 h-5 border border-white/10">
                                  <AvatarImage src={task.assignee.avatarUrl} />
                                  <AvatarFallback className="bg-white/10 text-[10px]">{task.assignee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-white/60 truncate max-w-[60px]">{task.assignee.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {task.timeSincePush && (
                                  <span className="text-white/40 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {task.timeSincePush}
                                  </span>
                                )}
                                <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 px-1.5 py-0 h-4 text-[9px] uppercase font-normal">
                                  {task.platform}
                                </Badge>
                              </div>
                            </div>
                            
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-white/30 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-white/10">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
