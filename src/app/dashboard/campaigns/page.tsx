"use client";

import { useState } from "react";
import { Plus, Target, Calendar, BarChart2, ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/empty-state";

const CAMPAIGNS = [
  { id: "1", name: "Summer Sale 2026", brand: "Acme Corp", status: "Active", progress: 65, totalVideos: 24, completed: 16, startDate: "2026-06-01", platforms: ["TikTok", "Instagram"] },
  { id: "2", name: "Product Launch v2", brand: "Global Inc", status: "Scheduled", progress: 0, totalVideos: 8, completed: 0, startDate: "2026-04-15", platforms: ["YouTube", "Twitter"] },
  { id: "3", name: "Q1 Retargeting", brand: "Acme Corp", status: "Completed", progress: 100, totalVideos: 45, completed: 45, startDate: "2026-01-10", platforms: ["Instagram", "Facebook"] },
];

export default function CampaignsPage() {
  const [loading, setLoading] = useState(false);

  if (CAMPAIGNS.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground">Orchestrate multi-video marketing flows automatically.</p>
          </div>
          <Button><Plus className="w-4 h-4 mr-2" /> New Campaign</Button>
        </div>
        <EmptyState 
          icon={Rocket}
          title="No campaigns yet"
          description="Create a campaign to automate video generation for your brand launches or sales events."
          actionLabel="Create First Campaign"
          onAction={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Orchestrate multi-video marketing flows automatically.</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> New Campaign</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {CAMPAIGNS.map((campaign) => (
          <Card key={campaign.id} className="flex flex-col cursor-pointer hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="bg-background">
                  {campaign.brand}
                </Badge>
                <Badge variant={
                  campaign.status === "Active" ? "default" : 
                  campaign.status === "Scheduled" ? "secondary" : "outline"
                }>
                  {campaign.status}
                </Badge>
              </div>
              <CardTitle className="text-xl">{campaign.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 pb-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Generation Progress</span>
                  <span className="font-medium">{campaign.completed} / {campaign.totalVideos} Videos</span>
                </div>
                <Progress value={campaign.progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                <div>
                  <div className="text-muted-foreground flex items-center mb-1"><Calendar className="w-3.5 h-3.5 mr-1" /> Start Date</div>
                  <div className="font-medium">{campaign.startDate}</div>
                </div>
                <div>
                  <div className="text-muted-foreground flex items-center mb-1"><Target className="w-3.5 h-3.5 mr-1" /> Platforms</div>
                  <div className="font-medium truncate">{campaign.platforms.join(", ")}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="ghost" className="w-full text-primary justify-between group">
                View Details 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        <Card className="flex flex-col border-dashed bg-muted/20 items-center justify-center text-center p-6 min-h-[300px] hover:bg-muted/40 transition-colors cursor-pointer group" onClick={() => {}}>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="mb-2">Create Campaign</CardTitle>
          <CardDescription className="max-w-[200px]">
            Start a new automated video generation workflow.
          </CardDescription>
        </Card>
      </div>
    </div>
  );
}
