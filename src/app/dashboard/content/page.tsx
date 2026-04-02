"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ExternalLink,
  FileVideo,
  Loader2,
  RefreshCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { MetadataUpdater } from "@/components/metadata-updater";
import { VideoStatusBadge } from "@/components/dashboard/video-status-badge";
import { ErrorState } from "@/components/error-state";
import { TableSkeleton, WarmEmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api, type ContentItem } from "@/lib/api";
import { formatCompactNumber, formatDateTime } from "@/lib/format";
import { normalizeVideoStatus, type VideoLifecycleStatus } from "@/lib/video-status";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ContentFilter = "all" | "pending_review" | "approved" | "published" | "processing" | "attention";
type ApprovalState = "pending_review" | "approved" | "rejected" | "unknown";
type PublishState = "not_published" | "published" | "publishing" | "failed" | "unknown";
type PendingAction = { id: string; type: "approve" | "reject" | "publish" } | null;

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeMessage = Reflect.get(error, "message");
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }

    const response = Reflect.get(error, "response");
    if (typeof response === "object" && response !== null) {
      const data = Reflect.get(response, "data");
      if (typeof data === "object" && data !== null) {
        const responseMessage = Reflect.get(data, "message");
        if (typeof responseMessage === "string" && responseMessage.trim()) {
          return responseMessage;
        }
      }
    }
  }

  return "数据请求失败，请稍后重试。";
}

function normalizeApprovalStatus(status: string | null | undefined): ApprovalState {
  const normalized = `${status || ""}`.trim().toLowerCase();

  if (!normalized || ["pending", "pending_review", "reviewing", "submitted", "in_review"].includes(normalized)) {
    return "pending_review";
  }

  if (["approved", "pass", "passed", "success", "succeeded"].includes(normalized)) {
    return "approved";
  }

  if (["rejected", "reject", "denied", "failed"].includes(normalized)) {
    return "rejected";
  }

  return "unknown";
}

function normalizePublishStatus(status: string | null | undefined): PublishState {
  const normalized = `${status || ""}`.trim().toLowerCase();

  if (!normalized) {
    return "not_published";
  }

  if (["published", "pushed", "success", "succeeded"].includes(normalized)) {
    return "published";
  }

  if (["publishing", "sending", "queued", "pending", "processing", "running"].includes(normalized)) {
    return "publishing";
  }

  if (["failed", "error"].includes(normalized)) {
    return "failed";
  }

  return "unknown";
}

function isLifecycleFailure(status: VideoLifecycleStatus) {
  return ["failed", "cancelled", "expired"].includes(status);
}

function isLifecycleProcessing(status: VideoLifecycleStatus) {
  return ["draft", "queued", "processing"].includes(status);
}

function getLifecycleStatus(item: ContentItem) {
  return normalizeVideoStatus(item.lifecycleStatus || item.status);
}

function getContentFilter(item: ContentItem): Exclude<ContentFilter, "all"> {
  const approval = normalizeApprovalStatus(item.approvalStatus);
  const publish = normalizePublishStatus(item.publishStatus);
  const lifecycle = getLifecycleStatus(item);

  if (publish === "published") {
    return "published";
  }

  if (approval === "approved") {
    return "approved";
  }

  if (approval === "rejected" || publish === "failed" || isLifecycleFailure(lifecycle)) {
    return "attention";
  }

  if (isLifecycleProcessing(lifecycle)) {
    return "processing";
  }

  return "pending_review";
}

function getApprovalBadgeLabel(status: ApprovalState) {
  switch (status) {
    case "approved":
      return "已通过";
    case "rejected":
      return "已驳回";
    case "unknown":
      return "待回传";
    default:
      return "待审核";
  }
}

function getPublishBadgeLabel(status: PublishState) {
  switch (status) {
    case "published":
      return "已发布";
    case "publishing":
      return "发布中";
    case "failed":
      return "发布失败";
    case "unknown":
      return "状态未知";
    default:
      return "未发布";
  }
}

