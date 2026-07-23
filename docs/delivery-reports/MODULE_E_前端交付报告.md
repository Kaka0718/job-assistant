# 前端交付文档 — MODULE_E_AI智能增强与数据导出

> **版本：** v1.0  
> **交付日期：** 2026-07-23  
> **Sprint：** 5 — AI 智能增强与数据导出（流式输出 + 关键词勾选 + 历史版本 + CSV 导出）  
> **交付 Agent：** 前端开发 Agent

---

## 一、交付清单

### 1.1 新增文件

| 文件 | 模块 | 说明 |
|:-----|:-----|:------|
| `src/components/greeting/KeywordSelector.tsx` | E2 | 关键词勾选组件（标签云 + 最多5个限制） |
| `src/components/greeting/VersionHistory.tsx` | E3 | 版本历史时间线组件 |
| `src/stores/greetingVersionStore.ts` | E3 | 版本历史状态管理（localStorage 持久化） |
| `src-tauri/src/commands/export.rs` | E4 | 后端 CSV 导出命令（3 个 Command） |

### 1.2 修改文件

| 文件 | 模块 | 改动说明 |
|:-----|:-----|:---------|
| `src/lib/ai.ts` | E1, E2 | 新增 `generateGreetingStream()` 流式函数；`buildUserMessage()` 支持 `selectedKeywords` 参数 |
| `src/stores/greetingStore.ts` | E1, E2, E3 | 新增 `streamingContent`/`isStreaming` 流式状态；新增 `keywords`/`selectedKeywords`/`extractKeywords()` 关键词状态；集成版本历史保存 |
| `src/pages/GreetingPage.tsx` | E1, E2, E3 | 集成 KeywordSelector 和 VersionHistory；传递流式状态到 GreetingResult |
| `src/components/greeting/GreetingResult.tsx` | E1 | 支持流式显示 + 打字机光标效果 |
| `src/components/greeting/DeepAnalysisCard.tsx` | E1 | 支持 `loading` 骨架屏状态 |
| `src/types/greeting.ts` | E3 | 新增 `GreetingVersion` 类型 |
| `src/index.css` | E1 | 新增 `@keyframes blink` 打字机光标动画 |
| `src/pages/Dashboard.tsx` | E4 | 新增"导出报告"按钮 |
| `src/pages/PositionListPage.tsx` | E4 | 新增"导出 CSV"按钮 |
| `src/pages/ApplicationListPage.tsx` | E4 | 新增"导出 CSV"按钮 |
| `src-tauri/src/commands/mod.rs` | E4 | 注册 `export` 模块 |
| `src-tauri/src/lib.rs` | E4 | 注册 3 个 CSV 导出 Command |

---

## 二、模块实现详情

### E1：流式输出（Streaming Output）

| 功能 | 实现 |
|:-----|:------|
| 流式函数 | `generateGreetingStream()` 使用 `stream: true` + `response.body.getReader()` 读取 SSE 流 |
| SSE 解析 | 逐行解析 `data: {...}` 格式，提取 `delta.content` 增量 |
| 实时显示 | `onToken` 回调更新 `streamingContent`，GreetingResult 实时渲染 |
| 打字机光标 | CSS `@keyframes blink` 实现闪烁 `|` 光标 |
| 分析卡片 | 流式过程中显示骨架屏，完成后一次性渲染完整分析 |
| 按钮禁用 | 流式完成前禁用"复制"和"重新生成"按钮 |
| 超时处理 | 30 秒 `AbortController` 超时 |
| 后备模式 | 保留 `generateGreeting()` 非流式函数 |

### E2：关键词手动勾选（Manual Keyword Selection）

| 功能 | 实现 |
|:-----|:------|
| 关键词提取 | 正则分词 + 停用词过滤 + 词频排序，取前 20 个 |
| 组件展示 | `KeywordSelector` 标签云，Badge 组件样式 |
| 勾选限制 | 最多 5 个，满额后未选中标签变灰禁用 |
| 提示文字 | 显示"勾选关键词（最多 5 个），AI 将围绕这些关键词生成打招呼" |
| Prompt 注入 | 选中关键词后，System Prompt 追加关键词约束段落 |
| 空状态 | JD 为空时显示"请先粘贴 JD 内容" |

### E3：打招呼历史版本（Greeting Version History）

| 功能 | 实现 |
|:-----|:------|
| 类型定义 | `GreetingVersion` 接口（id/positionId/jdContent/selectedKeywords/result/createdAt） |
| 状态管理 | `greetingVersionStore` — localStorage 持久化（Key: `greeting_versions_{positionId}`） |
| 自动保存 | 每次生成成功后自动调用 `saveVersion()` |
| 版本列表 | 时间线布局，显示生成时间、关键词摘要、内容预览 |
| 切换查看 | 点击版本切换显示对应内容 |
| 删除版本 | hover 显示删除按钮，带确认对话框 |
| 空状态 | 无版本时显示"暂无历史版本，生成后将自动保存" |
| 数据持久化 | localStorage 存储，刷新页面不丢失 |

