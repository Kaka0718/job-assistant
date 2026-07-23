import { useState } from "react";
import type { GreetingVersion } from "@/types/greeting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Clock, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface VersionHistoryProps {
  versions: GreetingVersion[];
  currentVersionId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "刚刚";
    if (diffMin < 60) return `${diffMin} 分钟前`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} 小时前`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} 天前`;

    return d.toLocaleDateString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function VersionHistory({
  versions,
  currentVersionId,
  onSelect,
  onDelete,
  disabled = false,
  loading = false,
}: VersionHistoryProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">历史版本</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock size={16} className="text-primary" />
            历史版本
            {versions.length > 0 && (
              <span className="text-xs font-normal text-text-muted">
                ({versions.length})
              </span>
            )}
          </CardTitle>
          {versions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
          )}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent>
          {versions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <Clock size={24} className="mx-auto mb-2 text-text-muted" />
              <p className="text-sm text-text-muted">暂无历史版本</p>
              <p className="text-xs text-text-muted">生成后将自动保存</p>
            </div>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {versions.map((version) => {
                const isSelected = version.id === currentVersionId;
                const preview = version.result.greeting.slice(0, 20);
                const keywords = version.selectedKeywords?.slice(0, 3) ?? [];

                return (
                  <div
                    key={version.id}
                    className={cn(
                      "group relative cursor-pointer rounded-lg border p-3 transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-surface-hover",
                    )}
                    onClick={() => !disabled && onSelect(version.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-text-secondary">
                            {formatTime(version.createdAt)}
                          </span>
                          {isSelected && (
                            <Badge variant="default" className="h-4 px-1 text-[10px]">
                              当前
                            </Badge>
                          )}
                        </div>
                        {keywords.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {keywords.map((kw) => (
                              <Badge
                                key={kw}
                                variant="outline"
                                className="h-4 px-1 text-[10px]"
                              >
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="mt-1 truncate text-xs text-text-muted">
                          {preview}...
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(version.id);
                        }}
                      >
                        <Trash2 size={12} className="text-error" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="确认删除"
        description="删除后该版本将无法恢复，确认删除？"
        confirmLabel="删除"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) {
            onDelete(deleteTarget);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </Card>
  );
}