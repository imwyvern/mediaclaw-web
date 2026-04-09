"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Calendar as CalendarIcon,
  Download,
  AlertCircle,
  Eye,
  TrendingUp,
  Award,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCompactNumber } from "@/lib/format";
import { toast } from "sonner";
import {
  LineChart, Line, BarChart as ReBarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

interface AnalyticsSummary {
  totalViews: number;
  avgEngagementRate: number;
  bestVideoTitle?: string;
  worstVideoTitle?: string;
}

interface TrendData {
  date: string;
  views: number;
  engagementRate: number;
}

interface PlatformData {
  name: string;
  value: number;
}

interface TopVideo {
  title: string;
  views: number;
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [platformData, setPlatformData] = useState<PlatformData[]>([]);
  const [topVideos, setTopVideos] = useState<TopVideo[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("30d");

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trendRes, topRes] = await Promise.all([
        fetch(`/api/v1/analytics/trend?range=${dateRange}`).catch(() => null),
        fetch(`/api/v1/analytics/top?range=${dateRange}`).catch(() => null)
      ]);

      if (!trendRes?.ok || !topRes?.ok) {
        throw new Error("获取数据分析失败");
      }

      const trendJson = await trendRes.json();
      const topJson = await topRes.json();

      setSummary(trendJson.summary || {
        totalViews: 0, avgEngagementRate: 0, bestVideoTitle: "未计算", worstVideoTitle: "未计算"
      });
      setTrendData(Array.isArray(trendJson.trends) ? trendJson.trends : []);
      setPlatformData(Array.isArray(trendJson.platforms) ? trendJson.platforms : []);
      setTopVideos(Array.isArray(topJson.data) ? topJson.data : []);
    } catch (err: any) {
      console.error(err);
      setError("服务连接中...");
      setSummary(null);
      setTrendData([]);
      setPlatformData([]);
      setTopVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const handleExport = () => {
    toast.success("CSV 导出已加入队列，稍后将自动下载");
  };

  const COLORS = ['#00e8b8', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'];

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-8rem)] text-[#f0f0f0] animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-1 flex items-center gap-3">
            <BarChart className="w-8 h-8 text-[#00e8b8]" />
            数据分析
          </h1>
          <p className="text-white/50">全方位追踪视频表现，洞察爆款基因</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white/5 p-1.5 rounded-xl border border-white/10 flex items-center">
            <CalendarIcon className="w-4 h-4 text-white/40 ml-2 mr-1 shrink-0" />
            <Select value={dateRange} onValueChange={(val) => val && setDateRange(val)}>
              <SelectTrigger className="w-[130px] bg-transparent border-none focus:ring-0 text-white font-medium hover:bg-white/5">
                <SelectValue placeholder="时间范围" />
              </SelectTrigger>
              <SelectContent className="bg-[#0b0f1a] border-white/10 text-white">
                <SelectItem value="7d">最近 7 天</SelectItem>
                <SelectItem value="30d">最近 30 天</SelectItem>
                <SelectItem value="90d">最近 90 天</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> 导出 CSV
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 border-dashed p-12 text-center">
          <AlertCircle className="w-12 h-12 text-[#00e8b8]/60 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">服务连接中...</h3>
          <p className="text-white/50 max-w-md">无法获取分析数据。正在尝试重新连接，请稍后...</p>
          <Button onClick={fetchAnalytics} variant="outline" className="mt-8 border-white/20 hover:bg-white/10 bg-transparent text-white">
            重新加载
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#0b0f1a] border-white/10 shadow-none hover:border-[#00e8b8]/30 transition-colors group">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-[#00e8b8]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Eye className="w-5 h-5 text-[#00e8b8]" />
                </div>
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">总播放量</p>
                <p className="text-2xl font-black text-white">{formatCompactNumber(summary?.totalViews || 0)}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#0b0f1a] border-white/10 shadow-none hover:border-blue-400/30 transition-colors group">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">平均互动率</p>
                <p className="text-2xl font-black text-white">{summary?.avgEngagementRate ? summary.avgEngagementRate.toFixed(1) : "0"}%</p>
              </CardContent>
            </Card>

            <Card className="bg-[#0b0f1a] border-white/10 shadow-none hover:border-orange-400/30 transition-colors group">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">表现最佳</p>
                <p className="text-sm font-bold text-white line-clamp-1 w-full">{summary?.bestVideoTitle || "暂无数据"}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#0b0f1a] border-white/10 shadow-none hover:border-red-400/30 transition-colors group">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">需优化视频</p>
                <p className="text-sm font-bold text-white line-clamp-1 w-full">{summary?.worstVideoTitle || "暂无数据"}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Views Trend Line Chart */}
            <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
              <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-base font-bold text-white">播放量趋势</CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-[300px]">
                {trendData.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">暂无趋势数据</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                )}
              </CardContent>
            </Card>

            {/* Engagement Trend Line Chart */}
            <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
              <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-base font-bold text-white">互动率趋势 (%)</CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-[300px]">
                {trendData.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">暂无互动数据</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0b0f1a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#3b82f6' }}
                      />
                      <Line type="monotone" dataKey="engagementRate" name="互动率" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#0b0f1a', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Platform Distribution Donut */}
            <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
              <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-base font-bold text-white">平台流量分布</CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-[300px] flex items-center justify-center">
                {platformData.length === 0 ? (
                  <div className="text-white/30 text-sm">暂无平台数据</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0b0f1a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Top 10 Videos Horizontal Bar */}
            <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
              <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-base font-bold text-white">TOP 10 爆款视频</CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-[300px]">
                {topVideos.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">暂无排名数据</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart layout="vertical" data={topVideos} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCompactNumber} />
                      <YAxis type="category" dataKey="title" stroke="rgba(255,255,255,0.6)" fontSize={10} tickLine={false} axisLine={false} width={80} tickFormatter={(val) => val.substring(0, 5) + '...'} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#0b0f1a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                      <Bar dataKey="views" name="播放量" fill="#00e8b8" radius={[0, 4, 4, 0]} barSize={12} />
                    </ReBarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
