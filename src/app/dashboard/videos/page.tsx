"use client";

import { useState } from "react";
import { Plus, Search, Filter, Play, MoreVertical, Copy, Download, Film, Loader2, Trash2, Edit3, CheckCircle2, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  { id: "1", title: "Q3 Campaign Hero", brand: "Acme Corp", status: "Completed" as VideoStatus, date: "2026-03-28", credits: 5 },
  { id: "2", title: "Product Demo v2", brand: "Global Inc", status: "Processing" as VideoStatus, date: "2026-03-29", credits: 2 },
  { id: "3", title: "Instagram Reel", brand: "Acme Corp", status: "Failed" as VideoStatus, date: "2026-03-27", credits: 1 },
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
    toast.success(`Deleted ${selectedItems.length} items`);
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
          <h1 className="text-3xl font-bold tracking-tight">Videos</h1>
          <p className="text-muted-foreground">Manage and track your video production tasks.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportDialog 
            title="Export Videos" 
            description="Export your video production logs and metadata."
            onExport={handleExport}
          />
          <Button><Plus className="w-4 h-4 mr-2" /> New Video</Button>
        </div>
      </div>

      <Card className="border-none shadow-none bg-transparent relative">
        {selectedItems.length > 0 && (
          <div className="absolute -top-14 left-0 right-0 bg-primary text-primary-foreground p-3 rounded-lg shadow-lg flex items-center justify-between z-20 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-4 ml-2">
              <span className="text-sm font-bold">{selectedItems.length} items selected</span>
              <div className="h-4 w-px bg-primary-foreground/20" />
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 h-8 gap-2">
                <Download className="w-4 h-4" /> Download ZIP
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 h-8 gap-2">
                <Edit3 className="w-4 h-4" /> Edit Copy
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBatchDelete}
                className="text-primary-foreground hover:bg-destructive hover:text-white h-8 gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedItems([])} className="text-primary-foreground/80 hover:text-primary-foreground h-8">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="搜索视频..." className="pl-9 h-9" />
          </div>
          <FilterSystem 
            brands={["Acme Corp", "Global Inc", "Alpha"]}
            statuses={["Completed", "Processing", "Failed"]}
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
                  <TableHead>Video</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Credits</TableHead>
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
                        <div className="w-16 h-9 bg-muted rounded flex items-center justify-center relative overflow-hidden group-hover/title:bg-primary/10 transition-colors">
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
                        {video.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{video.date}</TableCell>
                    <TableCell>{video.credits}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/dashboard/videos/${video.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Download</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
            title="No videos found"
            description="You haven't processed any videos yet. Create your first task to see it here."
            actionLabel="Create First Video"
            onAction={() => {}}
          />
        )}
      </Card>
    </div>
  );
}
