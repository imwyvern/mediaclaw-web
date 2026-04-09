"use client";

import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Key,
  Bell,
  CreditCard,
  Building,
  UploadCloud,
  CheckCircle2,
  Copy,
  RefreshCw,
  Trash2,
  Plus,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface SettingsData {
  general: {
    orgName: string;
    timezone: string;
    language: string;
    logoUrl?: string;
  };
  apiKeys: Array<{ id: string; name: string; key: string; lastUsed: string }>;
  notifications: {
    feishu: { enabled: boolean; webhookUrl: string };
    dingtalk: { enabled: boolean; webhookUrl: string };
    wecom: { enabled: boolean; webhookUrl: string };
  };
  billing: {
    plan: string;
    usedVideos: number;
    totalVideos: number;
    history: Array<{ id: string; date: string; amount: number; status: string }>;
  };
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, apiKeysRes, billingRes] = await Promise.all([
        fetch("/api/v1/settings").catch(() => null),
        fetch("/api/v1/apikey").catch(() => null),
        fetch("/api/v1/billing/usage").catch(() => null)
      ]);

      // Handle failures gracefully with partial mock fallback to prevent crash if APIs not ready
      const s = settingsRes?.ok ? await settingsRes.json() : {};
      const k = apiKeysRes?.ok ? await apiKeysRes.json() : { data: [] };
      const b = billingRes?.ok ? await billingRes.json() : {};

      setData({
        general: s.general || { orgName: "MediaClaw Demo", timezone: "Asia/Shanghai", language: "zh-CN" },
        apiKeys: Array.isArray(k.data) ? k.data : [],
        notifications: s.notifications || {
          feishu: { enabled: false, webhookUrl: "" },
          dingtalk: { enabled: false, webhookUrl: "" },
          wecom: { enabled: false, webhookUrl: "" }
        },
        billing: b.data || { plan: "Pro", usedVideos: 124, totalVideos: 500, history: [] }
      });
    } catch (err: any) {
      console.error(err);
      setError("服务连接中...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ general: data?.general })
      });
      if (!res.ok) throw new Error("保存失败");
      toast.success("基础设置已更新");
    } catch (err: any) {
      toast.error(err.message || "设置更新失败");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications: data?.notifications })
      });
      if (!res.ok) throw new Error("保存失败");
      toast.success("通知设置已更新");
    } catch (err: any) {
      toast.error(err.message || "设置更新失败");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  if (error || !data) {
    return (
      <div className="flex flex-col gap-6 min-h-[calc(100vh-8rem)] text-[#f0f0f0] animate-in fade-in">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-1 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-[#00e8b8]" /> 设置
          </h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 border-dashed p-12 text-center">
          <AlertCircle className="w-12 h-12 text-[#00e8b8]/60 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">服务连接中...</h3>
          <p className="text-white/50 max-w-md">无法获取设置数据。正在尝试重新连接，请稍后...</p>
          <Button onClick={fetchSettings} variant="outline" className="mt-8 border-white/20 hover:bg-white/10 bg-transparent text-white">重新加载</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-8rem)] text-[#f0f0f0] animate-in fade-in">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white mb-1 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-[#00e8b8]" />
          设置
        </h1>
        <p className="text-white/50">管理组织信息、API 密钥、系统通知及账单</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 mb-6 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-[#0b0f1a] data-[state=active]:text-[#00e8b8]">
            <Building className="w-4 h-4 mr-2" /> 基础设置
          </TabsTrigger>
          <TabsTrigger value="apikeys" className="rounded-lg data-[state=active]:bg-[#0b0f1a] data-[state=active]:text-[#00e8b8]">
            <Key className="w-4 h-4 mr-2" /> API 密钥
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-[#0b0f1a] data-[state=active]:text-[#00e8b8]">
            <Bell className="w-4 h-4 mr-2" /> 消息通知
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-[#0b0f1a] data-[state=active]:text-[#00e8b8]">
            <CreditCard className="w-4 h-4 mr-2" /> 账单与用量
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="text-lg text-white">组织信息</CardTitle>
              <CardDescription className="text-white/50">这些信息将显示在您的控制台和生成的报告中</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {data.general.logoUrl ? (
                    <img src={data.general.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building className="w-8 h-8 text-white/20" />
                  )}
                </div>
                <div>
                  <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 mb-2">
                    <UploadCloud className="w-4 h-4 mr-2" /> 上传新 Logo
                  </Button>
                  <p className="text-xs text-white/40">推荐尺寸 512x512px，支持 PNG, JPG</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">组织名称</label>
                  <Input 
                    value={data.general.orgName} 
                    onChange={e => setData({...data, general: {...data.general, orgName: e.target.value}})}
                    className="bg-white/5 border-white/10 text-white focus-visible:ring-[#00e8b8]/50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">默认时区</label>
                  <Select value={data.general.timezone} onValueChange={v => setData({...data, general: {...data.general, timezone: v}})}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0b0f1a] border-white/10 text-white">
                      <SelectItem value="Asia/Shanghai">Asia/Shanghai (北京时间)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0 border-t border-white/5 mt-6 justify-end">
              <Button onClick={handleSaveGeneral} disabled={saving} className="bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold px-6">
                保存更改
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="apikeys" className="space-y-6">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-white">API 密钥</CardTitle>
                <CardDescription className="text-white/50">用于开发者集成 MediaClaw 的内容生成能力</CardDescription>
              </div>
              <Button className="bg-white/10 text-white hover:bg-white/20 border border-white/10">
                <Plus className="w-4 h-4 mr-2" /> 创建密钥
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {data.apiKeys.length === 0 ? (
                <div className="p-8 text-center text-white/50">暂无 API 密钥</div>
              ) : (
                <div className="flex flex-col">
                  {data.apiKeys.map(key => (
                    <div key={key.id} className="p-6 border-b border-white/5 last:border-0 flex items-center justify-between hover:bg-white/[0.02]">
                      <div>
                        <h4 className="font-bold text-white/90 mb-1">{key.name}</h4>
                        <div className="flex items-center gap-3">
                          <code className="bg-black border border-white/10 px-2 py-1 rounded text-xs text-[#00e8b8] font-mono">
                            {key.key.substring(0, 8)}...{key.key.substring(key.key.length - 4)}
                          </code>
                          <span className="text-xs text-white/40">最后使用: {new Date(key.lastUsed).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10" onClick={() => copyToClipboard(key.key)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="text-lg text-white">群组机器人推送</CardTitle>
              <CardDescription className="text-white/50">当视频处理完成、发布成功或收到新评论时，自动推送到工作群</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Feishu */}
              <div className="flex items-start justify-between border border-white/5 bg-white/[0.02] p-5 rounded-xl">
                <div className="flex-1 space-y-3 mr-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center"><MessageSquare className="w-4 h-4 text-blue-400" /></div>
                    <h4 className="font-bold text-white/90">飞书机器人</h4>
                  </div>
                  {data.notifications.feishu.enabled && (
                    <Input 
                      placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..." 
                      value={data.notifications.feishu.webhookUrl}
                      onChange={e => setData({...data, notifications: {...data.notifications, feishu: {...data.notifications.feishu, webhookUrl: e.target.value}}})}
                      className="bg-black/50 border-white/10 text-white text-xs font-mono h-9" 
                    />
                  )}
                </div>
                <Switch 
                  checked={data.notifications.feishu.enabled} 
                  onCheckedChange={c => setData({...data, notifications: {...data.notifications, feishu: {...data.notifications.feishu, enabled: c}}})}
                  className="data-[state=checked]:bg-[#00e8b8]"
                />
              </div>

              {/* DingTalk */}
              <div className="flex items-start justify-between border border-white/5 bg-white/[0.02] p-5 rounded-xl">
                <div className="flex-1 space-y-3 mr-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-400/20 flex items-center justify-center"><MessageSquare className="w-4 h-4 text-blue-300" /></div>
                    <h4 className="font-bold text-white/90">钉钉机器人</h4>
                  </div>
                  {data.notifications.dingtalk.enabled && (
                    <Input 
                      placeholder="https://oapi.dingtalk.com/robot/send?access_token=..." 
                      value={data.notifications.dingtalk.webhookUrl}
                      onChange={e => setData({...data, notifications: {...data.notifications, dingtalk: {...data.notifications.dingtalk, webhookUrl: e.target.value}}})}
                      className="bg-black/50 border-white/10 text-white text-xs font-mono h-9" 
                    />
                  )}
                </div>
                <Switch 
                  checked={data.notifications.dingtalk.enabled} 
                  onCheckedChange={c => setData({...data, notifications: {...data.notifications, dingtalk: {...data.notifications.dingtalk, enabled: c}}})}
                  className="data-[state=checked]:bg-[#00e8b8]"
                />
              </div>

              {/* WeCom */}
              <div className="flex items-start justify-between border border-white/5 bg-white/[0.02] p-5 rounded-xl">
                <div className="flex-1 space-y-3 mr-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center"><MessageSquare className="w-4 h-4 text-green-400" /></div>
                    <h4 className="font-bold text-white/90">企业微信机器人</h4>
                  </div>
                  {data.notifications.wecom.enabled && (
                    <Input 
                      placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..." 
                      value={data.notifications.wecom.webhookUrl}
                      onChange={e => setData({...data, notifications: {...data.notifications, wecom: {...data.notifications.wecom, webhookUrl: e.target.value}}})}
                      className="bg-black/50 border-white/10 text-white text-xs font-mono h-9" 
                    />
                  )}
                </div>
                <Switch 
                  checked={data.notifications.wecom.enabled} 
                  onCheckedChange={c => setData({...data, notifications: {...data.notifications, wecom: {...data.notifications.wecom, enabled: c}}})}
                  className="data-[state=checked]:bg-[#00e8b8]"
                />
              </div>

            </CardContent>
            <CardFooter className="p-6 pt-0 border-t border-white/5 mt-6 justify-between">
              <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">测试发送</Button>
              <Button onClick={handleSaveNotifications} disabled={saving} className="bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold px-6">
                保存更改
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
              <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="text-lg text-white">当前方案</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-white">{data.billing.plan}</span>
                  <Badge className="bg-[#00e8b8]/20 text-[#00e8b8] border-none font-normal text-sm px-3 py-1">运行良好</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white/70">
                    <span>视频生成额度</span>
                    <span className="font-bold">{data.billing.usedVideos} / {data.billing.totalVideos}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden ring-1 ring-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        (data.billing.usedVideos / data.billing.totalVideos) > 0.8 ? 'bg-red-500' : 'bg-[#00e8b8]'
                      }`} 
                      style={{ width: `${(data.billing.usedVideos / data.billing.totalVideos) * 100}%` }} 
                    />
                  </div>
                </div>
                <Button className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/10">
                  升级方案
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
              <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="text-lg text-white">支付信息</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex flex-col justify-between h-[calc(100%-4rem)]">
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="w-12 h-8 bg-black border border-white/20 rounded flex items-center justify-center text-[10px] font-bold">VISA</div>
                  <div>
                    <p className="text-white font-medium text-sm">•••• •••• •••• 4242</p>
                    <p className="text-white/40 text-xs">过期时间 12/28</p>
                  </div>
                </div>
                <Button variant="link" className="text-[#00e8b8] hover:text-[#00e8b8]/80 px-0 self-start mt-4">
                  更新支付方式
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#0b0f1a] border-white/10 shadow-none">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="text-lg text-white">账单历史</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.billing.history.length === 0 ? (
                <div className="p-8 text-center text-white/50">暂无账单记录</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-white/50 uppercase bg-white/[0.02] border-b border-white/10">
                      <tr>
                        <th className="px-6 py-3">账单 ID</th>
                        <th className="px-6 py-3">日期</th>
                        <th className="px-6 py-3">金额</th>
                        <th className="px-6 py-3">状态</th>
                        <th className="px-6 py-3 text-right">发票</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.billing.history.map((invoice) => (
                        <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="px-6 py-4 font-mono text-xs text-white/70">{invoice.id}</td>
                          <td className="px-6 py-4 text-white/90">{new Date(invoice.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-bold">¥{invoice.amount.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            {invoice.status === 'paid' ? (
                              <span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 已支付</span>
                            ) : (
                              <span className="text-yellow-400">待支付</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm" className="h-8 text-[#00e8b8] hover:text-[#00e8b8] hover:bg-[#00e8b8]/10">下载</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
