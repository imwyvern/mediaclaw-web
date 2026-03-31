"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Play, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileVideo,
  ExternalLink,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { MetadataUpdater } from "@/components/metadata-updater";
import { api, Video } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

export default function ContentManagementPage() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await api.content.list({ status: statusFilter !== "all" ? statusFilter : undefined });
      setContent(res.data);
    } catch (err) {
      console.error("Failed to fetch content:", err);
      // Fallback mock
      setContent([
        { id: "1", title: "Q3 Campaign Hero Video", brand: "Acme Corp", status: "Completed", date: "2026-03-28", credits: 5 },
        { id: "2", title: "Product Demo Reel", brand: "Global Inc", status: "Processing", date: "2026-03-30", credits: 2 },
        { id: "3", title: "Customer Testimonial", brand: "Acme Corp", status: "Failed", date: "2026-03-25", credits: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [statusFilter]);

  const filteredContent = content.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed": return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 gap-1"><CheckCircle2 className="w-3 h-3" /> 已完成</Badge>;
      case "Processing": return <Badge variant="secondary" className="gap-1 animate-pulse"><Clock className="w-3 h-3" /> 处理中</Badge>;
      case "Failed": return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" /> 失败</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <MetadataUpdater title="内容管理" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">Review, approve, and manage all generated video assets.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/videos/create">
            <Button size="sm" className="gap-2">
              <FileVideo className="w-4 h-4" /> 生产新内容
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-4 md:flex h-10">
            <TabsTrigger value="all" className="px-4">全部</TabsTrigger>
            <TabsTrigger value="Pending" className="px-4 text-xs sm:text-sm">待审核</TabsTrigger>
            <TabsTrigger value="Completed" className="px-4 text-xs sm:text-sm">已通过</TabsTrigger>
            <TabsTrigger value="Failed" className="px-4 text-xs sm:text-sm">失败</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="搜索标题或品牌..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading && content.length === 0 ? (
        <div className="rounded-md border overflow-hidden">
          <div className="h-12 border-b px-4 flex items-center gap-4 bg-muted/30">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 flex-1" />)}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 border-b px-4 flex items-center gap-4">
              <Skeleton className="h-10 w-16 rounded" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      ) : filteredContent.length > 0 ? (
        <div className="rounded-md border overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">预览</TableHead>
                <TableHead>内容标题</TableHead>
                <TableHead>所属品牌</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最后更新</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item) => (
                <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="w-16 h-10 rounded bg-muted flex items-center justify-center relative overflow-hidden border">
                      <Play className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <Link href={`/dashboard/videos/${item.id}`} className="font-medium hover:text-primary hover:underline transition-colors truncate max-w-[300px]">
                        {item.title}
                      </Link>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-tight">ID: {item.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">{item.brand}</Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.status)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.date}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem render={<Link href={`/dashboard/videos/${item.id}`} className="flex w-full" />}>
                          <ExternalLink className="w-4 h-4 mr-2" /> 查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" /> 下载视频
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> 删除
                        </DropdownMenuItem>
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
          title="No content items found"
          description={searchQuery || statusFilter !== "all" ? "Try adjusting your filters or search query." : "You haven't generated any content yet."}
          actionLabel={searchQuery || statusFilter !== "all" ? "Clear Filters" : "Generate Your First Video"}
          onAction={() => {
            if (searchQuery || statusFilter !== "all") {
              setSearchQuery("");
              setStatusFilter("all");
            } else {
              // Navigate to create
            }
          }}
        />
      )}
    </div>
  );
}
