"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Activity, ShieldAlert, Users, Server, Settings2, CheckCircle2, AlertCircle, Database, ListChecks } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/empty-state";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" /> 
            Restricted access. All actions are logged.
          </p>
        </div>
      </div>

      <Tabs defaultValue="clients" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="clients" className="gap-2"><Users className="w-4 h-4" /> Clients</TabsTrigger>
          <TabsTrigger value="system" className="gap-2"><Activity className="w-4 h-4" /> System</TabsTrigger>
          <TabsTrigger value="config" className="gap-2"><Settings2 className="w-4 h-4" /> Config</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>Manage client accounts and subscription tiers.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Video Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: "Acme Corp", plan: "Enterprise", videos: 1240, status: "Active", joined: "2025-10-24" },
                    { name: "Global Inc", plan: "Pro", videos: 562, status: "Active", joined: "2025-11-12" },
                    { name: "Alpha Startups", plan: "Starter", videos: 45, status: "Suspended", joined: "2026-01-05" },
                  ].map((org) => (
                    <TableRow key={org.name}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell><Badge variant="outline">{org.plan}</Badge></TableCell>
                      <TableCell>{org.videos}</TableCell>
                      <TableCell>
                        <Badge className={org.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}>
                          {org.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{org.joined}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Health</CardTitle>
                < Server className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.98%</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Operational
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Worker Queue</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142</div>
                <p className="text-xs text-muted-foreground mt-1">Pending render tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
                <Database className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78.4%</div>
                <Progress value={78.4} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Real-time audit trail of system events.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 font-mono text-xs">
                {[
                  { time: "2026-03-29 10:45:12", event: "Worker #04 started job mc_8f22", level: "INFO" },
                  { time: "2026-03-29 10:44:55", event: "User login: admin@acme.com", level: "AUTH" },
                  { time: "2026-03-29 10:42:01", event: "Storage threshold exceeded on node-01", level: "WARN" },
                ].length > 0 ? [
                  { time: "2026-03-29 10:45:12", event: "Worker #04 started job mc_8f22", level: "INFO" },
                  { time: "2026-03-29 10:44:55", event: "User login: admin@acme.com", level: "AUTH" },
                  { time: "2026-03-29 10:42:01", event: "Storage threshold exceeded on node-01", level: "WARN" },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 border-l-2 pl-4 border-muted">
                    <span className="text-muted-foreground">{log.time}</span>
                    <span className={log.level === "WARN" ? "text-orange-500 font-bold" : "text-blue-500"}>[{log.level}]</span>
                    <span>{log.event}</span>
                  </div>
                )) : (
                  <EmptyState 
                    icon={ListChecks}
                    title="No system logs"
                    description="System audit logs will appear here as events occur."
                    className="border-none py-12"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Configuration</CardTitle>
              <CardDescription>System-wide settings affecting all organizations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxJobs">Max Concurrent Jobs</Label>
                  <Input id="maxJobs" type="number" defaultValue={50} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defCredits">Default New Org Credits</Label>
                  <Input id="defCredits" type="number" defaultValue={100} />
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Maintenance Mode</div>
                    <div className="text-sm text-muted-foreground">Disable all public API access and frontends.</div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatic Backups</div>
                    <div className="text-sm text-muted-foreground">Snapshot database and storage daily.</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-between">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Changes take effect immediately across all nodes.
              </p>
              <Button>Save Config</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
