"use client";

import { Zap, CheckCircle2, AlertCircle, ReceiptText, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExportDialog, ExportConfig } from "@/components/export-dialog";
import { MetadataUpdater } from "@/components/metadata-updater";
import Link from "next/link";

const PACKS = [
  { id: "trial", name: "体验包", videos: 1, price: "9.9", description: "快速尝试 AI 视频生产效果。" },
  { id: "single", name: "单条包", videos: 1, price: "29", description: "单次按需购买，灵活便捷。" },
  { id: "pack_10", name: "进阶包", videos: 10, price: "199", description: "适合个人博主或小型工作室。", popular: true },
  { id: "pack_30", name: "专业包", videos: 30, price: "499", description: "更高的性价比，满足日常需求。" },
  { id: "pack_100", name: "企业包", videos: 100, price: "1299", description: "大批量生产首选，单价最低。" },
];

const ORDERS = [
  { id: "ORD-2026-032", date: "2026-03-20", plan: "Pro Pack (1000 Credits)", amount: "¥199", status: "Paid" },
  { id: "ORD-2026-015", date: "2026-02-15", plan: "Starter Pack (100 Credits)", amount: "¥29", status: "Paid" },
  { id: "ORD-2026-004", date: "2026-01-05", plan: "Scale Pack (5000 Credits)", amount: "¥499", status: "Failed" },
];

export default function BillingPage() {
  const handleExportOrders = async (config: ExportConfig) => {
    console.log("Exporting orders with config:", config);
    return new Promise<void>(resolve => setTimeout(resolve, 2000));
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <MetadataUpdater title="账单与算力" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Credits</h1>
        <p className="text-muted-foreground">Manage your production capacity and view payment history.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-gradient-to-br from-background to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Current Capacity</CardTitle>
            <CardDescription>Video credits are consumed per successful generation.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <div className="text-5xl font-extrabold text-primary flex items-baseline gap-2">
                  42 <span className="text-xl text-muted-foreground font-medium text-primary/60">Videos</span>
                </div>
                <div className="mt-4 flex items-center text-xs text-muted-foreground bg-primary/5 p-2 rounded-md border border-primary/10">
                  <Zap className="w-3.5 h-3.5 mr-2 text-primary fill-primary" /> 
                  Standard rendering (1080p) enabled for all packs.
                </div>
              </div>
              <div className="w-full sm:w-1/2 space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Usage this month</span>
                  <span>18 / 60</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-3 border rounded-lg bg-card">
              <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-white text-[10px] font-bold italic">
                VISA
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">•••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/28</p>
              </div>
            </div>
            <Button variant="outline" className="w-full text-xs">Update Method</Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Top-up Video Packs</h2>
          <Badge variant="secondary">PRD v1.6 Pricing</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PACKS.map((pack) => (
            <Card key={pack.id} className={`flex flex-col relative transition-all hover:shadow-lg ${pack.popular ? "border-primary ring-1 ring-primary/20 shadow-md" : ""}`}>
              {pack.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-bl-md uppercase tracking-tighter">
                  Popular
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground uppercase font-black tracking-widest">{pack.name}</CardTitle>
                <div className="mt-2 text-3xl font-black">¥{pack.price}</div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="flex items-center gap-2 font-bold text-lg mb-2 text-primary">
                  <Play className="w-4 h-4 fill-primary" /> {pack.videos} {pack.videos === 1 ? 'Video' : 'Videos'}
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">{pack.description}</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href={`/dashboard/billing/checkout?pack=${pack.id}`} className="w-full">
                  <Button variant={pack.popular ? "default" : "outline"} className="w-full font-bold">
                    Buy Pack
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Order History</CardTitle>
            <CardDescription>Invoices and receipts for past purchases.</CardDescription>
          </div>
          <ExportDialog 
            title="Export Invoices" 
            description="Export your billing history and tax invoices."
            onExport={handleExportOrders}
            trigger={<Button variant="outline" size="sm"><ReceiptText className="w-4 h-4 mr-2" /> Export History</Button>}
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Plan / Credits</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ORDERS.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.plan}</TableCell>
                  <TableCell className="font-medium">{order.amount}</TableCell>
                  <TableCell>
                    {order.status === "Paid" ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">
                        <AlertCircle className="w-3 h-3 mr-1" /> Failed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" disabled={order.status !== "Paid"}>Invoice</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
