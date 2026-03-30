"use client";

import { Key, BellRing, Webhook, User, Shield, Copy, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { useState } from "react";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const [isBinding, setIsBinding] = useState(false);

  const handleBindWeChat = () => {
    setIsBinding(true);
    toast.info("正在调起微信绑定...");
    
    setTimeout(() => {
      if (user) {
        const updatedUser = { ...user, wechatId: "wx_bound_id_123" };
        login(updatedUser, localStorage.getItem("auth-storage") ? JSON.parse(localStorage.getItem("auth-storage")!).state.token : "mock_token");
        toast.success("微信绑定成功！");
      }
      setIsBinding(false);
    }, 1500);
  };

  const handleUnbindWeChat = () => {
    toast.info("微信已解绑");
    if (user) {
      const { wechatId, ...rest } = user;
      login(rest as any, localStorage.getItem("auth-storage") ? JSON.parse(localStorage.getItem("auth-storage")!).state.token : "mock_token");
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account, API keys, and workspace preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-6">
        <TabsList className="flex md:flex-col h-auto bg-transparent gap-1 items-start w-full md:w-48 overflow-x-auto p-0">
          <TabsTrigger value="profile" className="w-full justify-start gap-2 data-[state=active]:bg-muted px-4 py-2 h-10">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="api" className="w-full justify-start gap-2 data-[state=active]:bg-muted px-4 py-2 h-10">
            <Key className="w-4 h-4" /> API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="w-full justify-start gap-2 data-[state=active]:bg-muted px-4 py-2 h-10">
            <Webhook className="w-4 h-4" /> Webhooks
          </TabsTrigger>
          <TabsTrigger value="notifications" className="w-full justify-start gap-2 data-[state=active]:bg-muted px-4 py-2 h-10">
            <BellRing className="w-4 h-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-w-0">
          <TabsContent value="profile" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and public profile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20 border-2">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>MC</AvatarFallback>
                  </Avatar>
                  <Button variant="outline">Change Avatar</Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue={user?.name || "Admin"} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="User" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={user?.email || "admin@acme.com"} disabled />
                  <p className="text-xs text-muted-foreground">Contact support to change your email address.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>Connect your social accounts for easier login.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#07C160]/10 flex items-center justify-center text-[#07C160]">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M8.225 3.518c-4.482 0-8.117 3.257-8.117 7.276 0 2.21 1.107 4.183 2.85 5.568-.158.577-1.026 2.05-1.066 2.12-.04.07-.028.163.03.22.035.035.093.06.15.06h.058c.07 0 2.378-.455 3.322-.922.88.243 1.81.378 2.773.378.11 0 .22-.004.332-.01-4.14-.383-7.406-3.418-7.406-7.143 0-3.95 3.69-7.152 8.24-7.152 4.55 0 8.24 3.202 8.24 7.152 0 .546-.07 1.074-.202 1.577 1.07.72 1.83 1.765 2.14 2.96.26-.64.407-1.343.407-2.078 0-5.51-5.188-9.978-11.583-9.978zm10.375 7.97c-3.64 0-6.59 2.645-6.59 5.908 0 1.795.898 3.398 2.314 4.522-.128.47-.833 1.666-.865 1.723-.033.056-.023.132.025.178.028.028.075.048.122.048h.047c.057 0 1.93-.37 2.698-.75.714.198 1.47.307 2.25.307 3.64 0 6.59-2.645 6.59-5.908s-2.95-5.908-6.59-5.908z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">WeChat</div>
                      <div className="text-sm text-muted-foreground">
                        {user?.wechatId ? "Currently connected" : "Not connected"}
                      </div>
                    </div>
                  </div>
                  {user?.wechatId ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Bound
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={handleUnbindWeChat}>Unbind</Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleBindWeChat} disabled={isBinding}>
                      {isBinding ? "Connecting..." : "Connect"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Secret keys used to authenticate with the MediaClaw API.</CardDescription>
                  </div>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Create Key</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        Production Key <Badge variant="outline" className="text-xs">Active</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Created on Mar 15, 2026 • Never expires</div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex mt-3">
                    <Input value="mc_prod_8f92a****************************" readOnly className="font-mono text-sm rounded-r-none bg-muted/50 border-r-0" />
                    <Button variant="outline" className="rounded-l-none px-3">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-card border-dashed">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium flex items-center gap-2 text-muted-foreground">
                        Test Environment <Badge variant="secondary" className="text-xs">Revoked</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Revoked on Mar 20, 2026</div>
                    </div>
                  </div>
                  <div className="flex mt-3 opacity-50">
                    <Input value="mc_test_revoked_key_**************" readOnly disabled className="font-mono text-sm rounded-r-none" />
                    <Button variant="outline" disabled className="rounded-l-none px-3">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Webhook Endpoints</CardTitle>
                    <CardDescription>Receive real-time HTTP requests when events occur.</CardDescription>
                  </div>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Endpoint</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-card">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-medium">Production Endpoint</div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm font-mono bg-muted p-2 rounded truncate">https://api.acme.com/webhooks/mediaclaw</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">video.completed</Badge>
                      <Badge variant="secondary">video.failed</Badge>
                      <Badge variant="secondary">campaign.started</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">View Logs</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what alerts you want to receive and how.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm tracking-wide uppercase text-muted-foreground">System Alerts</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Video Processing Failed</div>
                      <div className="text-sm text-muted-foreground">When a video fails to render completely.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Low Credit Balance</div>
                      <div className="text-sm text-muted-foreground">When your balance falls below 100 credits.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-sm tracking-wide uppercase text-muted-foreground">Marketing & Updates</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Product Updates</div>
                      <div className="text-sm text-muted-foreground">New features and API changes.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Monthly Report</div>
                      <div className="text-sm text-muted-foreground">Summary of your account usage.</div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
