# MODULE_E_前端开发.md — 前端开发 Agent 任务指令

> **版本：** v1.0  
> **发出人：** PM Agent  
> **日期：** 2026-07-23  
> **Sprint：** 5 — AI 智能增强与数据导出

---

## 一、你需要阅读的文档（按顺序）

| 顺序 | 文档 | 原因 |
|:----:|:-----|:-----|
| ① | `ARCHITECTURE.md`（项目根目录） | 了解全局架构、数据模型、组件约定 |
| ② | `docs/sprint-tasks/MODULE_E_AI智能增强与数据导出.md` | **核心任务文档**，重点看 E1/E2/E3 的前端任务 |
| ③ | `docs/sprint-tasks/MODULE_D_体验优化.md`（参考） | 了解 Sprint 4 的组件组织和代码风格 |

---

## 二、你的开发范围

### 模块 E1：流式输出（Streaming Output）

**核心目标：** 将 AI 打招呼从"等待全部返回"改为"逐字显示"

#### 1. 修改 `src/lib/ai.ts`

新增 `generateGreetingStream()` 函数：

```typescript
export async function generateGreetingStream(
  settings: Settings,
  profile: Profile,
  position: Position,
  jdContent: string,
  selectedKeywords?: string[],
  onToken?: (token: string) => void,
  signal?: AbortSignal,
): Promise<GreetingResult>
```

实现要点：
- 请求体添加 `stream: true` 参数
- 使用 `response.body.getReader()` 读取 SSE 流
- 解析 SSE 格式：`data: {"choices":[{"delta":{"content":"xxx"}}]}\n\n`
- 每收到一个 `content` 增量，调用 `onToken(token)`
- 流结束后，拼接完整 content 调用 `parseGreetingResult()`
- 兼容 Deepseek API 的流式响应格式（与 OpenAI 兼容）
- 保留原有的 `generateGreeting()` 函数作为后备（非流式模式）

#### 2. 修改 `src/stores/greetingStore.ts`

新增状态：
```typescript
streamingContent: string    // 当前流式累积内容
isStreaming: boolean        // 是否正在流式输出
```

修改 `generateGreeting()` 方法：
- 新增 `keywords?: string[]` 参数
- 调用 `generateGreetingStream()` 替代 `generateGreeting()`
- 传入 `onToken` 回调实时更新 `streamingContent`
- 流式完成后 `parseGreetingResult` 并更新 `result`
- 流式过程中 `progress` 更新为"正在生成..."等提示

#### 3. 修改 `src/components/greeting/GreetingResult.tsx`

- 新增 props：`streamingContent: string`, `isStreaming: boolean`
- 流式中：实时显示 `streamingContent`，带打字机光标效果
- 流式完成后：显示完整结果（与现有行为一致）
- 流式中禁用"复制"、"编辑"按钮
- 光标效果：使用 CSS 动画 `@keyframes blink` 实现 `|` 闪烁

#### 4. 修改 `src/components/greeting/DeepAnalysisCard.tsx`

- 新增 props：`loading: boolean`
- loading 时显示骨架屏（Skeleton 组件）
- 加载完成后一次性渲染分析内容

#### 验收标准

| 检查项 | 预期结果 |
|:-------|:---------|
| 流式启动 | 点击生成后 1 秒内开始显示文字 |
| 逐字显示 | 文字逐段出现，不是一次性全部显示 |
| 打字机光标 | 流式过程中有闪烁光标 |
| 分析部分 | 流式完成后显示完整分析卡片 |
| 复制按钮 | 流式完成前禁用，完成后启用 |
| 超时处理 | 超过 30 秒无响应时提示超时 |

---

### 模块 E2：关键词手动勾选（Manual Keyword Selection）

**核心目标：** 用户从 JD 中勾选关键词，AI 围绕这些关键词生成打招呼

#### 1. 新增 `src/components/greeting/KeywordSelector.tsx`

```
interface KeywordSelectorProps {
  jdContent: string;
  keywords: string[];
  selectedKeywords: string[];
  onSelect: (keywords: string[]) => void;
  disabled?: boolean;
}
```

