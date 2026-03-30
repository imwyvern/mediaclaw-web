"use client";

import { useState } from "react";
import { Plus, Search, Filter, Play, MoreVertical, Copy, Download, Film, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type VideoStatus = "Completed" | "Processing" | "Failed";

const MOCK_VIDEOS = [
  { id: "1", title: "Q3 Campaign Hero", brand: "Acme Corp", status: "Completed" as VideoStatus, date: "2026-03-28", credits: 5 },
  { id: "2", title: "Product Demo v2", brand: "Global Inc", status: "Processing" as VideoStatus, date: "2026-03-29", credits: 2 },
  { id: "3", title: "Instagram Reel", brand: "Acme Corp", status: "Failed" as VideoStatus, date: "2026-03-27", credits: 1 },
];

export default function VideosPage() {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<typeof MOCK_VIDEOS>([]);
  const [selectedVideo, setSelectedVideo] = useState<typeof MOCK_VIDEOS[0] | null>(null);

  // Simulate data fetching
  useState(() => {
    const timer = setTimeout(() => {
      setVideos(MOCK_VIDEOS);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Videos</h1>
          <p className="text-muted-foreground">Manage and track your video production tasks.</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> New Video</Button>
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search videos..." className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                <SelectItem value="acme">Acme Corp</SelectItem>
                <SelectItem value="global">Global Inc</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                  <TableRow key={video.id} className="cursor-pointer group" onClick={() => setSelectedVideo(video)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-9 bg-muted rounded flex items-center justify-center relative overflow-hidden group-hover:bg-primary/10 transition-colors">
                          <Play className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{video.title}</span>
                      </div>
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
                          <DropdownMenuItem onClick={() => setSelectedVideo(video)}>View Details</DropdownMenuItem>
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
          <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl border-dashed bg-muted/20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Film className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No videos found</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              You haven't processed any videos yet. Create your first task to see it here.
            </p>
            <Button><Plus className="w-4 h-4 mr-2" /> Create First Video</Button>
          </div>
        )}
      </Card>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
            <DialogDescription>
              {selectedVideo?.brand} • {selectedVideo?.date}
            </DialogDescription>
          </DialogHeader>
          
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative my-4">
            {selectedVideo?.status === "Processing" ? (
              <div className="flex flex-col items-center text-white/70">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Processing Video...</p>
              </div>
            ) : selectedVideo?.status === "Failed" ? (
              <div className="text-red-400">Rendering Failed</div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                 <Play className="w-12 h-12 text-white/80 hover:text-white transition-colors cursor-pointer" fill="currentColor" />
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Generated Copy</h4>
                <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground relative group">
                  <p>Check out our latest feature launch! Perfect for scaling your SaaS product faster than ever. 🚀 #SaaS #Growth</p>
                  <Button size="icon" variant="ghost" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="w-48 space-y-3">
              <Button className="w-full" disabled={selectedVideo?.status !== "Completed"}>
                <Download className="w-4 h-4 mr-2" /> Download MP4
              </Button>
              <Button variant="outline" className="w-full">
                Edit Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
