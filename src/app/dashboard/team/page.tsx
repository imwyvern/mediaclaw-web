"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Shield,
  Video,
  TrendingUp,
  AlertCircle,
  Network
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "publisher";
  avatarUrl?: string;
  platforms: string[];
  assignedVideos: number;
  publishRate: number;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "", email: "", role: "editor", platforms: "抖音,小红书"
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [membersRes, rulesRes] = await Promise.all([
        fetch("/api/v1/org/members").catch(() => null),
        fetch("/api/v1/distribution/rules").catch(() => null)
      ]);
      
      if (!membersRes?.ok) throw new Error("获取团队数据失败");
      
      const membersData = await membersRes.json();
      const rulesData = rulesRes?.ok ? await rulesRes.json() : { data: [] };
      
      setMembers(Array.isArray(membersData.data) ? membersData.data : []);
      setRules(Array.isArray(rulesData.data) ? rulesData.data : []);
    } catch (err: any) {
      console.error(err);
      setError("服务连接中...");
      setMembers([]);
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/v1/org/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMember,
          platforms: newMember.platforms.split(',').map(p => p.trim()).filter(Boolean)
        })
      });
      if (!res.ok) throw new Error("添加失败");
      
      toast.success("成员邀请已发送");
      setCreateOpen(false);
      setNewMember({ name: "", email: "", role: "editor", platforms: "抖音,小红书" });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "添加成员请求失败");
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <Badge className="bg-purple-500/20 text-purple-400 border-none font-normal">管理员</Badge>;
      case "editor": return <Badge className="bg-blue-500/20 text-blue-400 border-none font-normal">创作者</Badge>;
      case "publisher": return <Badge className="bg-[#00e8b8]/20 text-[#00e8b8] border-none font-normal">发布者</Badge>;
      default: return <Badge className="bg-white/10 text-white/70 border-none font-normal">成员</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-8rem)] text-[#f0f0f0] animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-1 flex items-center gap-3">
            <Users className="w-8 h-8 text-[#00e8b8]" />
            团队与分发规则
          </h1>
          <p className="text-white/50">管理团队成员权限，配置自动化分发管线与负责人员</p>
        </div>
        
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold px-6">
              <Plus className="w-4 h-4 mr-2" /> 添加成员
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0b0f1a] border-white/10 text-white sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00e8b8]" /> 邀请团队成员
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">成员姓名</label>
                <Input required value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" placeholder="例如：张三" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">登录邮箱</label>
                <Input type="email" required value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" placeholder="zhangsan@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">系统角色</label>
                <Select value={newMember.role} onValueChange={(val) => val && setNewMember({...newMember, role: val as any})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-[#00e8b8]/50">
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0b0f1a] border-white/10 text-white">
                    <SelectItem value="admin">管理员</SelectItem>
                    <SelectItem value="editor">创作者 (仅制作不发布)</SelectItem>
                    <SelectItem value="publisher">发布者 (负责审核与多平台分发)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">绑定平台 (用逗号分隔)</label>
                <Input value={newMember.platforms} onChange={e => setNewMember({...newMember, platforms: e.target.value})} className="bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" placeholder="例如：抖音,快手" />
                <p className="text-[10px] text-white/40">发布者将仅能看到绑定平台的分发任务</p>
              </div>
              <DialogFooter className="pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} className="text-white/50 hover:text-white">取消</Button>
                <Button type="submit" disabled={creating} className="bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold px-6">
                  {creating ? "发送邀请..." : "发送邀请"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 border-dashed p-12 text-center">
          <AlertCircle className="w-12 h-12 text-[#00e8b8]/60 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">服务连接中...</h3>
          <p className="text-white/50 max-w-md">无法获取团队数据。正在尝试重新连接，请稍后...</p>
          <Button onClick={fetchData} variant="outline" className="mt-8 border-white/20 hover:bg-white/10 bg-transparent text-white">重新加载</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input placeholder="搜索成员姓名..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#00e8b8]/50" />
              </div>
              <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                <Filter className="w-4 h-4 mr-2" /> 角色筛选
              </Button>
            </div>

            {members.length === 0 && !loading ? (
              <div className="bg-white/5 rounded-2xl border border-white/10 border-dashed p-16 text-center">
                <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">暂无团队成员</h3>
                <p className="text-white/50 max-w-sm mx-auto mb-8">邀请团队成员协同办公，提升多平台分发效率。</p>
              </div>
            ) : (
              <div className="bg-[#0b0f1a] border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-white/50 uppercase bg-white/[0.02] border-b border-white/10">
                      <tr>
                        <th className="px-4 py-3">成员</th>
                        <th className="px-4 py-3">角色</th>
                        <th className="px-4 py-3">负责平台</th>
                        <th className="px-4 py-3 text-right">待处理任务</th>
                        <th className="px-4 py-3 text-right">完播/准时率</th>
                        <th className="px-4 py-3 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-white/10">
                                <AvatarImage src={member.avatarUrl} />
                                <AvatarFallback className="bg-white/10 text-white/70">{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-white/90 group-hover:text-[#00e8b8] transition-colors">{member.name}</p>
                                <p className="text-xs text-white/40">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">{getRoleBadge(member.role)}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {member.platforms && member.platforms.length > 0 ? (
                                member.platforms.map((p, i) => (
                                  <Badge key={i} variant="outline" className="bg-white/5 border-white/10 font-normal px-1.5 py-0 text-[10px]">
                                    {p}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-white/30 text-xs italic">无限制</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 font-bold text-white/80">
                              <Video className="w-3.5 h-3.5 text-white/40" />
                              {member.assignedVideos || 0}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className={`font-bold ${member.publishRate >= 90 ? 'text-[#00e8b8]' : member.publishRate >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {member.publishRate || 0}%
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none">
                                <MoreVertical className="w-4 h-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#0b0f1a] border-white/10 text-white">
                                <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                                  查看数据详情
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                                  编辑角色权限
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer">
                                  移除成员
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
              <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Network className="w-5 h-5 text-[#00e8b8]" />
                  分发管线规则
                </CardTitle>
                <CardDescription className="text-white/50">控制自动化发布的路由方向</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {rules.length === 0 && !loading ? (
                  <div className="p-6 text-center text-white/40 text-sm">
                    <Network className="w-8 h-8 mx-auto mb-3 text-white/20" />
                    未配置分发规则。<br/>视频目前需手动指派给发布者。
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {rules.map((rule, idx) => (
                      <div key={idx} className="p-5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-white/90 text-sm">{rule.pipelineName || "未命名管线"}</h4>
                          <Badge variant="outline" className="bg-[#00e8b8]/10 text-[#00e8b8] border-[#00e8b8]/30 px-2 py-0 text-[10px]">
                            自动化
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm text-white/60">
                          <div className="flex justify-between">
                            <span>触发条件:</span>
                            <span className="text-white/80 font-medium">{rule.condition || "所有视频"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>分配给:</span>
                            <span className="text-white/80 font-medium">{rule.assignee || "随机空闲发布者"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-4 border-t border-white/5">
                  <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 border-dashed">
                    <Plus className="w-4 h-4 mr-2" /> 新增路由规则
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
              <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  安全与权限
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-sm text-white/60">
                <div className="flex items-center justify-between">
                  <span>多平台账号密码查看</span>
                  <Badge variant="outline" className="bg-white/5 border-white/10 text-white/50">仅管理员</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>活动预算管理</span>
                  <Badge variant="outline" className="bg-white/5 border-white/10 text-white/50">仅管理员</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>草稿免审直接发布</span>
                  <Badge variant="outline" className="bg-white/5 border-white/10 text-white/50">管理员/发布者</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
