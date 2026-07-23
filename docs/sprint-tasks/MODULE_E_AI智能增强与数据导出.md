# MODULE_E_AI智能增强与数据导出.md — Sprint 5 开发任务

> **版本：** v1.0  
> **PM 分析师：** Claude PM Agent  
> **日期：** 2026-07-23  
> **Sprint 目标：** AI 流式输出、关键词手动勾选、打招呼历史版本、数据导出 CSV

---

## 1. 需求全景摘要

Sprint 1~4 完成了全部 P0 基础功能和体验优化（拖拽、图表、导入导出、备份恢复）。本 Sprint 聚焦 **AI 智能增强** 和 **数据导出**，让 AI 打招呼从"一键生成"升级为"精细化控制"。

### 核心痛点

| 痛点 | 当前状态 | Sprint 5 改进 |
|:-----|:---------|:--------------|
| 生成等待焦虑 | 点击生成后白屏等待 3-10 秒，无反馈 | E1 流式输出 |
| 关键词不可控 | AI 随机选择关键词，可能与用户预期不符 | E2 关键词手动勾选 |
| 版本不可回溯 | 每次生成覆盖上一次，无法对比选择 | E3 历史版本管理 |
| 数据无法离开本应用 | 数据被锁在应用内，无法用于外部分析 | E4 数据导出 CSV |

---

## 2. 模块拆分与开发指令

### 模块 E1：流式输出（Streaming Output）

**重要性：** ⭐⭐⭐⭐⭐（用户体验关键改进）

#### 前端任务清单

1. **修改 `src/lib/ai.ts`**：
   - 新增 `generateGreetingStream()` 函数，使用 `stream: true` 调用 OpenAI 兼容 API
   - 解析 SSE（Server-Sent Events）响应，实时提取 `content` 增量
   - 回调模式：`onToken(token: string)` 每收到一个 token 调用一次
   - 兼容现有 Deepseek API 的流式格式

2. **修改 `src/stores/greetingStore.ts`**：
   - 新增 `streamingContent: string` 状态，实时存储已收到的 tokens
   - 新增 `isStreaming: boolean` 状态，替代/补充 `generating`
   - 修改 `generateGreeting()` 方法，支持流式模式
   - 流式完成后自动调用 `parseGreetingResult()` 解析完整 JSON

3. **修改 `src/components/greeting/GreetingResult.tsx`**：
   - 流式过程中实时显示累积的问候文案（不等待完整 JSON）
   - 添加打字机光标效果（闪烁的 `|` 光标）
   - 流式完成前禁用"复制"和"编辑"按钮

4. **修改 `src/components/greeting/DeepAnalysisCard.tsx`**：
   - 流式过程中显示"分析生成中..."骨架屏
   - 分析部分（matchScore / highlights / gaps）在流式完成后一次性渲染

#### 后端任务清单

- 本模块无 Rust 后端任务。AI 调用从浏览器直接发往 API，不经过 Tauri 后端

#### 验收标准

| 检查项 | 预期结果 |
|:-------|:---------|
| 流式启动 | 点击生成后 1 秒内开始显示文字 |
| 逐字显示 | 文字逐段出现，不是一次性全部显示 |
| 打字机光标 | 流式过程中有闪烁光标 |
| 分析部分 | 流式完成后显示完整分析卡片 |
| 复制按钮 | 流式完成前禁用，完成后启用 |
| 超时处理 | 超过 30 秒无响应时提示超时 |
| 错误处理 | 流式中断时显示部分内容 + 错误提示 |

---

### 模块 E2：关键词手动勾选（Manual Keyword Selection）

**重要性：** ⭐⭐⭐⭐（核心功能增强）

#### 前端任务清单

1. **新增 `src/components/greeting/KeywordSelector.tsx`**：
   - 接收 JD 文本作为 props
   - 使用正则/分词提取关键词（名词短语、技术栈、技能词）
   - 关键词去重，按词频排序
   - 展示为可勾选的标签云（Chip/Tag 组件）
   - 限制最多勾选 5 个，最少 0 个（不勾选则 AI 自主选择）
   - 勾选后自动触发重新生成

