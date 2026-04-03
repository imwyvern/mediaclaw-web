import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type Method,
} from "axios";
import { toast } from "sonner";

import { getCookie, setCookie, eraseCookie } from "./cookies";
import {
  normalizeVideoStatus,
  toLegacyVideoStatus,
  type VideoLifecycleStatus,
} from "./video-status";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const API_TIMEOUT = 10_000;
const FALLBACK_RETRY_STATUSES = new Set([404, 405]);

type AnyRecord = Record<string, unknown>;

type TaskStatus = "queued" | "processing" | "completed" | "failed";

type VideoTaskType = "brand_replace" | "remix" | "new_content";

interface ApiEnvelope<T> {
  code?: number;
  message?: string;
  data: T;
}

interface RetryableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _suppressErrorToast?: boolean;
}

interface RequestCandidate {
  url: string;
  method?: Method;
  data?: unknown;
  params?: unknown;
  headers?: AxiosRequestConfig["headers"];
  timeout?: number;
}

interface RequestOptions {
  suppressErrorToast?: boolean;
  fallbackStatuses?: Set<number> | number[];
}

export interface ApiResult<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: "user" | "admin";
  wechatId?: string;
  orgId?: string | null;
  userType?: string;
  avatarUrl?: string;
  imBindings?: unknown[];
  lastLoginAt?: string;
  createdAt?: string;
}

export interface Video {
  id: string;
  title: string;
  brand: string;
  brandId?: string;
  status: "Completed" | "Processing" | "Failed";
  lifecycleStatus?: VideoLifecycleStatus;
  date: string;
  credits: number;
  progress?: number;
  type?: string;
  taskType?: string;
  outputVideoUrl?: string;
  sourceVideoUrl?: string;
  publishStatus?: string;
  approvalStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  tokens?: number;
}

export interface ContentItem extends Video {
  subtitle?: string;
  hashtags: string[];
  blueWords: string[];
  commentGuide?: string;
  commentGuides: string[];
  approval?: Record<string, unknown> | null;
  publishInfo?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
  raw?: unknown;
}

export interface VideoTimelineEntry {
  id: string;
  status: VideoLifecycleStatus;
  rawStatus: string;
  label: string;
  timestamp?: string;
  message?: string;
  progress: number;
}

export interface VideoIteration extends VideoTimelineEntry {
  outputVideoUrl?: string;
}

export interface VideoDetail extends ContentItem {
  timeline: VideoTimelineEntry[];
  iterations: VideoIteration[];
}

export interface ProductionTask {
  id: string;
  title: string;
  status: TaskStatus;
  progress: number;
  createdAt: string;
  brandName: string;
  error?: string;
  rawStatus?: string;
}

