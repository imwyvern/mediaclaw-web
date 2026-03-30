"use client";

import { useState } from "react";
import { Briefcase, Plus, MoreHorizontal, LayoutGrid, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const MOCK_BRANDS = [
  { id: "1", name: "Acme Corp", category: "Technology", pipelines: 4, videos: 124, logo: "AC" },
  { id: "2", name: "Global Inc", category: "E-Commerce", pipelines: 2, videos: 56, logo: "GI" },
  { id: "3", name: "Alpha Startups", category: "Marketing", pipelines: 1, videos: 12, logo: "AS" },
];

export default function BrandsPage() {
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<typeof MOCK_BRANDS>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useState(() => {
    const timer = setTimeout(() => {
      setBrands(MOCK_BRANDS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
          <p className="text-muted-foreground">Manage your clients, workspaces, and brand identities.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger>
            <Button><Plus className="w-4 h-4 mr-2" /> New Brand</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Brand</DialogTitle>
              <DialogDescription>Setup a new workspace with distinct assets and pipelines.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name</Label>
                <Input id="name" placeholder="e.g. MediaClaw" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="e.g. SaaS, E-Commerce" />
              </div>
              <div className="space-y-2">
                <Label>Brand Logo</Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <p className="text-sm">Click to upload logo</p>
                  <p className="text-xs">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsCreateOpen(false)}>Create Brand</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="pb-4">
                <Skeleton className="h-12 w-12 rounded-lg mb-2" />
                <Skeleton className="h-6 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="mt-auto">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : brands.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <Card key={brand.id} className="flex flex-col relative group">
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit Settings</DropdownMenuItem>
                    <DropdownMenuItem>Manage Assets</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete Brand</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 text-primary font-bold flex items-center justify-center rounded-xl mb-4 border border-primary/20">
                  {brand.logo}
                </div>
                <CardTitle className="text-xl">{brand.name}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary" className="font-normal mt-1">{brand.category}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-1">Pipelines</span>
                    <span className="font-medium flex items-center"><LayoutGrid className="w-3.5 h-3.5 mr-1" /> {brand.pipelines}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-1">Videos</span>
                    <span className="font-medium flex items-center"><Briefcase className="w-3.5 h-3.5 mr-1" /> {brand.videos}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full">View Workspace</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl border-dashed bg-muted/20">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No brands yet</h3>
          <p className="text-muted-foreground max-w-md mb-8">
            Create brands to organize your content pipelines, isolate assets, and manage client workspaces separately.
          </p>
          <Button size="lg" onClick={() => setIsCreateOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Your First Brand</Button>
        </div>
      )}
    </div>
  );
}
