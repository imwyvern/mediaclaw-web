"use client";

import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  LayoutGrid, 
  Settings, 
  Film, 
  Upload, 
  Plus, 
  MoreHorizontal, 
  Image as ImageIcon,
  TrendingUp,
  Activity,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
import { MetadataUpdater } from "@/components/metadata-updater";

export default function BrandDetailPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8">
      <MetadataUpdater title="品牌详情" />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-12 h-12 bg-primary/10 text-primary font-bold flex items-center justify-center rounded-xl border border-primary/20">
          AC
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Acme Corp</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">Technology</Badge>
            <span>•</span>
            <span>Created Oct 24, 2025</span>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline"><Upload className="w-4 h-4 mr-2" /> Upload Assets</Button>
          <Button><Plus className="w-4 h-4 mr-2" /> New Video</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="gap-2"><Activity className="w-4 h-4" /> Overview</TabsTrigger>
          <TabsTrigger value="assets" className="gap-2"><ImageIcon className="w-4 h-4" /> Assets</TabsTrigger>
          <TabsTrigger value="videos" className="gap-2"><Film className="w-4 h-4" /> Videos</TabsTrigger>
          <TabsTrigger value="settings" className="gap-2"><Settings className="w-4 h-4" /> Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                <Film className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,240</div>
                <p className="text-xs text-emerald-500 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" /> +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Pipelines</CardTitle>
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground mt-1">Standard Workflows</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.4%</div>
                <p className="text-xs text-muted-foreground mt-1">Based on last 500 renders</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Video Rendered", name: "Product_Showcase_v2.mp4", time: "2 hours ago" },
                  { action: "Asset Uploaded", name: "New_Logo_Dark.svg", time: "5 hours ago" },
                  { action: "Campaign Started", name: "Q3 Retargeting", time: "1 day ago" },
                ].map((act, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                    <div className="flex gap-4 items-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div>
                        <span className="font-medium">{act.action}:</span>
                        <span className="ml-2 text-muted-foreground">{act.name}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{act.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Logo_Primary.png", type: "IMAGE" },
              { name: "Brand_Guidelines.pdf", type: "DOC" },
              { name: "Intro_Sequence.mov", type: "VIDEO" },
              { name: "Font_Bold.ttf", type: "FONT" },
            ].map((asset, i) => (
              <Card key={i} className="group cursor-pointer hover:border-primary transition-colors overflow-hidden">
                <div className="aspect-square bg-muted flex items-center justify-center relative">
                  <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:scale-110 transition-transform" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-xs font-bold truncate mb-1">{asset.name}</div>
                  <Badge variant="outline" className="text-[10px] h-4 px-1">{asset.type}</Badge>
                </div>
              </Card>
            ))}
            <button className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-xs font-medium">Add Asset</span>
            </button>
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <EmptyState 
            icon={Film}
            title="No videos for this brand"
            description="Start generating content by choosing a template or pipeline."
            actionLabel="Create First Video"
            onAction={() => {}}
          />
        </TabsContent>

        <TabsContent value="settings" className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Brand Settings</CardTitle>
              <CardDescription>Update your brand workspace details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input id="brandName" defaultValue="Acme Corp" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" defaultValue="Technology" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://acme.com" />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
