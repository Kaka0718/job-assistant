import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface KeywordSelectorProps {
  keywords: string[];
  selectedKeywords: string[];
  onSelect: (keywords: string[]) => void;
  disabled?: boolean;
}

const MAX_SELECTIONS = 5;

export default function KeywordSelector({
  keywords,
  selectedKeywords,
  onSelect,
  disabled = false,
}: KeywordSelectorProps) {
  const isMaxSelected = selectedKeywords.length >= MAX_SELECTIONS;

  const handleToggle = (keyword: string) => {
    if (disabled) return;

    const isSelected = selectedKeywords.includes(keyword);
    if (isSelected) {
      onSelect(selectedKeywords.filter((k) => k !== keyword));
    } else {
      if (isMaxSelected) return;
      onSelect([...selectedKeywords, keyword]);
    }
  };

  if (keywords.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface p-4">
        <p className="text-center text-sm text-text-muted">
          请先粘贴 JD 内容
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-secondary">
          勾选关键词（最多 {MAX_SELECTIONS} 个），AI 将围绕这些关键词生成打招呼
        </p>
        <span
          className={cn(
            "text-xs",
            isMaxSelected ? "font-medium text-warning" : "text-text-muted"
          )}
        >
          {selectedKeywords.length}/{MAX_SELECTIONS}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => {
          const isSelected = selectedKeywords.includes(keyword);
          const isDisabled = disabled || (!isSelected && isMaxSelected);

          return (
            <Badge
              key={keyword}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all duration-200",
                isSelected &&
                  "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
                !isSelected &&
                  "hover:bg-surface-hover hover:border-primary/50",
                isDisabled &&
                  "cursor-not-allowed opacity-40 hover:bg-transparent hover:border-border",
              )}
              onClick={() => handleToggle(keyword)}
            >
              {keyword}
            </Badge>
          );
        })}
      </div>

      {isMaxSelected && (
        <p className="text-xs text-warning">
          已达到上限 {MAX_SELECTIONS} 个，取消勾选后可重新选择
        </p>
      )}
    </div>
  );
}