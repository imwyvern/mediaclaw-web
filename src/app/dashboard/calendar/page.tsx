"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addDays, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Filter, Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type VideoStatus = "draft" | "scheduled" | "published" | "failed";

interface ScheduledVideo {
  id: string;
  title: string;
  date: Date;
  status: VideoStatus;
  brand: string;
}

const MOCK_VIDEOS: ScheduledVideo[] = [
  { id: "1", title: "Product Launch Reel", date: new Date(2026, 2, 29, 10, 0), status: "published", brand: "Acme Corp" },
  { id: "2", title: "Customer Interview", date: new Date(2026, 2, 29, 14, 0), status: "scheduled", brand: "Acme Corp" },
  { id: "3", title: "Tutorial Pt 1", date: new Date(2026, 2, 30, 9, 0), status: "draft", brand: "Global Inc" },
  { id: "4", title: "Promo Video", date: new Date(2026, 3, 1, 11, 0), status: "failed", brand: "Alpha" },
];

const statusColors: Record<VideoStatus, string> = {
  draft: "bg-gray-500",
  scheduled: "bg-blue-500",
  published: "bg-emerald-500",
  failed: "bg-red-500",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 29));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [view, setView] = useState<"month" | "week">("month");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const videosForDay = (day: Date) => MOCK_VIDEOS.filter(v => isSameDay(v.date, day));

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
          <p className="text-muted-foreground">Schedule and manage your video distribution pipeline.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          <Button><Plus className="w-4 h-4 mr-2" /> Schedule New</Button>
        </div>
      </div>

      <Card className="flex-1 min-h-[600px] flex flex-col border-none shadow-none bg-transparent">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-r-none border-r">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-l-none">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
          </div>
          
          <Tabs defaultValue="month" onValueChange={(v) => setView(v as any)}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 bg-card border rounded-xl overflow-hidden shadow-sm">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 border-b bg-muted/50">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 flex-1 auto-rows-fr h-full divide-x divide-y">
            {days.map((day, i) => {
              const dayVideos = videosForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={i} 
                  className={`min-h-[100px] p-2 transition-colors hover:bg-muted/30 cursor-pointer ${!isCurrentMonth ? "bg-muted/10 opacity-40" : ""}`}
                  onClick={() => setSelectedDay(day)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
                      {format(day, "d")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayVideos.map(video => (
                      <div 
                        key={video.id} 
                        className={`px-2 py-1 rounded shadow-sm text-[10px] font-bold text-white truncate flex items-center gap-1.5 mb-1 last:mb-0 transition-transform hover:scale-[1.02] ${statusColors[video.status]}`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 ring-1 ring-white/20" />
                        {video.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Dialog open={!!selectedDay} onOpenChange={(o) => !o && setSelectedDay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDay && format(selectedDay, "MMMM d, yyyy")}</DialogTitle>
            <DialogDescription>Content scheduled for this day.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedDay && videosForDay(selectedDay).length > 0 ? (
              videosForDay(selectedDay).map(video => (
                <div key={video.id} className="flex items-center justify-between p-3 border rounded-lg bg-card group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${statusColors[video.status]}`} />
                    <div>
                      <div className="font-medium text-sm">{video.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" /> {format(video.date, "HH:mm")} • {video.brand}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">Edit</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <p>No content scheduled for this day.</p>
                <Button variant="link" size="sm">Schedule something</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
