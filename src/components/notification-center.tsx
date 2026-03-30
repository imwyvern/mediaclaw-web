"use client";

import { useState } from "react";
import { 
  Bell, 
  CheckCheck, 
  Video, 
  AlertCircle, 
  Zap, 
  Store,
  ExternalLink,
  Circle
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: "success" | "error" | "warning" | "info";
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", title: "视频渲染完成", description: "您的视频 'Q3 营销主片' 已处理完成，点击查看。", type: "success", time: "2分钟前", read: false },
  { id: "2", title: "订阅即将到期", description: "您的企业版订阅将在 3 天后到期，请及时续费。", type: "warning", time: "1小时前", read: false },
  { id: "3", title: "算力点数不足", description: "当前可用点数不足 100，部分排期任务可能受阻。", type: "error", time: "3小时前", read: true },
  { id: "4", title: "新模板上架", description: "素材市场新增了 12 款针对 618 大促的爆款模板。", type: "info", time: "1天前", read: true },
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <Video className="w-4 h-4 text-emerald-500" />;
      case "error": return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "warning": return <Zap className="w-4 h-4 text-orange-500" />;
      default: return <Store className="w-4 h-4 text-blue-500" />;
    }
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
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <DropdownMenuItem 
                  key={n.id} 
                  className={`flex items-start gap-4 p-4 cursor-pointer focus:bg-muted/50 ${!n.read ? "bg-primary/5" : ""}`}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold leading-none ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {n.description}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="mt-1 flex-shrink-0">
                      <Circle className="w-2 h-2 fill-primary text-primary" />
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
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
