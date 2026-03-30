import { toast } from "sonner";

type WSEvent = "video_completed" | "video_failed" | "credit_low" | "notification" | "video_progress";

interface WSMessage {
  event: WSEvent;
  data: any;
}

class WebSocketManager {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<WSEvent, Set<(data: any) => void>> = new Map();

  constructor(url: string = "wss://api.mediaclaw.com/ws") {
    this.url = url;
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    // Mocking WebSocket for now
    console.log("Connecting to WebSocket:", this.url);
    this.simulateConnection();
  }

  private simulateConnection() {
    // Simulate events for demo purposes
    setInterval(() => {
      const events: WSEvent[] = ["video_progress", "notification"];
      const event = events[Math.floor(Math.random() * events.length)];
      
      let data;
      if (event === "video_progress") {
        data = { videoId: "v_1", progress: Math.floor(Math.random() * 100) };
      } else {
        data = { message: "New system update available" };
      }

      this.emit(event, data);
    }, 10000);
  }

  on(event: WSEvent, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: WSEvent, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: WSEvent, data: any) {
    this.listeners.get(event)?.forEach((callback) => callback(data));
    
    // Global toast for certain events
    if (event === "video_completed") {
      toast.success("Video Production Completed", { description: data.title });
    } else if (event === "video_failed") {
      toast.error("Video Production Failed", { description: data.title });
    }
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}

export const wsManager = new WebSocketManager();
