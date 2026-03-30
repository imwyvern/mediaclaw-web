"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep("code");
    }, 1000);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-24 w-full max-w-xl mx-auto lg:mx-0">
        <div className="flex items-center gap-2 font-bold text-xl mb-12">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <Video size={18} />
          </div>
          MediaClaw
        </div>

        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
            <TabsTrigger value="individual" className="text-sm">Individual</TabsTrigger>
            <TabsTrigger value="enterprise" className="text-sm">Enterprise</TabsTrigger>
          </TabsList>
          
          <TabsContent value="individual">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
                <CardDescription className="text-base">Login or sign up with your phone number.</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {step === "phone" ? (
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex">
                        <span className="flex items-center justify-center px-4 border border-r-0 border-input rounded-l-md bg-muted text-muted-foreground text-sm">
                          +86
                        </span>
                        <Input 
                          id="phone" 
                          type="tel" 
                          placeholder="138 0000 0000" 
                          className="rounded-l-none text-lg h-12"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 text-base mt-2" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Send SMS Code"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="code">Verification Code</Label>
                        <button 
                          type="button" 
                          onClick={() => setStep("phone")}
                          className="text-sm text-primary hover:underline"
                        >
                          Change number
                        </button>
                      </div>
                      <Input 
                        id="code" 
                        type="text" 
                        placeholder="000000" 
                        className="text-center text-2xl tracking-[0.5em] h-14 font-mono"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 text-base mt-2" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Verify & Login"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enterprise">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-3xl font-bold tracking-tight">Enterprise Login</CardTitle>
                <CardDescription className="text-base">Sign in with SSO or corporate email.</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input id="email" type="email" placeholder="name@company.com" className="h-12" required />
                  </div>
                  <Button type="submit" className="w-full h-12 text-base mt-2">
                    Continue with Email
                  </Button>
                </form>
                
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full h-12 text-base">
                  Single Sign-On (SSO)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="hidden lg:flex bg-primary/5 flex-col justify-between p-12 border-l relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div />
        <div className="max-w-md mx-auto relative z-10">
          <blockquote className="space-y-6">
            <p className="text-3xl font-medium leading-snug tracking-tight">
              "MediaClaw reduced our video processing pipeline costs by 40% while doubling our output speed. The API is a joy to work with."
            </p>
            <footer className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-muted border overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-semibold">Sarah Jenkins</div>
                <div className="text-sm text-muted-foreground">CTO at StreamFlix</div>
              </div>
            </footer>
          </blockquote>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground z-10">
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}
