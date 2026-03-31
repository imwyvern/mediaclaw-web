"use client";

import { useEffect, useState } from "react";
import { Briefcase, Plus, MoreHorizontal, LayoutGrid, Image as ImageIcon, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import Link from "next/link";
import { MetadataUpdater } from "@/components/metadata-updater";
import { api, Brand } from "@/lib/api";
import { toast } from "sonner";

export default function BrandsPage() {
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: "", category: "" });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await api.brand.list();
      setBrands(res.data);
    } catch (err) {
      console.error("Failed to fetch brands:", err);
      // Fallback mock if needed for development
      setBrands([
        { id: "1", name: "Acme Corp", category: "Technology", pipelines: 4, videos: 124, logo: "AC" },
        { id: "2", name: "Global Inc", category: "E-Commerce", pipelines: 2, videos: 56, logo: "GI" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreateBrand = async () => {
    if (!newBrand.name) {
      toast.error("Please enter a brand name");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.brand.create(newBrand);
      toast.success("Brand created successfully");
      setIsCreateOpen(false);
      setNewBrand({ name: "", category: "" });
      fetchBrands();
    } catch (err) {
      toast.error("Failed to create brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <MetadataUpdater title="品牌管理" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
          <p className="text-muted-foreground">Manage your clients, workspaces, and brand identities.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={<Button className="gap-2"><Plus className="w-4 h-4" /> New Brand</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Brand</DialogTitle>
              <DialogDescription>Setup a new workspace with distinct assets and pipelines.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. MediaClaw" 
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  placeholder="e.g. SaaS, E-Commerce" 
                  value={newBrand.category}
                  onChange={(e) => setNewBrand({ ...newBrand, category: e.target.value })}
                />
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
              <Button onClick={handleCreateBrand} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Brand
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading && brands.length === 0 ? (
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
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />}>
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem render={<Link href={`/dashboard/brands/${brand.id}`} />}>
                      Edit Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>Manage Assets</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete Brand</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 text-primary font-bold flex items-center justify-center rounded-xl mb-4 border border-primary/20 uppercase">
                  {brand.logo || brand.name.substring(0, 2)}
                </div>
                <CardTitle className="text-xl truncate">{brand.name}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary" className="font-normal mt-1">{brand.category}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-1 text-xs uppercase font-bold tracking-wider">Pipelines</span>
                    <span className="font-medium flex items-center"><LayoutGrid className="w-3.5 h-3.5 mr-1" /> {brand.pipelines}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-1 text-xs uppercase font-bold tracking-wider">Videos</span>
                    <span className="font-medium flex items-center"><Briefcase className="w-3.5 h-3.5 mr-1" /> {brand.videos}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full" render={<Link href={`/dashboard/brands/${brand.id}`} />}>
                  View Workspace
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={Building2}
          title="No brands yet"
          description="Create brands to organize your content pipelines, isolate assets, and manage client workspaces separately."
          actionLabel="Add Your First Brand"
          onAction={() => setIsCreateOpen(true)}
        />
      )}
    </div>
  );
}

