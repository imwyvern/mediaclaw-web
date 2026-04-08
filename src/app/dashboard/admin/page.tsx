"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Activity,
  Building2,
  Database,
  FileClock,
  RefreshCw,
  Server,
  ShieldAlert,
  Users,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { MetadataUpdater } from "@/components/metadata-updater";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  api,
  readApiErrorMessage,
  type AdminClientRecord,
  type AdminHealthStatus,
  type AuditLogEntry,
  type PaginatedResponse,
  type User,
} from "@/lib/api";
import { useAuthStore } from "@/lib/store";

const EMPTY_AUDIT_LOGS: PaginatedResponse<AuditLogEntry> = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
};

function formatDateTime(value?: string) {
  if (!value) {
    return "未记录";
  }

  try {
    return format(parseISO(value), "yyyy-MM-dd HH:mm");
  } catch {
    return value;
  }
}

function formatPercent(value: number) {
  const digits = Number.isInteger(value) ? 0 : 1;
  return `${value.toFixed(digits)}%`;
}

function getStatusBadgeClass(status: string) {
  const normalized = status.trim().toLowerCase();

  if (["super_admin", "admin", "enterprise_admin"].includes(normalized)) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-100";
  }

  if (["editor", "operator"].includes(normalized)) {
    return "border-sky-500/20 bg-sky-500/10 text-sky-100";
  }

  if (["viewer", "employee"].includes(normalized)) {
    return "border-slate-500/20 bg-slate-500/10 text-slate-200";
  }

  if (["healthy", "operational", "ok", "up", "online", "active", "paid"].includes(normalized)) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-100";
  }

  if (["warning", "degraded", "pending", "scheduled", "trial"].includes(normalized)) {
    return "border-amber-500/20 bg-amber-500/10 text-amber-100";
  }

  if (["failed", "down", "offline", "error", "suspended", "inactive"].includes(normalized)) {
    return "border-rose-500/20 bg-rose-500/10 text-rose-100";
  }

  return "border-slate-500/20 bg-slate-500/10 text-slate-200";
}