实现要点：
- **关键词提取**：接收 `keywords` 列表（由父组件/Store 提取），展示为标签云
- **标签展示**：使用 `badge` 组件风格，可点击切换选中状态
- **选中状态**：选中的标签使用 primary 色填充，未选中使用 outline 样式
- **限制**：最多勾选 5 个，满 5 个后未选中标签变灰禁用
- **提示**：标签上方显示"勾选关键词（最多 5 个），AI 将围绕这些关键词生成打招呼"
- **空状态**：JD 为空时显示"请先粘贴 JD 内容"
- **动画**：选中/取消选中时平滑过渡

#### 2. 修改 `src/stores/greetingStore.ts`

新增状态和方法：
```typescript
keywords: string[]              // 从 JD 提取的所有关键词
selectedKeywords: string[]      // 用户选中的关键词
extractKeywords(jd: string): void  // 提取关键词逻辑
```

关键词提取逻辑（简单实现，不引入第三方分词库）：
```typescript
function extractKeywords(text: string): string[] {
  // 1. 按中英文标点+空格分割
  // 2. 过滤停用词（的、了、是、在、有、和、就、不、人、都、一、一个、上、也、很、到、说、要、去、你、会、着、没有、看、好、自己、这）
  // 3. 过滤长度 < 2 的词
  // 4. 按词频排序，取前 20 个
  // 5. 去重（保留首次出现顺序）
}
```

#### 3. 修改 `src/pages/GreetingPage.tsx`

- 在 JD 粘贴区和岗位选择器之间插入 `<KeywordSelector>`
- 当 `jdContent` 变化时调用 `extractKeywords()`
- 生成时传入 `selectedKeywords`

#### 验收标准

| 检查项 | 预期结果 |
|:-------|:---------|
| 关键词提取 | JD 粘贴后自动提取 5-15 个关键词 |
| 关键词展示 | 以标签形式展示，可勾选 |
| 勾选限制 | 最多勾选 5 个，超限提示 |
| 重新生成 | 勾选后自动触发重新生成 |
| 无关键词 | 不勾选时 AI 自主选择，保持原有行为 |

---

### 模块 E3：打招呼历史版本（Greeting Version History）

**核心目标：** 同一投递可生成多个版本，切换查看/选择

#### 1. 新增 `src/types/greeting.ts` 类型

```typescript
export interface GreetingVersion {
  id: string;
  positionId: string;
  positionTitle: string;
  company: string;
  jdContent: string;
  selectedKeywords?: string[];
  result: GreetingResult;
  createdAt: string;  // ISO 8601
}
```

#### 2. 新增 `src/stores/greetingVersionStore.ts`

```typescript
interface GreetingVersionStore {
  versions: GreetingVersion[];
  currentVersionId: string | null;
  loading: boolean;
  error: string | null;

  loadVersions(positionId: string): Promise<void>;
  saveVersion(
    positionId: string,
    positionTitle: string,
    company: string,
    jdContent: string,
    selectedKeywords: string[] | undefined,
    result: GreetingResult,
  ): Promise<void>;
  deleteVersion(id: string): Promise<void>;
  setCurrentVersion(id: string | null): void;
  getVersion(id: string): GreetingVersion | undefined;
}
```

存储方案：
- 优先使用 `localStorage`（Key: `greeting_versions_{positionId}`）
- 可选的 Tauri 文件持久化（写入 `data/greeting_versions/{positionId}.json`）
- 使用 `safeInvoke` 调用 Tauri 命令（如果后端提供了文件读写命令）

#### 3. 新增 `src/components/greeting/VersionHistory.tsx`

```
interface VersionHistoryProps {
  versions: GreetingVersion[];
  currentVersionId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
}
```

实现要点：
- **时间线布局**：垂直列表，每个版本左侧显示时间线圆点
- **版本条目**：显示生成时间、关键词摘要（最多 3 个标签）、内容预览（前 20 字）
- **选中高亮**：当前选中版本使用 primary 背景色
- **删除按钮**：hover 时显示，点击弹出确认对话框
- **空状态**：无版本时显示"暂无历史版本，生成后将自动保存"
- **加载状态**：加载中显示骨架屏
- **滚动**：版本过多时列表可滚动，最大高度 400px

#### 4. 修改 `src/pages/GreetingPage.tsx`

