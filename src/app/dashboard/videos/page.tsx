"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Play, 
  MoreVertical, 
  Download, 
  Film, 
  Loader2, 
  Trash2, 
  Edit3, 
  FileVideo 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ExportDialog, ExportConfig } from "@/components/export-dialog";
import { EmptyState } from "@/components/empty-state";
import { FilterSystem } from "@/components/filter-system";
import { toast } from "sonner";
import Link from "next/link";

type VideoStatus = "Completed" | "Processing" | "Failed";

const MOCK_VIDEOS = [
  { id: "1", title: "Q3 营销系列主视频", brand: "Acme Corp", status: "Completed" as VideoStatus, date: "2026-03-28", credits: 5 },
  { id: "2", title: "产品演示版本 v2", brand: "Global Inc", status: "Processing" as VideoStatus, date: "2026-03-29", credits: 2 },
  { id: "3", title: "Instagram 爆款短片", brand: "Acme Corp", status: "Failed" as VideoStatus, date: "2026-03-27", credits: 1 },
];

export default function VideosPage() {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<typeof MOCK_VIDEOS>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Simulate data fetching
  useState(() => {
    const timer = setTimeout(() => {
      setVideos(MOCK_VIDEOS);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  });

  const toggleSelectAll = () => {
    if (selectedItems.length === videos.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(videos.map(v => v.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    toast.success(`成功删除 ${selectedItems.length} 个视频`);
    setSelectedItems([]);
  };

  const handleExport = async (config: ExportConfig) => {
    console.log("Exporting with config:", config);
    return new Promise<void>(resolve => setTimeout(resolve, 2000));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">我的视频</h1>
          <p className="text-muted-foreground">管理和跟踪您的所有视频生产任务。</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportDialog 
            title="导出视频记录" 
            description="导出您的视频生产日志及相关元数据。"
            onExport={handleExport}
          />
          <Button><Plus className="w-4 h-4 mr-2" /> 新建视频</Button>
        </div>
      </div>

      <Card className="border-none shadow-none bg-transparent relative">
        {selectedItems.length > 0 && (
          <div className="absolute -top-14 left-0 right-0 bg-primary text-primary-foreground p-3 rounded-lg shadow-lg flex items-center justify-between z-20 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-4 ml-2">
              <span className="text-sm font-bold">已选择 {selectedItems.length} 项</span>
              <div className="h-4 w-px bg-primary-foreground/20" />
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 h-8 gap-2">
                <Download className="w-4 h-4" /> 批量下载 ZIP
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 h-8 gap-2">
                <Edit3 className="w-4 h-4" /> 批量编辑
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBatchDelete}
                className="text-primary-foreground hover:bg-destructive hover:text-white h-8 gap-2"
              >
                <Trash2 className="w-4 h-4" /> 删除
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedItems([])} className="text-primary-foreground/80 hover:text-primary-foreground h-8">
                取消
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="输入视频名称搜索..." className="pl-9 h-9" />
          </div>
          <FilterSystem 
            brands={["Acme Corp", "Global Inc", "Alpha"]}
            statuses={["已完成", "处理中", "失败"]}
            onFilterChange={(f) => console.log(f)}
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-16 rounded-md" />
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox checked={selectedItems.length === videos.length} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead>视频内容</TableHead>
                  <TableHead>所属品牌</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建日期</TableHead>
                  <TableHead>消耗点数</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow 
                    key={video.id} 
                    className={`group ${selectedItems.includes(video.id) ? "bg-muted/50" : ""}`} 
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedItems.includes(video.id)} 
                        onCheckedChange={() => toggleSelectItem(video.id)} 
                      />
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/videos/${video.id}`} className="flex items-center gap-3 group/title">
                        <div className="w-16 h-9 bg-muted rounded flex items-center justify-center relative overflow-hidden group-hover/title:bg-primary/10 transition-colors border">
                          <Play className="w-4 h-4 text-muted-foreground group-hover/title:text-primary transition-colors" />
                        </div>
                        <span className="font-medium group-hover/title:text-primary transition-colors">{video.title}</span>
                      </Link>
                    </TableCell>
                    <TableCell>{video.brand}</TableCell>
                    <TableCell>
                      <Badge variant={
                        video.status === "Completed" ? "default" : 
                        video.status === "Processing" ? "secondary" : 
                        "destructive"
                      }>
                        {video.status === "Processing" && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                        {video.status === "Completed" ? "已完成" : video.status === "Processing" ? "处理中" : "失败"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{video.date}</TableCell>
                    <TableCell>{video.credits}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem render={<Link href={`/dashboard/videos/${video.id}`} />}>
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem>下载视频</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">删除任务</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState 
            icon={FileVideo}
            title="暂无视频任务"
            description="您还没有处理过任何视频。创建您的首个任务，它将出现在这里。"
            actionLabel="创建首个视频"
            onAction={() => {}}
          />
        )}
      </Card>
    </div>
  );
}
