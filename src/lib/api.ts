import axios from "axios";
import { toast } from "sonner";
import { getCookie, setCookie, eraseCookie } from "./cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://8.129.133.52/api";

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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getCookie("refresh_token");
        const res = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, { token: refreshToken });
        if (res.data.token) {
          setCookie("auth_token", res.data.token, 7);
          originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
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
  email: string;
  phone: string;
  role: "user" | "admin";
  wechatId?: string;
}

export interface Video {
  id: string;
  title: string;
  brand: string;
  status: "Completed" | "Processing" | "Failed";
  date: string;
  credits: number;
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

// Unified API Client
export const api = {
  content: {
    list: (params?: any) => apiClient.get("/v1/content", { params }),
    get: (id: string) => apiClient.get(`/v1/content/${id}`),
    approve: (id: string) => apiClient.post(`/v1/content/${id}/approve`),
    reject: (id: string, data: { comment: string }) => apiClient.post(`/v1/content/${id}/reject`, data),
    markPublished: (id: string, data: any) => apiClient.post(`/v1/content/${id}/published`, data),
  },
  analytics: {
    overview: () => apiClient.get("/v1/analytics/overview"),
    trends: (params?: any) => apiClient.get("/v1/analytics/trends", { params }),
  },
  brand: {
    list: () => apiClient.get("/v1/brands"),
    get: (id?: string) => id ? apiClient.get(`/v1/brands/${id}`) : apiClient.get("/v1/brand"),
    create: (data: any) => apiClient.post("/v1/brands", data),
    update: (data: any) => apiClient.patch("/v1/brand", data),
    uploadAsset: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiClient.post("/v1/brand/assets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  },
  tasks: {
    create: (data: any) => apiClient.post("/v1/tasks", data),
    get: (id: string) => apiClient.get(`/v1/tasks/${id}`),
    list: (params?: any) => apiClient.get("/v1/tasks", { params }),
  },
  account: {
    info: () => apiClient.get("/v1/account"),
    usage: () => apiClient.get("/v1/account/usage"),
  },
  auth: {
    login: (phone: string, code: string) => apiClient.post<{ token: string; user: User }>("/v1/auth/login", { phone, code }),
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
  getBrands: () => apiClient.get("/v1/brands"), // Note: brand.get vs brands.list
};
export const AnalyticsAPI = {
  getAnalytics: api.analytics.overview,
};
export const BillingAPI = {
  getOrders: () => apiClient.get("/v1/billing/orders"),
};
export const ProfileAPI = {
  getProfile: api.account.info,
};

