"use client";

import { useState } from "react";
import { Check, CreditCard, Download, Zap, BarChart3, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const PLANS = [
  {
    name: "Free",
    price: "0",
    description: "For individuals starting out",
    features: ["2 videos / month", "720p resolution", "Basic templates", "MediaClaw watermark"],
    current: false,
  },
  {
    name: "Pro",
    price: "199",
    description: "For content creators",
    features: ["50 videos / month", "1080p resolution", "Premium templates", "No watermark", "Priority rendering"],
    current: true,
  },
  {
    name: "Business",
    price: "899",
    description: "For teams and agencies",
    features: ["500 videos / month", "4K resolution", "Custom branding", "Team collaboration", "API access", "24/7 support"],
    current: false,
  },
];

const INVOICES = [
  { id: "INV-2026-003", date: "Mar 1, 2026", amount: "￥199.00", status: "Paid" },
  { id: "INV-2026-002", date: "Feb 1, 2026", amount: "￥199.00", status: "Paid" },
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: "￥199.00", status: "Paid" },
];

export default function SubscriptionPage() {
  const [autoRenew, setAutoRenew] = useState(true);

  const handleToggleAutoRenew = (val: boolean) => {
    setAutoRenew(val);
    toast.success(val ? "Auto-renewal enabled" : "Auto-renewal disabled");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription & Billing</h1>
        <p className="text-muted-foreground">Manage your plan, usage, and billing history.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>You are currently on the Pro plan.</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10 border-none px-3">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Usage</span>
                  <span className="font-medium">32 / 50 videos</span>
                </div>
                <Progress value={64} className="h-2" />
                <p className="text-[10px] text-muted-foreground">Next reset on April 1, 2026</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Storage Usage</span>
                  <span className="font-medium">4.2 GB / 20 GB</span>
                </div>
                <Progress value={21} className="h-2" />
                <p className="text-[10px] text-muted-foreground">42 videos stored</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border shadow-sm">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Next payment of ￥199.00</p>
                  <p className="text-xs text-muted-foreground">Due on April 1, 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Auto-renewal</span>
                <Switch checked={autoRenew} onCheckedChange={handleToggleAutoRenew} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/30 px-6 py-4 flex justify-between">
            <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">
              Cancel Subscription
            </Button>
            <Button className="gap-2">
              <Zap className="w-4 h-4" /> Upgrade to Business
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Your primary payment method.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg flex items-center gap-4">
              <div className="w-12 h-8 bg-muted rounded flex items-center justify-center font-bold text-[10px] tracking-widest italic">
                VISA
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">•••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/28</p>
              </div>
              <Badge variant="outline" className="text-[10px]">Primary</Badge>
            </div>
            <Button variant="outline" className="w-full text-xs h-9">Update Payment Method</Button>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              <span>Payments are processed securely via Stripe. Your card information never touches our servers.</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Available Plans</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <Card key={plan.name} className={`relative flex flex-col ${plan.current ? "border-primary ring-1 ring-primary" : ""}`}>
                {plan.current && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3">Current Plan</Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="text-xs min-h-[32px]">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">￥{plan.price}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs">
                        <Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={plan.current ? "secondary" : "outline"} 
                    className="w-full h-9 text-xs" 
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : plan.price === "0" ? "Switch to Free" : "Upgrade Plan"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Billing History</h2>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-10 text-xs">Invoice</TableHead>
                    <TableHead className="h-10 text-xs text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {INVOICES.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="py-3">
                        <div className="font-medium text-xs">{invoice.id}</div>
                        <div className="text-[10px] text-muted-foreground">{invoice.date} • {invoice.amount}</div>
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
