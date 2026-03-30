import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Film, Activity, Users, Plus, Upload, MoreHorizontal } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Monitor your content delivery and workspace metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Plus className="w-4 h-4 mr-2" /> New Project</Button>
          <Button><Upload className="w-4 h-4 mr-2" /> Upload Video</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground mt-1 text-emerald-500 font-medium">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth (30d)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.4 TB</div>
            <p className="text-xs text-muted-foreground mt-1 text-emerald-500 font-medium">+18% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Viewers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2K</div>
            <p className="text-xs text-muted-foreground mt-1 text-emerald-500 font-medium">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.012%</div>
            <p className="text-xs text-muted-foreground mt-1">-0.004% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Bandwidth Usage</CardTitle>
            <CardDescription>Daily bandwidth consumption across all CDNs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end gap-2 pt-6">
              {/* Dummy chart bars */}
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="flex-1 bg-primary/20 hover:bg-primary transition-colors rounded-t-sm" style={{ height: `${Math.max(20, Math.random() * 100)}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
            <CardDescription>Latest processed videos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: "Product_Demo_Final.mp4", status: "Ready", time: "2 hours ago", dur: "04:12" },
                { name: "Interview_Raw_Cam1.mov", status: "Processing", time: "5 hours ago", dur: "--:--" },
                { name: "Tutorial_Setup.mp4", status: "Ready", time: "1 day ago", dur: "12:45" },
                { name: "Social_Ad_Campaign.mp4", status: "Failed", time: "2 days ago", dur: "00:30" }
              ].map((video, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mr-4">
                    <Film className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <p className="text-sm font-medium leading-none truncate">{video.name}</p>
                    <p className="text-xs text-muted-foreground">{video.time} • {video.dur}</p>
                  </div>
                  <Badge variant={
                    video.status === "Ready" ? "default" : 
                    video.status === "Processing" ? "secondary" : 
                    "destructive"
                  } className="ml-auto">
                    {video.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Manage keys used to authenticate API requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Production Website</TableCell>
                <TableCell><Badge>Production</Badge></TableCell>
                <TableCell className="text-muted-foreground">Oct 24, 2025</TableCell>
                <TableCell className="text-muted-foreground">Just now</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Local Development</TableCell>
                <TableCell><Badge variant="outline">Testing</Badge></TableCell>
                <TableCell className="text-muted-foreground">Nov 12, 2025</TableCell>
                <TableCell className="text-muted-foreground">2 days ago</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
