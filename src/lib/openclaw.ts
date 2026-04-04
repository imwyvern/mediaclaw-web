import {
  type ClawHostInstanceConfigRecord,
  type ClawHostInstanceLifecycleStatus,
  type ClawHostInstanceRecord,
} from "./api";

export const OPENCLAW_MEDIACLAW_CLIENT_SKILL_ID = "mediaclaw-client";
export const OPENCLAW_MEDIACLAW_CLIENT_VERSION = "latest";

export const DEFAULT_OPENCLAW_INSTANCE_CONFIG: ClawHostInstanceConfigRecord = {
  cpu: "500m",
  memory: "1Gi",
  storage: "10Gi",
};

export function hasOpenClawSkill(
  instance: ClawHostInstanceRecord | null | undefined,
  skillId = OPENCLAW_MEDIACLAW_CLIENT_SKILL_ID,
) {
  return Boolean(instance?.skills.some((skill) => skill.skillId === skillId));
}

export function formatOpenClawStatus(
  status?: ClawHostInstanceLifecycleStatus | null,
): string {
  switch (status) {
    case "creating":
      return "创建中";
    case "pending_manual_setup":
      return "待人工配置";
    case "running":
      return "运行中";
    case "stopped":
      return "已停止";
    case "error":
      return "异常";
    case "upgrading":
      return "升级中";
    default:
      return "未开通";
  }
}

export function resolveOpenClawClientName(candidates: Array<string | null | undefined>) {
  const matched = candidates.find((value) => typeof value === "string" && value.trim());
  return matched?.trim() || "MediaClaw Client";
}
