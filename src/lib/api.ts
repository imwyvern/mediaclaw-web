import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { token: refreshToken });
        if (res.data.token) {
          localStorage.setItem("auth_token", res.data.token);
          originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
          return api(originalRequest);
        }
      } catch (err) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
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
}

// API functions
export const AuthAPI = {
  login: (phone: string, code: string) => api.post<{ token: string; user: User }>("/auth/login", { phone, code }),
  registerEnterprise: (data: any) => api.post("/auth/enterprise/register", data),
};

export const VideoAPI = {
  getVideos: (params?: any) => api.get<Video[]>("/videos", { params }),
  getVideo: (id: string) => api.get<Video>(`/videos/${id}`),
};

export const BrandAPI = {
  getBrands: () => api.get<Brand[]>("/brands"),
};

export const AnalyticsAPI = {
  getAnalytics: () => api.get("/analytics"),
};

export const BillingAPI = {
  getOrders: () => api.get("/billing/orders"),
};

export const ProfileAPI = {
  getProfile: () => api.get<User>("/users/me"),
};
