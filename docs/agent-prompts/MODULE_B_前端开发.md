# MODULE_B_前端开发.md — 前端开发 Agent 任务指令

> **版本：** v1.0  
> **发出人：** PM Agent  
> **日期：** 2026-07-20  
> **Sprint：** 2 — AI 打招呼生成

---

## 一、你需要阅读的文档（按顺序）

| 顺序 | 文档 | 原因 |
|:----:|:-----|:-----|
| ① | `ARCHITECTURE.md`（项目根目录） | 了解全局架构、组件树、路由表、状态管理、设计系统 |
| ② | `docs/sprint-tasks/MODULE_B_AI打招呼生成.md` | **核心任务文档**，重点看 B2 / B3 / B4 子模块 |
| ③ | `docs/sprint-tasks/MODULE_A_基础设施搭建.md`（参考） | 了解 Sprint 1 已搭建的组件和 Store 接口 |
| ④ | `docs/pm-reports/MODULE_A_基础设施搭建.md`（参考） | 了解 Sprint 1 验收结果和遗留问题 |

---

## 二、你的开发范围

### 子模块 B2：AI API 集成层（`src/lib/ai.ts`）
- 实现 `generateGreeting()` 和 `testConnection()` 函数
- 封装 Deepseek API 调用（OpenAI 兼容格式）
- 实现核心 Prompt（system prompt + user message 模板）
- 处理所有边界情况（API Key 无效、网络超时、格式异常、余额不足）

### 子模块 B3：打招呼页面（`src/pages/GreetingPage.tsx` + 相关组件）
- JDPasteInput — JD 粘贴区域（空态/有内容/过长三种状态）
- PositionSelector — 岗位档案选择器
- GenerationProgress — 生成进度条（分步动画）
- GreetingResult — 结果展示（打招呼文案 + 深度分析卡片）
- GreetingActions — 复制/重新生成/编辑操作栏
- 完善 `greetingStore.ts` 的实现
- 生成成功后自动调用 `applicationStore.createApplication()` 记录投递

### 子模块 B4：设置页数据绑定（`src/pages/SettingsPage.tsx`）
- 表单绑定 `settingsStore` 数据
- 集成 `next-themes` 实现主题切换（light/dark/system）
- 完善"测试连接"按钮的交互逻辑

---

## 三、你的输出规范

### 代码输出
- 所有前端代码输出到 `src/` 目录下
- 严格遵循 `ARCHITECTURE.md` 第 5 节的目录结构
- 组件文件命名：PascalCase（如 `GreetingResult.tsx`）
- 工具文件命名：camelCase（如 `ai.ts`）

### 文档输出（如需要记录）
- 如果有 QA 测试需求，测试报告存到 `docs/test-reports/MODULE_B_AI打招呼生成.md`
- 遵循命名规范：`MODULE_{字母}_{功能描述}.md`

---

## 四、注意事项

1. **AI 调用从 React 前端直接发起**，不经过 Rust 后端（架构文档 7.1 节）
2. **存储层依赖**：B2/B3 依赖 B1（后端实现），确认后端存储层完成后才能联调
3. **Sprint 1 已有 Store 接口**：`greetingStore.ts`、`settingsStore.ts` 已在 Sprint 1 定义接口，你只需完善实现
4. **shadcn/ui 组件**：可直接使用，无需重新安装
5. **设计系统参考**：`design-system/job-assistant/MASTER.md` 和 `pages/greeting.md`