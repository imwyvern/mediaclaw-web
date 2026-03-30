"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/lib/store";
import { AuthAPI } from "@/lib/api";
import { toast } from "sonner";

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Enterprise fields
  const [companyName, setCompanyName] = useState("");
  const [adminName, setAdminName] = useState("");

  const login = useAuthStore((state) => state.login);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    if (!agreeTerms) {
      toast.error("Please agree to the Terms of Service.");
      return;
    }
    setIsLoading(true);
    // Simulate sending SMS
    setTimeout(() => {
      setIsLoading(false);
      setStep("code");
      toast.success("Verification code sent!");
    }, 1000);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setIsLoading(true);
    
    try {
      // Simulate API call
      // const res = await AuthAPI.login(phone, code);
      // login(res.data.user, res.data.token);
      
      // Mock login success
      setTimeout(() => {
        login({ id: "1", name: "Admin", email: "admin@acme.com", phone, role: "admin" }, "mock-jwt-token");
        setIsLoading(false);
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const handleEnterpriseRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !phone || !adminName) return;
    if (!agreeTerms) {
      toast.error("Please agree to the Terms of Service.");
      return;
    }
    setIsLoading(true);
    try {
      // await AuthAPI.registerEnterprise({ companyName, phone, adminName });
      setTimeout(() => {
        setIsLoading(false);
        toast.success("Registration submitted! Our team will contact you shortly.");
      }, 1500);
    } catch (err) {
      setIsLoading(false);
    }
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
            <TabsTrigger value="individual" className="text-sm">个人登录</TabsTrigger>
            <TabsTrigger value="enterprise" className="text-sm">企业注册</TabsTrigger>
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
                    
                    <div className="flex items-center space-x-2 py-2">
                      <Checkbox id="terms1" checked={agreeTerms} onCheckedChange={(c) => setAgreeTerms(c as boolean)} />
                      <label htmlFor="terms1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground">
                        I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                      </label>
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
                <CardTitle className="text-3xl font-bold tracking-tight">Enterprise Registration</CardTitle>
                <CardDescription className="text-base">Apply for an enterprise workspace.</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <form onSubmit={handleEnterpriseRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Corp" className="h-12" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Admin Name</Label>
                    <Input id="adminName" value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="John Doe" className="h-12" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ent-phone">Contact Phone</Label>
                    <Input id="ent-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="138 0000 0000" className="h-12" required />
                  </div>

                  <div className="flex items-center space-x-2 py-2">
                    <Checkbox id="terms2" checked={agreeTerms} onCheckedChange={(c) => setAgreeTerms(c as boolean)} />
                    <label htmlFor="terms2" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground">
                      I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                    </label>
                  </div>

                  <Button type="submit" className="w-full h-12 text-base mt-2" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Submit Application"}
                  </Button>
                </form>
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
