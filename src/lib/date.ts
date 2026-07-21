import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { zhCN } from "date-fns/locale";

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd", { locale: zhCN });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd HH:mm", { locale: zhCN });
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "今天";
  if (isYesterday(d)) return "昨天";
  return formatDistanceToNow(d, { addSuffix: true, locale: zhCN });
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MM/dd", { locale: zhCN });
}