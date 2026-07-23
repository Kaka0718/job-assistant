import type {
  Position,
  CreatePositionInput,
  UpdatePositionInput,
} from "@/types/position";
import type {
  Application,
  ApplicationFilter,
  ApplicationStatus,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "@/types/application";
import type { Profile } from "@/types/profile";
import type { Settings } from "@/types/settings";

/**
 * 检测是否运行在 Tauri 环境中
 * Tauri 2.0 通过 window.__TAURI_INTERNALS__ 暴露 IPC 桥接
 */
function isTauri(): boolean {
  return (
    typeof window !== "undefined" &&
    (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ !== undefined
  );
}

/** 是否已警告过 Tauri 不可用 */
let warned = false;

/**
 * 安全的 invoke 调用 — 在 Tauri 环境中调用真实 IPC，
 * 在浏览器开发模式中返回 mock 数据。
 */
async function safeInvoke<T>(
  command: string,
  args?: Record<string, unknown>,
  mockData?: T,
): Promise<T> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<T>(command, args);
  }

  if (!warned) {
    warned = true;
    console.info(
      `[dev-mode] 浏览器开发模式 — 使用模拟数据（Tauri IPC 不可用）`,
    );
  }

  if (mockData !== undefined) {
    // 模拟异步延迟，让 UI 能看到 loading 状态
    await new Promise((r) => setTimeout(r, 300));
    return mockData;
  }

  throw new Error("Tauri IPC 不可用，请在 Tauri 桌面窗口中运行");
}

// ──────────────────────────────
// Mock 数据
// ──────────────────────────────

const mockPositions: Position[] = [
  {
    id: "pos_001",
    title: "高级前端工程师",
    category: "开发",
    created: "2026-07-20",
    updated: "2026-07-22",
    status: "active",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    tags: ["前端", "高级"],
    notes: "偏向全栈方向",
  },
  {
    id: "pos_002",
    title: "测试工程师",
    category: "测试",
    created: "2026-07-18",
    updated: "2026-07-21",
    status: "active",
    skills: ["自动化测试", "性能测试", "Python"],
    tags: ["软件测试", "自动化"],
    notes: "偏向自动化方向",
  },
  {
    id: "pos_003",
    title: "产品经理",
    category: "产品",
    created: "2026-07-15",
    updated: "2026-07-19",
    status: "archived",
    skills: ["需求分析", "原型设计", "数据分析"],
    tags: ["产品", "B端"],
    notes: "已归档",
  },
];

const mockApplications: Application[] = [
  {
    id: "app_001",
    positionId: "pos_001",
    company: "字节跳动",
    positionTitle: "高级前端工程师",
    created: "2026-07-22",
    status: "applied",
    matchScore: 85,
    hasProgress: false,
    keywords: ["React", "TypeScript", "性能优化"],
    jdContent: "负责核心业务前端开发...",
    greeting: "您好，我有 5 年前端开发经验...",
  },
  {
    id: "app_002",
    positionId: "pos_001",
    company: "阿里巴巴",
    positionTitle: "资深前端开发",
    created: "2026-07-21",
    status: "chatting",
    matchScore: 72,
    hasProgress: true,
    keywords: ["React", "Node.js"],
    jdContent: "负责中后台系统开发...",
  },
  {
    id: "app_003",
    positionId: "pos_002",
    company: "腾讯",
    positionTitle: "测试开发工程师",
    created: "2026-07-19",
    status: "read",
    matchScore: 90,
    hasProgress: true,
    keywords: ["自动化测试", "CI/CD"],
    jdContent: "负责质量保障体系建设...",
  },
  {
    id: "app_004",
    positionId: "pos_002",
    company: "美团",
    positionTitle: "高级测试工程师",
    created: "2026-07-15",
    status: "rejected",
    matchScore: 60,
    hasProgress: false,
    keywords: ["性能测试", "自动化"],
  },
];

const mockProfile: Profile = {
  id: "profile_001",
  created: "2026-07-01",
  updated: "2026-07-20",
  name: "张三",
  title: "前端开发工程师",
  city: "北京",
  email: "zhangsan@example.com",
  phone: "13800138000",
  expectSalary: "25K-35K",
  yearsOfExperience: 5,
  skills: ["React", "TypeScript", "Vue", "Node.js", "Tailwind CSS"],
  workExperience:
    "### 某科技公司 (2021-2026)\n高级前端工程师，负责核心业务前端架构设计与开发...\n\n### 某创业公司 (2018-2021)\n前端工程师，负责产品前端开发与维护...",
  projects:
    "### 项目A\n基于 React + TypeScript 的大型企业级应用...\n\n### 项目B\n基于 Node.js 的微服务网关...",
  education: "本科 · 计算机科学与技术 · 某985大学 (2014-2018)",
};