function MetricCardSkeleton() {
  return (
    <Card className="border-white/10 bg-black/20">
      <CardHeader className="space-y-3 pb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton({ columns = 5, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <Card className="border-white/10 bg-black/20">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: columns }).map((__, columnIndex) => (
                <Skeleton key={columnIndex} className="h-10 w-full" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const storedUser = useAuthStore((state) => state.user);

  const [clients, setClients] = useState<AdminClientRecord[]>([]);
  const [health, setHealth] = useState<AdminHealthStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<PaginatedResponse<AuditLogEntry>>(EMPTY_AUDIT_LOGS);
  const [members, setMembers] = useState<User[]>([]);
  const [accessState, setAccessState] = useState<"checking" | "granted" | "denied">(
    storedUser?.role ? (storedUser.role === "super_admin" ? "granted" : "denied") : "checking",
  );

  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [clientsError, setClientsError] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);

  const loadAdminData = async (options?: { silent?: boolean }) => {
    if (options?.silent) {
      setRefreshing(true);
    } else {
      setPageLoading(true);
    }

    setClientsError(null);
    setHealthError(null);
    setAuditError(null);
    setMembersError(null);

    const [clientsResult, healthResult, auditResult, membersResult] = await Promise.allSettled([
      api.admin.clients(),
      api.admin.health(),
      api.admin.auditLogs({ page: 1, limit: 20 }),
      api.admin.members(),
    ]);

    if (clientsResult.status === "fulfilled") {
      setClients(clientsResult.value.data);
    } else {
      setClients([]);
      setClientsError(
        readApiErrorMessage(clientsResult.reason, "客户列表加载失败，请稍后重试。"),
      );
    }

    if (healthResult.status === "fulfilled") {
      setHealth(healthResult.value.data);
    } else {
      setHealth(null);
      setHealthError(
        readApiErrorMessage(healthResult.reason, "系统健康状态加载失败，请稍后重试。"),
      );
    }

    if (auditResult.status === "fulfilled") {
      setAuditLogs(auditResult.value.data);
    } else {
      setAuditLogs(EMPTY_AUDIT_LOGS);
      setAuditError(
        readApiErrorMessage(auditResult.reason, "审计日志加载失败，请稍后重试。"),
      );
    }

    if (membersResult.status === "fulfilled") {
      setMembers(membersResult.value.data);
    } else {
      setMembers([]);
      setMembersError(
        readApiErrorMessage(membersResult.reason, "成员列表加载失败，请稍后重试。"),
      );
    }

    setPageLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    let cancelled = false;

    const resolveAccess = async () => {
      if (storedUser?.role) {
        setAccessState(storedUser.role === "super_admin" ? "granted" : "denied");
        return;
      }

      try {
        const response = await api.account.info();
        if (!cancelled) {
          setAccessState(response.data.role === "super_admin" ? "granted" : "denied");
        }
      } catch {
        if (!cancelled) {
          setAccessState("denied");
        }
      }
    };

    void resolveAccess();

    return () => {
      cancelled = true;
    };
  }, [storedUser?.role]);

  useEffect(() => {
    if (accessState !== "granted") {
      setPageLoading(accessState === "checking");
      return;
    }

    void loadAdminData();
  }, [accessState]);

  const totalVideos = useMemo(() => {
    return clients.reduce((sum, client) => sum + client.videoCount, 0);
  }, [clients]);

  const totalMembers = useMemo(() => {
    return clients.reduce((sum, client) => sum + client.memberCount, 0);
  }, [clients]);

  const healthyServices = useMemo(() => {
    if (!health) {
      return 0;
    }

    return health.services.filter((service) => {
      const normalized = service.status.trim().toLowerCase();
      return ["healthy", "operational", "ok", "up", "online"].includes(normalized);
    }).length;
  }, [health]);

  if (accessState === "denied") {
    return (
      <div className="flex flex-col gap-8 pb-8">
        <MetadataUpdater title="管理后台" />
        <Card className="border-rose-500/20 bg-rose-500/5">
          <CardHeader>
            <CardTitle className="text-white">无权限访问管理后台</CardTitle>
            <CardDescription className="text-slate-300">
              该页面仅向超级管理员开放，企业管理员请返回工作台使用组织级管理入口。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
              onClick={() => router.replace("/dashboard")}
            >
              返回概览
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <MetadataUpdater title="管理后台" />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">管理后台</h1>
          <p className="flex items-center gap-2 text-sm text-slate-300/80 sm:text-base">
            <ShieldAlert className="h-4 w-4 text-sky-300" />
            当前面板直接读取真实的客户、健康度、审计和组织成员数据，不再展示占位数据。
          </p>
        </div>

        <Button
          variant="outline"
          className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
          onClick={() => {
            void loadAdminData({ silent: true });
          }}
          disabled={pageLoading || refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          刷新后台数据
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {pageLoading ? (
          Array.from({ length: 3 }).map((_, index) => <MetricCardSkeleton key={index} />)
        ) : (
          <>
            <Card className="border-white/10 bg-black/20">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-sm text-slate-300">客户组织</CardTitle>
                  <CardDescription className="text-slate-400">已接入的企业与视频规模</CardDescription>
                </div>
                <Building2 className="h-4 w-4 text-sky-300" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-white">{clients.length}</div>
                <p className="mt-2 text-sm text-slate-400">
                  累计 {totalVideos} 条视频，覆盖 {totalMembers} 名成员
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/20">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-sm text-slate-300">服务健康度</CardTitle>
                  <CardDescription className="text-slate-400">来自 `/v1/health/status` 的聚合状态</CardDescription>
                </div>
                <Server className="h-4 w-4 text-emerald-300" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-white">
                  {health ? formatPercent(health.availability) : "--"}
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {health ? `${healthyServices}/${health.services.length} 个服务正常` : "等待系统数据"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/20">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-sm text-slate-300">审计记录</CardTitle>
                  <CardDescription className="text-slate-400">最近一页行为日志与成员变更</CardDescription>
                </div>
                <FileClock className="h-4 w-4 text-amber-300" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-white">{auditLogs.total}</div>
                <p className="mt-2 text-sm text-slate-400">
                  当前展示第 {auditLogs.page} 页，成员总数 {members.length}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="clients" className="space-y-6">
        <TabsList className="border border-white/10 bg-white/[0.04]">
          <TabsTrigger value="clients" className="gap-2">
            <Users className="h-4 w-4" />
            客户管理
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Activity className="h-4 w-4" />
            系统状态
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <FileClock className="h-4 w-4" />
            审计日志
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            用户列表
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-6">
          {pageLoading ? (
            <TableSkeleton columns={6} rows={5} />
          ) : clientsError ? (
            <ErrorState
              title="客户列表加载失败"
              description={clientsError}
              onRetry={() => {
                void loadAdminData();
              }}
              className="border-white/10 bg-black/20"
            />
          ) : clients.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="暂无客户组织"
              description="当新的客户组织开通后，这里会显示套餐、成员数和视频规模。"
              actionLabel="刷新列表"
              onAction={() => {
                void loadAdminData({ silent: true });
              }}
              className="border-white/10 bg-black/20"
            />
          ) : (
            <Card className="border-white/10 bg-black/20">
              <CardHeader>
                <CardTitle className="text-white">客户组织</CardTitle>
                <CardDescription className="text-slate-400">
                  来自 `/v1/admin/orgs` 的真实组织数据。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead>组织</TableHead>
                      <TableHead>套餐</TableHead>
                      <TableHead>成员数</TableHead>
                      <TableHead>视频数</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>开通时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id} className="border-white/10">
                        <TableCell className="font-medium text-white">{client.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-white/10 bg-white/[0.03] text-slate-100"
                          >
                            {client.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>{client.memberCount}</TableCell>
                        <TableCell>{client.videoCount}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeClass(client.status)}>
                            {client.status || "unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {formatDateTime(client.joinedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {pageLoading ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <MetricCardSkeleton key={index} />
                ))}
              </div>
              <TableSkeleton columns={4} rows={4} />
            </>
          ) : healthError ? (
            <ErrorState
              title="系统状态加载失败"
              description={healthError}
              onRetry={() => {
                void loadAdminData();
              }}
              className="border-white/10 bg-black/20"
            />
          ) : !health ? (
            <EmptyState
              icon={Activity}
              title="暂无系统状态数据"
              description="当前没有可展示的健康指标，请稍后刷新。"
              actionLabel="刷新状态"
              onAction={() => {
                void loadAdminData({ silent: true });
              }}
              className="border-white/10 bg-black/20"
            />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-white/10 bg-black/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm text-slate-300">整体状态</CardTitle>
                    <Server className="h-4 w-4 text-emerald-300" />
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3 flex items-center gap-2">
                      <Badge variant="outline" className={getStatusBadgeClass(health.overallStatus)}>
                        {health.overallStatus || "unknown"}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        更新时间 {formatDateTime(health.checkedAt)}
                      </span>
                    </div>
                    <div className="text-3xl font-semibold text-white">
                      {formatPercent(health.availability)}
                    </div>
                    <Progress
                      value={Math.max(0, Math.min(100, health.availability))}
                      className="mt-3 h-2"
                    />
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-black/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm text-slate-300">任务队列</CardTitle>
                    <Activity className="h-4 w-4 text-sky-300" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold text-white">{health.queueDepth}</div>
                    <p className="mt-2 text-sm text-slate-400">待处理渲染与发布任务深度</p>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-black/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm text-slate-300">存储占用</CardTitle>
                    <Database className="h-4 w-4 text-amber-300" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold text-white">
                      {formatPercent(health.storageUsage)}
                    </div>
                    <Progress
                      value={Math.max(0, Math.min(100, health.storageUsage))}
                      className="mt-3 h-2"
                    />
                  </CardContent>
                </Card>
              </div>

              {health.services.length === 0 ? (
                <EmptyState
                  icon={Server}
                  title="暂无服务检查项"
                  description="health 接口已返回，但没有服务级别的检查明细。"
                  className="border-white/10 bg-black/20"
                />
              ) : (
                <Card className="border-white/10 bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-white">服务明细</CardTitle>
                    <CardDescription className="text-slate-400">
                      逐项展示 API、队列和存储依赖的健康结果。
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead>服务</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>延迟</TableHead>
                          <TableHead>说明</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {health.services.map((service) => (
                          <TableRow key={service.id} className="border-white/10">
                            <TableCell className="font-medium text-white">{service.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusBadgeClass(service.status)}>
                                {service.status || "unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {typeof service.latencyMs === "number"
                                ? `${service.latencyMs} ms`
                                : "--"}
                            </TableCell>
                            <TableCell className="text-slate-400">
                              {service.message || "无额外说明"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          {pageLoading ? (
            <TableSkeleton columns={5} rows={6} />
          ) : auditError ? (
            <ErrorState
              title="审计日志加载失败"
              description={auditError}
              onRetry={() => {
                void loadAdminData();
              }}
              className="border-white/10 bg-black/20"
            />
          ) : auditLogs.items.length === 0 ? (
            <EmptyState
              icon={FileClock}
              title="暂无审计日志"
              description="当后台产生登录、配置修改或组织变更后，这里会自动出现对应记录。"
              actionLabel="刷新日志"
              onAction={() => {
                void loadAdminData({ silent: true });
              }}
              className="border-white/10 bg-black/20"
            />
          ) : (
            <Card className="border-white/10 bg-black/20">
              <CardHeader>
                <CardTitle className="text-white">审计日志</CardTitle>
                <CardDescription className="text-slate-400">
                  当前展示最近 {auditLogs.items.length} 条记录，共 {auditLogs.total} 条。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead>时间</TableHead>
                      <TableHead>级别</TableHead>
                      <TableHead>执行者</TableHead>
                      <TableHead>动作</TableHead>
                      <TableHead>说明</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.items.map((log) => (
                      <TableRow key={log.id} className="border-white/10 align-top">
                        <TableCell className="whitespace-nowrap text-slate-400">
                          {formatDateTime(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeClass(log.level)}>
                            {log.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">{log.actor}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell className="text-slate-400">
                          {log.description}
                          {log.target ? (
                            <div className="mt-1 text-xs text-slate-500">目标：{log.target}</div>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          {pageLoading ? (
            <TableSkeleton columns={5} rows={6} />
          ) : membersError ? (
            <ErrorState
              title="成员列表加载失败"
              description={membersError}
              onRetry={() => {
                void loadAdminData();
              }}
              className="border-white/10 bg-black/20"
            />
          ) : members.length === 0 ? (
            <EmptyState
              icon={Users}
              title="暂无组织成员"
              description="还没有成员加入当前组织，后续邀请成功后会展示在这里。"
              actionLabel="刷新成员"
              onAction={() => {
                void loadAdminData({ silent: true });
              }}
              className="border-white/10 bg-black/20"
            />
          ) : (
            <Card className="border-white/10 bg-black/20">
              <CardHeader>
                <CardTitle className="text-white">组织成员</CardTitle>
                <CardDescription className="text-slate-400">
                  来自 `/org/members` 的真实成员列表。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead>姓名</TableHead>
                      <TableHead>手机号</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>角色</TableHead>
                      <TableHead>最近登录</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id} className="border-white/10">
                        <TableCell className="font-medium text-white">{member.name}</TableCell>
                        <TableCell>{member.phone || "未填写"}</TableCell>
                        <TableCell className="text-slate-400">{member.email || "未填写"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeClass(member.role)}>
                            {member.roleLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {formatDateTime(member.lastLoginAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
