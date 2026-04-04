"use client";

import { useEffect, useState } from "react";
import {
  BellRing,
  CheckCircle2,
  Copy,
  Key,
  Loader2,
  Plus,
  RefreshCcw,
  Trash2,
  User as UserIcon,
  Webhook,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { MetadataUpdater } from "@/components/metadata-updater";
import {
  api,
  type ApiKeyRecord,
  type NotificationChannel,
  type User,
  type WebhookRecord,
} from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

type SettingsTab = "profile" | "api" | "webhooks" | "notifications";
type AsyncStatus = "idle" | "loading" | "success" | "error";

interface ApiKeyFormState {
  name: string;
  permissionsText: string;
  expiresAt: string;
}

interface WebhookFormState {
  name: string;
  url: string;
  secret: string;
  eventsText: string;
  isActive: boolean;
}

interface NotificationDraft {
  id?: string;
  channel: string;
  name: string;
  eventsText: string;
  configText: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiKeyValidationState {
  valid: boolean;
  message?: string;
}

const DEFAULT_API_KEY_FORM: ApiKeyFormState = {
  name: "",
  permissionsText: "videos:read, videos:write",
  expiresAt: "",
};

const DEFAULT_WEBHOOK_FORM: WebhookFormState = {
  name: "",
  url: "",
  secret: "",
  eventsText: "video.completed, video.failed",
  isActive: true,
};

const DEFAULT_NOTIFICATION_SEED = {
  channel: "system",
  name: "System Alerts",
  events: ["video.failed", "credit.low"],
  config: {},
  isActive: true,
};

function splitCommaSeparated(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDateTime(value?: string) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}


function toIsoDateTime(value: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const maybeResponse = "response" in error ? error.response : undefined;
    if (maybeResponse && typeof maybeResponse === "object" && maybeResponse !== null && "data" in maybeResponse) {
      const responseData = maybeResponse.data;
      if (responseData && typeof responseData === "object" && "message" in responseData && typeof responseData.message === "string") {
        return responseData.message;
      }
    }

    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }

  return fallback;
}

function readAuthTokenFromCookies() {
  if (typeof document === "undefined") {
    return "";
  }

  const tokenPair = document.cookie
    .split("; ")
    .find((item) => item.startsWith("auth_token="));

  return tokenPair?.split("=")[1] ?? "";
}

function stringifyConfig(config: Record<string, unknown>) {
  try {
    return JSON.stringify(config, null, 2);
  } catch {
    return "{}";
  }
}

function parseConfigText(value: string) {
  if (!value.trim()) {
    return {} as Record<string, unknown>;
  }

  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Notification config must be a JSON object.");
  }

  return parsed as Record<string, unknown>;
}

function getApiKeyDisplayValue(record: ApiKeyRecord) {
  return record.secret || record.maskedKey || record.prefix;
}

function toNotificationDraft(channel: NotificationChannel): NotificationDraft {
  return {
    id: channel.id,
    channel: channel.channel,
    name: channel.name,
    eventsText: channel.events.join(", "),
    configText: stringifyConfig(channel.config),
    isActive: channel.isActive,
    createdAt: channel.createdAt,
    updatedAt: channel.updatedAt,
  };
}