2. **修改 `src/lib/ai.ts`**：
   - 修改 `buildUserMessage()` 新增 `selectedKeywords?: string[]` 参数
   - 当有关键词时，在 System Prompt 追加：
     `## 关键词约束\n用户已选择以下关键词，请在打招呼文案中优先围绕这些关键词展开：\n- {keyword1}\n- {keyword2}`
   - 无关键词时保持原有行为

3. **修改 `src/pages/GreetingPage.tsx`**：
   - 在 JD 粘贴区和 PositionSelector 之间插入 KeywordSelector
   - 当 JD 内容变化时，自动更新关键词列表
   - 关键词选择后，调用 `generateGreeting()` 时传入 `selectedKeywords`

4. **修改 `src/stores/greetingStore.ts`**：
   - 新增 `keywords: string[]` 状态
   - 新增 `selectedKeywords: string[]` 状态
   - 新增 `extractKeywords()` 方法

#### 验收标准

| 检查项 | 预期结果 |
|:-------|:---------|
| 关键词提取 | JD 粘贴后自动提取 5-15 个关键词 |
| 关键词展示 | 以标签形式展示，可勾选 |
| 勾选限制 | 最多勾选 5 个，超限提示 |
| 重新生成 | 勾选后自动触发重新生成（或点击"重新生成"） |
| 无关键词 | 不勾选时 AI 自主选择，保持原有行为 |
| 关键词质量 | 提取结果包含技术栈、技能词、领域名词，排除停用词 |

---

### 模块 E3：打招呼历史版本（Greeting Version History）

**重要性：** ⭐⭐⭐⭐（数据完整性增强）

#### 前端任务清单

1. **新增 `src/types/greeting.ts` 类型**：
   ```typescript
   export interface GreetingVersion {
     id: string;           // uuid
     positionId: string;
     jdContent: string;
     selectedKeywords?: string[];
     result: GreetingResult;
     createdAt: string;    // ISO 8601
   }
   ```

2. **新增 `src/stores/greetingVersionStore.ts`**：
   - `versions: GreetingVersion[]` — 当前岗位的所有版本
   - `currentVersionId: string | null` — 当前选中的版本
   - `loadVersions(positionId: string)` — 从本地存储加载
   - `saveVersion(result: GreetingResult)` — 保存新版本
   - `deleteVersion(id: string)` — 删除版本
   - `getVersion(id: string): GreetingVersion | undefined`
   - 数据存储：使用 `localStorage` + 文件持久化（通过 Tauri 文件 API）

3. **新增 `src/components/greeting/VersionHistory.tsx`**：
   - 展示版本列表（时间线形式）
   - 每个版本显示：生成时间、关键词摘要、内容预览（前 20 字）
   - 当前选中版本高亮
   - 点击版本切换查看详情
   - 删除按钮（带确认）
   - 空状态："暂无历史版本"

4. **修改 `src/pages/GreetingPage.tsx`**：
   - 在 GreetingResult 旁侧新增版本历史侧边栏（或底部折叠面板）
   - 生成成功后自动保存到版本历史
   - 切换版本时更新显示内容

#### 后端任务清单

- 本模块可仅使用前端 localStorage + 文件存储，无需 Rust 后端命令
- 如需要持久化到 data/ 目录，可新增轻量命令（可选，前端优先方案）

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

### 模块 E4：数据导出为 CSV（Data Export）

**重要性：** ⭐⭐⭐⭐（数据价值延伸）

#### 前端任务清单

1. **新增导出按钮**：
   - **Dashboard 页**：导出投递统计报告（各状态数量、趋势）
   - **PositionListPage 页**：导出岗位档案列表
   - **ApplicationListPage 页**：导出投递记录列表
   - 导出按钮位置：页面右上角操作区，使用 `Download` 图标

2. **实现 CSV 导出逻辑**：
   - 调用后端命令获取数据 → 转换为 CSV 格式
   - 使用 `@tauri-apps/plugin-dialog` 的 `save` 方法选择保存路径
   - 通过 Tauri 文件 API 写入文件
   - CSV 格式：BOM（UTF-8 BOM 确保 Excel 正确打开中文）+ 逗号分隔 + 双引号转义

3. **导出进度和反馈**：
   - 导出按钮点击后显示 loading 状态
   - 导出成功 toast 提示
   - 导出失败 toast 提示 + 错误详情

#### 后端任务清单

