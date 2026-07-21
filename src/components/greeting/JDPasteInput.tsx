import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ClipboardPaste } from "lucide-react";

const MAX_JD_LENGTH = 8000;

interface JDPasteInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function JDPasteInput({
  value,
  onChange,
  disabled = false,
}: JDPasteInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isTooLong = value.length > MAX_JD_LENGTH;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text");
    if (text.length > MAX_JD_LENGTH * 2) {
      onChange(text.slice(0, MAX_JD_LENGTH));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-primary">
          📋 粘贴岗位 JD
        </label>
        {value && (
          <span
            className={cn(
              "text-xs",
              isTooLong ? "text-error font-medium" : "text-text-muted",
            )}
          >
            {value.length.toLocaleString()}
            {isTooLong && ` / ${MAX_JD_LENGTH.toLocaleString()} (已超出，将自动截断)`}
          </span>
        )}
      </div>

      <div
        className={cn(
          "relative rounded-lg border transition-colors",
          !value && "border-dashed border-border",
          value && !isTooLong && "border-solid border-border",
          isTooLong && "border-solid border-error",
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            const newVal = e.target.value;
            if (newVal.length <= MAX_JD_LENGTH * 2) {
              onChange(newVal);
            }
          }}
          onPaste={handlePaste}
          placeholder="在此粘贴招聘 JD 内容..."
          disabled={disabled}
          rows={8}
          className={cn(
            "w-full resize-none bg-transparent p-4 text-sm text-text-primary outline-none",
            "placeholder:text-text-muted",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />

        {/* Empty state overlay */}
        {!value && !disabled && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-muted">
            <ClipboardPaste size={32} strokeWidth={1.5} />
            <span className="text-sm">粘贴 JD 或拖拽文本...</span>
          </div>
        )}
      </div>

      {isTooLong && (
        <p className="text-xs text-error">
          已超过 {MAX_JD_LENGTH.toLocaleString()} 字，将自动截断
        </p>
      )}
    </div>
  );
}