- 在页面右侧（或折叠面板底部）集成 VersionHistory
- 生成成功后自动调用 `saveVersion()`
- 切换版本时更新 GreetingResult 的展示内容
- 使用 `Resizable` 或固定宽度布局（左侧 70% 主区域，右侧 30% 版本历史）

#### 验收标准

| 检查项 | 预期结果 |
|:-------|:---------|
| 自动保存 | 每次生成成功后自动保存版本 |
| 版本列表 | 以时间线展示所有历史版本 |
| 切换查看 | 点击版本可切换查看对应内容 |
| 删除版本 | 删除有确认对话框，删除后列表更新 |
| 空状态 | 无版本时显示"暂无历史版本" |
| 数据持久化 | 刷新页面后版本数据不丢失 |
| 版本数量 | 无上限限制（按 positionId 分组） |

---

### 模块 E4：数据导出为 CSV（仅前端职责）

**核心目标：** 在页面添加导出按钮，调用后端命令导出 CSV

#### 1. 修改 `src/pages/Dashboard.tsx`

- 在 Header 的 actions 区域新增"导出报告"按钮（Download 图标）
- 点击后调用后端 `export_dashboard_csv` 命令
- 使用 `@tauri-apps/plugin-dialog` 的 `save()` 让用户选择保存路径
- 导出成功后 toast 提示

#### 2. 修改 `src/pages/PositionListPage.tsx`

- 在 Header 的 actions 区域新增"导出 CSV"按钮
- 点击后调用后端 `export_positions_csv` 命令

#### 3. 修改 `src/pages/ApplicationListPage.tsx`

- 在 Header 的 actions 区域新增"导出 CSV"按钮
- 点击后调用后端 `export_applications_csv` 命令

#### 验收标准

| 检查项 | 预期结果 |
|:-------|:---------|
| 按钮展示 | 3 个页面均有导出按钮，位置合理 |
| 导出调用 | 点击按钮调用后端对应命令 |
| 路径选择 | 弹出系统文件保存对话框 |
| 成功反馈 | 导出成功后 toast 提示"导出成功" |
| 错误反馈 | 导出失败后 toast 提示错误详情 |

---

## 三、你的输出规范

### 代码输出

所有代码输出到 `src/` 目录下：

| 操作 | 文件 | 说明 |
|:-----|:-----|:-----|
| 修改 | `src/lib/ai.ts` | 新增 `generateGreetingStream()` 流式函数 |
| 修改 | `src/stores/greetingStore.ts` | 新增流式状态、关键词状态 |
| 修改 | `src/pages/GreetingPage.tsx` | 集成 KeywordSelector 和 VersionHistory |
| 修改 | `src/components/greeting/GreetingResult.tsx` | 支持流式显示 |
| 修改 | `src/components/greeting/DeepAnalysisCard.tsx` | 支持 loading 骨架屏 |
| 新增 | `src/components/greeting/KeywordSelector.tsx` | 关键词勾选组件 |
| 新增 | `src/stores/greetingVersionStore.ts` | 版本历史状态管理 |
| 新增 | `src/components/greeting/VersionHistory.tsx` | 版本历史展示组件 |
| 修改 | `src/types/greeting.ts` | 新增 GreetingVersion 类型 |
| 修改 | `src/pages/Dashboard.tsx` | 新增导出按钮 |
| 修改 | `src/pages/PositionListPage.tsx` | 新增导出按钮 |
| 修改 | `src/pages/ApplicationListPage.tsx` | 新增导出按钮 |

### 文档输出

- 交付后输出交付报告到 `docs/delivery-reports/MODULE_E_前端交付报告.md`
- 遵循命名规范：`MODULE_{字母}_{功能描述}.md`

---

## 四、注意事项

1. **流式兼容性**：测试 Deepseek 和 OpenAI 两种 API 的流式格式，确保兼容
2. **关键词提取**：不要引入 jieba 等中文分词库，使用简单正则 + 停用词过滤
3. **版本存储**：优先使用 localStorage，数据量小无需后端
4. **向后兼容**：现有生成流程不能破坏，非流式模式作为后备
5. **CSS 黑暗模式**：使用 `dark:` 前缀确保新组件在深色模式下正常显示
6. **组件复用**：使用已有的 shadcn/ui 组件（Button、Card、Badge、Skeleton、Dialog）

---

*本任务指令由 PM Agent 基于 Sprint 5 任务文档自动生成。*