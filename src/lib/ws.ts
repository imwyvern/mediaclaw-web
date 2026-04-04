import { toast } from "sonner";

export type WSEvent = "video_completed" | "video_failed" | "credit_low" | "notification" | "video_progress";

export interface VideoProgressData {
  videoId: string;
  progress: number;
}

export interface NotificationData {
  message: string;
}

export interface VideoEventData {
  id: string;
  title: string;
  outputVideoUrl?: string;
}

export type WSEventData = {
  video_completed: VideoEventData;
  video_failed: VideoEventData;
  credit_low: { balance: number };
  notification: NotificationData;
  video_progress: VideoProgressData;
};

class WebSocketManager {
  private socket: WebSocket | null = null;
  private url: string;
  private listeners: Map<WSEvent, Set<(data: never) => void>> = new Map();
  private reconnectTimer: number | null = null;
  private shouldReconnect = true;

  constructor(url?: string) {
    this.url = url || this.getDefaultUrl();
  }

  connect() {
    if (
      typeof window === "undefined"
      || !this.url
      || this.socket?.readyState === WebSocket.OPEN
      || this.socket?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    this.shouldReconnect = true;
    const socket = new WebSocket(this.url);
    this.socket = socket;

    socket.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    socket.onclose = () => {
      this.socket = null;
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  private getDefaultUrl() {
    const configuredUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!configuredUrl) {
      return "";
    }

    if (configuredUrl.startsWith("http://")) {
      return configuredUrl.replace(/^http:\/\//, "ws://");
    }

    if (configuredUrl.startsWith("https://")) {
      return configuredUrl.replace(/^https:\/\//, "wss://");
    }

    return configuredUrl;
  }

  private handleMessage(raw: unknown) {
    if (typeof raw !== "string") {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as {
        event?: unknown;
        type?: unknown;
        data?: unknown;
        payload?: unknown;
      };
      const event = (typeof parsed.event === "string" ? parsed.event : parsed.type) as WSEvent | undefined;
      const data = parsed.data ?? parsed.payload;

      if (event && this.isSupportedEvent(event)) {
        this.emit(event, data as WSEventData[typeof event]);
      }
    } catch {
      return;
    }
  }

  private isSupportedEvent(event: string): event is WSEvent {
    return ["video_completed", "video_failed", "credit_low", "notification", "video_progress"].includes(event);
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || typeof window === "undefined") {
      return;
    }

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  on<K extends WSEvent>(event: K, callback: (data: WSEventData[K]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as (data: never) => void);
    return () => this.off(event, callback);
  }

  off<K extends WSEvent>(event: K, callback: (data: WSEventData[K]) => void) {
    this.listeners.get(event)?.delete(callback as (data: never) => void);
  }

  private emit<K extends WSEvent>(event: K, data: WSEventData[K]) {
    this.listeners.get(event)?.forEach((callback) => callback(data as never));
    
    // Global toast for certain events
    if (event === "video_completed") {
      const videoData = data as VideoEventData;
      toast.success("视频生产完成", { description: videoData.title });
    } else if (event === "video_failed") {
      const videoData = data as VideoEventData;
      toast.error("视频生产失败", { description: videoData.title });
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
  }
}

export const wsManager = new WebSocketManager();
