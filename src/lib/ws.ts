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

  constructor(url?: string) {
    this.url = url || this.getDefaultUrl();
  }

  connect() {
    if (typeof window === "undefined" || this.socket?.readyState === WebSocket.OPEN) return;

    // Mocking WebSocket for now
    console.log("Connecting to WebSocket:", this.url);
    this.simulateConnection();
  }

  private getDefaultUrl() {
    if (typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      return `${protocol}://${window.location.host}/ws`;
    }

    return process.env.NEXT_PUBLIC_WS_URL || "ws://localhost/ws";
  }

  private simulateConnection() {
    // Simulate events for demo purposes
    setInterval(() => {
      const events: WSEvent[] = ["video_progress", "notification"];
      const event = events[Math.floor(Math.random() * events.length)];
      
      if (event === "video_progress") {
        this.emit(event, { videoId: "v_1", progress: Math.floor(Math.random() * 100) });
      } else if (event === "notification") {
        this.emit(event, { message: "New system update available" });
      }
    }, 10000);
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
      toast.success("Video Production Completed", { description: videoData.title });
    } else if (event === "video_failed") {
      const videoData = data as VideoEventData;
      toast.error("Video Production Failed", { description: videoData.title });
    }
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}

export const wsManager = new WebSocketManager();
