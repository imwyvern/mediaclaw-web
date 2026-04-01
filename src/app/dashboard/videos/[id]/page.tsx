"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Sparkles, 
  History, 
  CheckCircle2, 
  Clock, 
  Edit3,
  Globe,
  Check,
  X,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VideoPlayer } from "@/components/video-player";
import { MetadataUpdater } from "@/components/metadata-updater";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [approvalComment, setApprovalComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"Pending" | "Approved" | "Rejected" | "Completed">("Pending");

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await api.content.approve(params.id as string);
      toast.success("视频已通过审核");
      setStatus("Approved");
    } catch (err) {
      toast.error("操作失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!approvalComment) {
      toast.error("请填写驳回原因");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.content.reject(params.id as string, { comment: approvalComment });
      toast.warning("视频已驳回");
      setStatus("Rejected");
    } catch (err) {
      toast.error("操作失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <MetadataUpdater title="视频详情" />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Q3 Campaign Hero Video</h1>
            <Badge variant={
              status === "Approved" || status === "Completed" ? "default" :
              status === "Rejected" ? "destructive" : "secondary"
            }>
              {status === "Pending" ? "待审核" : status === "Approved" ? "已通过" : status === "Rejected" ? "已驳回" : "完成"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">ID: {params.id} • Created on Mar 28, 2026</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
          <Button size="sm"><Download className="w-4 h-4 mr-2" /> Download</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Player & Copy */}
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer 
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            status="Ready"
          />

          {status === "Pending" && (
            <Card className="border-primary ring-1 ring-primary/20 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" /> 审批意见
                </CardTitle>
                <CardDescription>请审阅视频内容及文案，确认无误后点击通过。</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="在此输入修改意见或备注（驳回必填）..." 
                  className="min-h-[100px] bg-muted/30"
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex gap-4 border-t bg-muted/30 pt-6">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  onClick={handleReject}
                  disabled={isSubmitting}
                >
                  <X size={18} /> 驳回修改
                </Button>
                <Button 
                  className="flex-1 h-12 gap-2 font-bold"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                >
                  <Check size={18} /> 通过并发布
                </Button>
              </CardFooter>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Content Metadata</CardTitle>
                <CardDescription>Edit video titles and social media copy.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Cancel" : <><Edit3 className="w-4 h-4 mr-2" /> Edit</>}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Video Title</Label>
                  <Input defaultValue="Q3 Campaign Hero Video" disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label>Social Copy</Label>
                  <Textarea 
                    className="min-h-[100px]" 
                    defaultValue="Check out our latest feature launch! Perfect for scaling your SaaS product faster than ever. 🚀 #SaaS #Growth #Innovation" 
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hashtags</Label>
                  <Input defaultValue="#SaaS, #Growth, #Innovation" disabled={!isEditing} />
                </div>
              </div>
              {isEditing && <Button className="w-full mt-4">Save Changes</Button>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" /> Distribution Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { platform: "TikTok", status: "Published", date: "Mar 29, 10:00" },
                  { platform: "Instagram", status: "Published", date: "Mar 29, 10:05" },
                  { platform: "YouTube", status: "Scheduled", date: "Apr 01, 12:00" },
                ].map((p) => (
                  <div key={p.platform} className="p-4 border rounded-lg bg-muted/20">
                    <div className="font-bold mb-1">{p.platform}</div>
                    <div className="text-xs text-muted-foreground mb-2">{p.date}</div>
                    <Badge variant={p.status === "Published" ? "default" : "secondary"}>{p.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI & Timeline */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" /> AI Suggestions
              </CardTitle>
              <CardDescription>Optimized variants based on performance data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-background border rounded-lg cursor-pointer hover:border-primary transition-colors group">
                <div className="text-xs font-bold text-primary mb-1">VARIANT A (Viral Focus)</div>
                <p className="text-sm line-clamp-2 text-muted-foreground group-hover:text-foreground">&quot;The secret to 10x growth is finally here. Watch to find out how...&quot;</p>
              </div>
              <div className="p-3 bg-background border rounded-lg cursor-pointer hover:border-primary transition-colors group">
                <div className="text-xs font-bold text-primary mb-1">VARIANT B (Feature Focus)</div>
                <p className="text-sm line-clamp-2 text-muted-foreground group-hover:text-foreground">&quot;Introducing MediaClaw 2.0: The infrastructure for video-first SaaS...&quot;</p>
              </div>
              <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10">
                Regenerate Suggestions
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" /> Task Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-0.5 before:bg-muted">
                {status === "Approved" && (
                  <div className="relative flex items-start gap-4 ml-6 animate-in fade-in slide-in-from-left-2">
                    <div className="absolute -left-[31px] mt-1 bg-background rounded-full p-0.5 text-emerald-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Approved & Published</div>
                      <div className="text-xs text-muted-foreground">Just now</div>
                    </div>
                  </div>
                )}
                {status === "Rejected" && (
                  <div className="relative flex items-start gap-4 ml-6 animate-in fade-in slide-in-from-left-2">
                    <div className="absolute -left-[31px] mt-1 bg-background rounded-full p-0.5 text-destructive">
                      <X className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Rejected by Admin</div>
                      <div className="text-xs text-muted-foreground mb-1">Just now</div>
                      <p className="text-[10px] bg-destructive/10 text-destructive p-2 rounded-md italic">
                        &quot;{approvalComment}&quot;
                      </p>
                    </div>
                  </div>
                )}
                {[
                  { title: "Published to Platforms", time: "Mar 29, 10:05", icon: CheckCircle2, color: "text-emerald-500" },
                  { title: "Rendering Completed", time: "Mar 28, 14:20", icon: CheckCircle2, color: "text-emerald-500" },
                  { title: "AI Generation Finished", time: "Mar 28, 14:15", icon: CheckCircle2, color: "text-emerald-500" },
                  { title: "Video Uploaded", time: "Mar 28, 14:00", icon: Clock, color: "text-muted-foreground" },
                ].map((item, i) => (
                  <div key={i} className="relative flex items-start gap-4 ml-6">
                    <div className={`absolute -left-[31px] mt-1 bg-background rounded-full p-0.5 ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Original File</span>
                <Button variant="link" size="sm" className="h-auto p-0">source.mov</Button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtitle File</span>
                <Button variant="link" size="sm" className="h-auto p-0">captions.vtt</Button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Credits Used</span>
                <span className="font-medium">5.0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
