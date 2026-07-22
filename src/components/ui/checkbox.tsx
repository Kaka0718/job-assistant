import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function Checkbox({
  className,
  checked,
  onCheckedChange,
  id,
  ...props
}: {
  className?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
} & React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      id={id}
      role="checkbox"
      aria-checked={checked}
      className={cn(
        "peer inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-input bg-background transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked && "border-primary bg-primary text-primary-foreground",
        className
      )}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      {checked && <Check size={12} className="text-white" />}
    </button>
  );
}