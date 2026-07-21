import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, RefreshCw } from "lucide-react";

interface GreetingActionsProps {
  greeting: string;
  onRegenerate: () => void;
  onCopy?: () => void;
  disabled?: boolean;
}

export default function GreetingActions({
  greeting,
  onRegenerate,
  onCopy,
  disabled = false,
}: GreetingActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(greeting);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy method
      const textarea = document.createElement("textarea");
      textarea.value = greeting;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        disabled={disabled || !greeting}
        className="gap-1.5"
      >
        {copied ? (
          <>
            <Check size={14} className="text-success" />
            已复制
          </>
        ) : (
          <>
            <Copy size={14} />
            复制文案
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onRegenerate}
        disabled={disabled}
        className="gap-1.5"
      >
        <RefreshCw size={14} />
        重新生成
      </Button>
    </div>
  );
}