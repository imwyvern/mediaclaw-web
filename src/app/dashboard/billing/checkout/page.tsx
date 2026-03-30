"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, CreditCard, QrCode, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const PACKS = [
  { id: "pack_1", name: "Small Pack", videos: 10, price: 99, unitPrice: 9.9, popular: false },
  { id: "pack_2", name: "Standard Pack", videos: 50, price: 399, unitPrice: 7.98, popular: true },
  { id: "pack_3", name: "Business Pack", videos: 200, price: 1299, unitPrice: 6.49, popular: false },
  { id: "pack_4", name: "Enterprise Pack", videos: 500, price: 2999, unitPrice: 5.99, popular: false },
];

const ORDER_HISTORY = [
  { id: "ORD-7281", date: "2026-03-15", pack: "Standard Pack", amount: "￥399.00", status: "Paid" },
  { id: "ORD-6192", date: "2026-02-10", pack: "Small Pack", amount: "￥99.00", status: "Paid" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedPack, setSelectedPack] = useState(PACKS[1].id);
  const [step, setStep] = useState<"select" | "pay" | "success">("select");
  const [paymentMethod, setPaymentMethod] = useState<"wechat" | "alipay">("wechat");
  const [isPolling, setIsPolling] = useState(false);

  const orderId = useMemo(() => `MediaClaw_${Math.random().toString(36).substr(2, 9).toUpperCase()}`, []);

  const pack = PACKS.find(p => p.id === selectedPack)!;

  const handleCheckout = () => {
    setStep("pay");
    setIsPolling(true);
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPolling) {
      timeout = setTimeout(() => {
        setIsPolling(false);
        setStep("success");
        toast.success("支付成功！");
      }, 5000); // Simulate 5s polling
    }
    return () => clearTimeout(timeout);
  }, [isPolling]);

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 animate-in zoom-in duration-500">
          <CheckCircle2 size={48} />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">支付成功</h1>
          <p className="text-muted-foreground">您的账户已增加 {pack.videos} 个视频额度。</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/billing")}>查看账单</Button>
          <Button onClick={() => router.push("/dashboard/videos")}>开始制作视频</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => step === "pay" ? setStep("select") : router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Credits</h1>
          <p className="text-muted-foreground">Select a video pack to increase your production capacity.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {step === "select" ? (
            <Card>
              <CardHeader>
                <CardTitle>Select Video Pack</CardTitle>
                <CardDescription>All packs include 1080p rendering and cloud storage.</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPack} onValueChange={setSelectedPack} className="grid gap-4 sm:grid-cols-2">
                  {PACKS.map((p) => (
                    <div key={p.id}>
                      <RadioGroupItem value={p.id} id={p.id} className="peer sr-only" />
                      <Label
                        htmlFor={p.id}
                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all relative"
                      >
                        {p.popular && (
                          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3">Most Popular</Badge>
                        )}
                        <div className="text-center space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">{p.name}</p>
                          <p className="text-3xl font-bold">{p.videos}</p>
                          <p className="text-xs text-muted-foreground">Videos</p>
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-2xl font-bold">￥{p.price}</p>
                          <p className="text-[10px] text-muted-foreground">￥{p.unitPrice}/video</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Secure checkout with 30-day money back guarantee.
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Complete Payment</CardTitle>
                <CardDescription>Scan the QR code below to complete your purchase of {pack.name}.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-10 space-y-8">
                <div className="flex gap-4 p-1 bg-muted rounded-lg">
                  <Button 
                    variant={paymentMethod === "wechat" ? "secondary" : "ghost"} 
                    className="gap-2"
                    onClick={() => setPaymentMethod("wechat")}
                  >
                    <svg className="w-5 h-5 fill-[#07C160]" viewBox="0 0 24 24">
                      <path d="M8.225 3.518c-4.482 0-8.117 3.257-8.117 7.276 0 2.21 1.107 4.183 2.85 5.568-.158.577-1.026 2.05-1.066 2.12-.04.07-.028.163.03.22.035.035.093.06.15.06h.058c.07 0 2.378-.455 3.322-.922.88.243 1.81.378 2.773.378.11 0 .22-.004.332-.01-4.14-.383-7.406-3.418-7.406-7.143 0-3.95 3.69-7.152 8.24-7.152 4.55 0 8.24 3.202 8.24 7.152 0 .546-.07 1.074-.202 1.577 1.07.72 1.83 1.765 2.14 2.96.26-.64.407-1.343.407-2.078 0-5.51-5.188-9.978-11.583-9.978zm10.375 7.97c-3.64 0-6.59 2.645-6.59 5.908 0 1.795.898 3.398 2.314 4.522-.128.47-.833 1.666-.865 1.723-.033.056-.023.132.025.178.028.028.075.048.122.048h.047c.057 0 1.93-.37 2.698-.75.714.198 1.47.307 2.25.307 3.64 0 6.59-2.645 6.59-5.908s-2.95-5.908-6.59-5.908z"/>
                    </svg>
                    WeChat Pay
                  </Button>
                  <Button 
                    variant={paymentMethod === "alipay" ? "secondary" : "ghost"} 
                    className="gap-2"
                    onClick={() => setPaymentMethod("alipay")}
                  >
                    <svg className="w-5 h-5 fill-[#00A1E9]" viewBox="0 0 24 24">
                      <path d="M11.663 15.038c-1.282.025-2.52.128-3.702.327-.923.153-1.85.34-2.774.568l.244-1.12c.07-.34.133-.68.188-1.026h4.636c.143 0 .26-.11.26-.255v-.954a.26.26 0 00-.26-.26H6.17c.218-1.042.482-2.062.793-3.052h5.45c.144 0 .262-.112.262-.257V8.043a.26.26 0 00-.262-.262h-4.9c.28-.795.59-1.57.925-2.315.064-.144.004-.316-.135-.395l-1.04-.59a.25.25 0 00-.337.086c-.443.832-.862 1.72-1.25 2.66-.026.062-.054.125-.084.188l-.004.01c-.134.33-.263.665-.386 1.004-.012.032-.023.064-.035.097L3.4 8.526a.258.258 0 00-.096.347l.564 1.056c.07.133.24.185.378.118l.85-.41c-.266.86-.5 1.76-.7 2.684H2.433a.256.256 0 00-.256.256v.954c0 .142.115.255.256.255H4.11c-.114.62-.206 1.257-.272 1.902C2.792 16.35 2 17.15 2 18.232c0 1.583 1.724 2.21 3.518 2.21 2.372 0 4.67-.807 6.474-2.274l1.378 1.488c.1.107.266.113.376.012l.745-.69a.258.258 0 00.012-.375l-2.84-2.573zm-4.72 1.923c.535-.1 1.077-.184 1.62-.254 1.076.996 2.365 1.67 3.79 1.956-1.543.812-3.328 1.25-5.18 1.25-1.124 0-2.12-.34-2.12-.962 0-.348.167-.655.394-.906.197-.216.596-.547 1.496-1.084zM22 10.43c0-.142-.115-.255-.256-.255h-8.08c-.143 0-.257.113-.257.255v.954c0 .142.114.256.257.256h2.72c-.417 1.096-.983 2.146-1.685 3.123-1.053-.872-1.95-1.875-2.664-2.986l-.013-.02a.262.262 0 00-.41-.044l-.815.793a.253.253 0 00-.022.35c.784 1.134 1.742 2.17 2.85 3.085-1.343.834-2.956 1.464-4.75 1.834a.262.262 0 00-.205.3l.135 1.1c.018.14.148.243.288.225 3.16-.416 5.86-1.854 7.68-3.957 1.18 1.282 2.653 2.348 4.363 3.126.133.06.29.004.354-.127l.515-1.066a.262.262 0 00-.11-.343c-1.554-.73-2.887-1.703-3.965-2.87 1.104-1.385 1.968-2.964 2.544-4.685H21.74c.142 0 .257-.114.257-.256v-.954z"/>
                    </svg>
                    Alipay
                  </Button>
                </div>

                <div className="relative group">
                  <div className="w-64 h-64 bg-white p-4 border rounded-xl shadow-lg flex items-center justify-center">
                    <QrCode className="w-52 h-52 text-foreground" />
                    {isPolling && (
                      <div className="absolute inset-0 bg-white/80 rounded-xl flex flex-col items-center justify-center animate-in fade-in">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
                        <p className="text-sm font-medium">Waiting for payment...</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold">Total: ￥{pack.price}</p>
                  <p className="text-sm text-muted-foreground">Order ID: {orderId}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t bg-muted/50 px-6 py-4">
                <p className="text-xs text-muted-foreground">The page will automatically redirect after payment is completed.</p>
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{pack.name} ({pack.videos} videos)</span>
                <span className="font-medium">￥{pack.price}.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-medium">￥0.00</span>
              </div>
              <div className="pt-4 border-t flex justify-between">
                <span className="font-bold">Total Amount</span>
                <span className="font-bold text-primary">￥{pack.price}.00</span>
              </div>
              {step === "select" && (
                <Button className="w-full h-12 text-lg" onClick={handleCheckout}>Go to Payment</Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableBody>
                  {ORDER_HISTORY.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="py-3">
                        <div className="font-medium text-xs">{order.id}</div>
                        <div className="text-[10px] text-muted-foreground">{order.date}</div>
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <div className="font-medium text-xs">{order.amount}</div>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-green-100 text-green-700 border-none">
                          {order.status}
                        </Badge>
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
