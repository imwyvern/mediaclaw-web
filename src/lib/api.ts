import axios from "axios";
import { toast } from "sonner";
import { getCookie, setCookie, eraseCookie } from "./cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface ApiEnvelope<T> {
  code?: number;
  message?: string;
  data: T;
}

function unwrapApiData<T>(payload: T | ApiEnvelope<T>): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    ("code" in payload || "message" in payload)
  ) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? getCookie("auth_token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => ({
    ...response,
    data: unwrapApiData(response.data),
  }),
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getCookie("refresh_token");
        const res = await axios.post<ApiEnvelope<{ accessToken: string; refreshToken?: string }>>(
          `${API_BASE_URL}/v1/auth/refresh`,
          { refreshToken }
        );
        const authData = unwrapApiData(res.data);

        if (authData.accessToken) {
          setCookie("auth_token", authData.accessToken, 7);
          if (authData.refreshToken) {
            setCookie("refresh_token", authData.refreshToken, 7);
          }
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        eraseCookie("auth_token");
        eraseCookie("refresh_token");
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
      }
    }

    const message = error.response?.data?.message || error.message || "An unexpected error occurred";
    toast.error("API Error", { description: message });
    return Promise.reject(error);
  }
);

// Types
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
}

export interface Video {
  id: string;
  title: string;
  brand: string;
  status: "Completed" | "Processing" | "Failed";
  date: string;
  credits: number;
  progress?: number;
}

export interface Brand {
  id: string;
  name: string;
  category: string;
  pipelines: number;
  videos: number;
  logo: string;
  colors?: string[];
  fonts?: string[];
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

type AnalyticsPeriod = "daily" | "weekly" | "monthly";

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

// Unified API Client
export const api = {
  content: {
    list: (params?: any) => apiClient.get("/v1/content", { params }),
    get: (id: string) => apiClient.get(`/v1/content/${id}`),
    approve: (id: string) => apiClient.post(`/v1/content/${id}/approve`),
    reject: (id: string, data: { comment: string }) =>
      apiClient.post(`/v1/content/${id}/review`, {
        action: "reject",
        comment: data.comment,
      }),
    markPublished: (id: string, data: any) => apiClient.post(`/v1/content/${id}/published`, data),
  },
  analytics: {
    overview: () => apiClient.get("/v1/analytics/overview"),
    trends: (params?: { period?: AnalyticsPeriod; timeframe?: string }) => {
      const period = params?.period || normalizeAnalyticsPeriod(params?.timeframe);
      return apiClient.get("/v1/analytics/trends", {
        params: period ? { period } : undefined,
      });
    },
  },
  brand: {
    list: () => apiClient.get("/v1/brand"),
    get: (id?: string) => id ? apiClient.get(`/v1/brand/${id}`) : apiClient.get("/v1/brand"),
    create: (data: any) => apiClient.post("/v1/brand", data),
    update: (id: string, data: any) => apiClient.patch(`/v1/brand/${id}`, data),
    remove: (id: string) => apiClient.delete(`/v1/brand/${id}`),
    uploadAsset: (id: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiClient.patch(`/v1/brand/${id}/assets`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  },
  tasks: {
    create: (data: any) => apiClient.post("/v1/video", data),
    get: (id: string) => apiClient.get(`/v1/video/${id}`),
    list: (params?: any) => apiClient.get("/v1/video", { params }),
  },
  campaigns: {
    list: () => apiClient.get("/v1/campaign"),
    get: (id: string) => apiClient.get(`/v1/campaign/${id}`),
    create: (data: any) => apiClient.post("/v1/campaign", data),
    update: (id: string, data: any) => apiClient.patch(`/v1/campaign/${id}`, data),
    remove: (id: string) => apiClient.delete(`/v1/campaign/${id}`),
  },
  discovery: {
    getPool: (params?: DiscoveryPoolParams) => {
      const query = {
        limit: params?.limit,
        industry: params?.industry,
      };

      return apiClient.get<DiscoveryPoolResponse>("/v1/discovery/pool", {
        params: query,
      });
    },
    analyzeViral: (contentId: string) =>
      apiClient.post<DiscoveryViralAnalysis>("/v1/discovery/analyze-viral-elements", { contentId }),
    generateBrief: (contentId: string, brandId: string) =>
      apiClient.post<DiscoveryRemixBrief>("/v1/discovery/generate-remix-brief", { contentId, brandId }),
    markRemixed: (contentId: string, taskId: string) =>
      apiClient.post("/v1/discovery/mark-remixed", { contentId, taskId }),
  },
  account: {
    info: () => apiClient.get("/v1/account"),
    usage: () => apiClient.get("/v1/account/usage"),
    updateProfile: (data: any) => apiClient.patch("/v1/account/profile", data),
  },
  platformAccounts: {
    list: () => apiClient.get("/v1/platform-accounts"),
    get: (id: string) => apiClient.get(`/v1/platform-accounts/${id}`),
    create: (data: any) => apiClient.post("/v1/platform-accounts", data),
    sync: (id: string) => apiClient.post(`/v1/platform-accounts/${id}/sync`),
    history: (id: string, params?: any) => apiClient.get(`/v1/platform-accounts/${id}/history`, { params }),
    remove: (id: string) => apiClient.delete(`/v1/platform-accounts/${id}`),
  },
  billing: {
    balance: () => apiClient.get("/v1/billing/balance"),
    orders: (params?: any) => apiClient.get("/v1/billing/orders", { params }),
  },
  payment: {
    products: () => apiClient.get("/v1/payment/products"),
    create: (data: any) => apiClient.post("/v1/payment/create", data),
    orders: (params?: any) => apiClient.get("/v1/payment/orders", { params }),
    status: (orderId: string) => apiClient.get(`/v1/payment/status/${orderId}`),
  },
  apikey: {
    list: () => apiClient.get("/v1/apikey"),
    create: (data: any) => apiClient.post("/v1/apikey", data),
    revoke: (id: string) => apiClient.delete(`/v1/apikey/${id}`),
  },
  skill: {
    config: (agentId: string) => apiClient.get("/v1/skill/config", { params: { agentId } }),
    register: (data: { agentId: string; capabilities?: string[] }) => apiClient.post("/v1/skill/register", data),
    deliveries: (agentId: string) => apiClient.get("/v1/skill/deliveries", { params: { agentId } }),
    confirmDelivery: (data: { agentId: string; taskId: string }) =>
      apiClient.post("/v1/skill/confirm-delivery", data),
    feedback: (data: { agentId: string; taskId: string; feedback: Record<string, any> }) =>
      apiClient.post("/v1/skill/feedback", data),
  },
  auth: {
    sendCode: (phone: string) => apiClient.post("/v1/auth/sms/send", { phone }),
    verifyCode: (phone: string, code: string) =>
      apiClient.post<AuthResponse>("/v1/auth/sms/verify", { phone, code }),
    login: (phone: string, code: string) =>
      apiClient.post<AuthResponse>("/v1/auth/sms/verify", { phone, code }),
    registerEnterprise: (data: EnterpriseRegisterData) => apiClient.post("/v1/auth/enterprise/register", data),
  }
};

// Legacy API exports for backward compatibility (optional but safer)
export const AuthAPI = api.auth;
export const VideoAPI = {
  getVideos: api.content.list,
  getVideo: api.content.get,
};
export const BrandAPI = {
  getBrands: () => apiClient.get("/v1/brand"),
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
