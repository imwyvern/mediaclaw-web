"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar as CalendarIcon,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  File,
  Send
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface ExportJob {
  id: string;
  name: string;
  type: string;
  format: string;
  dateRange: string;
  status: "completed" | "processing" | "failed";
  createdAt: string;
  url?: string;
}

export default function AnalyticsExportPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  
  // Export Form State
  const [exportForm, setExportForm] = useState({
    template: "custom",
    dateRange: "30d",
    format: "csv",
    platforms: ["douyin", "xhs"],
    isScheduled: false,
    scheduleEmail: ""
  });

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/analytics/exports");
      if (!res.ok) throw new Error("获取导出记录失败");
      const data = await res.json();
      setJobs(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      console.error(err);
      setError("服务连接中...");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (exportForm.platforms.length === 0) {
      return toast.error("请至少选择一个平台");
    }
    if (exportForm.isScheduled && !exportForm.scheduleEmail) {
      return toast.error("请输入接收报表的邮箱");
    }

    setExporting(true);
    try {
      const res = await fetch("/api/v1/analytics/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exportForm)
      });
      if (!res.ok) throw new Error("导出请求失败");
      
      if (exportForm.isScheduled) {
        toast.success("定时推送报表已配置成功");
      } else {
        toast.success("导出任务已加入队列，完成后可下载");
        fetchJobs(); // Refresh jobs to show pending task
      }
    } catch (err: any) {
      toast.error(err.message || "操作失败");
    } finally {
      setExporting(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv": return <FileText className="w-4 h-4 text-blue-400" />;
      case "excel": return <FileSpreadsheet className="w-4 h-4 text-green-400" />;
      case "pdf": return <File className="w-4 h-4 text-red-400" />;
      default: return <FileText className="w-4 h-4 text-white/50" />;
    }
  };

  const availablePlatforms = [
    { id: "douyin", label: "抖音" },
    { id: "xhs", label: "小红书" },
    { id: "kuaishou", label: "快手" },
    { id: "bilibili", label: "B站" }
  ];

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-8rem)] text-[#f0f0f0] animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white/50 hover:text-white hover:bg-white/10 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
              <Download className="w-6 h-6 text-[#00e8b8]" /> 导出数据报表
            </h1>
            <p className="text-white/50 text-sm">生成详细的数据分析报告，支持自定义字段与自动推送</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Form Panel */}
        <div className="space-y-6">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="text-base font-bold text-white">配置导出任务</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleExport} className="space-y-6">
                
                <div className="space-y-3">
                  <label className="text-xs font-medium text-white/70 uppercase tracking-wider">报表模版</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "daily", label: "数据日报", desc: "前一日关键数据" },
                      { id: "weekly", label: "数据周报", desc: "本周复盘与爆款" },
                      { id: "monthly", label: "数据月报", desc: "月度 ROI 总结" },
                      { id: "custom", label: "自定义报表", desc: "按需选择维度" }
                    ].map(t => (
                      <div 
                        key={t.id}
                        onClick={() => setExportForm({...exportForm, template: t.id})}
                        className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                          exportForm.template === t.id 
                            ? 'bg-[#00e8b8]/10 border-[#00e8b8]/50 text-white' 
                            : 'bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/5'
                        }`}
                      >
                        <h4 className={`font-bold mb-1 ${exportForm.template === t.id ? 'text-[#00e8b8]' : ''}`}>{t.label}</h4>
                        <p className="text-[10px] opacity-70">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/70 uppercase tracking-wider">时间范围</label>
                    <Select value={exportForm.dateRange} onValueChange={v => v && setExportForm({...exportForm, dateRange: v})}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <CalendarIcon className="w-4 h-4 mr-2 text-white/40" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0b0f1a] border-white/10 text-white">
                        <SelectItem value="7d">最近 7 天</SelectItem>
                        <SelectItem value="30d">最近 30 天</SelectItem>
                        <SelectItem value="90d">最近 90 天</SelectItem>
                        <SelectItem value="all">所有时间</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/70 uppercase tracking-wider">导出格式</label>
                    <Select value={exportForm.format} onValueChange={v => v && setExportForm({...exportForm, format: v})}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white uppercase">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0b0f1a] border-white/10 text-white uppercase">
                        <SelectItem value="csv">CSV (适合数据分析)</SelectItem>
                        <SelectItem value="excel">Excel (适合汇报)</SelectItem>
                        <SelectItem value="pdf">PDF (可视化报告)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-white/70 uppercase tracking-wider">包含平台</label>
                  <div className="flex flex-wrap gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    {availablePlatforms.map(p => (
                      <div key={p.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`plat-${p.id}`}
                          checked={exportForm.platforms.includes(p.id)}
                          onCheckedChange={(c) => {
                            if (c) setExportForm({...exportForm, platforms: [...exportForm.platforms, p.id]});
                            else setExportForm({...exportForm, platforms: exportForm.platforms.filter(x => x !== p.id)});
                          }}
                          className="border-white/40 data-[state=checked]:bg-[#00e8b8] data-[state=checked]:border-[#00e8b8]" 
                        />
                        <label htmlFor={`plat-${p.id}`} className="text-sm font-medium leading-none text-white/80">{p.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="schedule"
                      checked={exportForm.isScheduled}
                      onCheckedChange={(c) => setExportForm({...exportForm, isScheduled: !!c})}
                      className="border-white/40 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500" 
                    />
                    <label htmlFor="schedule" className="text-sm font-medium leading-none text-white/90">
                      设置定时发送 (每天/每周一发送至邮箱)
                    </label>
                  </div>
                  
                  {exportForm.isScheduled && (
                    <div className="pl-6 animate-in slide-in-from-top-2 duration-300">
                      <Input 
                        type="email" 
                        placeholder="输入接收报表的邮箱地址" 
                        value={exportForm.scheduleEmail}
                        onChange={e => setExportForm({...exportForm, scheduleEmail: e.target.value})}
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500/50" 
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={exporting} className={`w-full h-12 font-bold text-base ${exportForm.isScheduled ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90'}`}>
                    {exporting ? "处理中..." : exportForm.isScheduled ? "保存定时任务" : "立即生成导出"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* History Panel */}
        <div className="space-y-6">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none h-full">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-white/50" />
                近期导出记录
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {error ? (
                <div className="p-8 text-center text-white/50">连接失败</div>
              ) : loading ? (
                <div className="p-8 text-center text-white/50">加载中...</div>
              ) : jobs.length === 0 ? (
                <div className="p-12 text-center text-white/40">
                  <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>暂无导出记录</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {jobs.map(job => (
                    <div key={job.id} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                          {getFormatIcon(job.format)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white/90 text-sm line-clamp-1">{job.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                            <span>{new Date(job.createdAt).toLocaleString()}</span>
                            <span>·</span>
                            <span className="uppercase">{job.format}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {job.status === "completed" ? (
                          <a href={job.url || "#"} download className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 px-3 text-[#00e8b8] hover:text-[#00e8b8] hover:bg-[#00e8b8]/10">
                            下载
                          </a>
                        ) : job.status === "processing" ? (
                          <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-medium px-3">
                            <Clock className="w-3 h-3 animate-spin" /> 生成中
                          </div>
                        ) : (
                          <span className="text-xs text-red-400 px-3">失败</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
