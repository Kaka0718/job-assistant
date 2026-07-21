import { useState } from "react";
import type { GreetingResult as GreetingResultType } from "@/types/greeting";
import DeepAnalysisCard from "./DeepAnalysisCard";
import GreetingActions from "./GreetingActions";

interface GreetingResultProps {
  result: GreetingResultType;
  onRegenerate: () => void;
  disabled?: boolean;
}

export default function GreetingResult({
  result,
  onRegenerate,
  disabled = false,
}: GreetingResultProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedGreeting, setEditedGreeting] = useState(result.greeting);

  // Sync with result when it changes
  if (result.greeting !== editedGreeting && !isEditing) {
    setEditedGreeting(result.greeting);
  }

  const handleCopy = () => {
    // Copy action is handled by GreetingActions
  };

  return (
    <div className="space-y-4">
      {/* Greeting Text */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-primary">打招呼文案</h3>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-primary hover:text-primary-light"
            aria-label={isEditing ? "完成编辑" : "编辑文案"}
          >
            {isEditing ? "完成编辑" : "编辑"}
          </button>
        </div>

        {isEditing ? (
          <textarea
            value={editedGreeting}
            onChange={(e) => setEditedGreeting(e.target.value)}
            className="w-full resize-none rounded-md border border-border bg-bg p-3 text-sm text-text-primary outline-none ring-1 ring-primary"
            rows={4}
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
            {editedGreeting}
          </p>
        )}
      </div>

      {/* Actions */}
      <GreetingActions
        greeting={editedGreeting}
        onRegenerate={onRegenerate}
        onCopy={handleCopy}
        disabled={disabled}
      />

      {/* Deep Analysis */}
      <DeepAnalysisCard analysis={result.analysis} />
    </div>
  );
}