import { ReactNode } from "react";
import { LucideIcon, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Skeleton } from "@/components/ui/skeleton";

interface DataStateProps {
  loading: boolean;
  error?: string | null;
  isEmpty?: boolean;
  loadingState?: ReactNode;
  emptyState?: ReactNode;
  errorState?: ReactNode;
  onRetry?: () => void;
  children: ReactNode;
}

export function DataState({
  loading,
  error,
  isEmpty,
  loadingState,
  emptyState,
  errorState,
  onRetry,
  children,
}: DataStateProps) {
  if (loading) {
    return <>{loadingState || <CardGridSkeleton />}</>;
  }

  if (error) {
    return (
      <>
        {errorState || (
          <ErrorState
            title="加载失败"
            description={error}
            onRetry={onRetry}
          />
        )}
      </>
    );
  }

  if (isEmpty) {
    return (
      <>
        {emptyState || (
          <EmptyState
            icon={Sparkles}
            title="这里还没有内容"
            description="第一条真实数据进来后，我们会在这里帮你把关键指标和动作整理好。"
          />
        )}
      </>
    );
  }

  return <>{children}</>;
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-2xl border bg-card p-5 shadow-sm">
          <Skeleton className="mb-4 h-4 w-24" />
          <Skeleton className="mb-2 h-8 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="grid gap-4 border-b bg-muted/30 px-4 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </div>
      <div className="space-y-0">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 border-b px-4 py-4 last:border-b-0"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((__, columnIndex) => (
              <Skeleton key={columnIndex} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function WarmEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
      className="rounded-2xl border-border/80 bg-card/70"
    />
  );
}
