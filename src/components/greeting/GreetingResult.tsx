import { useState, useEffect } from "react";
import type { GreetingResult as GreetingResultType } from "@/types/greeting";
import DeepAnalysisCard from "./DeepAnalysisCard";
import GreetingActions from "./GreetingActions";

interface GreetingResultProps {
  result: GreetingResultType;
  onRegenerate: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  streamingContent?: string;
}

export default function GreetingResult({
  result,
  onRegenerate,
  disabled = false,
  isStreaming = false,
  streamingContent = "",
}: GreetingResultProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedGreeting, setEditedGreeting] = useState(result.greeting);

  // Sync with result when it changes
  useEffect(() => {
    if (result.greeting !== editedGreeting && !isEditing) {
      setEditedGreeting(result.greeting);
    }
  }, [result.greeting]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayGreeting = isStreaming ? streamingContent : editedGreeting;
  const isStreamingNotDone = isStreaming && result.greeting === "";

  const handleCopy = () => {
    // Copy action is handled by GreetingActions
  };

  return (
    <div className="space-y-4">
      {/* Greeting Text */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-primary">打招呼文案</h3>
          {!isStreaming && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-primary hover:text-primary-light"
              aria-label={isEditing ? "完成编辑" : "编辑文案"}
            >
              {isEditing ? "完成编辑" : "编辑"}
            </button>
          )}
        </div>

        {isEditing && !isStreaming ? (
          <textarea
            value={editedGreeting}
            onChange={(e) => setEditedGreeting(e.target.value)}
            className="w-full resize-none rounded-md border border-border bg-bg p-3 text-sm text-text-primary outline-none ring-1 ring-primary"
            rows={4}
          />
        ) : (
          <div className="relative">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
              {displayGreeting}
              {isStreamingNotDone && (
                <span className="inline-block h-4 w-0.5 animate-blink bg-primary align-text-bottom" />
              )}
            </p>
            {isStreamingNotDone && !displayGreeting && (
              <p className="text-sm text-text-muted italic">等待 AI 响应...</p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <GreetingActions
        greeting={isStreamingNotDone ? "" : editedGreeting}
        onRegenerate={onRegenerate}
        onCopy={handleCopy}
        disabled={disabled || isStreamingNotDone}
      />

      {/* Deep Analysis */}
      <DeepAnalysisCard analysis={result.analysis} loading={isStreaming} />
    </div>
  );
}