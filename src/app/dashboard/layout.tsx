"use client";

import { useState } from "react";
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
  LogOut,
  Target,
  Calendar,
  Shield,
  ChevronRight,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Videos", href: "/dashboard/videos", icon: Film },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Brands", href: "/dashboard/brands", icon: Briefcase },
  { name: "Campaigns", href: "/dashboard/campaigns", icon: Target },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Admin", href: "/dashboard/admin", icon: Shield },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    return paths.map((path, i) => {
      const href = `/${paths.slice(0, i + 1).join("/")}`;
      const name = path.charAt(0).toUpperCase() + path.slice(1);
      return { name, href, isLast: i === paths.length - 1 };
    });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <Video size={18} />
          </div>
          MediaClaw
        </Link>
      </div>
      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} onClick={() => setIsMobileOpen(false)}>
                <span className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                  <Icon size={18} className={isActive ? "text-primary-foreground" : "group-hover:scale-110 transition-transform"} />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t mt-auto">
        <div className="bg-muted/50 rounded-xl p-4 border border-dashed border-muted-foreground/20">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Usage</div>
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mb-2">
            <div className="bg-primary h-full w-[45%] rounded-full" />
          </div>
          <div className="flex justify-between text-[10px] font-medium uppercase tracking-tight">
            <span>45 / 100 Credits</span>
            <Link href="/dashboard/billing" className="text-primary hover:underline">Upgrade</Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <SidebarContent />
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b bg-background/80 backdrop-blur z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger className="md:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9">
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
                <SidebarContent />
              </SheetContent>
            </Sheet>
            
            <div className="hidden sm:block">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                      <Home size={14} />
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {getBreadcrumbs().slice(1).map((crumb, i) => (
                    <div key={crumb.href} className="flex items-center gap-2">
                      <BreadcrumbSeparator>
                        <ChevronRight size={14} />
                      </BreadcrumbSeparator>
                      <BreadcrumbItem>
                        {crumb.isLast ? (
                          <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={crumb.href}>{crumb.name}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 outline-none group">
                <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-primary/20 transition-all">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>MC</AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start text-left">
                  <span className="text-sm font-bold leading-none">Admin User</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Enterprise</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/dashboard/settings" className="cursor-pointer flex w-full items-center">
                    <Settings className="mr-2 h-4 w-4" /> Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Briefcase className="mr-2 h-4 w-4" /> Switch Workspace
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-muted/5">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
