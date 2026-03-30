"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Video, 
  LayoutDashboard, 
  Film, 
  Briefcase, 
  BarChart, 
  CreditCard, 
  Settings,
  Bell,
  Menu,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Videos", href: "/dashboard/videos", icon: Film },
  { name: "Brands", href: "/dashboard/brands", icon: Briefcase },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-muted/30 border-r">
      <div className="p-6">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <Video size={18} />
          </div>
          MediaClaw
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <span className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
                <Icon size={18} />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Card className="shadow-none bg-background/50 border-dashed">
          <CardContent className="p-4">
            <div className="text-sm font-medium mb-1">Storage Usage</div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-primary h-full w-[45%]" />
            </div>
            <div className="text-xs text-muted-foreground">45GB / 100GB Used</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <Sidebar />
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b bg-background z-10">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger className="md:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <Sidebar />
              </SheetContent>
            </Sheet>
            
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium border rounded-md px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Acme Corp
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border border-background" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-9 w-9 rounded-full inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>MC</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin User</p>
                    <p className="text-xs text-muted-foreground leading-none">admin@acme.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>Switch Workspace</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Minimal Card implementation for the sidebar
const Card = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow ${className || ""}`}>
    {children}
  </div>
);

const CardContent = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={`p-6 pt-0 ${className || ""}`}>
    {children}
  </div>
);
