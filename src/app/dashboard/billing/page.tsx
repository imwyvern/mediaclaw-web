"use client";

import { CreditCard, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const ORDERS = [
  { id: "ORD-2026-032", date: "2026-03-20", plan: "Pro Pack (1000 Credits)", amount: "¥199", status: "Paid" },
  { id: "ORD-2026-015", date: "2026-02-15", plan: "Starter Pack (100 Credits)", amount: "¥29", status: "Paid" },
  { id: "ORD-2026-004", date: "2026-01-05", plan: "Scale Pack (5000 Credits)", amount: "¥499", status: "Failed" },
];

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Credits</h1>
        <p className="text-muted-foreground">Manage your API credits and view payment history.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-gradient-to-br from-background to-muted/50 border-primary/20">
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>Credits are consumed per video generation based on duration and resolution.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <div className="text-5xl font-extrabold text-primary flex items-baseline gap-2">
                  482 <span className="text-xl text-muted-foreground font-medium">Credits</span>
                </div>
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 mr-2" /> 
                  Will automatically top-up when below 100 credits.
                </div>
              </div>
              <div className="w-full sm:w-1/2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usage this month</span>
                  <span className="font-medium">518 / 1000</span>
                </div>
                <Progress value={51.8} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Default method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-3 border rounded-lg bg-card">
              <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-bold italic">
                VISA
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/28</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">Update Payment Method</Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Top-up Credits</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <div className="mt-2 text-3xl font-bold">¥29</div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 font-medium text-lg mb-4">
                <Zap className="w-5 h-5 text-primary" /> 100 Credits
              </div>
              <p className="text-sm text-muted-foreground">Perfect for testing and small projects.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Buy Once</Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col border-primary relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
              POPULAR
            </div>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <div className="mt-2 text-3xl font-bold">¥199</div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 font-medium text-lg mb-4">
                <Zap className="w-5 h-5 text-primary" /> 1,000 Credits
              </div>
              <p className="text-sm text-muted-foreground">~15% discount. Best for active creators.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Buy Pro Pack</Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Scale</CardTitle>
              <div className="mt-2 text-3xl font-bold">¥499</div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 font-medium text-lg mb-4">
                <Zap className="w-5 h-5 text-primary" /> 5,000 Credits
              </div>
              <p className="text-sm text-muted-foreground">~30% discount. For serious volume.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Buy Scale Pack</Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <div className="mt-2 text-3xl font-bold">¥1299</div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 font-medium text-lg mb-4">
                <Zap className="w-5 h-5 text-primary" /> 20,000 Credits
              </div>
              <p className="text-sm text-muted-foreground">Highest volume discount available.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Invoices and receipts for past purchases.</CardDescription>
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