function getApprovalBadgeClass(status: ApprovalState) {
  switch (status) {
    case "approved":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "rejected":
      return "border-destructive/20 bg-destructive/10 text-destructive";
    case "unknown":
      return "border-border bg-muted/40 text-muted-foreground";
    default:
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  }
}

function getPublishBadgeClass(status: PublishState) {
  switch (status) {
    case "published":
      return "border-sky-500/20 bg-sky-500/10 text-sky-300";
    case "publishing":
      return "border-primary/20 bg-primary/10 text-primary";
    case "failed":
      return "border-destructive/20 bg-destructive/10 text-destructive";
    case "unknown":
      return "border-border bg-muted/40 text-muted-foreground";
    default:
      return "border-border bg-muted/50 text-muted-foreground";
  }
}

function getUsageHint(item: ContentItem) {
  const usageParts: string[] = [];

  if (item.credits > 0) {
    usageParts.push(`消耗 ${formatCompactNumber(item.credits)} 条`);
  }

  if ((item.tokens || 0) > 0) {
    usageParts.push(`${formatCompactNumber(item.tokens)} tokens`);
  }

  return usageParts.length > 0 ? usageParts.join(" / ") : "等待后端回传用量数据";
}

function canApprove(item: ContentItem) {
  const approval = normalizeApprovalStatus(item.approvalStatus);
  const publish = normalizePublishStatus(item.publishStatus);
  const lifecycle = getLifecycleStatus(item);

  return approval !== "approved" && approval !== "rejected" && publish !== "published" && !isLifecycleProcessing(lifecycle) && !isLifecycleFailure(lifecycle);
}

function canReject(item: ContentItem) {
  return canApprove(item);
}

function canPublish(item: ContentItem) {
  const approval = normalizeApprovalStatus(item.approvalStatus);
  const publish = normalizePublishStatus(item.publishStatus);
  return approval === "approved" && publish !== "published";
}

function StatusMetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-sm shadow-black/10">
      <CardContent className="space-y-2 p-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function ApprovalStatusBadge({ status }: { status: ApprovalState }) {
  return (
    <Badge className={cn("border font-normal", getApprovalBadgeClass(status))}>
      {status === "approved" ? <ShieldCheck className="mr-1 h-3.5 w-3.5" /> : null}
      {status === "rejected" ? <ShieldX className="mr-1 h-3.5 w-3.5" /> : null}
      {status === "pending_review" ? <ShieldAlert className="mr-1 h-3.5 w-3.5" /> : null}
      {getApprovalBadgeLabel(status)}
    </Badge>
  );
}

