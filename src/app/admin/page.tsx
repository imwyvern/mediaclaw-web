"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  Users,
  Activity,
  Video,
  Search,
  Filter,
  MoreVertical,
  AlertCircle,
  Plus,
  RefreshCw,
  Server
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCompactNumber } from "@/lib/format";

interface Customer {
  id: string;
  orgName: string;
  plan: string;
  videosProduced: number;
  mrr: number;
  status: "active" | "churned" | "trial";
  joinedDate: string;
}

interface SystemStats {
  videosToday: number;
  apiCalls: number;
  errorRate: number;
  queueDepth: number;
}

export default function AdminDashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [custRes, statsRes] = await Promise.all([
        fetch("/api/v1/admin/customers").catch(() => null),
        fetch("/api/v1/admin/stats").catch(() => null)
      ]);
      
      const c = custRes?.ok ? await custRes.json() : { data: [] };
      const s = statsRes?.ok ? await statsRes.json() : null;
      
      setCustomers(Array.isArray(c.data) ? c.data : []);
      setStats(s?.data || { videosToday: 0, apiCalls: 0, errorRate: 0, queueDepth: 0 });
    } catch (err: any) {
      console.error(err);
      setError("服务连接中...");
      setCustomers([]);
      setStats({ videosToday: 0, apiCalls: 0, errorRate: 0, queueDepth: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-[#00e8b8]/20 text-[#00e8b8] border-none font-normal">活跃</Badge>;
      case "trial": return <Badge className="bg-blue-500/20 text-blue-400 border-none font-normal">试用</Badge>;
      case "churned": return <Badge className="bg-red-500/20 text-red-400 border-none font-normal">流失</Badge>;
      default: return <Badge className="bg-white/10 text-white/70 border-none font-normal">未知</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "enterprise": return <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">企业版</Badge>;
      case "pro": return <Badge variant="outline" className="bg-[#00e8b8]/10 text-[#00e8b8] border-[#00e8b8]/20">专业版</Badge>;
      default: return <Badge variant="outline" className="bg-white/5 text-white/70 border-white/10">基础版</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-8rem)] animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-1 flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#00e8b8]" />
            系统管理台
          </h1>
          <p className="text-white/50">全局客户监控与系统健康状态大屏</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
            <Server className="w-4 h-4 mr-2" /> 系统诊断
          </Button>
          <Button className="bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold px-6">
            <Plus className="w-4 h-4 mr-2" /> 新增客户
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 border-dashed p-12 text-center">
          <AlertCircle className="w-12 h-12 text-[#00e8b8]/60 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">服务连接中...</h3>
          <p className="text-white/50 max-w-md">无法获取管理后台数据。正在尝试重新连接，请稍后...</p>
          <Button onClick={fetchAdminData} variant="outline" className="mt-8 border-white/20 hover:bg-white/10 bg-transparent text-white">重新加载</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#00e8b8]/10 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-[#00e8b8]" />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-1">今日视频产出</p>
                  <p className="text-xl font-black text-white">{formatCompactNumber(stats?.videosToday || 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-1">今日 API 调用</p>
                  <p className="text-xl font-black text-white">{formatCompactNumber(stats?.apiCalls || 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-1">API 错误率</p>
                  <p className={`text-xl font-black ${(stats?.errorRate || 0) > 1 ? 'text-red-400' : 'text-white'}`}>{stats?.errorRate || 0}%</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-1">当前队列深度</p>
                  <p className={`text-xl font-black ${(stats?.queueDepth || 0) > 100 ? 'text-yellow-400' : 'text-white'}`}>{stats?.queueDepth || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00e8b8]" />
                客户列表
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input placeholder="搜索组织名称..." className="h-9 pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#00e8b8]/50" />
                </div>
                <Button variant="outline" size="sm" className="h-9 bg-white/5 border-white/10 text-white hover:bg-white/10">
                  <Filter className="w-4 h-4 mr-2" /> 筛选
                </Button>
              </div>
            </div>

            {customers.length === 0 && !loading ? (
              <div className="bg-white/5 rounded-2xl border border-white/10 border-dashed p-16 text-center">
                <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">暂无客户数据</h3>
                <p className="text-white/50 max-w-sm mx-auto mb-8">开始邀请您的第一批种子客户。</p>
              </div>
            ) : (
              <div className="bg-[#0b0f1a] border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-white/50 uppercase bg-white/[0.02] border-b border-white/10">
                      <tr>
                        <th className="px-6 py-3">组织名称</th>
                        <th className="px-6 py-3">套餐计划</th>
                        <th className="px-6 py-3 text-right">产出视频数</th>
                        <th className="px-6 py-3 text-right">MRR (¥)</th>
                        <th className="px-6 py-3">状态</th>
                        <th className="px-6 py-3">入驻日期</th>
                        <th className="px-6 py-3 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4 font-bold text-white/90 group-hover:text-[#00e8b8] transition-colors">{c.orgName}</td>
                          <td className="px-6 py-4">{getPlanBadge(c.plan)}</td>
                          <td className="px-6 py-4 text-right font-medium text-white/80">{formatCompactNumber(c.videosProduced)}</td>
                          <td className="px-6 py-4 text-right font-bold text-white/90">{formatCompactNumber(c.mrr)}</td>
                          <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                          <td className="px-6 py-4 text-white/50">{new Date(c.joinedDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