// ──────────────────────────────
// 导出 API
// ──────────────────────────────

export const api = {
  // ── Positions ──
  listPositions: () =>
    safeInvoke<Position[]>("list_positions", undefined, mockPositions),

  getPosition: (id: string) =>
    safeInvoke<Position | null>("get_position", { id }, mockPositions.find((p) => p.id === id) ?? null),

  createPosition: (data: CreatePositionInput) =>
    safeInvoke<Position>("create_position", { data }, {
      ...data,
      id: `pos_${Date.now()}`,
      created: new Date().toISOString().slice(0, 10),
      updated: new Date().toISOString().slice(0, 10),
      status: "active" as const,
    }),

  updatePosition: (id: string, data: UpdatePositionInput) =>
    safeInvoke<Position>("update_position", { id, data }, {
      id,
      title: data.title ?? "",
      category: data.category ?? "其他",
      created: "",
      updated: new Date().toISOString().slice(0, 10),
      status: data.status ?? "active",
      skills: data.skills ?? [],
      tags: data.tags ?? [],
      notes: data.notes,
      analysis: data.analysis,
      interviewQuestions: data.interviewQuestions,
    }),

  deletePosition: (id: string) =>
    safeInvoke<void>("delete_position", { id }, undefined),

  archivePosition: (id: string) =>
    safeInvoke<Position>("archive_position", { id }, {
      id,
      title: "",
      category: "其他",
      created: "",
      updated: new Date().toISOString().slice(0, 10),
      status: "archived",
      skills: [],
      tags: [],
    }),

  // ── Applications ──
  listApplications: (filter?: ApplicationFilter) =>
    safeInvoke<Application[]>("list_applications", { filter: filter ?? {} }, mockApplications),

  getApplication: (id: string) =>
    safeInvoke<Application | null>("get_application", { id }, mockApplications.find((a) => a.id === id) ?? null),

  createApplication: (data: CreateApplicationInput) =>
    safeInvoke<Application>("create_application", { data }, {
      ...data,
      id: `app_${Date.now()}`,
      created: new Date().toISOString().slice(0, 10),
      status: "applied" as ApplicationStatus,
      hasProgress: false,
    }),

  updateApplication: (id: string, data: UpdateApplicationInput) =>
    safeInvoke<Application>("update_application", { id, data }, {
      id,
      positionId: "",
      company: "",
      positionTitle: "",
      created: "",
      status: data.status ?? "applied",
      hasProgress: data.hasProgress ?? false,
      keywords: data.keywords ?? [],
      greeting: data.greeting,
    }),

  updateApplicationStatus: (id: string, status: ApplicationStatus) =>
    safeInvoke<Application>("update_application_status", { id, status }, {
      id,
      positionId: "",
      company: "",
      positionTitle: "",
      created: "",
      status,
      hasProgress: false,
      keywords: [],
    }),

  deleteApplication: (id: string) =>
    safeInvoke<void>("delete_application", { id }, undefined),

  // ── Profile ──
  getProfile: () =>
    safeInvoke<Profile | null>("get_profile", undefined, mockProfile),

  saveProfile: (data: Profile) =>
    safeInvoke<Profile>("save_profile", { data }, data),

  deleteProfile: () =>
    safeInvoke<void>("delete_profile", undefined, undefined),

  // ── Settings ──
  getSettings: () =>
    safeInvoke<Settings | null>("get_settings", undefined, null),

  saveSettings: (data: Settings) =>
    safeInvoke<Settings>("save_settings", { data }, data),

  testAiConnection: () =>
    safeInvoke<boolean>("test_ai_connection", undefined, true),

  // ── Dashboard ──
  getDashboardStats: () =>
    safeInvoke<{
      todayCount: number;
      weekCount: number;
      avgMatchScore: number | null;
      progressCount: number;
      recentApplications: Application[];
    }>("get_dashboard_stats", undefined, {
      todayCount: 1,
      weekCount: 3,
      avgMatchScore: 77,
      progressCount: 2,
      recentApplications: mockApplications.slice(0, 5),
    }),
};