export interface Brand {
  id: string;
  name: string;
  category: string;
  industry?: string;
  pipelines: number;
  videos: number;
  logo: string;
  logoUrl?: string;
  colors?: string[];
  fonts?: string[];
  videoStyle?: string;
  isActive?: boolean;
  orgId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarTask {
  id: string;
  title: string;
  brand: string;
  status: VideoLifecycleStatus;
  rawStatus: string;
  scheduledAt: string;
  detailId: string;
  outputVideoUrl?: string;
}

export interface AdminClientRecord {
  id: string;
  name: string;
  plan: string;
  status: string;
  videoCount: number;
  memberCount: number;
  joinedAt?: string;
}

export interface AdminHealthService {
  id: string;
  name: string;
  status: string;
  message?: string;
  latencyMs?: number;
}

export interface AdminHealthStatus {
  overallStatus: string;
  availability: number;
  queueDepth: number;
  storageUsage: number;
  checkedAt?: string;
  services: AdminHealthService[];
}

export interface AuditLogEntry {
  id: string;
  timestamp?: string;
  level: string;
  action: string;
  actor: string;
  description: string;
  target?: string;
}

export interface CampaignRecord {
  id: string;
  name: string;
  brand: string;
  brandId?: string;
  status: string;
  progress: number;
  totalVideos: number;
  completed: number;
  startDate?: string;
  endDate?: string;
  platforms: string[];
  description?: string;
  objective?: string;
  raw?: unknown;
}

export interface BillingInvoiceRecord {
  id: string;
  number: string;
  status: string;
  amount: number;
  currency: string;
  issuedAt?: string;
  paidAt?: string;
  dueAt?: string;
  downloadUrl?: string;
}

export interface EnterpriseRegisterData {
  orgName: string;
  industry: string;
  adminPhone: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  isNewUser: boolean;
}

export type DiscoveryPlatform = "douyin" | "xhs" | "kuaishou" | "bilibili";

export interface DiscoveryPoolParams {
  limit?: number;
  industry?: string;
  platform?: DiscoveryPlatform | "all";
  sortBy?: "viralScore" | "time";
}

export interface DiscoveryPoolItem {
  contentId: string;
  platform: DiscoveryPlatform;
  videoId: string;
  title: string;
  author: string;
  viralScore: number;
  industry?: string;
  keywords?: string[];
  contentUrl?: string;
  thumbnailUrl?: string;
  discoveredAt?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

export interface DiscoveryPoolResponse {
  orgId: string;
  total: number;
  source: string;
  items: DiscoveryPoolItem[];
}

export interface DiscoveryViralAnalysis {
  source: string;
  model: string;
  contentId: string;
  platform: DiscoveryPlatform;
  videoId: string;
  title: string;
  summary: string;
  hooks: string[];
  narrativeBeats: string[];
  visualMotifs: string[];
  audioCues: string[];
  ctaStyle?: string;
  risks: string[];
  raw?: string;
}

export interface DiscoveryRemixBrief {
  source: string;
  model: string;
  contentId: string;
  brandId: string;
  briefTitle: string;
  coreAngle?: string;
  targetAudience?: string;
  openingHook?: string;
  scenePlan: string[];
  copyIdeas: string[];
  brandSafetyNotes: string[];
  productionNotes: string[];
  raw?: string;
}

export interface CreditSummary {
  remaining: number;
  used: number;
  total: number;
}

export interface UsageTotals {
  recordCount: number;
  videosGenerated: number;
  creditsConsumed: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  tokenCost: number;
  estimatedCost: number;
  refundedCredits: number;
}

export interface UsageBreakdownItem {
  id: string;
  name: string;
  type?: string;
  creditsConsumed: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  tokenCost: number;
  recordCount: number;
}

export interface UsageSummary {
  totals: UsageTotals;
  byType: UsageBreakdownItem[];
  byBrand: UsageBreakdownItem[];
  period: {
    startAt?: string;
    endAt?: string;
    granularity?: string;
  };
}

export interface UsageTimelinePoint {
  periodStart: string;
  creditsConsumed: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  tokenCost: number;
  recordCount: number;
}

export interface UsageTimeline {
  granularity: string;
  points: UsageTimelinePoint[];
}

export interface UsageDetailItem {
  id: string;
  videoTaskId?: string;
  videoTitle: string;
  type: string;
  creditsConsumed: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  tokenCost: number;
  model?: string;
  brandId?: string;
  brandName?: string;
  refunded: boolean;
  refundedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface AccountPack {
  id: string;
  packType: string;
  status: string;
  totalCredits: number;
  remainingCredits: number;
  usedCredits: number;
  purchasedAt?: string;
  expiresAt?: string;
  expired: boolean;
  paymentOrderId?: string;
}

export interface AccountSnapshot {
  credits: CreditSummary;
  packs: AccountPack[];
  currentPeriod: UsageTotals;
}

export interface PaymentProduct {
  id: string;
  name: string;
  description: string;
  productType: string;
  currency: string;
  unitAmount: number;
  price: number;
  unitCredits: number;
  packType: string;
}

export interface PaymentOrder {
  id: string;
  orderId: string;
  orgId?: string;
  userId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  productType?: string;
  productId?: string;
  quantity: number;
  payUrl?: string;
  paidAt?: string;
  expiredAt?: string;
  callbackData?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnalyticsOverview {
  totalVideos: number;
  creditsUsed: number;
  successRate: number;
  avgProductionTimeMs: number;
  avgProductionTimeMinutes: number;
  performance: {
    views: number;
    likes: number;
    comments: number;
  };
  topVideos?: AnalyticsTopVideo[];
}

export interface AnalyticsTrendPoint {
  periodStart: string;
  totalVideos: number;
  completedVideos: number;
  creditsUsed: number;
  views: number;
  likes: number;
  comments: number;
  successRate: number;
}

export interface AnalyticsTopVideo {
  id: string;
  taskId: string;
  brandId?: string;
  brandName: string;
  title: string;
  outputVideoUrl?: string;
  views: number;
  likes: number;
  comments: number;
  engagementScore: number;
  completedAt?: string;
}

export interface DataOverviewActivityPoint {
  date: string;
  totalVideos: number;
  completedVideos: number;
  totalViews: number;
}

export interface DataOverviewSummary {
  totalVideos: number;
  completedVideos: number;
  successRate: number;
  totalViews: number;
  averageViewsPerVideo: number;
  engagementRate: number;
  publishingConsistency: number;
  trackedVideos: number;
}

export interface DataOverview {
  orgId: string;
  source: string;
  dashboardTier?: string;
  windowDays: number;
  summary: DataOverviewSummary;
  activity: DataOverviewActivityPoint[];
  recentVideos: ContentItem[];
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  maskedKey: string;
  permissions: string[];
  lastUsedAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt?: string;
  secret?: string;
}

export interface WebhookRecord {
  id: string;
  name: string;
  url: string;
  hasSecret: boolean;
  secretPreview?: string;
  events: string[];
  isActive: boolean;
  lastTriggeredAt?: string;
  failCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationChannel {
  id: string;
  channel: string;
  name: string;
  events: string[];
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

type AnalyticsPeriod = "daily" | "weekly" | "monthly";

let refreshPromise: Promise<RefreshResponse | null> | null = null;

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null;
}

function toResult<T>(data: T): ApiResult<T> {
  return { data };
}

function unwrapApiData<T>(payload: unknown): T {
  if (
    isRecord(payload) &&
    "data" in payload &&
    ("code" in payload || "message" in payload)
  ) {
    return (payload as unknown as ApiEnvelope<T>).data;
  }

  return payload as T;
}

function readNestedMessage(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const message = value.message;
  if (typeof message === "string" && message.trim()) {
    return message;
  }

  const error = value.error;
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (Array.isArray(value.errors) && value.errors.length > 0) {
    const firstError = value.errors[0];
    if (typeof firstError === "string" && firstError.trim()) {
      return firstError;
    }
    if (isRecord(firstError) && typeof firstError.message === "string") {
      return firstError.message;
    }
  }

  return undefined;
}

export function readApiErrorMessage(
  error: unknown,
  fallback = "请求失败，请稍后重试。",
) {
  if (axios.isAxiosError(error)) {
    const responseMessage = readNestedMessage(error.response?.data);
    if (responseMessage) {
      return responseMessage;
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function getApiStatusCode(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  const status = error.response?.status;
  return typeof status === "number" ? status : null;
}

export function isApiNotFoundError(error: unknown) {
  return getApiStatusCode(error) === 404;
}

function showApiErrorToast(error: unknown) {
  toast.error("请求失败", {
    description: readApiErrorMessage(error),
  });
}

function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  eraseCookie("auth_token");
  eraseCookie("refresh_token");
  window.location.href = "/auth";
}

async function refreshAuthSession(): Promise<RefreshResponse | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const refreshToken = getCookie("refresh_token");
  if (!refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<ApiEnvelope<RefreshResponse> | RefreshResponse>(
        `${API_BASE_URL}/v1/auth/refresh`,
        { refreshToken },
        { timeout: API_TIMEOUT },
      )
      .then((response) => unwrapApiData<RefreshResponse>(response.data))
      .then((payload) => {
        if (!payload?.accessToken) {
          return null;
        }

        setCookie("auth_token", payload.accessToken, 7);
        if (payload.refreshToken) {
          setCookie("refresh_token", payload.refreshToken, 7);
        }
        return payload;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function createApiClient({ silentErrors }: { silentErrors: boolean }) {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
  });

  client.interceptors.request.use(
    (config) => {
      if (typeof window !== "undefined") {
        const token = getCookie("auth_token");
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (response) => ({
      ...response,
      data: unwrapApiData(response.data),
    }),
    async (error: AxiosError) => {
      const originalRequest = (error.config || {}) as RetryableRequestConfig;
      const requestUrl = String(originalRequest.url || "");

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !requestUrl.includes("/v1/auth/refresh")
      ) {
        originalRequest._retry = true;
        const refreshPayload = await refreshAuthSession();

        if (refreshPayload?.accessToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${refreshPayload.accessToken}`;
          return client(originalRequest);
        }

        clearAuthSession();
      }

      if (!silentErrors && !originalRequest._suppressErrorToast) {
        showApiErrorToast(error);
      }

      return Promise.reject(error);
    },
  );

  return client;
}

export const rawApiClient = createApiClient({ silentErrors: true });
export const apiClient = createApiClient({ silentErrors: false });

function shouldTryFallback(error: unknown, fallbackStatuses: Set<number>) {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  return typeof status === "number" && fallbackStatuses.has(status);
}

async function requestData<T>(
  candidate: RequestCandidate,
  options: RequestOptions = {},
): Promise<T> {
  const client = options.suppressErrorToast ? rawApiClient : apiClient;
  const config: RetryableRequestConfig = {
    url: candidate.url,
    method: candidate.method || "GET",
    data: candidate.data,
    params: candidate.params,
    headers: candidate.headers,
    timeout: candidate.timeout,
    _suppressErrorToast: options.suppressErrorToast,
  };

  try {
    const response = await client.request<T, AxiosResponse<T>>(config);
    return response.data;
  } catch (error) {
    if (client === rawApiClient && !options.suppressErrorToast) {
      showApiErrorToast(error);
    }
    throw error;
  }
}

async function request<T = unknown>(
  candidate: RequestCandidate,
  options?: RequestOptions,
): Promise<ApiResult<T>> {
  return toResult(await requestData<T>(candidate, options));
}

async function requestWithFallbackData<T>(
  candidates: RequestCandidate[],
  options: RequestOptions = {},
): Promise<T> {
  const fallbackStatuses = options.fallbackStatuses
    ? new Set(options.fallbackStatuses)
    : FALLBACK_RETRY_STATUSES;

  let lastError: unknown = null;

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const isLast = index === candidates.length - 1;
    const client = isLast && !options.suppressErrorToast ? apiClient : rawApiClient;
    const config: RetryableRequestConfig = {
      url: candidate.url,
      method: candidate.method || "GET",
      data: candidate.data,
      params: candidate.params,
      headers: candidate.headers,
      timeout: candidate.timeout,
      _suppressErrorToast: options.suppressErrorToast || !isLast,
    };

    try {
      const response = await client.request<T, AxiosResponse<T>>(config);
      return response.data;
    } catch (error) {
      lastError = error;
      const canRetry = !isLast && shouldTryFallback(error, fallbackStatuses);
      if (canRetry) {
        continue;
      }

      if (client === rawApiClient && !options.suppressErrorToast) {
        showApiErrorToast(error);
      }
      throw error;
    }
  }

  throw (lastError instanceof Error ? lastError : new Error("Request failed"));
}

async function requestWithFallback<T = unknown>(
  candidates: RequestCandidate[],
  options?: RequestOptions,
): Promise<ApiResult<T>> {
  return toResult(await requestWithFallbackData<T>(candidates, options));
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function stringOrUndefined(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    const next = stringOrUndefined(value);
    if (next) {
      return next;
    }
  }

  return undefined;
}

function numberValue(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function booleanValue(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function arrayValue<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function compactObject<T extends AnyRecord>(value: T): T {
  const next = {} as T;

  Object.entries(value).forEach(([key, item]) => {
    if (item !== undefined) {
      (next as AnyRecord)[key] = item;
    }
  });

  return next;
}

function extractId(value: unknown, fallbackPrefix = "item") {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (!isRecord(value)) {
    return `${fallbackPrefix}_${Math.random().toString(36).slice(2, 8)}`;
  }

  const candidate = value.id ?? value._id ?? value.orderId ?? value.taskId ?? value.videoTaskId;
  if (typeof candidate === "string" || typeof candidate === "number") {
    return String(candidate);
  }

  return `${fallbackPrefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function initials(value: string) {
  const words = value
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return "MC";
  }

  return words
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() || "")
    .join("");
}

function normalizeAnalyticsPeriod(timeframe?: string): AnalyticsPeriod | undefined {
  switch (timeframe) {
    case "7d":
      return "daily";
    case "30d":
      return "weekly";
    case "90d":
      return "monthly";
    default:
      return undefined;
  }
}

function normalizePercentNumber(value: unknown) {
  const numeric = numberValue(value);
  if (numeric > 0 && numeric <= 1) {
    return numeric * 100;
  }
  return numeric;
}

function fileNameFromUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  try {
    const url = new URL(value);
    const name = url.pathname.split("/").filter(Boolean).pop();
    return name || undefined;
  } catch {
    const name = value.split("/").filter(Boolean).pop();
    return name || undefined;
  }
}

function inferTaskType(value: unknown): VideoTaskType {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "new_content" || normalized === "template") {
    return "new_content";
  }
  if (normalized === "remix" || normalized === "upload") {
    return "remix";
  }
  return "brand_replace";
}

function normalizeUser(raw: unknown): User {
  const record = objectValue(raw) || {};
  const roleRaw = String(record.role || record.userType || "").toLowerCase();
  const role: User["role"] =
    roleRaw.includes("admin") || roleRaw.includes("owner") || roleRaw.includes("enterprise")
      ? "admin"
      : "user";
  const bindings = arrayValue(record.imBindings);
  const wechatBinding = bindings.find((item) => {
    const binding = objectValue(item);
    return binding && String(binding.type || binding.provider || "").toLowerCase().includes("wechat");
  });

  return {
    id: extractId(record, "user"),
    name: stringValue(record.name, stringValue(record.phone, "未命名用户")),
    email: stringOrUndefined(record.email),
    phone: stringValue(record.phone),
    role,
    wechatId: stringOrUndefined(record.wechatId) || stringOrUndefined(objectValue(wechatBinding)?.openId),
    orgId: stringOrUndefined(record.orgId) || null,
    userType: stringOrUndefined(record.userType),
    avatarUrl: stringOrUndefined(record.avatarUrl),
    imBindings: bindings,
    lastLoginAt: stringOrUndefined(record.lastLoginAt),
    createdAt: stringOrUndefined(record.createdAt),
  };
}

function normalizeBrand(raw: unknown): Brand {
  const record = objectValue(raw) || {};
  const name = stringValue(record.name, "未命名品牌");
  const visualIdentity = objectValue(record.visualIdentity) || {};

  return {
    id: extractId(record, "brand"),
    name,
    category: stringValue(record.category, stringValue(record.industry, "未分类")),
    industry: stringOrUndefined(record.industry) || stringOrUndefined(record.category),
    pipelines: numberValue(record.pipelines ?? record.pipelineCount),
    videos: numberValue(record.videos ?? record.videoCount ?? record.contentCount),
    logo: stringValue(record.logo, initials(name)),
    logoUrl: stringOrUndefined(record.logoUrl),
    colors: arrayValue<string>(record.colors).length > 0 ? arrayValue<string>(record.colors) : arrayValue<string>(visualIdentity.colors),
    fonts: arrayValue<string>(record.fonts).length > 0 ? arrayValue<string>(record.fonts) : arrayValue<string>(visualIdentity.fonts),
    videoStyle: stringOrUndefined(record.videoStyle),
    isActive: booleanValue(record.isActive, true),
    orgId: stringOrUndefined(record.orgId),
    createdAt: stringOrUndefined(record.createdAt),
    updatedAt: stringOrUndefined(record.updatedAt),
  };
}

function normalizeCalendarTask(raw: unknown): CalendarTask {
  const record = objectValue(raw) || {};
  const rawStatus = stringValue(
    record.status,
    stringValue(record.publishStatus, stringValue(record.taskStatus, "scheduled")),
  );
  const scheduledAt =
    firstString(
      record.scheduledAt,
      record.publishAt,
      record.publishedAt,
      record.plannedAt,
      record.executeAt,
      record.createdAt,
      record.updatedAt,
    ) || new Date().toISOString();

  return {
    id: extractId(record, "calendar"),
    title: inferVideoTitle(record),
    brand: inferVideoBrand(record),
    status: normalizeVideoStatus(rawStatus),
    rawStatus,
    scheduledAt,
    detailId:
      firstString(record.videoId, record.taskId, record.id, record._id) ||
      extractId(record, "calendar"),
    outputVideoUrl: firstString(record.outputVideoUrl, record.videoUrl),
  };
}

function normalizeAdminClient(raw: unknown): AdminClientRecord {
  const record = objectValue(raw) || {};
  return {
    id: extractId(record, "client"),
    name: stringValue(
      record.name,
      stringValue(record.orgName, stringValue(record.brandName, "未命名客户")),
    ),
    plan: stringValue(
      record.plan,
      stringValue(record.planName, stringValue(record.subscriptionTier, "未配置套餐")),
    ),
    status: stringValue(
      record.status,
      stringValue(record.subscriptionStatus, stringValue(record.accountStatus, "unknown")),
    ),
    videoCount: numberValue(
      record.videoCount ?? record.videos ?? record.contentCount ?? record.generatedVideos,
    ),
    memberCount: numberValue(record.memberCount ?? record.members ?? record.userCount),
    joinedAt: firstString(record.joinedAt, record.createdAt, record.startedAt),
  };
}

function normalizeAdminHealthService(raw: unknown): AdminHealthService {
  const record = objectValue(raw) || {};
  return {
    id: extractId(record, "service"),
    name: stringValue(record.name, stringValue(record.service, "未命名服务")),
    status: stringValue(record.status, "unknown"),
    message: firstString(record.message, record.detail, record.description),
    latencyMs:
      typeof record.latencyMs === "number" || typeof record.latency === "number"
        ? numberValue(record.latencyMs ?? record.latency)
        : undefined,
  };
}

function normalizeAdminHealthStatus(raw: unknown): AdminHealthStatus {
  const record = objectValue(raw) || {};
  const metrics = objectValue(record.metrics) || {};
  const queue = objectValue(record.queue) || {};
  const storage = objectValue(record.storage) || {};
  const services =
    Array.isArray(record.services)
      ? record.services.map((item) => normalizeAdminHealthService(item))
      : Array.isArray(record.checks)
        ? record.checks.map((item) => normalizeAdminHealthService(item))
        : [];

  return {
    overallStatus: stringValue(record.status, stringValue(record.overallStatus, "unknown")),
    availability: normalizePercentNumber(
      record.availability ??
        record.uptime ??
        record.uptimeRatio ??
        metrics.availability ??
        metrics.uptime,
    ),
    queueDepth: numberValue(record.queueDepth ?? metrics.queueDepth ?? queue.pending),
    storageUsage: normalizePercentNumber(
      record.storageUsage ?? metrics.storageUsage ?? storage.usage ?? storage.utilization,
    ),
    checkedAt: firstString(record.checkedAt, record.updatedAt, record.timestamp),
    services,
  };
}

function normalizeAuditLog(raw: unknown): AuditLogEntry {
  const record = objectValue(raw) || {};
  const actor =
    firstString(record.actorName, record.actor, record.userName, record.userEmail, record.userId) ||
    "系统";
  const action = stringValue(
    record.action,
    stringValue(record.event, stringValue(record.type, "unknown")),
  );

  return {
    id: extractId(record, "audit"),
    timestamp: firstString(record.timestamp, record.createdAt, record.occurredAt),
    level: stringValue(record.level, stringValue(record.severity, "info")).toUpperCase(),
    action,
    actor,
    description:
      firstString(
        record.description,
        record.message,
        record.summary,
        record.detail,
      ) || `${actor} 执行了 ${action}`,
    target: firstString(record.target, record.targetName, record.resource, record.resourceId),
  };
}

function normalizeCampaign(raw: unknown): CampaignRecord {
  const record = objectValue(raw) || {};
  const totalVideos = numberValue(record.totalVideos ?? record.videoCount ?? record.targetVideos);
  const completed = numberValue(
    record.completed ?? record.completedVideos ?? record.generatedVideos,
  );
  const progress = Math.max(
    0,
    Math.min(
      100,
      numberValue(
        record.progress,
        totalVideos > 0 ? (completed / totalVideos) * 100 : 0,
      ),
    ),
  );

  return {
    id: extractId(record, "campaign"),
    name: stringValue(
      record.name,
      stringValue(record.title, stringValue(record.campaignName, "未命名活动")),
    ),
    brand: stringValue(record.brandName, inferVideoBrand(record)),
    brandId: firstString(record.brandId, objectValue(record.brand)?.id),
    status: stringValue(record.status, stringValue(record.stage, "draft")),
    progress,
    totalVideos,
    completed,
    startDate: firstString(record.startDate, record.startedAt, record.createdAt),
    endDate: firstString(record.endDate, record.endedAt),
    platforms:
      arrayValue<string>(record.platforms).length > 0
        ? arrayValue<string>(record.platforms)
        : arrayValue<string>(record.channels),
    description: firstString(record.description, record.summary),
    objective: firstString(record.objective, record.goal),
    raw,
  };
}

function normalizeBillingInvoice(raw: unknown): BillingInvoiceRecord {
  const record = objectValue(raw) || {};
  return {
    id: extractId(record, "invoice"),
    number: stringValue(
      record.number,
      stringValue(record.invoiceNumber, stringValue(record.orderId, extractId(record, "invoice"))),
    ),
    status: stringValue(record.status, "pending"),
    amount: numberValue(record.amount ?? record.totalAmount),
    currency: stringValue(record.currency, "CNY"),
    issuedAt: firstString(record.issuedAt, record.createdAt),
    paidAt: firstString(record.paidAt),
    dueAt: firstString(record.dueAt, record.expiredAt),
    downloadUrl: firstString(record.downloadUrl, record.invoiceUrl, record.pdfUrl),
  };
}

function normalizeBrandList(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeBrand(item));
  }

  if (isRecord(payload) && Array.isArray(payload.items)) {
    return payload.items.map((item) => normalizeBrand(item));
  }

  if (isRecord(payload) && (payload.id || payload._id)) {
    return [normalizeBrand(payload)];
  }

  return [] as Brand[];
}

function normalizeUsageTotals(raw: unknown): UsageTotals {
  const record = objectValue(raw) || {};
  const recordCount = numberValue(record.recordCount ?? record.records ?? record.total);
  return {
    recordCount,
    videosGenerated: numberValue(record.videosGenerated ?? record.videoCount ?? recordCount),
    creditsConsumed: numberValue(record.creditsConsumed ?? record.usedCredits),
    inputTokens: numberValue(record.inputTokens),
    outputTokens: numberValue(record.outputTokens),
    totalTokens: numberValue(record.totalTokens),
    tokenCost: numberValue(record.tokenCost),
    estimatedCost: numberValue(record.estimatedCost ?? record.tokenCost),
    refundedCredits: numberValue(record.refundedCredits),
  };
}

function normalizeUsageBreakdown(raw: unknown, type?: string): UsageBreakdownItem {
  const record = objectValue(raw) || {};
  return {
    id: extractId(record, type || "usage"),
    name: stringValue(record.name, stringValue(record.brandName, stringValue(record.type, "未命名"))),
    type: stringOrUndefined(record.type) || type,
    creditsConsumed: numberValue(record.creditsConsumed),
    inputTokens: numberValue(record.inputTokens),
    outputTokens: numberValue(record.outputTokens),
    totalTokens: numberValue(record.totalTokens),
    tokenCost: numberValue(record.tokenCost),
    recordCount: numberValue(record.recordCount ?? record.count),
  };
}

function normalizeUsageSummary(raw: unknown): UsageSummary {
  const record = objectValue(raw) || {};
  const period = objectValue(record.period) || {};

  return {
    totals: normalizeUsageTotals(record.totals),
    byType: arrayValue(record.byType).map((item) => normalizeUsageBreakdown(item, "type")),
    byBrand: arrayValue(record.byBrand).map((item) => normalizeUsageBreakdown(item, "brand")),
    period: {
      startAt: stringOrUndefined(period.startAt) || stringOrUndefined(period.startDate),
      endAt: stringOrUndefined(period.endAt) || stringOrUndefined(period.endDate),
      granularity: stringOrUndefined(period.granularity),
    },
  };
}

function normalizeUsageTimeline(raw: unknown): UsageTimeline {
  const record = objectValue(raw) || {};

  return {
    granularity: stringValue(record.granularity, "daily"),
    points: arrayValue(record.points).map((item) => {
      const point = objectValue(item) || {};
      return {
        periodStart: stringValue(point.periodStart),
        creditsConsumed: numberValue(point.creditsConsumed),
        inputTokens: numberValue(point.inputTokens),
        outputTokens: numberValue(point.outputTokens),
        totalTokens: numberValue(point.totalTokens),
        tokenCost: numberValue(point.tokenCost),
        recordCount: numberValue(point.recordCount),
      };
    }),
  };
}

function inferUsageVideoTitle(record: AnyRecord) {
  const metadata = objectValue(record.metadata) || {};
  return (
    stringOrUndefined(metadata.title) ||
    stringOrUndefined(metadata.videoTitle) ||
    stringOrUndefined(record.videoTitle) ||
    fileNameFromUrl(record.outputVideoUrl) ||
    fileNameFromUrl(record.sourceVideoUrl) ||
    stringOrUndefined(record.videoTaskId) ||
    "未命名视频"
  );
}

function normalizeUsageDetailItem(raw: unknown): UsageDetailItem {
  const record = objectValue(raw) || {};
  const tokenUsage = objectValue(record.tokenUsage) || {};
  const metadata = objectValue(record.metadata);

  return {
    id: extractId(record, "usage"),
    videoTaskId: stringOrUndefined(record.videoTaskId) || stringOrUndefined(record.taskId),
    videoTitle: inferUsageVideoTitle(record),
    type: stringValue(record.type, "unknown"),
    creditsConsumed: numberValue(record.creditsConsumed),
    inputTokens: numberValue(tokenUsage.inputTokens),
    outputTokens: numberValue(tokenUsage.outputTokens),
    totalTokens: numberValue(tokenUsage.totalTokens),
    tokenCost: numberValue(tokenUsage.cost),
    model: stringOrUndefined(tokenUsage.model),
    brandId: stringOrUndefined(record.brandId),
    brandName: stringOrUndefined(record.brandName),
    refunded: booleanValue(record.refunded),
    refundedAt: stringOrUndefined(record.refundedAt),
    metadata,
    createdAt: stringOrUndefined(record.createdAt),
  };
}

function normalizePaginated<T>(
  payload: unknown,
  mapper: (item: unknown) => T,
): PaginatedResponse<T> {
  if (Array.isArray(payload)) {
    return {
      items: payload.map((item) => mapper(item)),
      total: payload.length,
      page: 1,
      limit: payload.length || 10,
    };
  }

  const record = objectValue(payload) || {};
  const pagination = objectValue(record.pagination) || {};
  const rawItems = Array.isArray(record.items)
    ? record.items
    : Array.isArray(record.tasks)
      ? record.tasks
      : Array.isArray(record.orders)
        ? record.orders
        : Array.isArray(record.records)
          ? record.records
          : [];
  const items = rawItems.map((item) => mapper(item));

  return {
    items,
    total: numberValue(record.total ?? pagination.total, items.length),
    page: numberValue(record.page ?? pagination.page, 1),
    limit: numberValue(record.limit ?? pagination.limit, items.length || 10),
  };
}

function normalizeCreditSummary(raw: unknown): CreditSummary {
  const record = objectValue(raw) || {};
  return {
    remaining: numberValue(record.remaining ?? record.balance),
    used: numberValue(record.used),
    total: numberValue(record.total),
  };
}

function normalizeAccountPack(raw: unknown): AccountPack {
  const record = objectValue(raw) || {};
  return {
    id: extractId(record, "pack"),
    packType: stringValue(record.packType, stringValue(record.productType, "unknown")),
    status: stringValue(record.status, "unknown"),
    totalCredits: numberValue(record.totalCredits),
    remainingCredits: numberValue(record.remainingCredits),
    usedCredits: numberValue(record.usedCredits),
    purchasedAt: stringOrUndefined(record.purchasedAt),
    expiresAt: stringOrUndefined(record.expiresAt),
    expired: booleanValue(record.expired),
    paymentOrderId: stringOrUndefined(record.paymentOrderId),
  };
}

function normalizeAccountSnapshot(raw: unknown): AccountSnapshot {
  const record = objectValue(raw) || {};

  return {
    credits: normalizeCreditSummary(record.credits),
    packs: arrayValue(record.packs).map((item) => normalizeAccountPack(item)),
    currentPeriod: normalizeUsageTotals(record.currentPeriod),
  };
}

function normalizePaymentProduct(raw: unknown): PaymentProduct {
  const record = objectValue(raw) || {};
  const unitAmount = numberValue(record.unitAmount);
  const directPrice = numberValue(record.price);
  return {
    id: extractId(record, "product"),
    name: stringValue(record.name, "视频包"),
    description: stringValue(record.description),
    productType: stringValue(record.productType, stringValue(record.packType, "credit_pack")),
    currency: stringValue(record.currency, "CNY"),
    unitAmount,
    price: directPrice || (unitAmount > 0 ? unitAmount / 100 : 0),
    unitCredits: numberValue(record.unitCredits ?? record.credits),
    packType: stringValue(record.packType, stringValue(record.productType, "unknown")),
  };
}

function normalizePaymentOrder(raw: unknown): PaymentOrder {
  const record = objectValue(raw) || {};
  const callbackData = objectValue(record.callbackData);
  return {
    id: extractId(record, "order"),
    orderId: stringValue(record.orderId, extractId(record, "order")),
    orgId: stringOrUndefined(record.orgId),
    userId: stringOrUndefined(record.userId),
    amount: numberValue(record.amount),
    currency: stringValue(record.currency, "CNY"),
    paymentMethod: stringValue(record.paymentMethod, "wechat_native"),
    status: stringValue(record.status, "pending"),
    productType: stringOrUndefined(record.productType),
    productId: stringOrUndefined(record.productId),
    quantity: numberValue(record.quantity, 1),
    payUrl: stringOrUndefined(record.payUrl) || stringOrUndefined(callbackData?.payUrl),
    paidAt: stringOrUndefined(record.paidAt),
    expiredAt: stringOrUndefined(record.expiredAt),
    callbackData,
    createdAt: stringOrUndefined(record.createdAt),
    updatedAt: stringOrUndefined(record.updatedAt),
  };
}

function inferProgress(status: VideoLifecycleStatus, value: unknown) {
  const numeric = numberValue(value, -1);
  if (numeric >= 0) {
    return Math.max(0, Math.min(100, numeric));
  }

  switch (status) {
    case "completed":
    case "published":
    case "approved":
      return 100;
    case "failed":
    case "cancelled":
    case "expired":
      return 0;
    case "queued":
      return 10;
    case "processing":
      return 55;
    case "pending_review":
      return 85;
    default:
      return 0;
  }
}

function inferVideoTitle(record: AnyRecord) {
  const copy = objectValue(record.copy) || {};
  const metadata = objectValue(record.metadata) || {};
  return (
    stringOrUndefined(record.title) ||
    stringOrUndefined(copy.title) ||
    stringOrUndefined(metadata.title) ||
    stringOrUndefined(metadata.videoTitle) ||
    fileNameFromUrl(record.outputVideoUrl) ||
    fileNameFromUrl(record.sourceVideoUrl) ||
    stringOrUndefined(record.taskId) ||
    "未命名视频"
  );
}

function inferVideoBrand(record: AnyRecord) {
  const brand = objectValue(record.brand) || {};
  return (
    stringOrUndefined(record.brandName) ||
    stringOrUndefined(brand.name) ||
    stringOrUndefined(record.brandId) ||
    "未关联品牌"
  );
}

function normalizeContentItem(raw: unknown): ContentItem {
  const record = objectValue(raw) || {};
  const copy = objectValue(record.copy) || {};
  const approval = objectValue(record.approval) || null;
  const publishInfo = objectValue(record.publishInfo) || null;
  const metadata = objectValue(record.metadata);
  const lifecycleStatus = normalizeVideoStatus(
    stringOrUndefined(record.status) ||
      stringOrUndefined(record.publishStatus) ||
      stringOrUndefined(approval?.status),
  );
  const progress = inferProgress(
    lifecycleStatus,
    record.progress ?? metadata?.progress ?? publishInfo?.progress,
  );

  return {
    id: extractId(record, "video"),
    title: inferVideoTitle(record),
    brand: inferVideoBrand(record),
    brandId: stringOrUndefined(record.brandId),
    status: toLegacyVideoStatus(lifecycleStatus),
    lifecycleStatus,
    date:
      stringValue(
        record.completedAt,
        stringValue(record.updatedAt, stringValue(record.createdAt, "--")),
      ),
    credits: numberValue(
      record.creditsConsumed ?? metadata?.creditsConsumed ?? record.creditCost,
    ),
    progress,
    type: stringOrUndefined(record.taskType) || stringOrUndefined(record.type),
    taskType: stringOrUndefined(record.taskType),
    outputVideoUrl: stringOrUndefined(record.outputVideoUrl),
    sourceVideoUrl: stringOrUndefined(record.sourceVideoUrl),
    publishStatus: stringOrUndefined(record.publishStatus),
    approvalStatus: stringOrUndefined(approval?.status),
    createdAt: stringOrUndefined(record.createdAt),
    updatedAt: stringOrUndefined(record.updatedAt),
    completedAt: stringOrUndefined(record.completedAt),
    tokens: numberValue(metadata?.totalTokens ?? record.totalTokens),
    subtitle: stringOrUndefined(copy.subtitle),
    hashtags: arrayValue<string>(copy.hashtags),
    blueWords: arrayValue<string>(copy.blueWords),
    commentGuide: stringOrUndefined(copy.commentGuide),
    commentGuides: arrayValue<string>(copy.commentGuides),
    approval,
    publishInfo,
    metadata,
    raw,
  };
}

function normalizeTimelineEntry(raw: unknown): VideoTimelineEntry {
  const record = objectValue(raw) || {};
  const rawStatus = stringValue(record.rawStatus, stringValue(record.status, "unknown"));
  const status = normalizeVideoStatus(rawStatus);
  return {
    id: extractId(record, "timeline"),
    status,
    rawStatus,
    label: stringValue(record.message, rawStatus),
    timestamp: stringOrUndefined(record.timestamp) || stringOrUndefined(record.createdAt),
    message: stringOrUndefined(record.message),
    progress: inferProgress(status, record.progress),
  };
}

function normalizeVideoIteration(raw: unknown): VideoIteration {
  const base = normalizeTimelineEntry(raw);
  const record = objectValue(raw) || {};
  return {
    ...base,
    outputVideoUrl: stringOrUndefined(record.outputVideoUrl),
  };
}

function normalizeVideoDetail(raw: unknown, iterations: VideoIteration[] = []): VideoDetail {
  const content = normalizeContentItem(raw);
  const record = objectValue(raw) || {};
  const timelinePayload = objectValue(record.timeline);
  const timeline = Array.isArray(record.timeline)
    ? record.timeline.map((item) => normalizeTimelineEntry(item))
    : Array.isArray(timelinePayload?.items)
      ? timelinePayload.items.map((item) => normalizeTimelineEntry(item))
      : [];

  return {
    ...content,
    timeline,
    iterations,
  };
}

function normalizeTaskStatus(rawStatus: unknown): TaskStatus {
  const status = normalizeVideoStatus(rawStatus as string | undefined);
  switch (status) {
    case "failed":
    case "cancelled":
    case "expired":
      return "failed";
    case "completed":
    case "published":
    case "approved":
      return "completed";
    case "queued":
    case "draft":
      return "queued";
    default:
      return "processing";
  }
}

function normalizeProductionTask(raw: unknown): ProductionTask {
  const record = objectValue(raw) || {};
  const rawStatus = stringValue(record.rawStatus, stringValue(record.status, "queued"));
  const status = normalizeTaskStatus(rawStatus);
  const metadata = objectValue(record.metadata) || {};

  return {
    id: extractId(record, "task"),
    title: inferVideoTitle(record),
    status,
    progress: inferProgress(normalizeVideoStatus(rawStatus), record.progress ?? metadata.progress),
    createdAt: stringValue(record.createdAt, "--"),
    brandName: inferVideoBrand(record),
    error: stringOrUndefined(record.error) || stringOrUndefined(metadata.error),
    rawStatus,
  };
}

function normalizeAnalyticsOverview(raw: unknown): AnalyticsOverview {
  const record = objectValue(raw) || {};
  const summary = objectValue(record.summary) || {};
  const performance = objectValue(summary.performance) || objectValue(record.performance) || {};
  return {
    totalVideos: numberValue(record.totalVideos ?? summary.totalVideos),
    creditsUsed: numberValue(record.creditsUsed ?? summary.creditsUsed),
    successRate: normalizePercentNumber(record.successRate ?? summary.successRate),
    avgProductionTimeMs: numberValue(record.avgProductionTimeMs ?? summary.avgProductionTimeMs),
    avgProductionTimeMinutes: numberValue(
      record.avgProductionTimeMinutes ?? summary.avgProductionTimeMinutes,
    ),
    performance: {
      views: numberValue(
        performance.views ?? objectValue(record.last30Days)?.totalViews ?? objectValue(record.requestedWindow)?.totalViews,
      ),
      likes: numberValue(
        performance.likes ?? objectValue(record.last30Days)?.totalLikes ?? objectValue(record.requestedWindow)?.totalLikes,
      ),
      comments: numberValue(
        performance.comments ?? objectValue(record.last30Days)?.totalComments ?? objectValue(record.requestedWindow)?.totalComments,
      ),
    },
    topVideos: arrayValue(record.topVideos).map((item) => normalizeAnalyticsTopVideo(item)),
  };
}

function normalizeDataOverview(raw: unknown): DataOverview {
  const record = objectValue(raw) || {};
  const summary = objectValue(record.summary) || {};
  return {
    orgId: stringValue(record.orgId, ""),
    source: stringValue(record.source, "unknown"),
    dashboardTier: stringOrUndefined(record.dashboardTier),
    windowDays: numberValue(record.windowDays, 30),
    summary: {
      totalVideos: numberValue(summary.totalVideos),
      completedVideos: numberValue(summary.completedVideos),
      successRate: normalizePercentNumber(summary.successRate),
      totalViews: numberValue(summary.totalViews),
      averageViewsPerVideo: numberValue(summary.averageViewsPerVideo),
      engagementRate: normalizePercentNumber(summary.engagementRate),
      publishingConsistency: normalizePercentNumber(summary.publishingConsistency),
      trackedVideos: numberValue(summary.trackedVideos),
    },
    activity: arrayValue(record.activity).map((item) => {
      const point = objectValue(item) || {};
      return {
        date: stringValue(point.date),
        totalVideos: numberValue(point.totalVideos),
        completedVideos: numberValue(point.completedVideos),
        totalViews: numberValue(point.totalViews),
      };
    }),
    recentVideos: arrayValue(record.recentVideos).map((item) => normalizeContentItem(item)),
  };
}

function normalizeAnalyticsTrendPoint(raw: unknown): AnalyticsTrendPoint {
  const record = objectValue(raw) || {};
  return {
    periodStart: stringValue(record.periodStart),
    totalVideos: numberValue(record.totalVideos),
    completedVideos: numberValue(record.completedVideos),
    creditsUsed: numberValue(record.creditsUsed),
    views: numberValue(record.views),
    likes: numberValue(record.likes),
    comments: numberValue(record.comments),
    successRate: normalizePercentNumber(record.successRate),
  };
}

function normalizeAnalyticsTopVideo(raw: unknown): AnalyticsTopVideo {
  const record = objectValue(raw) || {};
  return {
    id: extractId(record, "top_video"),
    taskId: stringValue(record.taskId, extractId(record, "top_video")),
    brandId: stringOrUndefined(record.brandId),
    brandName: stringValue(record.brandName, stringValue(record.brandId, "未关联品牌")),
    title:
      stringOrUndefined(record.title) ||
      fileNameFromUrl(record.outputVideoUrl) ||
      stringValue(record.taskId, "未命名视频"),
    outputVideoUrl: stringOrUndefined(record.outputVideoUrl),
    views: numberValue(record.views),
    likes: numberValue(record.likes),
    comments: numberValue(record.comments),
    engagementScore: numberValue(record.engagementScore),
    completedAt: stringOrUndefined(record.completedAt),
  };
}

function normalizeApiKey(raw: unknown): ApiKeyRecord {
  const record = objectValue(raw) || {};
  const prefix = stringValue(record.prefix);
  const secret = stringOrUndefined(record.key);
  const maskedKey = secret || (prefix ? `${prefix}${"*".repeat(24)}` : "");

  return {
    id: extractId(record, "apikey"),
    name: stringValue(record.name, "未命名 Key"),
    prefix,
    maskedKey,
    permissions: arrayValue<string>(record.permissions),
    lastUsedAt: stringOrUndefined(record.lastUsedAt),
    expiresAt: stringOrUndefined(record.expiresAt),
    isActive: booleanValue(record.isActive, true),
    createdAt: stringOrUndefined(record.createdAt),
    secret,
  };
}

function normalizeWebhook(raw: unknown): WebhookRecord {
  const record = objectValue(raw) || {};
  return {
    id: extractId(record, "webhook"),
    name: stringValue(record.name, "未命名 Webhook"),
    url: stringValue(record.url),
    hasSecret: booleanValue(record.hasSecret),
    secretPreview: stringOrUndefined(record.secretPreview),
    events: arrayValue<string>(record.events),
    isActive: booleanValue(record.isActive, true),
    lastTriggeredAt: stringOrUndefined(record.lastTriggeredAt),
    failCount: numberValue(record.failCount),
    createdAt: stringOrUndefined(record.createdAt),
    updatedAt: stringOrUndefined(record.updatedAt),
  };
}

function normalizeNotification(raw: unknown): NotificationChannel {
  const record = objectValue(raw) || {};
  const channel = stringValue(record.channel, "system");
  return {
    id: extractId(record, "notification"),
    channel,
    name: stringValue(record.name, channel.toUpperCase()),
    events: arrayValue<string>(record.events),
    config: objectValue(record.config) || {},
    isActive: booleanValue(record.isActive, true),
    createdAt: stringOrUndefined(record.createdAt),
    updatedAt: stringOrUndefined(record.updatedAt),
  };
}

function normalizeNotificationList(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeNotification(item));
  }

  const record = objectValue(payload) || {};
  if (Array.isArray(record.items)) {
    return record.items.map((item) => normalizeNotification(item));
  }

  if (Array.isArray(record.channels)) {
    return record.channels.map((item) => normalizeNotification(item));
  }

  if (record.id) {
    return [normalizeNotification(record)];
  }

  return [] as NotificationChannel[];
}

function buildBrandPayload(data: Record<string, unknown>) {
  const name = stringOrUndefined(data.name);
  const industry = stringOrUndefined(data.industry) || stringOrUndefined(data.category);
  const payload = compactObject({
    name,
    industry,
    logoUrl: stringOrUndefined(data.logoUrl),
    videoStyle: stringOrUndefined(data.videoStyle),
    visualIdentity: objectValue(data.visualIdentity),
  });

  return payload;
}

function buildVideoCreatePayload(data: Record<string, unknown>) {
  const explicitTaskType = stringOrUndefined(data.taskType);
  const taskType = inferTaskType(explicitTaskType || data.mode || objectValue(data.source)?.type);
  const sourceVideoUrl =
    stringOrUndefined(data.sourceVideoUrl) ||
    stringOrUndefined(data.videoUrl) ||
    stringOrUndefined(objectValue(data.source)?.url);
  const source = objectValue(data.source);
  const { metadata: rawMetadata, ...rest } = data;
  const metadata = compactObject({
    ...(objectValue(rawMetadata) || {}),
    title: stringOrUndefined(data.title),
    prompt: stringOrUndefined(data.prompt),
    templateId: stringOrUndefined(data.templateId),
    referenceId: stringOrUndefined(data.referenceId),
    sourceContentId: stringOrUndefined(data.contentId),
    extra: compactObject(rest),
  });

  const payload = compactObject({
    brandId: stringOrUndefined(data.brandId),
    pipelineId: stringOrUndefined(data.pipelineId),
    taskType,
    sourceVideoUrl,
    source:
      source && Object.keys(source).length > 0
        ? compactObject({
            type: stringOrUndefined(source.type) || stringOrUndefined(data.mode),
            url: stringOrUndefined(source.url) || sourceVideoUrl,
            videoId: stringOrUndefined(source.videoId) || stringOrUndefined(data.videoId),
          })
        : sourceVideoUrl
          ? compactObject({
              type: stringOrUndefined(data.mode),
              url: sourceVideoUrl,
              videoId: stringOrUndefined(data.videoId),
            })
          : undefined,
    metadata,
  });

  return payload;
}

const contentApi = {
  list: async (params?: Record<string, unknown>) => {
    const page = await contentApi.listPage(params);
    return toResult(page.data.items.map((item) => ({ ...item })));
  },
  listPage: async (params?: Record<string, unknown>) => {
    const raw = await requestWithFallbackData<unknown>(
      [
        { url: "/v1/content", params },
        { url: "/v1/videos", params },
      ],
    );
    return toResult(normalizePaginated(raw, (item) => normalizeContentItem(item)));
  },
  get: async (id: string) => {
    const raw = await requestWithFallbackData<unknown>([
      { url: `/v1/content/${id}` },
      { url: `/v1/videos/${id}` },
      { url: `/v1/tasks/${id}` },
    ]);
    return toResult(normalizeVideoDetail(raw));
  },
  approve: async (id: string) => request({ url: `/v1/content/${id}/approve`, method: "POST" }),
  reject: async (id: string, data: { comment: string }) =>
    request({
      url: `/v1/content/${id}/review`,
      method: "POST",
      data: {
        action: "reject",
        comment: data.comment,
      },
    }),
  markPublished: async (id: string, data: Record<string, unknown>) =>
    request({ url: `/v1/content/${id}/published`, method: "POST", data }),
};

const analyticsApi = {
  overview: async () => {
    const raw = await requestData<unknown>({ url: "/v1/analytics/overview" });
    return toResult(normalizeAnalyticsOverview(raw));
  },
  trends: async (params?: { period?: AnalyticsPeriod; timeframe?: string }) => {
    const period = params?.period || normalizeAnalyticsPeriod(params?.timeframe);
    const raw = await requestData<unknown>({
      url: "/v1/analytics/trends",
      params: period ? { period } : undefined,
    });
    const points = Array.isArray(raw)
      ? raw.map((item) => normalizeAnalyticsTrendPoint(item))
      : arrayValue(objectValue(raw)?.items).map((item) => normalizeAnalyticsTrendPoint(item));
    return toResult(points);
  },
  top: async (params?: { limit?: number }) => {
    const raw = await requestData<unknown>({
      url: "/v1/analytics/top",
      params,
    });
    const items = Array.isArray(raw)
      ? raw.map((item) => normalizeAnalyticsTopVideo(item))
      : arrayValue(objectValue(raw)?.items).map((item) => normalizeAnalyticsTopVideo(item));
    return toResult(items);
  },
  benchmark: async () => {
    try {
      const raw = await requestData<unknown>(
        { url: "/v1/analytics/benchmark" },
        { suppressErrorToast: true },
      );
      return toResult(objectValue(raw) || null);
    } catch (error) {
      if (shouldTryFallback(error, new Set([404, 405]))) {
        return toResult(null);
      }
      throw error;
    }
  },
  videoDetail: async (id: string) => {
    const raw = await requestWithFallbackData<unknown>([
      { url: `/v1/analytics/video/${id}` },
      { url: `/v1/videos/${id}` },
      { url: `/v1/content/${id}` },
    ]);
    return toResult(normalizeVideoDetail(raw));
  },
};

const dataApi = {
  overview: async () => {
    const raw = await requestData<unknown>({ url: "/v1/data/overview" });
    return toResult(normalizeDataOverview(raw));
  },
};

const brandsApi = {
  list: async () => {
    const raw = await requestWithFallbackData<unknown>([
      { url: "/v1/brand/list" },
      { url: "/v1/brands" },
      { url: "/v1/brand" },
    ]);
    return toResult(normalizeBrandList(raw));
  },
  get: async (id?: string) => {
    if (!id) {
      return brandsApi.list();
    }

    const raw = await requestWithFallbackData<unknown>([
      { url: `/v1/brands/${id}` },
      { url: `/v1/brand/${id}` },
    ]);
    return toResult(normalizeBrand(raw));
  },
  create: async (data: Record<string, unknown>) => {
    const payload = buildBrandPayload(data);
    const raw = await requestWithFallbackData<unknown>([
      { url: "/v1/brand/create", method: "POST", data: payload },
      { url: "/v1/brands", method: "POST", data: payload },
      { url: "/v1/brand", method: "POST", data: payload },
    ]);
    return toResult(normalizeBrand(raw));
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const payload = buildBrandPayload(data);
    const raw = await requestWithFallbackData<unknown>([
      { url: `/v1/brand/${id}`, method: "PATCH", data: payload },
      { url: `/v1/brands/${id}`, method: "PATCH", data: payload },
    ]);
    return toResult(normalizeBrand(raw));
  },
  remove: async (id: string) =>
    requestWithFallback([
      { url: `/v1/brands/${id}`, method: "DELETE" },
      { url: `/v1/brand/${id}`, method: "DELETE" },
    ]),
  uploadAsset: async (id: string, file: File, assetType = "logo") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("brandId", id);
    formData.append("assetType", assetType);

    return requestWithFallback([
      {
        url: "/v1/asset/upload",
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      },
      {
        url: `/v1/brands/${id}/assets`,
        method: "PATCH",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      },
      {
        url: `/v1/brand/${id}/assets`,
        method: "PATCH",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      },
    ]);
  },
};
const accountApi = {
  get: async () => {
    const raw = await requestData<unknown>({ url: "/v1/account" });
    return toResult(normalizeAccountSnapshot(raw));
  },
  info: async () => {
    const raw = await requestWithFallbackData<unknown>([
      { url: "/v1/account/info" },
      { url: "/v1/account/profile" },
      { url: "/v1/account" },
    ]);
    return toResult(normalizeUser(raw));
  },
  usage: async () => {
    const raw = await requestData<unknown>({ url: "/v1/account/usage" });
    return toResult(normalizeUsageSummary(raw));
  },
  usageTimeline: async (params?: Record<string, unknown>) => {
    const raw = await requestData<unknown>({
      url: "/v1/account/usage/timeline",
      params,
    });
    return toResult(normalizeUsageTimeline(raw));
  },
  usageDetail: async (params?: Record<string, unknown>) => {
    const raw = await requestData<unknown>({
      url: "/v1/account/usage/detail",
      params,
    });
    return toResult(normalizePaginated(raw, (item) => normalizeUsageDetailItem(item)));
  },
  updateProfile: async (data: Record<string, unknown>) => {
    const raw = await requestData<unknown>({
      url: "/v1/account/profile",
      method: "PATCH",
      data,
    });
    return toResult(normalizeUser(raw));
  },
};

const paymentApi = {
  products: async () => {
    const raw = await requestData<unknown>({ url: "/v1/payment/products" });
    const items = Array.isArray(raw)
      ? raw.map((item) => normalizePaymentProduct(item))
      : arrayValue(objectValue(raw)?.items).map((item) => normalizePaymentProduct(item));
    return toResult(items);
  },
  create: async (data: Record<string, unknown>) => {
    const payload = compactObject({
      productId: stringOrUndefined(data.productId),
      paymentMethod: stringOrUndefined(data.paymentMethod) || "wechat_native",
      quantity: numberValue(data.quantity, 1),
      productType: stringOrUndefined(data.productType),
      openId: stringOrUndefined(data.openId),
      clientIp: stringOrUndefined(data.clientIp),
    });
    const raw = await requestData<unknown>({
      url: "/v1/payment/create",
      method: "POST",
      data: payload,
    });
    return toResult(normalizePaymentOrder(raw));
  },
  status: async (orderId: string) => {
    const raw = await requestData<unknown>({ url: `/v1/payment/status/${orderId}` });
    return toResult(normalizePaymentOrder(raw));
  },
  orders: async (params?: Record<string, unknown>) => {
    const raw = await requestData<unknown>({
      url: "/v1/payment/orders",
      params,
    });
    return toResult(normalizePaginated(raw, (item) => normalizePaymentOrder(item)));
  },
};

const videosApi = {
  list: async (params?: Record<string, unknown>) => {
    const raw = await requestWithFallbackData<unknown>([
      { url: "/v1/videos", params },
      { url: "/v1/video", params },
    ]);
    return toResult(normalizePaginated(raw, (item) => normalizeContentItem(item)));
  },
  get: async (id: string) => {
    const detailRaw = await requestWithFallbackData<unknown>([
      { url: `/v1/videos/${id}` },
      { url: `/v1/content/${id}` },
      { url: `/v1/tasks/${id}` },
    ]);

    let iterations: VideoIteration[] = [];
    try {
      const iterationResponse = await videosApi.iterations(id);
      iterations = iterationResponse.data;
    } catch {
      iterations = [];
    }

    return toResult(normalizeVideoDetail(detailRaw, iterations));
  },
  create: async (data: Record<string, unknown>) => {
    const payload = buildVideoCreatePayload(data);
    const raw = await requestWithFallbackData<unknown>([
      { url: "/v1/videos", method: "POST", data: payload },
      { url: "/v1/video", method: "POST", data: payload },
      { url: "/v1/tasks", method: "POST", data: payload },
    ]);
    return toResult(normalizeVideoDetail(raw));
  },
  iterations: async (id: string) => {
    const raw = await requestWithFallbackData<unknown>([
      { url: `/v1/videos/${id}/iterations` },
      { url: `/v1/tasks/timeline/${id}` },
    ]);

    if (Array.isArray(raw)) {
      return toResult(raw.map((item) => normalizeVideoIteration(item)));
    }

    const record = objectValue(raw) || {};
    if (Array.isArray(record.timeline)) {
      return toResult(record.timeline.map((item) => normalizeVideoIteration(item)));
    }

    if (Array.isArray(record.items)) {
      return toResult(record.items.map((item) => normalizeVideoIteration(item)));
    }

    return toResult([] as VideoIteration[]);
  },
};

const tasksApi = {
  create: async (data: Record<string, unknown>) => videosApi.create(data),
  get: async (id: string) => videosApi.get(id),
  list: async (params?: Record<string, unknown>) => {
    const raw = await requestWithFallbackData<unknown>([
      { url: "/v1/tasks", params },
      { url: "/v1/video", params },
      { url: "/v1/videos", params },
    ]);
    return toResult(normalizePaginated(raw, (item) => normalizeProductionTask(item)).items);
  },
  timeline: async (id: string) => videosApi.iterations(id),
};

const calendarApi = {
  scheduled: async (params?: { month?: string; status?: string }) => {
    const query = compactObject({
      month: params?.month,
      status: params?.status || "scheduled",
    });
    const raw = await requestWithFallbackData<unknown>([
      { url: "/v1/task-mgmt/tasks", params: query },
      { url: "/v1/tasks", params: query },
      { url: "/v1/videos", params: query },
    ]);
    return toResult(normalizePaginated(raw, (item) => normalizeCalendarTask(item)).items);
  },
};

const adminApi = {
  clients: async () => {
    const raw = await requestWithFallbackData<unknown>([
      { url: "/v1/client-mgmt/clients" },
      { url: "/v1/org/clients" },
    ]);
    return toResult(normalizePaginated(raw, (item) => normalizeAdminClient(item)).items);
  },
  health: async () => {
    const raw = await requestWithFallbackData<unknown>([
      { url: "/v1/health/status" },
      { url: "/v1/health" },
    ]);
    return toResult(normalizeAdminHealthStatus(raw));
  },
  auditLogs: async (params?: { page?: number; limit?: number }) => {
    const raw = await requestWithFallbackData<unknown>([
      { url: "/v1/audit/logs", params },
      { url: "/v1/audit", params },
    ]);
    return toResult(normalizePaginated(raw, (item) => normalizeAuditLog(item)));
  },
  members: async () => {
    const raw = await requestWithFallbackData<unknown>([
      { url: "/v1/org/members" },
      { url: "/v1/users" },
    ]);
    return toResult(normalizePaginated(raw, (item) => normalizeUser(item)).items);
  },
};

const billingApi = {
  balance: async () => accountApi.get(),
  orders: async (params?: Record<string, unknown>) => paymentApi.orders(params),
  usageSummary: async (params?: Record<string, unknown>) => {
    const raw = await requestData<unknown>({
      url: "/v1/billing/usage-summary",
      params,
    });
    return toResult(normalizeUsageSummary(raw));
  },
  invoices: async (params?: Record<string, unknown>) => {
    const raw = await requestWithFallbackData<unknown>([
      { url: "/v1/billing/invoices", params },
      { url: "/v1/payment/invoices", params },
    ]);
    return toResult(normalizePaginated(raw, (item) => normalizeBillingInvoice(item)));
  },
};
const settingsApi = {
  apiKeys: {
    list: async () => {
      const raw = await requestWithFallbackData<unknown>([
        { url: "/v1/settings/api-keys" },
        { url: "/v1/apikey" },
      ]);
      const items = Array.isArray(raw)
        ? raw.map((item) => normalizeApiKey(item))
        : arrayValue(objectValue(raw)?.items).map((item) => normalizeApiKey(item));
      return toResult(items);
    },
    add: async (data: Record<string, unknown>) => {
      const payload = compactObject({
        name: stringOrUndefined(data.name),
        permissions: Array.isArray(data.permissions) ? data.permissions : undefined,
        expiresAt: stringOrUndefined(data.expiresAt),
      });
      const raw = await requestWithFallbackData<unknown>([
        { url: "/v1/settings/api-keys", method: "POST", data: payload },
        { url: "/v1/apikey", method: "POST", data: payload },
      ]);
      return toResult(normalizeApiKey(raw));
    },
    remove: async (id: string) =>
      requestWithFallback([
        { url: `/v1/settings/api-keys/${id}`, method: "DELETE" },
        { url: `/v1/apikey/${id}`, method: "DELETE" },
      ]),
    validate: async (data: Record<string, unknown>) => {
      try {
        const raw = await requestWithFallbackData<unknown>(
          [{ url: "/v1/settings/api-keys/validate", method: "POST", data }],
          { suppressErrorToast: true },
        );
        const record = objectValue(raw) || {};
        return toResult({
          valid: booleanValue(record.valid, true),
          message: stringOrUndefined(record.message),
        });
      } catch (error) {
        if (shouldTryFallback(error, new Set([404, 405]))) {
          return toResult({
            valid: Boolean(stringOrUndefined(data.key) || stringOrUndefined(data.prefix)),
            message: undefined,
          });
        }
        throw error;
      }
    },
  },
  webhooks: {
    list: async () => {
      const raw = await requestWithFallbackData<unknown>([
        { url: "/v1/settings/webhooks" },
        { url: "/v1/webhook" },
      ]);
      const items = Array.isArray(raw)
        ? raw.map((item) => normalizeWebhook(item))
        : arrayValue(objectValue(raw)?.items).map((item) => normalizeWebhook(item));
      return toResult(items);
    },
    add: async (data: Record<string, unknown>) => {
      const payload = compactObject({
        name: stringOrUndefined(data.name),
        url: stringOrUndefined(data.url),
        secret: stringOrUndefined(data.secret),
        events: Array.isArray(data.events) ? data.events : undefined,
        isActive: typeof data.isActive === "boolean" ? data.isActive : undefined,
      });
      const raw = await requestWithFallbackData<unknown>([
        { url: "/v1/settings/webhooks", method: "POST", data: payload },
        { url: "/v1/webhook", method: "POST", data: payload },
      ]);
      return toResult(normalizeWebhook(raw));
    },
    update: async (id: string, data: Record<string, unknown>) => {
      const payload = compactObject({
        name: stringOrUndefined(data.name),
        url: stringOrUndefined(data.url),
        secret: stringOrUndefined(data.secret),
        events: Array.isArray(data.events) ? data.events : undefined,
        isActive: typeof data.isActive === "boolean" ? data.isActive : undefined,
      });
      const raw = await requestWithFallbackData<unknown>([
        { url: `/v1/settings/webhooks/${id}`, method: "PUT", data: payload },
        { url: `/v1/webhook/${id}`, method: "PATCH", data: payload },
      ]);
      return toResult(normalizeWebhook(raw));
    },
    remove: async (id: string) =>
      requestWithFallback([
        { url: `/v1/settings/webhooks/${id}`, method: "DELETE" },
        { url: `/v1/webhook/${id}`, method: "DELETE" },
      ]),
  },
  notifications: {
    get: async () => {
      const raw = await requestWithFallbackData<unknown>([
        { url: "/v1/settings/notifications" },
        { url: "/v1/notifications" },
      ]);
      return toResult(normalizeNotificationList(raw));
    },
    update: async (data: Record<string, unknown>) => {
      const id = stringOrUndefined(data.id);
      const payload = compactObject({
        channel: stringOrUndefined(data.channel),
        name: stringOrUndefined(data.name),
        events: Array.isArray(data.events) ? data.events : undefined,
        config: objectValue(data.config),
        isActive: typeof data.isActive === "boolean" ? data.isActive : undefined,
      });
      const raw = await requestWithFallbackData<unknown>([
        { url: "/v1/settings/notifications", method: "PUT", data: { id, ...payload } },
        id
          ? { url: `/v1/notifications/${id}`, method: "PATCH", data: payload }
          : { url: "/v1/notifications", method: "POST", data: payload },
      ]);
      return toResult(normalizeNotification(raw));
    },
    remove: async (id: string) =>
      requestWithFallback([
        { url: `/v1/settings/notifications/${id}`, method: "DELETE" },
        { url: `/v1/notifications/${id}`, method: "DELETE" },
      ]),
    test: async (id: string) =>
      requestWithFallback([
        { url: `/v1/settings/notifications/${id}/test`, method: "POST" },
        { url: `/v1/notifications/${id}/test`, method: "POST" },
      ]),
  },
};

const platformAccountsApi = {
  list: () => request({ url: "/v1/platform-accounts" }),
  get: (id: string) => request({ url: `/v1/platform-accounts/${id}` }),
  create: (data: Record<string, unknown>) =>
    request({ url: "/v1/platform-accounts", method: "POST", data }),
  sync: (id: string) => request({ url: `/v1/platform-accounts/${id}/sync`, method: "POST" }),
  history: (id: string, params?: Record<string, unknown>) =>
    request({ url: `/v1/platform-accounts/${id}/history`, params }),
  remove: (id: string) => request({ url: `/v1/platform-accounts/${id}`, method: "DELETE" }),
};

const campaignsApi = {
  list: async () => {
    const raw = await requestWithFallbackData<unknown>([
      { url: "/v1/campaign/list" },
      { url: "/v1/campaign" },
      { url: "/v1/campaigns" },
    ]);
    return toResult(normalizePaginated(raw, (item) => normalizeCampaign(item)).items);
  },
  get: async (id: string) => {
    const raw = await requestWithFallbackData<unknown>([
      { url: `/v1/campaign/${id}` },
      { url: `/v1/campaigns/${id}` },
    ]);
    return toResult(normalizeCampaign(raw));
  },
  create: async (data: Record<string, unknown>) => {
    const payload = compactObject({
      name: stringOrUndefined(data.name),
      brandId: stringOrUndefined(data.brandId),
      description: stringOrUndefined(data.description),
      objective: stringOrUndefined(data.objective),
      startDate: stringOrUndefined(data.startDate),
      endDate: stringOrUndefined(data.endDate),
      platforms: Array.isArray(data.platforms) ? data.platforms : undefined,
      totalVideos: typeof data.totalVideos === "number" ? data.totalVideos : undefined,
    });
    const raw = await requestWithFallbackData<unknown>([
      { url: "/v1/campaign/create", method: "POST", data: payload },
      { url: "/v1/campaign", method: "POST", data: payload },
    ]);
    return toResult(normalizeCampaign(raw));
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const payload = compactObject({
      name: stringOrUndefined(data.name),
      status: stringOrUndefined(data.status),
      brandId: stringOrUndefined(data.brandId),
      description: stringOrUndefined(data.description),
      objective: stringOrUndefined(data.objective),
      startDate: stringOrUndefined(data.startDate),
      endDate: stringOrUndefined(data.endDate),
      platforms: Array.isArray(data.platforms) ? data.platforms : undefined,
      totalVideos: typeof data.totalVideos === "number" ? data.totalVideos : undefined,
    });
    const candidates: RequestCandidate[] = payload.status && Object.keys(payload).length === 1
      ? [
          { url: `/v1/campaign/${id}/status`, method: "POST", data: { status: payload.status } },
          { url: `/v1/campaign/${id}`, method: "PATCH", data: payload },
        ]
      : [
          { url: `/v1/campaign/${id}`, method: "PATCH", data: payload },
          { url: `/v1/campaigns/${id}`, method: "PATCH", data: payload },
        ];
    const raw = await requestWithFallbackData<unknown>(candidates);
    return toResult(normalizeCampaign(raw));
  },
  remove: async (id: string) =>
    requestWithFallback([
      { url: `/v1/campaign/${id}`, method: "DELETE" },
      { url: `/v1/campaigns/${id}`, method: "DELETE" },
    ]),
};
const discoveryApi = {
  getPool: (params?: DiscoveryPoolParams) => {
    const query = compactObject({
      limit: params?.limit,
      industry: params?.industry,
    });

    return request<DiscoveryPoolResponse>({
      url: "/v1/discovery/pool",
      params: query,
    });
  },
  analyzeViral: (contentId: string) =>
    request<DiscoveryViralAnalysis>({
      url: "/v1/discovery/analyze-viral-elements",
      method: "POST",
      data: { contentId },
    }),
  generateBrief: (contentId: string, brandId: string) =>
    request<DiscoveryRemixBrief>({
      url: "/v1/discovery/generate-remix-brief",
      method: "POST",
      data: { contentId, brandId },
    }),
  remix: (contentId: string, brandId: string) =>
    requestWithFallback<DiscoveryRemixBrief>([
      {
        url: "/v1/discovery/remix",
        method: "POST",
        data: { contentId, brandId },
      },
      {
        url: "/v1/discovery/generate-remix-brief",
        method: "POST",
        data: { contentId, brandId },
      },
    ]),
  markRemixed: (contentId: string, taskId: string) =>
    request({
      url: "/v1/discovery/mark-remixed",
      method: "POST",
      data: { contentId, taskId },
    }),
};
const skillApi = {
  config: (agentId: string) => request({ url: "/v1/skill/config", params: { agentId } }),
  register: (data: { agentId: string; capabilities?: string[] }) =>
    request({ url: "/v1/skill/register", method: "POST", data }),
  deliveries: (agentId: string) => request({ url: "/v1/skill/deliveries", params: { agentId } }),
  confirmDelivery: (data: { agentId: string; taskId: string }) =>
    request({ url: "/v1/skill/confirm-delivery", method: "POST", data }),
  feedback: (data: { agentId: string; taskId: string; feedback: Record<string, unknown> }) =>
    request({ url: "/v1/skill/feedback", method: "POST", data }),
};

const authApi = {
  sendCode: (phone: string) => request({ url: "/v1/auth/sms/send", method: "POST", data: { phone } }),
  verifyCode: (phone: string, code: string) =>
    request<AuthResponse>({
      url: "/v1/auth/sms/verify",
      method: "POST",
      data: { phone, code },
    }),
  login: (phone: string, code: string) =>
    request<AuthResponse>({
      url: "/v1/auth/sms/verify",
      method: "POST",
      data: { phone, code },
    }),
  registerEnterprise: (data: EnterpriseRegisterData) =>
    request<AuthResponse>({
      url: "/v1/auth/enterprise/register",
      method: "POST",
      data,
    }),
};

export const api = {
  content: contentApi,
  analytics: analyticsApi,
  data: dataApi,
  brands: brandsApi,
  brand: brandsApi,
  calendar: calendarApi,
  admin: adminApi,
  account: accountApi,
  billing: billingApi,
  payment: paymentApi,
  videos: videosApi,
  tasks: tasksApi,
  settings: settingsApi,
  apikey: {
    list: settingsApi.apiKeys.list,
    create: settingsApi.apiKeys.add,
    revoke: settingsApi.apiKeys.remove,
  },
  platformAccounts: platformAccountsApi,
  campaigns: campaignsApi,
  discovery: discoveryApi,
  skill: skillApi,
  auth: authApi,
};

export const AuthAPI = api.auth;
export const VideoAPI = {
  getVideos: api.content.list,
  getVideo: api.content.get,
};
export const BrandAPI = {
  getBrands: api.brand.list,
};
export const AnalyticsAPI = {
  getAnalytics: api.analytics.overview,
};
export const BillingAPI = {
  getBalance: api.billing.balance,
  getOrders: api.billing.orders,
};
export const ProfileAPI = {
  getProfile: api.account.info,
};
