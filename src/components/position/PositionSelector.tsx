import { useEffect } from "react";
import { usePositionStore } from "@/stores/positionStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PositionSelectorProps {
  value: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
}

export default function PositionSelector({
  value,
  onChange,
  disabled = false,
}: PositionSelectorProps) {
  const navigate = useNavigate();
  const { positions, loading, fetchPositions } = usePositionStore();

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">
          选择岗位档案
        </label>
        <div className="h-10 animate-pulse rounded-md bg-border" />
      </div>
    );
  }

  // Empty state
  if (positions.length === 0) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">
          选择岗位档案
        </label>
        <div className="rounded-lg border border-dashed border-border p-4 text-center">
          <p className="mb-2 text-sm text-text-muted">暂无岗位档案</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/positions/new")}
          >
            先去新建岗位档案
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-primary">
        选择岗位档案
      </label>
      <Select
        value={value ?? undefined}
        onValueChange={(v: string) => onChange(v)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="选择一个岗位档案..." />
        </SelectTrigger>
        <SelectContent>
          {positions.map((position) => (
            <SelectItem key={position.id} value={position.id}>
              <div className="flex items-center gap-2">
                <span>{position.title}</span>
                <span className="text-xs text-text-muted">
                  ({position.category})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}