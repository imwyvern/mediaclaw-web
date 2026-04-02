import { AlertCircle, CheckCircle2, Clock3, Loader2, PauseCircle, Send, Sparkles, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getVideoStatusLabel, normalizeVideoStatus, type VideoLifecycleStatus } from "@/lib/video-status";

export { getVideoStatusLabel, normalizeVideoStatus, type VideoLifecycleStatus } from "@/lib/video-status";

export function VideoStatusBadge({
  status,
  progress,
  className,
}: {
  status: string | null | undefined;
  progress?: number | null;
  className?: string;
}) {
  const normalized = normalizeVideoStatus(status);
  const label = getVideoStatusLabel(normalized);
  const progressText = typeof progress === "number" && normalized === "processing"
    ? ` ${Math.round(progress)}%`
    : "";

  return (
    <Badge className={cn(getBadgeClassName(normalized), className)}>
      <StatusIcon status={normalized} />
      {label}{progressText}
    </Badge>
  );
}

function StatusIcon({ status }: { status: VideoLifecycleStatus }) {
  switch (status) {
    case "draft":
      return <PauseCircle className="mr-1 h-3.5 w-3.5" />;
    case "queued":
      return <Clock3 className="mr-1 h-3.5 w-3.5" />;
    case "processing":
      return <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />;
    case "pending_review":
      return <Sparkles className="mr-1 h-3.5 w-3.5" />;
    case "approved":
      return <CheckCircle2 className="mr-1 h-3.5 w-3.5" />;
    case "published":
      return <Send className="mr-1 h-3.5 w-3.5" />;
    case "completed":
      return <CheckCircle2 className="mr-1 h-3.5 w-3.5" />;
    case "failed":
    case "cancelled":
    case "expired":
      return <XCircle className="mr-1 h-3.5 w-3.5" />;
    default:
      return <AlertCircle className="mr-1 h-3.5 w-3.5" />;
  }
}

function getBadgeClassName(status: VideoLifecycleStatus) {
  switch (status) {
    case "completed":
    case "approved":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15";
    case "published":
      return "border-sky-500/20 bg-sky-500/10 text-sky-400 hover:bg-sky-500/15";
    case "processing":
      return "border-primary/20 bg-primary/10 text-primary hover:bg-primary/15";
    case "queued":
    case "draft":
    case "pending_review":
      return "border-border bg-muted/50 text-foreground hover:bg-muted/60";
    case "failed":
    case "cancelled":
    case "expired":
      return "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/15";
    default:
      return "border-border bg-muted/40 text-muted-foreground hover:bg-muted/50";
  }
}
