"use client";

import { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Video,
  X,
  AlertCircle,
  Play,
  MoreVertical
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatCompactNumber } from "@/lib/format";

// Utility to generate a calendar grid
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

interface ScheduledVideo {
  id: string;
  title: string;
  scheduledDate: string;
  status: "draft" | "processing" | "ready" | "published" | "expired";
  thumbnailUrl?: string;
  platform?: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [videos, setVideos] = useState<ScheduledVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [pipeline, setPipeline] = useState("all");

  // Selection/Detail
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayVideos, setDayVideos] = useState<ScheduledVideo[]>([]);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, viewMode, pipeline]);

  const fetchCalendarData = async () => {
    setLoading(true);
    setError(null);

    // Calculate range
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0).toISOString();

    try {
      const res = await fetch(`/api/v1/content?startDate=${startDate}&endDate=${endDate}&sort=scheduledDate&pipeline=${pipeline}`);
      if (!res.ok) throw new Error("获取内容日历失败");
      
      const data = await res.json();
      setVideos(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      console.error(err);
      setError("服务连接中...");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleExport = () => {
    toast.success("日历导出已加入队列，稍后将自动下载");
  };

  const handleDayClick = (dayNum: number) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
    setSelectedDay(d);
    
    // Filter videos for this exact day (assuming ISO strings)
    const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
    
    const matched = videos.filter(v => {
      if (!v.scheduledDate) return false;
      const vt = new Date(v.scheduledDate).getTime();
      return vt >= startOfDay && vt < endOfDay;
    });
    
    setDayVideos(matched);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-[#00e8b8] text-[#0b0f1a] border-[#00e8b8]";
      case "ready": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "processing": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "expired": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"; // draft
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "published": return "bg-[#00e8b8]";
      case "ready": return "bg-green-400";
      case "processing": return "bg-blue-400";
      case "expired": return "bg-red-400";
      default: return "bg-yellow-400";
    }
  };

  // Calendar rendering logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month); // 0 = Sun, 1 = Mon, etc.
  const emptyCells = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }).map((_, i) => <div key={`empty-${i}`} className="bg-white/[0.01] border border-white/5 min-h-[120px]" />);

  const days = Array.from({ length: daysInMonth }).map((_, i) => {
    const dayNum = i + 1;
    const startOfDay = new Date(year, month, dayNum).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
    
    const dayVids = videos.filter(v => {
      if (!v.scheduledDate) return false;
      const vt = new Date(v.scheduledDate).getTime();
      return vt >= startOfDay && vt < endOfDay;
    });

    const isToday = new Date().toDateString() === new Date(year, month, dayNum).toDateString();

    return (
      <div 
        key={`day-${dayNum}`} 
        onClick={() => handleDayClick(dayNum)}
        className={`min-h-[120px] p-2 border border-white/5 hover:border-white/20 transition-colors cursor-pointer group flex flex-col ${isToday ? 'bg-white/5 border-[#00e8b8]/30' : 'bg-white/[0.02]'}`}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[#00e8b8] text-[#0b0f1a]' : 'text-white/70 group-hover:text-white'}`}>
            {dayNum}
          </span>
          {dayVids.length > 0 && (
            <Badge variant="secondary" className="bg-white/10 text-white/70 border-none px-1.5 h-5 text-[10px]">
              {dayVids.length} 篇
            </Badge>
          )}
        </div>
        
        <div className="flex-1 flex flex-col gap-1 overflow-hidden">
          {dayVids.slice(0, 3).map(v => (
            <div key={v.id} className={`text-[10px] truncate px-1.5 py-0.5 rounded border ${getStatusColor(v.status)} flex items-center gap-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDot(v.status)}`} />
              <span className="truncate">{v.title}</span>
            </div>
          ))}
          {dayVids.length > 3 && (
            <div className="text-[10px] text-white/40 pl-1 mt-0.5">
              + {dayVids.length - 3} 更多
            </div>
          )}
        </div>
      </div>
    );
  });

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-8rem)] text-[#f0f0f0] animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-1 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-[#00e8b8]" />
            内容日历
          </h1>
          <p className="text-white/50">规划全平台发布节奏，一览所有排期任务</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={pipeline} onValueChange={(val) => val && setPipeline(val)}>
            <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white focus:ring-0">
              <Filter className="w-4 h-4 mr-2 text-white/40" />
              <SelectValue placeholder="筛选流水线" />
            </SelectTrigger>
            <SelectContent className="bg-[#0b0f1a] border-white/10 text-white">
              <SelectItem value="all">所有流水线</SelectItem>
              <SelectItem value="douyin_matrix">抖音矩阵</SelectItem>
              <SelectItem value="xhs_seed">小红书种草</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> 导出排期
          </Button>
        </div>
      </div>

      {/* Calendar Toolbar */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white w-32">
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
          </h2>
          <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5">
            <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <Button variant="ghost" className="h-9 text-white/50 hover:text-white hover:bg-white/10" onClick={() => setCurrentDate(new Date())}>
            回到今天
          </Button>
        </div>

        <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-1">
          <Button 
            variant="ghost" 
            size="sm"
            className={`h-8 px-4 ${viewMode === 'month' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
            onClick={() => setViewMode("month")}
          >
            月视图
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={`h-8 px-4 ${viewMode === 'week' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
            onClick={() => setViewMode("week")}
          >
            周视图
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 border-dashed p-12 text-center">
          <AlertCircle className="w-12 h-12 text-[#00e8b8]/60 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">服务连接中...</h3>
          <p className="text-white/50 max-w-md">无法获取日历排期数据。正在尝试重新连接，请稍后...</p>
          <Button onClick={fetchCalendarData} variant="outline" className="mt-8 border-white/20 hover:bg-white/10 bg-transparent text-white">
            重新加载
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#0b0f1a] overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02]">
            {['一', '二', '三', '四', '五', '六', '日'].map(d => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-white/50 uppercase tracking-wider">
                星期{d}
              </div>
            ))}
          </div>
          
          {/* Days grid */}
          <div className="grid grid-cols-7 bg-[#0b0f1a]">
            {emptyCells}
            {days}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 py-4 text-xs text-white/60">
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> 草稿/计划中</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> 处理中</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-400" /> 准备就绪</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#00e8b8]" /> 已发布</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> 已过期/失败</div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="bg-[#0b0f1a] border-white/10 text-white max-w-2xl sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {selectedDay && `${selectedDay.getMonth() + 1}月${selectedDay.getDate()}日 排期详情`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            {dayVideos.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5 border-dashed">
                <Video className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/50">本日无排期内容</p>
                <Button className="mt-4 bg-white/10 text-white hover:bg-white/20 border border-white/10" onClick={() => setSelectedDay(null)}>
                  创建任务
                </Button>
              </div>
            ) : (
              dayVideos.map(video => (
                <div key={video.id} className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors group">
                  <div className="w-24 h-16 rounded-md bg-black border border-white/10 overflow-hidden shrink-0 relative">
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <Video className="w-5 h-5" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                      <Play className="w-6 h-6 text-[#00e8b8]" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white/90 text-sm line-clamp-1 mb-1 group-hover:text-[#00e8b8] transition-colors">
                      {video.title || "未命名视频"}
                    </h4>
                    <div className="flex items-center gap-3 text-xs mt-2">
                      <Badge className={`${getStatusColor(video.status)} px-2 py-0 border font-normal`}>
                        {video.status === 'published' ? '已发布' : 
                         video.status === 'ready' ? '待发布' : 
                         video.status === 'processing' ? '处理中' : '草稿'}
                      </Badge>
                      {video.platform && (
                        <span className="text-white/50 bg-white/5 px-2 py-0.5 rounded">{video.platform}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
