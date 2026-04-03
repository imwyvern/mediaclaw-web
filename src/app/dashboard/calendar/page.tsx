"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  RefreshCw,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { MetadataUpdater } from "@/components/metadata-updater";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  api,
  isApiNotFoundError,
  readApiErrorMessage,
  type CalendarTask,
} from "@/lib/api";
import { type VideoLifecycleStatus } from "@/lib/video-status";

const STATUS_STYLES: Record<string, { dot: string; chip: string; label: string }> = {
  draft: {
    dot: "bg-slate-400",
    chip: "border-slate-400/20 bg-slate-400/10 text-slate-200",
    label: "草稿",
  },
  queued: {
    dot: "bg-slate-400",
    chip: "border-slate-400/20 bg-slate-400/10 text-slate-200",
    label: "排队中",
  },
  processing: {
    dot: "bg-violet-400",
    chip: "border-violet-400/20 bg-violet-400/10 text-violet-100",
    label: "处理中",
  },
  pending_review: {
    dot: "bg-amber-400",
    chip: "border-amber-400/20 bg-amber-400/10 text-amber-100",
    label: "待审核",
  },
  approved: {
    dot: "bg-emerald-400",
    chip: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    label: "已通过",
  },
  scheduled: {
    dot: "bg-sky-400",
    chip: "border-sky-400/20 bg-sky-400/10 text-sky-100",
    label: "待发布",
  },
  completed: {
    dot: "bg-emerald-400",
    chip: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    label: "已完成",
  },
  published: {
    dot: "bg-emerald-400",
    chip: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    label: "已发布",
  },
  failed: {
    dot: "bg-rose-400",
    chip: "border-rose-400/20 bg-rose-400/10 text-rose-100",
    label: "失败",
  },
  cancelled: {
    dot: "bg-slate-500",
    chip: "border-slate-500/20 bg-slate-500/10 text-slate-300",
    label: "已取消",
  },
  expired: {
    dot: "bg-slate-500",
    chip: "border-slate-500/20 bg-slate-500/10 text-slate-300",
    label: "已过期",
  },
};

