import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  value: externalValue,
  onChange,
  placeholder = "搜索...",
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(externalValue || "");
  const debouncedValue = useDebounce(internalValue, debounceMs);
  const isFirstRender = useRef(true);

  // Sync external value
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== internalValue) {
      setInternalValue(externalValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalValue]);

  // Notify parent of debounced changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onChange?.(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  return (
    <div className={cn("relative", className)}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <Input
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}