function PublishStatusBadge({ status }: { status: PublishState }) {
  return (
    <Badge className={cn("border font-normal", getPublishBadgeClass(status))}>
      {status === "published" ? <Send className="mr-1 h-3.5 w-3.5" /> : null}
      {status === "publishing" ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
      {getPublishBadgeLabel(status)}
    </Badge>
  );
}

export default function ContentManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentFilter>("all");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [rejectTarget, setRejectTarget] = useState<ContentItem | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  const loadContent = async ({ background = false }: { background?: boolean } = {}) => {
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await api.content.list();
      setContent(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (loadError) {
      console.error("Failed to fetch content list", loadError);
      const message = getErrorMessage(loadError);
      if (!background || content.length === 0) {
        setError(message);
      }
      toast.error(message);
    } finally {
      if (background) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadContent();
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredContent = content.filter((item) => {
    const matchesFilter = statusFilter === "all" || getContentFilter(item) === statusFilter;
    const matchesSearch =
      !normalizedQuery ||
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.brand.toLowerCase().includes(normalizedQuery) ||
      item.id.toLowerCase().includes(normalizedQuery);

    return matchesFilter && matchesSearch;
  });

  const metrics = content.reduce(
    (acc, item) => {
      const filter = getContentFilter(item);
      acc.total += 1;
      if (filter === "pending_review") acc.pending += 1;
      if (filter === "approved") acc.approved += 1;
      if (filter === "published") acc.published += 1;
      if (filter === "processing") acc.processing += 1;
      if (filter === "attention") acc.attention += 1;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, published: 0, processing: 0, attention: 0 },
  );

  const handleApprove = async (item: ContentItem) => {
    setPendingAction({ id: item.id, type: "approve" });

    try {
      await api.content.approve(item.id);
      toast.success(`《${item.title}》已通过审核`);
      await loadContent({ background: true });
    } catch (approveError) {
      console.error("Failed to approve content", approveError);
      toast.error(getErrorMessage(approveError));
    } finally {
      setPendingAction(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) {
      return;
    }

    const comment = rejectComment.trim();
    if (!comment) {
      toast.error("请先填写驳回原因，方便后续迭代。");
      return;
    }

    setPendingAction({ id: rejectTarget.id, type: "reject" });

    try {
      await api.content.reject(rejectTarget.id, { comment });
      toast.success(`《${rejectTarget.title}》已驳回`);
      setRejectTarget(null);
      setRejectComment("");
      await loadContent({ background: true });
    } catch (rejectError) {
      console.error("Failed to reject content", rejectError);
      toast.error(getErrorMessage(rejectError));
    } finally {
      setPendingAction(null);
    }
  };

  const handlePublish = async (item: ContentItem) => {
    setPendingAction({ id: item.id, type: "publish" });

    try {
      await api.content.markPublished(item.id, {});
      toast.success(`《${item.title}》已标记为发布完成`);
      await loadContent({ background: true });
    } catch (publishError) {
      console.error("Failed to mark content as published", publishError);
      toast.error(getErrorMessage(publishError));
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <MetadataUpdater title="内容管理" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">内容管理</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            这里展示真实内容池。生成状态来自视频任务，审核和发布状态直接读取内容 API，运营可以在同一页完成复核与发布回写。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => void loadContent({ background: true })}
            disabled={refreshing || loading}
            className="border-border/70 bg-background/60"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            刷新列表
          </Button>
          <Button className="bg-primary text-primary-foreground" onClick={() => router.push("/dashboard/videos/create")}>
            <FileVideo className="h-4 w-4" />
            继续生产内容
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatusMetricCard label="总内容数" value={formatCompactNumber(metrics.total)} hint="已经进入内容管理池的素材总量" />
        <StatusMetricCard label="待审核" value={formatCompactNumber(metrics.pending)} hint="可立即开始人工复核的内容" />
        <StatusMetricCard label="已通过" value={formatCompactNumber(metrics.approved)} hint="已完成审核，等待渠道发布回写" />
        <StatusMetricCard label="已发布" value={formatCompactNumber(metrics.published)} hint="已确认推送到渠道的内容" />
        <StatusMetricCard label="处理中 / 异常" value={formatCompactNumber(metrics.processing + metrics.attention)} hint="仍在生成或需要人工介入的内容" />
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm shadow-black/10">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as ContentFilter)} className="w-full xl:w-auto">
            <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-muted/40 p-1">
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="pending_review">待审核</TabsTrigger>
              <TabsTrigger value="approved">已通过</TabsTrigger>
              <TabsTrigger value="published">已发布</TabsTrigger>
              <TabsTrigger value="processing">处理中</TabsTrigger>
              <TabsTrigger value="attention">异常/驳回</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full xl:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="搜索标题、品牌或内容 ID"
              className="border-border/70 bg-background/60 pl-9"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <TableSkeleton rows={6} columns={7} />
        </div>
      ) : error && content.length === 0 ? (
        <ErrorState
          title="内容列表暂时不可用"
          description={error}
          onRetry={() => void loadContent()}
          className="border-border/60 bg-card/60"
        />
      ) : content.length === 0 ? (
        <WarmEmptyState
          icon={FileVideo}
          title="内容池还没有真实数据"
          description="第一条视频进入审核流后，这里会自动展示生成状态、审核状态和发布回写。现在可以先去创建一条新内容。"
          actionLabel="去创建内容"
          onAction={() => {
            router.push("/dashboard/videos/create");
          }}
        />
      ) : filteredContent.length === 0 ? (
        <WarmEmptyState
          icon={Search}
          title="当前筛选条件下没有内容"
          description="搜索词或状态筛选把结果收窄了。可以清空条件，回到完整内容池继续处理。"
          actionLabel="清空筛选"
          onAction={() => {
            setSearchQuery("");
            setStatusFilter("all");
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm shadow-black/10">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>内容</TableHead>
                <TableHead>品牌</TableHead>
                <TableHead>生成状态</TableHead>
                <TableHead>审核状态</TableHead>
                <TableHead>发布状态</TableHead>
                <TableHead>最近更新</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item) => {
                const approvalStatus = normalizeApprovalStatus(item.approvalStatus);
                const publishStatus = normalizePublishStatus(item.publishStatus);
                const actionKey = pendingAction?.id === item.id ? pendingAction.type : null;

                return (
                  <TableRow key={item.id} className="border-border/60 bg-transparent transition-colors hover:bg-muted/20">
                    <TableCell className="align-top">
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/80 text-muted-foreground">
                            <FileVideo className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <Link
                              href={`/dashboard/videos/${item.id}`}
                              className="block truncate font-medium text-foreground transition-colors hover:text-primary"
                            >
                              {item.title}
                            </Link>
                            <p className="text-xs text-muted-foreground">ID: {item.id}</p>
                            <p className="text-xs text-muted-foreground">{getUsageHint(item)}</p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="space-y-2">
                        <Badge variant="outline" className="border-border/70 bg-background/60 font-normal">
                          {item.brand}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{item.type || item.taskType || "未标记内容类型"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <VideoStatusBadge status={item.lifecycleStatus || item.status} progress={item.progress} />
                    </TableCell>
                    <TableCell className="align-top">
                      <ApprovalStatusBadge status={approvalStatus} />
                    </TableCell>
                    <TableCell className="align-top">
                      <PublishStatusBadge status={publishStatus} />
                    </TableCell>
                    <TableCell className="align-top text-sm text-muted-foreground">
                      {formatDateTime(item.updatedAt || item.completedAt || item.createdAt || item.date)}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex flex-wrap justify-end gap-2">
                        {item.outputVideoUrl ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(item.outputVideoUrl, "_blank", "noopener,noreferrer")}
                            className="border-border/70 bg-background/60"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            成片
                          </Button>
                        ) : null}
                        {canApprove(item) ? (
                          <Button
                            size="sm"
                            onClick={() => void handleApprove(item)}
                            disabled={actionKey !== null}
                          >
                            {actionKey === "approve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            通过
                          </Button>
                        ) : null}
                        {canReject(item) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRejectTarget(item);
                              setRejectComment("");
                            }}
                            disabled={actionKey !== null}
                            className="border-border/70 bg-background/60"
                          >
                            <ShieldX className="h-3.5 w-3.5" />
                            驳回
                          </Button>
                        ) : null}
                        {canPublish(item) ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => void handlePublish(item)}
                            disabled={actionKey !== null}
                          >
                            {actionKey === "publish" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            标记发布
                          </Button>
                        ) : null}
                        <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/videos/${item.id}`)}>
                          查看详情
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setRejectComment("");
          }
        }}
      >
        <DialogContent className="max-w-lg border-border/70 bg-popover/95 shadow-2xl shadow-black/30">
          <DialogHeader>
            <DialogTitle>驳回内容</DialogTitle>
            <DialogDescription>
              {rejectTarget ? `为《${rejectTarget.title}》填写驳回原因，后续迭代日志和审核记录会直接复用这段说明。` : "填写驳回原因"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">驳回原因</p>
            <Textarea
              value={rejectComment}
              onChange={(event) => setRejectComment(event.target.value)}
              placeholder="例如：口播节奏偏慢，产品利益点没有在前 3 秒建立，请重做封面钩子和字幕节奏。"
              className="min-h-28 border-border/70 bg-background/60"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectTarget(null);
                setRejectComment("");
              }}
              className="border-border/70 bg-background/60"
            >
              取消
            </Button>
            <Button onClick={() => void handleReject()} disabled={pendingAction?.type === "reject"} variant="destructive">
              {pendingAction?.type === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldX className="h-4 w-4" />}
              确认驳回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
