import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading this content. Please try again.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center border rounded-xl border-destructive/20 bg-destructive/5 ${className}`}>
      <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-destructive" />
      </div>
      <h3 className="text-lg font-bold mb-2 text-destructive">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6 text-sm">
        {description}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="border-destructive/20 hover:bg-destructive hover:text-destructive-foreground">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
}
