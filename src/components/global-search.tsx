"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Film, 
  Briefcase, 
  Target, 
  ArrowRight,
  History
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const results = query ? [
    { id: "v1", name: "Summer Campaign 2026", type: "video", category: "Videos" },
    { id: "v2", name: "Brand Intro Final", type: "video", category: "Videos" },
    { id: "b1", name: "Acme Corp", type: "brand", category: "Brands" },
    { id: "c1", name: "Product Launch", type: "campaign", category: "Campaigns" },
  ].filter(i => i.name.toLowerCase().includes(query.toLowerCase())) : [];

  const handleSelect = (type: string, id: string) => {
    setOpen(false);
    setQuery("");
    if (type === "video") router.push(`/dashboard/videos/${id}`);
    if (type === "brand") router.push(`/dashboard/brands/${id}`);
    if (type === "campaign") router.push(`/dashboard/campaigns`);
  };

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 border rounded-lg hover:bg-muted hover:text-foreground transition-colors w-full max-w-[240px]"
      >
        <Search className="w-4 h-4" />
        <span>搜索...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden border-none shadow-2xl">
          <div className="flex items-center border-b px-4 h-14">
            <Search className="mr-2 h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              className="flex h-full w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="搜索视频、品牌、营销活动..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <Button variant="ghost" size="sm" onClick={() => setQuery("")} className="h-8 px-2 text-xs">清除</Button>
            )}
          </div>
          <ScrollArea className="max-h-[400px] p-2">
            {!query ? (
              <div className="p-4 space-y-4">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">最近搜索</div>
                <div className="space-y-1">
                  {["Q3 视频", "Acme", "2026 计划"].map((q) => (
                    <button 
                      key={q}
                      onClick={() => setQuery(q)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <History className="w-4 h-4 text-muted-foreground" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="p-2 space-y-4">
                {["Videos", "Brands", "Campaigns"].map(cat => {
                  const catResults = results.filter(r => r.category === cat);
                  if (catResults.length === 0) return null;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 py-2">{cat}</div>
                      {catResults.map(r => (
                        <button
                          key={r.id}
                          onClick={() => handleSelect(r.type, r.id)}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            {r.type === "video" && <Film className="w-4 h-4" />}
                            {r.type === "brand" && <Briefcase className="w-4 h-4" />}
                            {r.type === "campaign" && <Target className="w-4 h-4" />}
                            <span>{r.name}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <p>未找到与 &quot;{query}&quot; 相关的结果</p>
              </div>
            )}
          </ScrollArea>
          <div className="flex items-center justify-between border-t px-4 h-10 bg-muted/30 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><kbd className="rounded border bg-background px-1">↵</kbd> 选择</span>
              <span className="flex items-center gap-1"><kbd className="rounded border bg-background px-1">↑↓</kbd> 导航</span>
            </div>
            <span>MediaClaw Search</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
