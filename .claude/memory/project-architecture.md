# 求职助手项目

项目根目录：`D:\新建文件夹 (2)`

## 核心决策

- **技术栈**：Tauri 2.0 + React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + shadcn/ui + Zustand
- **数据存储**：Markdown 文件 + YAML Frontmatter（非 SQLite），路径 `data/`
- **AI 接口**：Deepseek API（OpenAI 兼容格式），**前端直接调用**，不经过 Rust 后端
- **UI 风格**：简约现代，参考 Linear.app / Notion 风格，支持暗色模式
- **打包体积目标**：~5MB

## 数据模型

- `Profile` — 个人档案（单文件 `data/profiles/profile.md`）
- `Position` — 岗位档案（按岗位方向，如"测试工程师"），`data/positions/`
- `Application` — 投递记录（每次投递一条），`data/applications/{日期}_{公司}_{岗位}.md`
- `Settings` — 设置（JSON 格式 `data/settings.json`）

## 页面结构

`/` 仪表盘 → `/positions` 岗位档案 → `/greeting` 打招呼生成 → `/applications` 投递记录 → `/profile` 个人档案 → `/settings` 设置

## 生成策略

招呼生成 = profile + position + JD → AI → { greeting, analysis: { matchScore, highlights, gaps, suggestions, keyRequirements } }

## 第二阶段目标

截图 OCR → 移动端适配 → 数据同步

## 设计系统

由 `ui-ux-pro-max` Skill 生成，位于 `design-system/job-assistant/MASTER.md`
- 主风格：Flat Design + Micro-interactions
- 辅风格：Minimalism, Soft UI Evolution
- 主色：Blue 600 (#2563EB)
- 字体：Inter (英文) + 系统字体 (中文)
- 间距：4px 基数
- 图标：Lucide React

页面级覆盖在 `design-system/job-assistant/pages/`

## 相关文件

- [[ARCHITECTURE.md]] — 完整架构文档
- [[ENVIRONMENT.md]] — 开发环境需求
- [[design-system/job-assistant/MASTER.md]] — 设计系统
- [[design-system/job-assistant/pages/greeting.md]] — 打招呼页设计覆盖

**Why:** 这是项目的整体架构定义，记录了所有技术选型和设计决策的原因。
**How to apply:** 开发时以 ARCHITECTURE.md 为准，任何偏离需要更新该文档。