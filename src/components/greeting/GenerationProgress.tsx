import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface GenerationProgressProps {
  progress: string; // Current progress stage description
  isGenerating: boolean;
}

const STAGES = [
  { key: "analyzing", label: "正在分析 JD..." },
  { key: "generating", label: "正在生成打招呼..." },
  { key: "done", label: "生成完成" },
] as const;

export default function GenerationProgress({
  progress,
  isGenerating,
}: GenerationProgressProps) {
  if (!isGenerating && !progress) return null;

  const currentStageIndex = STAGES.findIndex((s) =>
    progress.includes(s.label.replace("...", "")),
  );

  // If progress is "生成完成", show final state
  const isDone = progress === "生成完成";

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        {isGenerating && !isDone ? (
          <Loader2 size={16} className="animate-spin text-primary" />
        ) : (
          <span className="text-success">✅</span>
        )}
        <span className="text-sm font-medium text-text-primary">
          {progress || "准备生成..."}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn(
            "h-full rounded-full bg-primary transition-all duration-500",
            isDone && "bg-success",
          )}
          style={{
            width: isDone
              ? "100%"
              : currentStageIndex >= 0
                ? `${((currentStageIndex + 1) / STAGES.length) * 100}%`
                : "0%",
          }}
        />
      </div>

      {/* Stage labels */}
      <div className="mt-2 flex justify-between">
        {STAGES.map((stage, i) => {
          const isActive = currentStageIndex >= i && !isDone;
          const isCompleted = i < currentStageIndex || isDone;
          return (
            <span
              key={stage.key}
              className={cn(
                "text-xs transition-colors",
                isCompleted && "text-success",
                isActive && !isCompleted && "text-primary font-medium",
                !isActive && !isCompleted && "text-text-muted",
              )}
            >
              {stage.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}