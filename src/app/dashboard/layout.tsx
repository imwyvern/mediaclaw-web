"use client";

import { wsManager } from "@/lib/ws";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart,
  Briefcase,
  Calendar,
  ChevronRight,
  CreditCard,
  Film,
  Flame,
  Home,
  Layers,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Plus,
  Settings,
  Shield,
  Target,
  Video,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { ErrorBoundary } from "@/components/error-boundary";
import { NotificationCenter } from "@/components/notification-center";
import { GlobalSearch } from "@/components/global-search";
import { eraseCookie } from "@/lib/cookies";
import { api, type AccountSnapshot, type User } from "@/lib/api";
import { formatCompactNumber } from "@/lib/format";
import { useAuthStore } from "@/lib/store";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  group: "内容" | "数据" | "管理";
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

const navItems: readonly NavItem[] = [
  { name: "总览", href: "/dashboard", icon: LayoutDashboard, group: "内容" },
  { name: "视频", href: "/dashboard/videos", icon: Film, group: "内容" },
  { name: "爆款发现", href: "/dashboard/discovery", icon: Flame, group: "内容" },
  { name: "品牌资产", href: "/dashboard/brands", icon: Briefcase, group: "内容" },
  
  { name: "内容日历", href: "/dashboard/calendar", icon: Calendar, group: "数据" },
  { name: "数据分析", href: "/dashboard/analytics", icon: BarChart, group: "数据" },
  
  { name: "活动管理", href: "/dashboard/campaigns", icon: Target, group: "管理" },
  { name: "团队管理", href: "/dashboard/team", icon: Users, group: "管理" },
  { name: "设置", href: "/dashboard/settings", icon: Settings, group: "管理" },
] as const;

const routeNameMap: Record<string, string> = {
  dashboard: "总览",
  videos: "视频",
  discovery: "爆款发现",
  calendar: "内容日历",
  brands: "品牌资产",
  campaigns: "活动管理",
  analytics: "数据分析",
  team: "团队管理",
  settings: "设置",
  admin: "Admin",
  create: "Create",
};

function getInitials(name?: string) {
  if (!name) {
    return "MC";
  }

  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "MC";
}

function SidebarContent({
  pathname,
  remainingCredits,
  totalCredits,
  usagePercent,
  role,
  roleScope,
  onItemClick,
}: {
  pathname: string;
  remainingCredits: number;
  totalCredits: number;
  usagePercent: number;
  role?: User["role"];
  roleScope?: User["roleScope"];
  onItemClick?: () => void;
}) {
  const visibleNavItems = navItems.filter(
    (item) =>
      (!item.adminOnly || roleScope === "admin")
      && (!item.superAdminOnly || role === "super_admin"),
  );

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Video size={18} />
          </div>
          MediaClaw
        </Link>
      </div>
      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-6">
          {(["内容", "数据", "管理"] as const).map((groupName) => {
            const groupItems = visibleNavItems.filter((item) => item.group === groupName);
            if (groupItems.length === 0) return null;
            return (
              <div key={groupName} className="space-y-1">
                <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{groupName}</h4>
                {groupItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link key={item.name} href={item.href} onClick={onItemClick}>
                      <span
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon
                          size={18}
                          className={isActive ? "text-primary-foreground" : "transition-transform group-hover:scale-110"}
                        />
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <div className="rounded-xl border border-dashed border-muted-foreground/20 bg-muted/50 p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Usage</span>
            <Link href="/dashboard/usage" className="text-primary hover:underline">
              查看
            </Link>
          </div>
          <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${usagePercent}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-tight">
            <span>
              {formatCompactNumber(remainingCredits)} / {formatCompactNumber(totalCredits)} Credits
            </span>
            <Link href="/dashboard/billing" className="text-primary hover:underline">
              Upgrade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [accountInfo, setAccountInfo] = useState<User | null>(null);
  const [accountSnapshot, setAccountSnapshot] = useState<AccountSnapshot | null>(null);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    eraseCookie("auth_token");
    eraseCookie("refresh_token");
    logout();
    router.push("/auth");
  };

  useEffect(() => {
    wsManager.connect();
    return () => wsManager.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrateLayoutMeta = async () => {
      try {
        const [infoResponse, accountResponse] = await Promise.all([
          api.account.info().catch(() => null),
          api.account.get().catch(() => null),
        ]);

        if (cancelled) {
          return;
        }

        if (infoResponse?.data) {
          setAccountInfo(infoResponse.data);
        }
        if (accountResponse?.data) {
          setAccountSnapshot(accountResponse.data);
        }
      } catch {
        if (!cancelled) {
          setAccountInfo(user || null);
        }
      }
    };

    void hydrateLayoutMeta();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const currentUser = accountInfo || user;
  const remainingCredits = accountSnapshot?.credits.remaining ?? 0;
  const totalCredits = accountSnapshot?.credits.total ?? 0;
  const usedCredits = accountSnapshot?.credits.used ?? Math.max(totalCredits - remainingCredits, 0);
  const usagePercent = totalCredits > 0 ? Math.min(100, (usedCredits / totalCredits) * 100) : 0;

  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, segments) => ({
      name: routeNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: `/${segments.slice(0, index + 1).join("/")}`,
      isLast: index === segments.length - 1,
    }));

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden w-64 flex-shrink-0 md:block">
        <SidebarContent
          pathname={pathname}
          remainingCredits={remainingCredits}
          totalCredits={totalCredits}
          usagePercent={usagePercent}
          role={currentUser?.role}
          roleScope={currentUser?.roleScope}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
                <SidebarContent
                  pathname={pathname}
                  remainingCredits={remainingCredits}
                  totalCredits={totalCredits}
                  usagePercent={usagePercent}
                  role={currentUser?.role}
                  roleScope={currentUser?.roleScope}
                  onItemClick={() => setIsMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>

            <div className="hidden w-full max-w-[240px] md:block">
              <GlobalSearch />
            </div>

            <div className="hidden sm:block">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                      <Home size={14} />
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumbs.slice(1).map((crumb) => (
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
            <NotificationCenter />

            <DropdownMenu>
              <DropdownMenuTrigger className="group flex items-center gap-2 outline-none">
                <Avatar className="h-9 w-9 border-2 border-transparent transition-all group-hover:border-primary/20">
                  <AvatarImage src={currentUser?.avatarUrl || undefined} />
                  <AvatarFallback>{getInitials(currentUser?.name)}</AvatarFallback>
                </Avatar>
                <div className="hidden items-start text-left lg:flex">
                  <span className="text-sm font-bold leading-none">
                    {currentUser?.name || "MediaClaw User"}
                  </span>
                  <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {currentUser?.roleLabel || "成员"}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/dashboard/settings" className="flex w-full cursor-pointer items-center">
                    <Settings className="mr-2 h-4 w-4" /> Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Briefcase className="mr-2 h-4 w-4" /> Switch Workspace
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-muted/5 pb-20 md:pb-0">
          <div className="mx-auto max-w-7xl animate-in fade-in p-4 duration-500 sm:p-6 lg:p-8">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-background px-2 md:hidden">
          {[
            { name: "Home", href: "/dashboard", icon: LayoutDashboard },
            { name: "Videos", href: "/dashboard/videos", icon: Film },
            { name: "Create", href: "/dashboard/videos/create", icon: Plus, primary: true },
            { name: "Stats", href: "/dashboard/analytics", icon: BarChart },
            { name: "Settings", href: "/dashboard/settings", icon: Settings },
          ].map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            if (item.primary) {
              return (
                <Link key={item.name} href={item.href} className="relative -top-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background">
                    <Icon size={24} />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 py-1 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