1. **新增 `src-tauri/src/commands/export.rs`**：

   ```rust
   pub fn export_positions_csv(path: String) -> Result<(), String>
     → 导出所有岗位档案为 CSV

   pub fn export_applications_csv(path: String) -> Result<(), String>
     → 导出所有投递记录为 CSV

   pub fn export_dashboard_csv(path: String) -> Result<(), String>
     → 导出仪表盘统计数据为 CSV
   ```

2. **实现细节**：
   - 从 data/ 目录读取 Markdown 文件，解析 frontmatter
   - 转换为 CSV 行（使用 `csv` crate 或手动拼接）
   - 写入 UTF-8 BOM 头部
   - 字段顺序固定，确保可读性

3. **新增 `Cargo.toml` 依赖**：
   ```toml
   csv = "1.3"    # CSV 写入（可选，也可手动拼接）
   ```

4. **在 `lib.rs` 注册新 Command**：
   ```rust
   .invoke_handler(tauri::generate_handler![
       // ... 现有命令
       crate::commands::export::export_positions_csv,
       crate::commands::export::export_applications_csv,
       crate::commands::export::export_dashboard_csv,
   ])
   ```

#### 验收标准

| 检查项 | 预期结果 |
|:-------|:---------|
| 岗位导出 | 导出 CSV 包含所有岗位字段（title/company/location/status/salaryRange 等） |
| 投递导出 | 导出 CSV 包含所有投递字段（position/company/status/createdAt 等） |
| 仪表盘导出 | 导出 CSV 包含各状态数量统计 |
| 中文编码 | 使用 UTF-8 BOM，Excel 打开无乱码 |
| Excel 打开 | 双击 CSV 文件在 Excel 中正确显示中文 |
| 空数据 | 无数据时导出空文件（仅表头） |
| 错误处理 | 文件写入失败时提示用户 |

---

## 3. 模块依赖关系

```
E1 流式输出 ────→ 无依赖，独立开发
E2 关键词勾选 ──→ 依赖 E1 的流式能力（可选，可独立先实现）
E3 历史版本 ────→ 依赖 E2 的关键词数据（可选，可独立先实现）
E4 数据导出 ────→ 无依赖，独立开发
```

**建议开发顺序：** E1 → E2 → E3 → E4 或 E1 + E4 并行 → E2 → E3

---

## 4. 不受影响文件清单

以下文件在本 Sprint 中无需修改：

| 文件 | 原因 |
|:-----|:-----|
| `src/pages/Dashboard.tsx` | 仅新增导出按钮，不修改现有逻辑 |
| `src/pages/ApplicationListPage.tsx` | 仅新增导出按钮 |
| `src/pages/PositionListPage.tsx` | 仅新增导出按钮 |
| `src/pages/ProfilePage.tsx` | 本 Sprint 不涉及 |
| `src/pages/SettingsPage.tsx` | 本 Sprint 不涉及 |
| `src/pages/ApplicationDetailPage.tsx` | 本 Sprint 不涉及 |
| 所有 `src/components/ui/*` | 本 Sprint 不涉及基础组件 |
| 所有 Rust 模型文件 | 本 Sprint 不修改数据模型 |
| 所有 Rust 现有命令文件 | 本 Sprint 不修改现有命令 |

---

## 5. 依赖预估

| 模块 | 新增依赖 | 类型 |
|:-----|:---------|:-----|
| E1 流式输出 | 无（基于已有 fetch API） | — |
| E2 关键词勾选 | 无（正则/分词提取） | — |
| E3 历史版本 | 无（localStorage + 文件系统） | — |
| E4 数据导出 | `csv = "1.3"` | Rust crate |

---

## 6. 非功能性要求

1. **流式性能**：首 token 到达时间 < 2 秒（受网络影响，但应尽快显示）
2. **版本存储**：单岗位版本数量建议上限 50 个（可配置）
3. **CSV 编码**：必须使用 UTF-8 BOM，确保 Windows 中文用户 Excel 正常打开
4. **关键词提取**：中文分词优先使用简单正则，不引入 jieba 等重量级依赖
5. **向后兼容**：所有修改不能破坏现有功能，特别是现有 AI 调用流程

---

*本任务文档由 PM Agent 基于 ARCHITECTURE.md 路线图及代码审查自动生成。*