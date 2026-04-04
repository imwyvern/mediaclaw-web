"use client";

import { useState, useEffect } from "react";
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Play, 
  MoreVertical,
  ArrowLeft,
  RefreshCw,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MetadataUpdater } from "@/components/metadata-updater";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { api, readApiErrorMessage } from "@/lib/api";
import Link from "next/link";

type TaskStatus = "queued" | "processing" | "completed" | "failed";

interface ProductionTask {
  id: string;
  title: string;
  status: TaskStatus;
  progress: number;
  createdAt: string;
  brandName: string;
  error?: string;
}

export default function VideoTasksPage() {
  const [tasks, setTasks] = useState<ProductionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchSearchQuery] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await api.tasks.list();
      setTasks(res.data);
      setError(null);
    } catch (err) {
      setTasks([]);
      setError(readApiErrorMessage(err, "生产任务加载失败，请稍后重试。"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "queued": return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> 排队中</Badge>;
      case "processing": return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 gap-1"><Loader2 className="w-3 h-3 animate-spin" /> 处理中</Badge>;
      case "completed": return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 gap-1"><CheckCircle2 className="w-3 h-3" /> 已完成</Badge>;
      case "failed": return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" /> 失败</Badge>;
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.brandName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <MetadataUpdater title="生产任务" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/videos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">生产任务列表</h1>
            <p className="text-muted-foreground">实时查看视频生产进度与状态。</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTasks} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Link href="/dashboard/videos/create">
            <Button size="sm">新建任务</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="搜索任务或品牌..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading && tasks.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : error ? (
            <ErrorState
              title="生产任务加载失败"
              description={error}
              onRetry={() => {
                setLoading(true);
                void fetchTasks();
              }}
            />
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              icon={Search}
              title={tasks.length === 0 ? "还没有生产任务" : "未找到相关生产任务"}
              description={
                tasks.length === 0
                  ? "新建视频任务后，这里会实时展示排队、处理、完成和失败状态。"
                  : "请调整搜索关键词，或刷新任务列表后重试。"
              }
              actionLabel={tasks.length === 0 ? "新建任务" : "刷新列表"}
              onAction={() => {
                if (tasks.length === 0) {
                  window.location.href = "/dashboard/videos/create";
                  return;
                }
                setLoading(true);
                void fetchTasks();
              }}
            />
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>任务名称</TableHead>
                    <TableHead>所属品牌</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <Play className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="font-medium truncate max-w-[200px]">{task.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>{task.brandName}</TableCell>
                      <TableCell className="w-[200px]">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(task.status)}
                          {task.error && <span className="text-[10px] text-destructive truncate max-w-[120px]">{task.error}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{task.createdAt}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
