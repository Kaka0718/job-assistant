export const APP_NAME = "求职助手";

export const NAV_ITEMS = [
  { label: "仪表盘", path: "/", icon: "LayoutDashboard" },
  { label: "岗位档案", path: "/positions", icon: "Briefcase" },
  { label: "打招呼", path: "/greeting", icon: "MessageSquare" },
  { label: "投递记录", path: "/applications", icon: "Send" },
  { label: "个人档案", path: "/profile", icon: "User" },
  { label: "设置", path: "/settings", icon: "Settings" },
] as const;

export const POSITION_CATEGORIES = [
  "测试",
  "开发",
  "运营",
  "产品",
  "设计",
  "运维",
  "数据",
  "其他",
] as const;

export const APPLICATION_STATUSES = [
  "draft",
  "applied",
  "read",
  "chatting",
  "interview",
  "offer",
  "rejected",
  "archived",
] as const;

export const AI_PROVIDERS = ["deepseek", "openai", "anthropic"] as const;
export const THEME_MODES = ["light", "dark", "system"] as const;