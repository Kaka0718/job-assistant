import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {Icon && (
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-hover">
          <Icon size={40} className="text-text-muted" />
        </div>
      )}
      <h3 className="mb-1 text-base font-medium text-text-primary">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-text-secondary">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}