function SectionSkeleton({ blocks = 2 }: { blocks?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: blocks }).map((_, index) => (
        <Card key={index} className="border-white/10 bg-zinc-950/60">
          <CardHeader className="space-y-3">
            <Skeleton className="h-5 w-40 bg-white/10" />
            <Skeleton className="h-4 w-72 bg-white/5" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full bg-white/5" />
            <Skeleton className="h-10 w-full bg-white/5" />
            <Skeleton className="h-24 w-full bg-white/5" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const storedUser = useAuthStore((state) => state.user);
  const storedToken = useAuthStore((state) => state.token);
  const login = useAuthStore((state) => state.login);

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const [profileStatus, setProfileStatus] = useState<AsyncStatus>("loading");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<User | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [apiKeysStatus, setApiKeysStatus] = useState<AsyncStatus>("idle");
  const [apiKeysError, setApiKeysError] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [apiKeyForm, setApiKeyForm] = useState<ApiKeyFormState>(DEFAULT_API_KEY_FORM);
  const [isCreatingApiKey, setIsCreatingApiKey] = useState(false);
  const [removingApiKeyId, setRemovingApiKeyId] = useState<string | null>(null);
  const [validatingApiKeyId, setValidatingApiKeyId] = useState<string | null>(null);
  const [apiKeyValidations, setApiKeyValidations] = useState<Record<string, ApiKeyValidationState>>({});

  const [webhooksStatus, setWebhooksStatus] = useState<AsyncStatus>("idle");
  const [webhooksError, setWebhooksError] = useState<string | null>(null);
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>([]);
  const [webhookForm, setWebhookForm] = useState<WebhookFormState>(DEFAULT_WEBHOOK_FORM);
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);
  const [removingWebhookId, setRemovingWebhookId] = useState<string | null>(null);

  const [notificationsStatus, setNotificationsStatus] = useState<AsyncStatus>("idle");
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [notificationDrafts, setNotificationDrafts] = useState<NotificationDraft[]>([]);
  const [savingNotificationKey, setSavingNotificationKey] = useState<string | null>(null);
  const [isSeedingNotifications, setIsSeedingNotifications] = useState(false);

  function syncAuthStore(nextUser: User) {
    const nextToken = storedToken || readAuthTokenFromCookies();
    if (nextToken) {
      login(nextUser, nextToken);
    }
  }

  async function loadProfile() {
    setProfileStatus("loading");
    setProfileError(null);

    try {
      const response = await api.account.info();
      const nextUser = response.data;
      setAccountInfo(nextUser);
      setProfileForm({
        name: nextUser.name ?? "",
        email: nextUser.email ?? "",
      });
      setProfileStatus("success");
      syncAuthStore(nextUser);
    } catch (error) {
      const message = getErrorMessage(error, "Failed to load profile.");
      setProfileError(message);
      setProfileStatus("error");
      toast.error("加载账号信息失败", { description: message });
    }
  }

  async function loadApiKeys() {
    setApiKeysStatus("loading");
    setApiKeysError(null);

    try {
      const response = await api.settings.apiKeys.list();
      setApiKeys(response.data);
      setApiKeysStatus("success");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to load API keys.");
      setApiKeysError(message);
      setApiKeysStatus("error");
      toast.error("加载 API Keys 失败", { description: message });
    }
  }

  async function loadWebhooks() {
    setWebhooksStatus("loading");
    setWebhooksError(null);

    try {
      const response = await api.settings.webhooks.list();
      setWebhooks(response.data);
      setWebhooksStatus("success");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to load webhooks.");
      setWebhooksError(message);
      setWebhooksStatus("error");
      toast.error("加载 Webhooks 失败", { description: message });
    }
  }

  async function loadNotifications() {
    setNotificationsStatus("loading");
    setNotificationsError(null);

    try {
      const response = await api.settings.notifications.get();
      setNotificationDrafts(response.data.map((item) => toNotificationDraft(item)));
      setNotificationsStatus("success");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to load notifications.");
      setNotificationsError(message);
      setNotificationsStatus("error");
      toast.error("加载通知配置失败", { description: message });
    }
  }

  useEffect(() => {
    void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "api" && apiKeysStatus === "idle") {
      void loadApiKeys();
    }

    if (activeTab === "webhooks" && webhooksStatus === "idle") {
      void loadWebhooks();
    }

    if (activeTab === "notifications" && notificationsStatus === "idle") {
      void loadNotifications();
    }
  }, [activeTab, apiKeysStatus, notificationsStatus, webhooksStatus]);

  async function handleCopy(value: string, label: string) {
    if (!value) {
      toast.error(`${label} 为空，无法复制`);
      return;
    }

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error("当前环境不支持剪贴板复制");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} 已复制`);
    } catch (error) {
      const message = getErrorMessage(error, "Copy failed.");
      toast.error("复制失败", { description: message });
    }
  }

  async function handleSaveProfile() {
    if (!profileForm.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await api.account.updateProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim() || undefined,
      });
      setAccountInfo(response.data);
      setProfileForm({
        name: response.data.name ?? "",
        email: response.data.email ?? "",
      });
      syncAuthStore(response.data);
      toast.success("Profile updated");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to update profile.");
      toast.error("保存 Profile 失败", { description: message });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function validateApiKey(record: ApiKeyRecord, silentSuccess = false) {
    const candidate = record.secret || record.prefix || record.maskedKey;
    if (!candidate) {
      toast.error("缺少可校验的 Key 信息");
      return;
    }

    setValidatingApiKeyId(record.id);
    try {
      const response = await api.settings.apiKeys.validate({
        key: candidate,
        prefix: record.prefix || undefined,
      });
      setApiKeyValidations((current) => ({
        ...current,
        [record.id]: response.data,
      }));

      if (!response.data.valid) {
        toast.error("API Key 校验未通过", {
          description: response.data.message,
        });
      } else if (!silentSuccess) {
        toast.success("API Key 校验通过", {
          description: response.data.message,
        });
      }
    } catch (error) {
      const message = getErrorMessage(error, "Failed to validate API key.");
      toast.error("API Key 校验失败", { description: message });
    } finally {
      setValidatingApiKeyId(null);
    }
  }

  async function handleCreateApiKey() {
    if (!apiKeyForm.name.trim()) {
      toast.error("请输入 Key 名称");
      return;
    }

    setIsCreatingApiKey(true);
    try {
      const response = await api.settings.apiKeys.add({
        name: apiKeyForm.name.trim(),
        permissions: splitCommaSeparated(apiKeyForm.permissionsText),
        expiresAt: toIsoDateTime(apiKeyForm.expiresAt),
      });
      setApiKeys((current) => [response.data, ...current]);
      setApiKeysStatus("success");
      setApiKeyForm(DEFAULT_API_KEY_FORM);
      toast.success("API Key 已创建");
      await validateApiKey(response.data, true);
    } catch (error) {
      const message = getErrorMessage(error, "Failed to create API key.");
      toast.error("创建 API Key 失败", { description: message });
    } finally {
      setIsCreatingApiKey(false);
    }
  }

  async function handleRemoveApiKey(record: ApiKeyRecord) {
    if (typeof window !== "undefined" && !window.confirm(`Delete API key \"${record.name}\"?`)) {
      return;
    }

    setRemovingApiKeyId(record.id);
    try {
      await api.settings.apiKeys.remove(record.id);
      setApiKeys((current) => current.filter((item) => item.id !== record.id));
      setApiKeyValidations((current) => {
        const next = { ...current };
        delete next[record.id];
        return next;
      });
      toast.success("API Key 已删除");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to remove API key.");
      toast.error("删除 API Key 失败", { description: message });
    } finally {
      setRemovingApiKeyId(null);
    }
  }

  async function handleCreateWebhook() {
    if (!webhookForm.name.trim()) {
      toast.error("请输入 Webhook 名称");
      return;
    }

    if (!webhookForm.url.trim()) {
      toast.error("请输入 Webhook URL");
      return;
    }

    try {
      new URL(webhookForm.url.trim());
    } catch {
      toast.error("Webhook URL 格式不正确");
      return;
    }

    setIsCreatingWebhook(true);
    try {
      const response = await api.settings.webhooks.add({
        name: webhookForm.name.trim(),
        url: webhookForm.url.trim(),
        secret: webhookForm.secret.trim() || undefined,
        events: splitCommaSeparated(webhookForm.eventsText),
        isActive: webhookForm.isActive,
      });
      setWebhooks((current) => [response.data, ...current]);
      setWebhooksStatus("success");
      setWebhookForm(DEFAULT_WEBHOOK_FORM);
      toast.success("Webhook 已创建");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to create webhook.");
      toast.error("创建 Webhook 失败", { description: message });
    } finally {
      setIsCreatingWebhook(false);
    }
  }

  async function handleRemoveWebhook(record: WebhookRecord) {
    if (typeof window !== "undefined" && !window.confirm(`Delete webhook \"${record.name}\"?`)) {
      return;
    }

    setRemovingWebhookId(record.id);
    try {
      await api.settings.webhooks.remove(record.id);
      setWebhooks((current) => current.filter((item) => item.id !== record.id));
      toast.success("Webhook 已删除");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to remove webhook.");
      toast.error("删除 Webhook 失败", { description: message });
    } finally {
      setRemovingWebhookId(null);
    }
  }

  function updateNotificationDraft(key: string, patch: Partial<NotificationDraft>) {
    setNotificationDrafts((current) =>
      current.map((draft) =>
        (draft.id ?? draft.channel) === key
          ? { ...draft, ...patch }
          : draft,
      ),
    );
  }

  async function handleSeedNotifications() {
    if (isSeedingNotifications) {
      return;
    }

    setIsSeedingNotifications(true);
    try {
      const response = await api.settings.notifications.update(DEFAULT_NOTIFICATION_SEED);
      setNotificationDrafts([toNotificationDraft(response.data)]);
      setNotificationsStatus("success");
      toast.success("默认通知渠道已创建");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to initialize notifications.");
      toast.error("初始化通知配置失败", { description: message });
    } finally {
      setIsSeedingNotifications(false);
    }
  }

  async function handleSaveNotification(draft: NotificationDraft) {
    const key = draft.id ?? draft.channel;
    if (!draft.name.trim()) {
      toast.error("Notification name is required.");
      return;
    }

    if (!draft.channel.trim()) {
      toast.error("Notification channel is required.");
      return;
    }

    let config: Record<string, unknown>;
    try {
      config = parseConfigText(draft.configText);
    } catch (error) {
      const message = getErrorMessage(error, "Invalid notification config.");
      toast.error("通知配置 JSON 无效", { description: message });
      return;
    }

    setSavingNotificationKey(key);
    try {
      const response = await api.settings.notifications.update({
        id: draft.id,
        channel: draft.channel.trim(),
        name: draft.name.trim(),
        events: splitCommaSeparated(draft.eventsText),
        config,
        isActive: draft.isActive,
      });
      const nextDraft = toNotificationDraft(response.data);
      setNotificationDrafts((current) =>
        current.map((item) =>
          (item.id ?? item.channel) === key
            ? nextDraft
            : item,
        ),
      );
      toast.success("通知配置已更新");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to update notifications.");
      toast.error("保存通知配置失败", { description: message });
    } finally {
      setSavingNotificationKey(null);
    }
  }

  const currentUser = accountInfo ?? storedUser;

  return (
    <div className="flex max-w-5xl flex-col gap-8 animate-in fade-in duration-500">
      <MetadataUpdater title="账号设置" description="Manage your profile, API keys, webhooks, and notification preferences." />

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, API credentials, outbound integrations, and alert preferences.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as SettingsTab)}
        className="flex flex-col gap-6 md:flex-row"
      >
        <TabsList className="h-auto w-full items-start gap-1 overflow-x-auto bg-transparent p-0 md:w-48 md:flex-col">
          <TabsTrigger value="profile" className="h-10 w-full justify-start gap-2 px-4 py-2 data-[state=active]:bg-muted">
            <UserIcon className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="api" className="h-10 w-full justify-start gap-2 px-4 py-2 data-[state=active]:bg-muted">
            <Key className="h-4 w-4" /> API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="h-10 w-full justify-start gap-2 px-4 py-2 data-[state=active]:bg-muted">
            <Webhook className="h-4 w-4" /> Webhooks
          </TabsTrigger>
          <TabsTrigger value="notifications" className="h-10 w-full justify-start gap-2 px-4 py-2 data-[state=active]:bg-muted">
            <BellRing className="h-4 w-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        <div className="min-w-0 flex-1">
          <TabsContent value="profile" className="mt-0 space-y-6">
            {profileStatus === "loading" ? (
              <SectionSkeleton />
            ) : profileStatus === "error" ? (
              <ErrorState
                title="Profile unavailable"
                description={profileError ?? "Failed to load your profile."}
                onRetry={() => void loadProfile()}
                className="border-white/10 bg-zinc-950/60"
              />
            ) : !currentUser ? (
              <EmptyState
                icon={UserIcon}
                title="No profile data"
                description="The API did not return an account profile."
                actionLabel="Reload"
                onAction={() => void loadProfile()}
                className="border-white/10 bg-zinc-950/60"
              />
            ) : (
              <>
                <Card className="border-white/10 bg-zinc-950/60">
                  <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="text-white">Profile Information</CardTitle>
                      <CardDescription>
                        Update the contact details returned by `api.account.info()`.
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => void loadProfile()}>
                      <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Refresh
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20 border border-white/10">
                        <AvatarImage
                          src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name || "mediaclaw"}`}
                          alt={currentUser.name}
                        />
                        <AvatarFallback>{(currentUser.name || "MC").slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="text-base font-medium text-white">{currentUser.name || "Unnamed User"}</div>
                        <div className="text-sm text-muted-foreground">
                          {currentUser.email || currentUser.phone || "No contact info"}
                        </div>
                        <Badge variant="outline" className="border-white/10 text-zinc-300">
                          {currentUser.role}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="settings-name">Name</Label>
                        <Input
                          id="settings-name"
                          value={profileForm.name}
                          onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="settings-phone">Phone Number</Label>
                        <Input id="settings-phone" value={currentUser.phone || ""} disabled />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="settings-email">Email Address</Label>
                      <Input
                        id="settings-email"
                        type="email"
                        value={profileForm.email}
                        onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Used for notifications and account recovery.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-white/10 px-6 py-4">
                    <Button onClick={() => void handleSaveProfile()} disabled={isSavingProfile}>
                      {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border-white/10 bg-zinc-950/60">
                  <CardHeader>
                    <CardTitle className="text-white">Account Snapshot</CardTitle>
                    <CardDescription>Read-only fields returned by the account API.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Role</div>
                      <div className="mt-2 text-sm font-medium text-white">{currentUser.role}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">WeChat</div>
                      <div className="mt-2 text-sm font-medium text-white">{currentUser.wechatId || "Not bound"}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Created At</div>
                      <div className="mt-2 text-sm font-medium text-white">{formatDateTime(currentUser.createdAt)}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Last Login</div>
                      <div className="mt-2 text-sm font-medium text-white">{formatDateTime(currentUser.lastLoginAt)}</div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="api" className="mt-0 space-y-6">
            <Card className="border-white/10 bg-zinc-950/60">
              <CardHeader>
                <CardTitle className="text-white">Create API Key</CardTitle>
                <CardDescription>
                  Create a new key with `api.settings.apiKeys.add()` and validate it right after creation.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="api-key-name">Name</Label>
                  <Input
                    id="api-key-name"
                    value={apiKeyForm.name}
                    onChange={(event) => setApiKeyForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Production key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key-expiry">Expires At</Label>
                  <Input
                    id="api-key-expiry"
                    type="datetime-local"
                    value={apiKeyForm.expiresAt}
                    onChange={(event) => setApiKeyForm((current) => ({ ...current, expiresAt: event.target.value }))}
                  />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="api-key-permissions">Permissions</Label>
                  <Textarea
                    id="api-key-permissions"
                    value={apiKeyForm.permissionsText}
                    onChange={(event) => setApiKeyForm((current) => ({ ...current, permissionsText: event.target.value }))}
                    placeholder="videos:read, videos:write"
                    className="min-h-24"
                  />
                  <p className="text-xs text-muted-foreground">Use commas or new lines to separate permissions.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t border-white/10 px-6 py-4">
                <Button onClick={() => void handleCreateApiKey()} disabled={isCreatingApiKey}>
                  {isCreatingApiKey ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Create Key
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-white/10 bg-zinc-950/60">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-white">API Keys</CardTitle>
                  <CardDescription>Loaded from `list()`, removable via `remove()`, and manually verifiable.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => void loadApiKeys()}>
                  <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {apiKeysStatus === "loading" ? (
                  <SectionSkeleton blocks={1} />
                ) : apiKeysStatus === "error" ? (
                  <ErrorState
                    title="API Keys unavailable"
                    description={apiKeysError ?? "Failed to load API keys."}
                    onRetry={() => void loadApiKeys()}
                    className="border-white/10 bg-zinc-950/60"
                  />
                ) : apiKeys.length === 0 ? (
                  <EmptyState
                    icon={Key}
                    title="No API keys yet"
                    description="Create your first key to access the MediaClaw API."
                    className="border-white/10 bg-zinc-950/60"
                  />
                ) : (
                  <div className="space-y-4">
                    {apiKeys.map((record) => {
                      const validation = apiKeyValidations[record.id];
                      const displayValue = getApiKeyDisplayValue(record);

                      return (
                        <div key={record.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1 space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-sm font-semibold text-white">{record.name}</div>
                                <Badge
                                  variant="outline"
                                  className={record.isActive ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-white/10 text-zinc-400"}
                                >
                                  {record.isActive ? "Active" : "Inactive"}
                                </Badge>
                                {validation && (
                                  <Badge
                                    variant={validation.valid ? "secondary" : "destructive"}
                                    className={validation.valid ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : undefined}
                                  >
                                    {validation.valid && <CheckCircle2 className="h-3 w-3" />}
                                    {validation.valid ? "Valid" : "Invalid"}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Created {formatDateTime(record.createdAt)}
                                {record.lastUsedAt ? ` • Last used ${formatDateTime(record.lastUsedAt)}` : " • Never used"}
                                {record.expiresAt ? ` • Expires ${formatDateTime(record.expiresAt)}` : " • Never expires"}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {record.permissions.length > 0 ? (
                                  record.permissions.map((permission) => (
                                    <Badge key={permission} variant="outline" className="border-white/10 text-zinc-300">
                                      {permission}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground">No explicit permissions</span>
                                )}
                              </div>
                              <div className="flex">
                                <Input
                                  value={displayValue}
                                  readOnly
                                  className="rounded-r-none border-r-0 bg-black/20 font-mono text-xs"
                                />
                                <Button
                                  variant="outline"
                                  className="rounded-l-none px-3"
                                  onClick={() => void handleCopy(displayValue, "API Key")}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              {record.secret && (
                                <p className="text-xs text-amber-300/80">This secret is only shown in the current session.</p>
                              )}
                              {validation?.message && (
                                <p className="text-xs text-muted-foreground">{validation.message}</p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => void validateApiKey(record)}
                                disabled={validatingApiKeyId === record.id}
                              >
                                {validatingApiKeyId === record.id && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                                Validate
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => void handleRemoveApiKey(record)}
                                disabled={removingApiKeyId === record.id}
                              >
                                {removingApiKeyId === record.id ? (
                                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                                )}
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="mt-0 space-y-6">
            <Card className="border-white/10 bg-zinc-950/60">
              <CardHeader>
                <CardTitle className="text-white">Add Webhook Endpoint</CardTitle>
                <CardDescription>
                  Create a new outbound webhook using `api.settings.webhooks.add()`.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="webhook-name">Name</Label>
                  <Input
                    id="webhook-name"
                    value={webhookForm.name}
                    onChange={(event) => setWebhookForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Primary endpoint"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">URL</Label>
                  <Input
                    id="webhook-url"
                    value={webhookForm.url}
                    onChange={(event) => setWebhookForm((current) => ({ ...current, url: event.target.value }))}
                    placeholder="https://example.com/webhooks/mediaclaw"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">Secret</Label>
                  <Input
                    id="webhook-secret"
                    value={webhookForm.secret}
                    onChange={(event) => setWebhookForm((current) => ({ ...current, secret: event.target.value }))}
                    placeholder="Optional signing secret"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-events">Events</Label>
                  <Textarea
                    id="webhook-events"
                    value={webhookForm.eventsText}
                    onChange={(event) => setWebhookForm((current) => ({ ...current, eventsText: event.target.value }))}
                    className="min-h-24"
                    placeholder="video.completed, video.failed"
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 lg:col-span-2">
                  <div>
                    <div className="text-sm font-medium text-white">Endpoint active after creation</div>
                    <div className="text-xs text-muted-foreground">Persisted through the `isActive` field in the API payload.</div>
                  </div>
                  <Switch
                    checked={webhookForm.isActive}
                    onCheckedChange={(checked) => setWebhookForm((current) => ({ ...current, isActive: checked }))}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t border-white/10 px-6 py-4">
                <Button onClick={() => void handleCreateWebhook()} disabled={isCreatingWebhook}>
                  {isCreatingWebhook ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Add Endpoint
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-white/10 bg-zinc-950/60">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-white">Webhook Endpoints</CardTitle>
                  <CardDescription>Loaded from `list()` and removable with `remove()`.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => void loadWebhooks()}>
                  <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {webhooksStatus === "loading" ? (
                  <SectionSkeleton blocks={1} />
                ) : webhooksStatus === "error" ? (
                  <ErrorState
                    title="Webhooks unavailable"
                    description={webhooksError ?? "Failed to load webhooks."}
                    onRetry={() => void loadWebhooks()}
                    className="border-white/10 bg-zinc-950/60"
                  />
                ) : webhooks.length === 0 ? (
                  <EmptyState
                    icon={Webhook}
                    title="No webhook endpoints"
                    description="Add an endpoint to receive outbound event notifications."
                    className="border-white/10 bg-zinc-950/60"
                  />
                ) : (
                  <div className="space-y-4">
                    {webhooks.map((record) => (
                      <div key={record.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-sm font-semibold text-white">{record.name}</div>
                              <Badge
                                variant="outline"
                                className={record.isActive ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-white/10 text-zinc-400"}
                              >
                                {record.isActive ? "Active" : "Inactive"}
                              </Badge>
                              {record.hasSecret && (
                                <Badge variant="outline" className="border-white/10 text-zinc-300">
                                  Secret configured
                                </Badge>
                              )}
                            </div>
                            <div className="rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-2 font-mono text-xs text-zinc-300">
                              {record.url}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {record.events.length > 0 ? (
                                record.events.map((eventName) => (
                                  <Badge key={eventName} variant="outline" className="border-white/10 text-zinc-300">
                                    {eventName}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">No subscribed events</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Created {formatDateTime(record.createdAt)}
                              {record.updatedAt ? ` • Updated ${formatDateTime(record.updatedAt)}` : ""}
                              {record.lastTriggeredAt ? ` • Last delivery ${formatDateTime(record.lastTriggeredAt)}` : " • Never delivered"}
                              {` • Failures ${record.failCount}`}
                            </div>
                            {record.secretPreview && (
                              <div className="text-xs text-muted-foreground">Secret preview: {record.secretPreview}</div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => void handleRemoveWebhook(record)}
                            disabled={removingWebhookId === record.id}
                          >
                            {removingWebhookId === record.id ? (
                              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0 space-y-6">
            <Card className="border-white/10 bg-zinc-950/60">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-white">Notification Preferences</CardTitle>
                  <CardDescription>
                    Loaded from `get()` and persisted with `update()`. Events are comma-separated and config is JSON.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => void loadNotifications()}>
                  <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {notificationsStatus === "loading" ? (
                  <SectionSkeleton />
                ) : notificationsStatus === "error" ? (
                  <ErrorState
                    title="Notifications unavailable"
                    description={notificationsError ?? "Failed to load notification channels."}
                    onRetry={() => void loadNotifications()}
                    className="border-white/10 bg-zinc-950/60"
                  />
                ) : notificationDrafts.length === 0 ? (
                  <EmptyState
                    icon={BellRing}
                    title="No notification channels"
                    description="Initialize a default channel so the API has something to update."
                    actionLabel={isSeedingNotifications ? "Initializing..." : "Create Default Channel"}
                    onAction={() => void handleSeedNotifications()}
                    className="border-white/10 bg-zinc-950/60"
                  />
                ) : (
                  <div className="space-y-4">
                    {notificationDrafts.map((draft) => {
                      const key = draft.id ?? draft.channel;
                      const isSaving = savingNotificationKey === key;

                      return (
                        <Card key={key} className="border-white/10 bg-black/20">
                          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <CardTitle className="text-base text-white">{draft.name}</CardTitle>
                              <CardDescription>
                                Channel: {draft.channel} • Updated {formatDateTime(draft.updatedAt || draft.createdAt)}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className={draft.isActive ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-white/10 text-zinc-400"}
                              >
                                {draft.isActive ? "Enabled" : "Disabled"}
                              </Badge>
                              <Switch
                                checked={draft.isActive}
                                onCheckedChange={(checked) => updateNotificationDraft(key, { isActive: checked })}
                              />
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`notification-name-${key}`}>Name</Label>
                                <Input
                                  id={`notification-name-${key}`}
                                  value={draft.name}
                                  onChange={(event) => updateNotificationDraft(key, { name: event.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`notification-channel-${key}`}>Channel</Label>
                                <Input id={`notification-channel-${key}`} value={draft.channel} disabled />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`notification-events-${key}`}>Events</Label>
                              <Textarea
                                id={`notification-events-${key}`}
                                value={draft.eventsText}
                                onChange={(event) => updateNotificationDraft(key, { eventsText: event.target.value })}
                                className="min-h-24"
                                placeholder="video.failed, credit.low"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`notification-config-${key}`}>Config (JSON object)</Label>
                              <Textarea
                                id={`notification-config-${key}`}
                                value={draft.configText}
                                onChange={(event) => updateNotificationDraft(key, { configText: event.target.value })}
                                className="min-h-32 font-mono text-xs"
                                placeholder="{}"
                              />
                            </div>
                          </CardContent>
                          <CardFooter className="border-t border-white/10 px-6 py-4">
                            <Button onClick={() => void handleSaveNotification(draft)} disabled={isSaving}>
                              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Save Notification
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
