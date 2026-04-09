"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Video,
  Search,
  Filter,
  MoreHorizontal,
  LayoutGrid,
  List as ListIcon,
  Download,
  Edit,
  Trash2,
  Flame,
  AlertCircle,
  Play
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { formatCompactNumber } from "@/lib/format";

interface VideoItem {
  id: string;
  title: string;
  platform: string;
  status: "draft" | "processing" | "ready" | "published";
  viralScore: number;
  views: number;
  thumbnailUrl: string;
  createdAt: string;
}

export default function VideoListPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Filters
  const [status, setStatus] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [search, setSearch] = useState("");
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "/api/v1/content?page=1&limit=20";
      if (status !== "all") url += `&status=${status}`;
      if (platform !== "all") url += `&platform=${platform}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("获取视频列表失败");
      
      const data = await res.json();
      setVideos(Array.isArray(data.data) ? data.data : []);
      setSelectedIds(new Set());
    } catch (err: any) {
      console.error(err);
      setError("服务连接中...");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [status, platform]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVideos();
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === videos.length && videos.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(videos.map(v => v.id)));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-[#00e8b8]/20 text-[#00e8b8] border-none font-normal">已发布</Badge>;
      case "ready": return <Badge className="bg-blue-500/20 text-blue-400 border-none font-normal">待发布</Badge>;
      case "processing": return <Badge className="bg-yellow-500/20 text-yellow-400 border-none font-normal">处理中</Badge>;
      default: return <Badge className="bg-white/10 text-white/70 border-none font-normal">草稿</Badge>;
    }
  };

  const handleRowClick = (id: string) => {
    router.push(`/dashboard/videos/${id}`);
  };

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-8rem)] text-[#f0f0f0]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-1">视频管理</h1>
          <p className="text-white/50">管理您的视频资产、审核状态及发布进度</p>
        </div>
        <Link href="/dashboard/videos/create">
          <Button className="bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold px-6">
            创建任务
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input 
              placeholder="搜索视频..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-64 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#00e8b8]/50" 
            />
          </form>
          
          <Select value={status} onValueChange={(v) => v && setStatus(v)}>
            <SelectTrigger className="w-full sm:w-[130px] bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent className="bg-[#0b0f1a] border-white/10 text-white">
              <SelectItem value="all">所有状态</SelectItem>
              <SelectItem value="draft">草稿</SelectItem>
              <SelectItem value="processing">处理中</SelectItem>
              <SelectItem value="ready">待发布</SelectItem>
              <SelectItem value="published">已发布</SelectItem>
            </SelectContent>
          </Select>

          <Select value={platform} onValueChange={(v) => v && setPlatform(v)}>
            <SelectTrigger className="w-full sm:w-[130px] bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
              <SelectValue placeholder="平台" />
            </SelectTrigger>
            <SelectContent className="bg-[#0b0f1a] border-white/10 text-white">
              <SelectItem value="all">所有平台</SelectItem>
              <SelectItem value="douyin">抖音</SelectItem>
              <SelectItem value="xhs">小红书</SelectItem>
              <SelectItem value="kuaishou">快手</SelectItem>
              <SelectItem value="bilibili">B站</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mr-2 animate-in fade-in zoom-in-95">
              <span className="text-sm text-[#00e8b8] font-medium px-2">已选 {selectedIds.size} 项</span>
              <Button size="icon" variant="outline" className="h-9 w-9 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white" title="下载所选">
                <Download className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-9 w-9 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white" title="批量编辑">
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-9 w-9 bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300" title="删除所选">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
            <Button size="icon" variant="ghost" className={`h-7 w-8 rounded-md ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`} onClick={() => setViewMode('grid')}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className={`h-7 w-8 rounded-md ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`} onClick={() => setViewMode('list')}>
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 border-dashed p-12 text-center">
          <AlertCircle className="w-12 h-12 text-[#00e8b8]/60 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">服务连接中...</h3>
          <p className="text-white/50 max-w-md">无法获取视频列表。正在尝试重新连接，请稍后...</p>
          <Button onClick={fetchVideos} variant="outline" className="mt-8 border-white/20 hover:bg-white/10 bg-transparent text-white">
            重新加载
          </Button>
        </div>
      ) : videos.length === 0 && !loading ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 border-dashed p-16 text-center">
          <Video className="w-16 h-16 text-white/20 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">未找到视频</h3>
          <p className="text-white/50 max-w-sm mb-8">
            当前条件没有匹配的视频，或您还未创建任何视频任务。
          </p>
          <Link href="/dashboard/videos/create">
            <Button className="bg-white/10 text-white hover:bg-white/20 border border-white/10">
              去创建视频
            </Button>
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="bg-[#0b0f1a] border-white/10 overflow-hidden hover:border-[#00e8b8]/40 transition-all duration-300 group shadow-none cursor-pointer flex flex-col" onClick={() => handleRowClick(video.id)}>
              <div className="relative aspect-video bg-black overflow-hidden shrink-0 border-b border-white/5 group-hover:border-[#00e8b8]/30">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/20 group-hover:scale-105 transition-transform duration-700">
                    <Video className="w-8 h-8 opacity-50" />
                  </div>
                )}
                
                {/* Overlay Checkbox */}
                <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={selectedIds.has(video.id)} 
                    onCheckedChange={(c) => {
                      const newSet = new Set(selectedIds);
                      if (c) newSet.add(video.id);
                      else newSet.delete(video.id);
                      setSelectedIds(newSet);
                    }}
                    className="border-white/40 data-[state=checked]:bg-[#00e8b8] data-[state=checked]:border-[#00e8b8] data-[state=checked]:text-[#0b0f1a]" 
                  />
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 left-2 z-10">
                  {getStatusBadge(video.status)}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f1a] via-transparent to-transparent opacity-80" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-[#00e8b8]/20 backdrop-blur-sm flex items-center justify-center border border-[#00e8b8]/50 text-[#00e8b8]">
                    <Play className="w-5 h-5 ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white/90 text-sm line-clamp-2 leading-snug group-hover:text-[#00e8b8] transition-colors mb-2">
                    {video.title || "未命名视频"}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    {video.platform && (
                      <Badge variant="outline" className="bg-white/5 text-white/60 border-white/10 text-[10px] px-1.5 py-0">
                        {video.platform}
                      </Badge>
                    )}
                    <span className="text-xs text-white/40">{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">播放量</span>
                    <span className="text-sm font-bold text-white/80">{formatCompactNumber(video.views || 0)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">爆款指数</span>
                    <span className="text-sm font-bold flex items-center gap-1">
                      <Flame className={`w-3 h-3 ${video.viralScore >= 80 ? 'text-[#00e8b8]' : 'text-yellow-500'}`} />
                      <span className={video.viralScore >= 80 ? 'text-[#00e8b8]' : 'text-yellow-500'}>{video.viralScore || 0}</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-[#0b0f1a] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-white/50 uppercase bg-white/[0.02] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">
                    <Checkbox 
                      checked={selectedIds.size === videos.length && videos.length > 0} 
                      onCheckedChange={toggleSelectAll}
                      className="border-white/40 data-[state=checked]:bg-[#00e8b8] data-[state=checked]:border-[#00e8b8] data-[state=checked]:text-[#0b0f1a]"
                    />
                  </th>
                  <th className="px-4 py-3">视频</th>
                  <th className="px-4 py-3">平台</th>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3 text-right">爆款指数</th>
                  <th className="px-4 py-3 text-right">播放量</th>
                  <th className="px-4 py-3">创建时间</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group" onClick={() => handleRowClick(video.id)}>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedIds.has(video.id)} 
                        onCheckedChange={(c) => {
                          const newSet = new Set(selectedIds);
                          if (c) newSet.add(video.id);
                          else newSet.delete(video.id);
                          setSelectedIds(newSet);
                        }}
                        className="border-white/40 data-[state=checked]:bg-[#00e8b8] data-[state=checked]:border-[#00e8b8] data-[state=checked]:text-[#0b0f1a]"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium flex items-center gap-3">
                      <div className="w-12 h-8 rounded bg-white/5 border border-white/10 overflow-hidden shrink-0">
                        {video.thumbnailUrl && <img src={video.thumbnailUrl} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <span className="line-clamp-1 group-hover:text-[#00e8b8] transition-colors">{video.title || "未命名视频"}</span>
                    </td>
                    <td className="px-4 py-3">
                      {video.platform ? <Badge variant="outline" className="bg-white/5 text-white/60 border-white/10 px-2 py-0 font-normal">{video.platform}</Badge> : "-"}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(video.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center font-bold ${video.viralScore >= 80 ? 'text-[#00e8b8]' : 'text-yellow-500'}`}>
                        <Flame className="w-3 h-3 mr-1" />{video.viralScore || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-white/80">{formatCompactNumber(video.views || 0)}</td>
                    <td className="px-4 py-3 text-white/50">{new Date(video.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0b0f1a] border-white/10 text-white">
                          <DropdownMenuItem onClick={() => handleRowClick(video.id)} className="hover:bg-white/10 cursor-pointer">
                            <Play className="w-4 h-4 mr-2 text-white/70" /> 查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                            <Download className="w-4 h-4 mr-2 text-white/70" /> 下载视频
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer">
                            <Trash2 className="w-4 h-4 mr-2" /> 删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
