export type VideoLifecycleStatus =
  | "draft"
  | "queued"
  | "processing"
  | "pending_review"
  | "approved"
  | "published"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired"
  | "unknown";

export function normalizeVideoStatus(status: string | null | undefined): VideoLifecycleStatus {
  const normalized = `${status || ""}`.trim().toLowerCase();

  if (!normalized) {
    return "unknown";
  }

  if (["pending", "queued", "created"].includes(normalized)) {
    return "queued";
  }

  if (["analyzing", "editing", "processing", "rendering", "running", "in_progress"].includes(normalized)) {
    return "processing";
  }

  if (["pending_review", "reviewing"].includes(normalized)) {
    return "pending_review";
  }

  if (normalized === "approved") {
    return "approved";
  }

  if (["completed", "ready", "success", "succeeded"].includes(normalized)) {
    return "completed";
  }

  if (["published", "pushed"].includes(normalized)) {
    return "published";
  }

  if (["failed", "error", "rejected"].includes(normalized)) {
    return "failed";
  }

  if (["cancelled", "canceled"].includes(normalized)) {
    return "cancelled";
  }

  if (normalized === "expired") {
    return "expired";
  }

  if (normalized === "draft") {
    return "draft";
  }

  return "unknown";
}

export function getVideoStatusLabel(status: VideoLifecycleStatus) {
  switch (status) {
    case "draft":
      return "草稿";
    case "queued":
      return "排队中";
    case "processing":
      return "处理中";
    case "pending_review":
      return "待审核";
    case "approved":
      return "已通过";
    case "published":
      return "已发布";
    case "completed":
      return "已完成";
    case "failed":
      return "失败";
    case "cancelled":
      return "已取消";
    case "expired":
      return "已过期";
    default:
      return "状态未知";
  }
}

export function toLegacyVideoStatus(status: VideoLifecycleStatus) {
  switch (status) {
    case "completed":
    case "published":
    case "approved":
      return "Completed" as const;
    case "failed":
    case "cancelled":
    case "expired":
      return "Failed" as const;
    default:
      return "Processing" as const;
  }
}
