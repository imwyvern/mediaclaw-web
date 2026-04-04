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

export function formatOpenClawDeploymentMode(mode?: string | null) {
  switch ((mode || "").trim().toLowerCase()) {
    case "managed":
      return "托管实例";
    case "byoc":
      return "自带客户端";
    default:
      return "未设置";
  }
}

export function formatOpenClawConnectionStatus(status?: string | null) {
  switch ((status || "").trim().toLowerCase()) {
    case "connected":
      return "已连接";
    case "waiting_for_bind":
      return "等待客户端绑定";
    case "bound_but_silent":
      return "已绑定，等待心跳";
    case "stale":
      return "心跳超时";
    case "stopped":
      return "已停止";
    default:
      return "未连接";
  }
}

export function formatOpenClawImChannel(channel?: string | null) {
  switch ((channel || "").trim().toLowerCase()) {
    case "feishu":
      return "飞书";
    case "wecom":
      return "企业微信";
    default:
      return channel?.trim() || "未指定";
  }
}

export function resolveOpenClawClientName(candidates: Array<string | null | undefined>) {
  const matched = candidates.find((value) => typeof value === "string" && value.trim());
  return matched?.trim() || "MediaClaw Client";
}