function parseTaskDate(value: string) {
  try {
    const parsed = parseISO(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

function getStatusStyle(status: VideoLifecycleStatus) {
  return STATUS_STYLES[status] || STATUS_STYLES.scheduled;
}

function CalendarGridSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-8 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <Skeleton className="mb-3 h-5 w-8 rounded-full" />
            <Skeleton className="mb-2 h-5 w-full rounded-lg" />
            <Skeleton className="h-5 w-4/5 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [view, setView] = useState<"month" | "week">("month");
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comingSoon, setComingSoon] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const intervalStart = view === "month" ? startOfWeek(monthStart) : startOfWeek(currentDate);
  const intervalEnd = view === "month" ? endOfWeek(monthEnd) : endOfWeek(currentDate);
  const days = eachDayOfInterval({ start: intervalStart, end: intervalEnd });
  const monthKey = format(currentDate, "yyyy-MM");

  const loadTasks = useCallback(async (options?: { silent?: boolean }) => {
    if (options?.silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);
    setComingSoon(false);

    try {
      const response = await api.calendar.scheduled({ month: monthKey, status: "scheduled" });
      setTasks(response.data);
    } catch (loadError) {
      setTasks([]);
      if (isApiNotFoundError(loadError)) {
        setComingSoon(true);
      } else {
        setError(readApiErrorMessage(loadError, "排期加载失败，请稍后重试。"));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [monthKey]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const tasksForDay = useMemo(() => {
    return days.reduce<Record<string, CalendarTask[]>>((accumulator, day) => {
      const key = format(day, "yyyy-MM-dd");
      accumulator[key] = tasks.filter((task) => {
        const parsedDate = parseTaskDate(task.scheduledAt);
        return parsedDate ? isSameDay(parsedDate, day) : false;
      });
      return accumulator;
    }, {});
  }, [days, tasks]);

  const selectedDayTasks = selectedDay
    ? tasksForDay[format(selectedDay, "yyyy-MM-dd")] || []
    : [];

  return (
    <div className="flex h-full flex-col gap-8 pb-8">
      <MetadataUpdater title="内容排期" />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">内容排期</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">
            直接读取真实排期任务，按月查看待发布、处理中和已发布的视频节点。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
            onClick={() => {
              void loadTasks({ silent: true });
            }}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            刷新排期
          </Button>
          <Button
            className="bg-white text-slate-950 hover:bg-slate-100"
            onClick={() => {
              window.location.href = "/dashboard/videos/create";
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            创建视频
          </Button>
        </div>
      </div>

      <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(6,10,18,0.98))] p-5 shadow-[0_28px_80px_-48px_rgba(14,165,233,0.35)]">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-white">{format(currentDate, view === "month" ? "MMMM yyyy" : "yyyy 年 M 月")}</h2>
            <div className="flex items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="rounded-none border-r border-white/10 text-slate-100 hover:bg-white/[0.08]"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="rounded-none text-slate-100 hover:bg-white/[0.08]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
              onClick={() => setCurrentDate(new Date())}
            >
              回到今天
            </Button>
          </div>

          <Tabs value={view} onValueChange={(value) => setView(value as "month" | "week")}>
            <TabsList className="border border-white/10 bg-white/[0.04]">
              <TabsTrigger value="month">月视图</TabsTrigger>
              <TabsTrigger value="week">周视图</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <CalendarGridSkeleton />
        ) : error ? (
          <ErrorState
            title="排期加载失败"
            description={error}
            onRetry={() => {
              void loadTasks();
            }}
            className="border-white/10 bg-black/20"
          />
        ) : comingSoon ? (
          <EmptyState
            icon={CalendarIcon}
            title="内容排期即将上线"
            description="排期服务接口还未在当前环境开放，页面已做好接入，后端准备好后会自动显示真实任务。"
            actionLabel="去创建视频"
            onAction={() => {
              window.location.href = "/dashboard/videos/create";
            }}
            className="border-white/10 bg-black/20"
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title="本月暂无排期，去创建视频吧"
            description="一旦有真实待发布任务，这里会自动按日期铺开，不再使用任何 mock 数据。"
            actionLabel="创建第一条视频"
            onAction={() => {
              window.location.href = "/dashboard/videos/create";
            }}
            className="border-white/10 bg-black/20"
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="rounded-xl border border-white/5 bg-white/[0.03] py-3">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayTasks = tasksForDay[key] || [];
                const isToday = isSameDay(day, new Date());
                const inCurrentMonth = isSameMonth(day, monthStart);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[132px] rounded-2xl border p-3 text-left transition ${
                      inCurrentMonth
                        ? "border-white/10 bg-black/20 hover:border-sky-400/30 hover:bg-black/30"
                        : "border-white/5 bg-black/10 text-slate-500"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          isToday ? "bg-white text-slate-950" : "bg-white/[0.04] text-slate-100"
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                      {dayTasks.length > 0 ? (
                        <span className="text-[11px] text-slate-400">{dayTasks.length} 条</span>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      {dayTasks.slice(0, 3).map((task) => {
                        const statusStyle = getStatusStyle(task.status);
                        return (
                          <div
                            key={task.id}
                            className={`rounded-xl border px-2.5 py-2 text-[11px] ${statusStyle.chip}`}
                          >
                            <div className="mb-1 flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                              <span className="truncate font-medium">{statusStyle.label}</span>
                            </div>
                            <div className="truncate text-sm font-semibold text-white">{task.title}</div>
                            <div className="truncate text-[11px] text-slate-300/75">{task.brand}</div>
                          </div>
                        );
                      })}

                      {dayTasks.length > 3 ? (
                        <div className="rounded-xl border border-dashed border-white/10 px-2.5 py-2 text-[11px] text-slate-400">
                          还有 {dayTasks.length - 3} 条任务
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <Dialog open={Boolean(selectedDay)} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="border-white/10 bg-slate-950 text-slate-100">
          <DialogHeader>
            <DialogTitle>{selectedDay ? format(selectedDay, "yyyy 年 M 月 d 日") : "排期详情"}</DialogTitle>
            <DialogDescription className="text-slate-400">查看当天的真实排期任务和状态。</DialogDescription>
          </DialogHeader>

          {selectedDay && selectedDayTasks.length > 0 ? (
            <div className="space-y-3 py-2">
              {selectedDayTasks.map((task) => {
                const statusStyle = getStatusStyle(task.status);
                const taskDate = parseTaskDate(task.scheduledAt);

                return (
                  <div key={task.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${statusStyle.chip}`}>
                        <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                        {statusStyle.label}
                      </span>
                      <span className="text-xs text-slate-400">{task.brand}</span>
                    </div>
                    <div className="text-base font-semibold text-white">{task.title}</div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="h-4 w-4" />
                      {taskDate ? format(taskDate, "HH:mm") : "时间待定"}
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]" render={<Link href="/dashboard/videos" />}>
                        查看全部视频
                      </Button>
                      <Button className="bg-white text-slate-950 hover:bg-slate-100" render={<Link href={`/dashboard/videos/${task.detailId}`} />}>
                        打开详情
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={CalendarIcon}
              title="这一天还没有排期"
              description="当前没有真实任务落在这一天，创建或调整发布时间后会自动同步到这里。"
              actionLabel="去创建视频"
              onAction={() => {
                window.location.href = "/dashboard/videos/create";
              }}
              className="border-white/10 bg-black/20 py-12"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