### E4：数据导出为 CSV（Data Export）

| 功能 | 实现 |
|:-----|:------|
| 后端 `export_positions_csv` | 读取 `data/positions/*.md`，解析 frontmatter，写入 CSV |
| 后端 `export_applications_csv` | 读取 `data/applications/*.md`，解析 frontmatter，写入 CSV |
| 后端 `export_dashboard_csv` | 按状态聚合统计，写入 CSV |
| UTF-8 BOM | 所有 CSV 文件包含 BOM 头，Excel 打开无乱码 |
| CSV 转义 | 字段含逗号/双引号/换行符时用双引号包裹 + `""` 转义 |
| 前端导出按钮 | Dashboard/PositionListPage/ApplicationListPage 各新增导出按钮 |
| 文件对话框 | Tauri `save()` 对话框选择保存路径 |
| 进度提示 | 导出中显示 loading 状态，完成后 toast 提示 |

---

## 三、数据流

```
E1: 点击生成 → generateGreetingStream → SSE 流 → onToken 回调 → streamingContent 更新 → UI 实时渲染
    ↓
    流式完成 → parseGreetingResult → result 更新 → DeepAnalysisCard 渲染

E2: JD 粘贴 → setJdContent → extractKeywords → keywords 状态更新 → KeywordSelector 渲染
    ↓
    勾选关键词 → setSelectedKeywords → generateGreeting 传入 selectedKeywords → Prompt 注入

E3: 生成完成 → saveVersion → localStorage 持久化 → 版本列表更新
    ↓
    切换版本 → switchVersion → result 更新 → UI 显示对应内容

E4: 点击导出 → save() 对话框 → invoke("export_*_csv") → 读取 data/*.md → 解析 → CSV 写入
```

---

## 四、自测情况

- [x] TypeScript 编译通过 (`npx tsc --noEmit` → 零错误)
- [x] Rust 后端编译通过 (`cargo check` → 零错误)
- [x] E1: 流式函数 `generateGreetingStream()` 新增
- [x] E1: `streamingContent`/`isStreaming` 状态管理
- [x] E1: GreetingResult 流式显示 + 打字机光标
- [x] E1: DeepAnalysisCard loading 骨架屏
- [x] E2: KeywordSelector 组件（标签云 + 5 个限制）
- [x] E2: 关键词提取逻辑（正则 + 停用词 + 词频排序）
- [x] E2: buildUserMessage 支持 selectedKeywords
- [x] E3: GreetingVersion 类型定义
- [x] E3: greetingVersionStore（localStorage 持久化）
- [x] E3: VersionHistory 组件（时间线 + 删除确认）
- [x] E3: 生成后自动保存版本
- [x] E4: export.rs 后端 3 个 CSV 命令
- [x] E4: UTF-8 BOM + CSV 转义
- [x] E4: 3 个页面导出按钮 + Tauri save 对话框
- [x] E4: 导出进度 toast 提示

---

## 五、变更统计

| 维度 | Sprint 5 新增 | 备注 |
|:-----|:-------------|:------|
| 前端 ai.ts | +65 行 | 新增流式函数 + 关键词参数 |
| 前端 greetingStore.ts | +80 行 | 流式状态 + 关键词提取 + 版本集成 |
| 前端 GreetingPage.tsx | +25 行 | 集成 KeywordSelector + VersionHistory |
| 前端 GreetingResult.tsx | +20 行 | 流式显示 + 光标 |
| 前端 DeepAnalysisCard.tsx | +25 行 | loading 骨架屏 |
| 前端 KeywordSelector.tsx | 新增 ~90 行 | 关键词勾选组件 |
| 前端 VersionHistory.tsx | 新增 ~160 行 | 版本历史组件 |
| 前端 greetingVersionStore.ts | 新增 ~110 行 | 版本状态管理 |
| 前端 types/greeting.ts | +12 行 | GreetingVersion 类型 |
| 前端 index.css | +8 行 | blink 动画 |
| 前端 Dashboard.tsx | +30 行 | 导出按钮 |
| 前端 PositionListPage.tsx | +20 行 | 导出 CSV 按钮 |
| 前端 ApplicationListPage.tsx | +25 行 | 导出 CSV 按钮 |
| 后端 export.rs | 新增 ~165 行 | 3 个 CSV 导出命令 |
| **前端总计** | **~610 行** | 7 个文件修改 + 4 个新文件 |
| **后端总计** | **~165 行** | 1 个新文件 + 2 个文件修改 |
| **合计** | **~775 行** | 不含依赖和配置变更 |

---

*本交付报告由前端开发 Agent 基于 Sprint 5 任务文档及实际代码实现自动生成。*
