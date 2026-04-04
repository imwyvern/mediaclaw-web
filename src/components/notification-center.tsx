"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  CheckCheck,
  Circle,
  ExternalLink,
  Store,
  Video,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api, readApiErrorMessage, type NotificationFeedItem } from "@/lib/api";
import { wsManager } from "@/lib/ws";

function formatNotificationTime(value?: string) {
  if (!value) {
    return "刚刚";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "刚刚";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isReadNotification(item: NotificationFeedItem, readIds: Set<string>) {
  return readIds.has(item.id) || item.status.toLowerCase() === "read";
}

function getNotificationIcon(item: NotificationFeedItem) {
  if (item.source === "discovery") {
    return <Store className="w-4 h-4 text-blue-500" />;
  }

  if (["content.approved", "content.published", "task.completed"].includes(item.event)) {
    return <Video className="w-4 h-4 text-emerald-500" />;
  }

  if (["content.rejected", "content.changes_requested", "task.failed"].includes(item.event)) {
    return <AlertCircle className="w-4 h-4 text-destructive" />;
  }

  if (["credit.low", "subscription.expiring"].includes(item.event)) {
    return <Zap className="w-4 h-4 text-orange-500" />;
  }

  return <Bell className="w-4 h-4 text-blue-500" />;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationFeedItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !isReadNotification(item, readIds)).length,
    [notifications, readIds],
  );

  useEffect(() => {
    let active = true;

    const loadNotifications = async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) {
        setLoading(true);
      }

      try {
        const response = await api.settings.notifications.listFeed({ limit: 12 });
        if (!active) {
          return;
        }

        const items = Array.isArray(response.data) ? response.data : response.data.items;
        setNotifications(items);
        setError(null);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(readApiErrorMessage(loadError, "通知加载失败"));
      } finally {
        if (active && !silent) {
          setLoading(false);
        }
      }
    };

    void loadNotifications();

    const interval = window.setInterval(() => {
      void loadNotifications({ silent: true });
    }, 60_000);

    const offNotification = wsManager.on("notification", () => {
      void loadNotifications({ silent: true });
    });

    return () => {
      active = false;
      window.clearInterval(interval);
      offNotification();
    };
  }, []);

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((item) => item.id)));
  };

  const markAsRead = (id: string) => {
    setReadIds((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground" />}>
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground border-2 border-background">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 sm:w-96" align="end">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <span className="text-base font-bold">通知中心</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="h-8 text-xs font-normal">
              <CheckCheck className="w-3 h-3 mr-1" /> 全部标记已读
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">正在加载通知...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground px-6 text-center">
              <AlertCircle className="w-8 h-8 opacity-40" />
              <p className="text-sm">{error}</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((notification) => {
                const read = isReadNotification(notification, readIds);

                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 cursor-pointer focus:bg-muted/50 ${!read ? "bg-primary/5" : ""}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="mt-1 flex-shrink-0">
                      {getNotificationIcon(notification)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-sm font-semibold leading-none ${!read ? "text-foreground" : "text-muted-foreground"}`}>
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {notification.content || "暂无详细内容"}
                      </p>
                    </div>
                    {!read && (
                      <div className="mt-1 flex-shrink-0">
                        <Circle className="w-2 h-2 fill-primary text-primary" />
                      </div>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">暂无新通知</p>
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="ghost" className="w-full h-9 text-xs justify-center gap-2" render={<Link href="/dashboard/settings?tab=notifications" />}>
            管理通知设置 <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
