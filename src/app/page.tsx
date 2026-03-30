import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Check, Play, Zap, BarChart3, Video, Layers } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-6 h-16 flex items-center border-b justify-between sticky top-0 bg-background/80 backdrop-blur z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <Video size={18} />
          </div>
          MediaClaw
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
          <Link href="/auth" className="hover:text-primary transition-colors">Enterprise</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/auth">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1.5 font-medium">
            <Zap className="w-3.5 h-3.5 mr-2 text-primary" />
            MediaClaw 2.0 is now live
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight max-w-4xl">
            The Content Infrastructure <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
              For Video First SaaS
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Manage, process, and analyze video content at scale. MediaClaw provides the API and dashboard to empower your application's video capabilities without the overhead.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link href="/auth">
              <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 group">
                Start Building Free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8">
              <Play className="mr-2 w-4 h-4" /> View Demo
            </Button>
          </div>
        </section>

        {/* Feature Showcase */}
        <section id="features" className="py-24 bg-muted/30 border-y">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
            <div className="mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Engineered for Scale</h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                We abstracted the hardest parts of video processing so you can focus on building your core product experience.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background rounded-2xl p-8 border shadow-sm relative overflow-hidden group">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Instant Transcoding</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upload any format and instantly deliver HLS/DASH streams optimized for every network condition.
                </p>
              </div>
              <div className="bg-background rounded-2xl p-8 border shadow-sm relative overflow-hidden group">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Deep Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real-time engagement metrics, retention graphs, and viewer behavior analysis built-in.
                </p>
              </div>
              <div className="bg-background rounded-2xl p-8 border shadow-sm relative overflow-hidden group">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Brand Workspaces</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Multi-tenant architecture allowing you to isolate clients, storage, and configurations effortlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Start for free, scale as you grow. No hidden fees or surprise overages.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>For hobbyists</CardDescription>
                <div className="mt-4 text-4xl font-extrabold">¥0</div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> 10GB Storage</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> 50GB Bandwidth</li>
                  <li className="flex items-center text-muted-foreground"><Check className="w-4 h-4 mr-2" /> Community Support</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">Current Plan</Button>
              </CardFooter>
            </Card>

            {/* Pro */}
            <Card className="flex flex-col border-primary shadow-sm relative">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For creators</CardDescription>
                <div className="mt-4 text-4xl font-extrabold">¥29<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> 100GB Storage</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> 500GB Bandwidth</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Analytics Dashboard</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Upgrade to Pro</Button>
              </CardFooter>
            </Card>

            {/* Business */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Business</CardTitle>
                <CardDescription>For growing teams</CardDescription>
                <div className="mt-4 text-4xl font-extrabold">¥199<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> 1TB Storage</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> 5TB Bandwidth</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Multiple Workspaces</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> API Access</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">Upgrade</Button>
              </CardFooter>
            </Card>

            {/* Scale */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Scale</CardTitle>
                <CardDescription>For production apps</CardDescription>
                <div className="mt-4 text-4xl font-extrabold">¥499<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> 5TB Storage</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> 25TB Bandwidth</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Custom Domain</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Priority Support</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">Upgrade</Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-12 bg-muted/50 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between border">
            <div>
              <h3 className="text-xl font-bold mb-2">Need more power? (¥1299+)</h3>
              <p className="text-muted-foreground">Custom SLAs, dedicated infrastructure, and volume discounts available for enterprise.</p>
            </div>
            <Button className="mt-6 md:mt-0" size="lg" variant="secondary">Contact Sales</Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/20 text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-foreground mb-4 md:mb-0">
            <Video size={16} /> MediaClaw
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Documentation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
