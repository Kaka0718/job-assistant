# SPRINT_TASK_MODULE_A.md — 基础设施搭建

> **版本：** v1.0  
> **PM 分析师：** Claude PM Agent  
> **日期：** 2026-07-20  
> **Sprint 目标：** 搭建 Tauri 2.0 + React 19 项目骨架，完成路由、布局、数据存储层、基础组件库，确保后续功能开发可并行推进。

---

## 1. 需求全景摘要

本次 Sprint 搭建求职助手桌面应用的完整基础设施，包括项目脚手架、前端路由与布局、UI 基础组件库、Rust 后端数据存储层、以及所有核心数据模型的定义。基础设施完成后，后续 4 个功能模块（岗位档案、个人档案、AI 打招呼、投递记录）可直接在此基础上并行开发，无需重复搭建环境。

---

## 2. 模块拆分与开发指令

### 模块 A：项目脚手架与构建配置

- **前端 (Frontend) 任务清单**：
    1. **项目初始化**：创建 Tauri 2.0 + React 19 + TypeScript 5.8 + Vite 6 项目
       - 运行 `npm create tauri-app@latest` 选择 `react-ts` 模板
       - 项目名：`job-assistant`，标识符：`com.job-assistant.app`
    2. **依赖安装**：一次性安装所有前端依赖
       - 核心：`react-router-dom`, `zustand`, `lucide-react`, `date-fns`, `@tauri-apps/api`, `@tauri-apps/plugin-dialog`
       - 工具：`tailwindcss @tailwindcss/vite`
       - 初始化 shadcn/ui：`npx shadcn@latest init`（选择 New York 风格、Slate 色系）
    3. **构建配置**：
       - 配置 `vite.config.ts`（路径别名 `@/` → `src/`）
       - 配置 `tsconfig.json`（路径别名、strict 模式）
       - 配置 `tailwind.config.ts`（自定义主题色、字体、圆角）
       - 配置 `eslint.config.js`（flat config）
       - 配置 `prettier.config.js`
    4. **边界逻辑**：
       - 确保 `tsconfig` 的 `paths` 与 `vite.config` 的 `resolve.alias` 一致
       - 确保 Tailwind 的 `content` 路径覆盖所有 `.tsx` 文件

- **后端 (Backend) 任务清单**：
    1. **Rust 项目配置**：
       - 编辑 `src-tauri/Cargo.toml` 添加所有依赖（见架构文档 6.2 节）
       - 确认 `tauri.conf.json` 配置（窗口大小 1200×800，最小 900×600，标题"求职助手"）
       - 配置 `capabilities/default.json` 权限
    2. **项目结构**：在 `src-tauri/src/` 下创建目录骨架
       - `commands/`（mod.rs + position.rs + application.rs + profile.rs + settings.rs）
       - `models/`（mod.rs + position.rs + application.rs + profile.rs + settings.rs）
       - `storage/`（mod.rs + file_ops.rs + position_storage.rs + application_storage.rs + profile_storage.rs + settings_storage.rs）
       - `utils/`（mod.rs + frontmatter.rs + id.rs + error.rs）
    3. **非功能性要求**：确保 `cargo build` 编译通过，无 warning

---

### 模块 B：前端路由与布局系统

- **前端 (Frontend) 任务清单**：
    1. **页面路由**：配置 React Router v7 完整路由表
       - `/` → Dashboard（仪表盘）
       - `/positions` → PositionListPage（岗位档案列表）
       - `/positions/new` → PositionDetailPage（新建岗位档案，复用编辑页）
       - `/positions/:id` → PositionDetailPage（编辑岗位档案）
       - `/greeting` → GreetingPage（打招呼生成）
       - `/applications` → ApplicationListPage（投递记录列表）
       - `/profile` → ProfilePage（个人档案）
       - `/settings` → SettingsPage（设置）
       - `*` → NotFoundPage（404）
    2. **UI 组件 — 布局**：
       - **Sidebar**：固定宽度 224px（w-56），白色底
         - Logo 区域（顶部，应用名称 "求职助手" + 图标）
         - 导航菜单项（仪表盘、岗位档案、打招呼、投递记录、个人档案、设置）
         - 当前选中态：蓝色文字 + 左侧蓝色竖条指示器
         - 每个菜单项搭配 Lucide 图标
       - **Header**：当前页面标题 + 面包屑（可选）
       - **AppShell**：组合 Sidebar + Header + `<main>` 内容区
         - 主内容区自适应剩余宽度，`max-w-4xl` 居中，内边距 `p-6`
       - **暗色模式支持**：通过 Tailwind `dark:` 前缀 + CSS 变量实现 light/dark/system 三模式
    3. **边界逻辑**：
       - 窗口最小尺寸 900×600，低于时出现滚动条
       - 侧边栏在当前页面高亮
       - 路由切换时保留滚动位置（可选优化）
       - Sidebar 在暗色模式下颜色正确切换

- **后端 (Backend) 任务清单**：
    1. 本模块无后端任务（纯前端路由与布局）

---

### 模块 C：Rust 数据模型与存储层

- **前端 (Frontend) 任务清单**：
    1. **TypeScript 类型定义**：在 `src/types/` 下定义所有数据类型
       - `position.ts`：`Position` 接口、`PositionCategory` 联合类型、`CreatePositionInput` / `UpdatePositionInput`
       - `application.ts`：`Application` 接口、`ApplicationStatus` 联合类型、`ApplicationFilter`
       - `profile.ts`：`Profile` 接口
       - `greeting.ts`：`GreetingResult` 接口（含 `GreetingAnalysis`）
       - `settings.ts`：`Settings` 接口（含 `AISettings`、`AppSettings`）
       - `api.ts`：`ApiResponse<T>` 泛型包装类型
    2. **边界逻辑**：
       - 所有字段均使用 TypeScript 的 `strict` 模式
       - 可选字段标记为 `?`（如 `notes`、`tags`）
       - 枚举类型使用 `as const` + 联合类型，而非 `enum` 关键字

- **后端 (Backend) 任务清单**：
    1. **数据模型定义**（`src-tauri/src/models/`）：
       - `position.rs`：`Position` 结构体，含 `id`, `title`, `category`, `created`, `updated`, `status`, `skills`, `tags`, `notes` 字段
       - `application.rs`：`Application` 结构体，含 `id`, `positionId`, `company`, `positionTitle`, `created`, `matchScore`, `hasProgress`, `keywords` 字段
       - `profile.rs`：`Profile` 结构体，含 `id`, `name`, `title`, `city`, `email`, `phone`, `expectSalary`, `yearsOfExperience`, `skills` 字段
       - `settings.rs`：`Settings` 结构体（含嵌套 `AISettings`、`AppSettings`）
       - 所有结构体派生 `Serialize`, `Deserialize`, `Debug`, `Clone`
    2. **工具函数**（`src-tauri/src/utils/`）：
       - `frontmatter.rs`：实现 `parse_frontmatter<T>(content: &str) -> Result<(T, String)>` 和 `serialize_frontmatter<T>(data: &T, content: &str) -> Result<String>`
         - 按 `---\n` 分割，第一部分 YAML 解析，第二部分为正文
         - 使用 `serde_yaml` 进行序列化/反序列化
       - `id.rs`：`generate_id(prefix: &str) -> String` 生成 `pos_xxx` / `app_xxx` / `prof_xxx` 格式 ID
       - `error.rs`：自定义 `AppError` 枚举，实现 `From` trait 转换，Display 输出中文错误信息
    3. **文件存储层**（`src-tauri/src/storage/`）：
       - `file_ops.rs`：
         - `read_file(path: &Path) -> Result<String>` — 读取文件
         - `write_file(path: &Path, content: &str) -> Result<()>` — 写入文件
         - `list_files(dir: &Path) -> Result<Vec<PathBuf>>` — 列出目录下所有文件
         - `ensure_dir(path: &Path) -> Result<()>` — 确保目录存在（启动时自动创建 `data/profiles/`, `data/positions/`, `data/applications/`）
         - `delete_file(path: &Path) -> Result<()>` — 删除文件
       - `position_storage.rs`：
         - `list_positions() -> Result<Vec<Position>>` — 扫描 `data/positions/*.md` 并解析
         - `get_position(id: &str) -> Result<Option<Position>>` — 按 ID 查找
         - `create_position(input: CreatePositionInput) -> Result<Position>` — 生成 ID + 时间戳，写文件
         - `update_position(id: &str, input: UpdatePositionInput) -> Result<Position>` — 读 → 合并 → 写
         - `delete_position(id: &str) -> Result<()>` — 删除文件
       - `application_storage.rs`：
         - 支持按 `status`、`positionId`、日期范围筛选
         - 文件名格式：`{日期}_{公司名}_{岗位}.md`
       - `profile_storage.rs`：
         - 单文件 `data/profiles/profile.md`，不存在返回 `None`
       - `settings_storage.rs`：
         - JSON 文件读写（非 Markdown），使用 `serde_json`
    4. **Tauri Commands 桩代码**（`src-tauri/src/commands/`）：
       - 每个命令函数标注 `#[tauri::command]`
       - 返回 `Result<T, String>`（Rust 端 `AppError` 自动 `.to_string()`）
       - 所有命令在 `lib.rs` 中通过 `.invoke_handler(tauri::generate_handler![...])` 注册
       - 具体实现留空或返回 `todo!()`，仅确保编译通过
    5. **非功能性要求**：
       - 所有文件操作使用 `PathBuf` 而非字符串拼接，防范路径注入
       - 错误类型统一，前端统一处理 `Err` 分支
       - 启动时自动创建 `data/` 目录结构

---

### 模块 D：Zustand 状态管理

- **前端 (Frontend) 任务清单**：
    1. **Store 实现**（`src/stores/`）：
       - `positionStore.ts`：
         - 状态：`positions: Position[]`, `loading: boolean`, `error: string | null`
         - 动作：`fetchPositions()`, `getPosition(id)`, `createPosition(data)`, `updatePosition(id, data)`, `deletePosition(id)`, `archivePosition(id)`
         - 调用方式：`invoke('list_positions')` 等 Tauri Command
       - `applicationStore.ts`：
         - 状态：`applications: Application[]`, `filter: ApplicationFilter`, `loading`, `error`
         - 动作：`fetchApplications(filter)`, `createApplication(data)`, `updateApplication(id, data)`, `updateStatus(id, status)`, `deleteApplication(id)`
       - `profileStore.ts`：
         - 状态：`profile: Profile | null`, `loading: boolean`, `saving: boolean`
         - 动作：`fetchProfile()`, `saveProfile(data)`
       - `greetingStore.ts`：
         - 状态：`jdContent: string`, `selectedPositionId: string | null`, `result: GreetingResult | null`, `generating: boolean`, `error: string | null`, `progress: string`
         - 动作：`setJdContent(content)`, `setSelectedPosition(id)`, `generateGreeting()`, `reset()`
       - `settingsStore.ts`：
         - 状态：`settings: Settings`, `loaded: boolean`, `testing: boolean`, `testResult: { success, message } | null`
         - 动作：`fetchSettings()`, `saveSettings(data)`, `testConnection()`
    2. **边界逻辑**：
       - 每个 Store 的 `fetch*` 方法在组件 mount 时通过 `useEffect` 调用
       - 错误状态统一存储，供 UI 组件展示
       - `loading` 状态用于骨架屏展示
       - `greetingStore` 的 `generateGreeting()` 包含进度回调

- **后端 (Backend) 任务清单**：
    1. 本模块无后端任务（Store 仅调用已注册的 Tauri Command）

---

### 模块 E：shadcn/ui 基础组件库

- **前端 (Frontend) 任务清单**：
    1. **组件安装**（`npx shadcn@latest add`）：
       - `button` — 按钮（含 primary/secondary/outline 变体）
       - `card` — 卡片容器
       - `input` — 文本输入框
       - `textarea` — 多行文本输入
       - `select` — 下拉选择器
       - `dialog` — 弹窗/对话框
       - `badge` — 标签/徽标
       - `tabs` — 标签页切换
       - `toast` — 轻提示
       - `skeleton` — 骨架屏加载占位
    2. **组件风格定制**：
       - 根据设计系统覆盖 `button`、`card`、`input` 等组件的默认样式
       - 圆角：`--radius-sm: 4px`, `--radius-md: 6px`, `--radius-lg: 8px`, `--radius-xl: 12px`
       - 主色覆盖：`--primary: #2563EB` 及其衍生色
    3. **边界逻辑**：
       - 确保所有组件支持暗色模式
       - 确保 `toast` 组件安装在全局 `App.tsx` 中

- **后端 (Backend) 任务清单**：
    1. 本模块无后端任务

---

### 模块 F：通用组件库

- **前端 (Frontend) 任务清单**：
    1. **UI 组件**（`src/components/common/`）：
       - **EmptyState**：居中布局，64-96px 图标 + 标题 + 描述 + CTA 按钮
         - 支持 `icon`, `title`, `description`, `actionLabel`, `onAction` props
       - **LoadingSpinner**：居中旋转动画，可选 `size` prop（sm/md/lg）
       - **ErrorBoundary**：React 错误边界，捕获渲染错误
         - 显示友好错误页面 + "重新加载"按钮
         - 支持 `onError` 回调（可用于日志上报）
       - **ConfirmDialog**：确认对话框，基于 shadcn Dialog
         - 支持 `title`, `description`, `confirmLabel`, `cancelLabel`, `variant`（danger/warning/info）
         - 确认按钮根据 `variant` 显示对应颜色
       - **SearchInput**：带搜索图标的输入框
         - 支持 `value`, `onChange`, `placeholder`, `debounceMs`（默认 300ms）props
         - 使用 `useDebounce` hook
    2. **边界逻辑**：
       - EmptyState 的图标使用 Lucide 图标，不支持 emoji
       - ErrorBoundary 需要捕获异步错误吗？React 错误边界默认只捕获渲染错误，异步错误用全局 `window.onerror`
       - ConfirmDialog 的确认按钮在 loading 时显示 Spinner 并禁用
       - SearchInput 支持受控和非受控模式
       - 所有组件支持 `className` 覆盖

- **后端 (Backend) 任务清单**：
    1. 本模块无后端任务

---

## 3. 验收标准 (Definition of Done)

- [ ] `npm run tauri dev` 启动成功，Tauri 窗口正常显示（1200×800，标题"求职助手"）
- [ ] 侧边栏渲染正常，6 个导航菜单项可点击，路由切换正确，无控制台报错
- [ ] 所有 9 个路由页面（含 404）均有对应的页面组件，非空内容
- [ ] shadcn/ui 10 个组件全部安装且可正常导入使用
- [ ] Rust 后端 `cargo build` 编译通过，无 warning
- [ ] 所有 TypeScript 类型定义在 `src/types/` 中完整，无 `any` 类型
- [ ] 所有 5 个 Zustand Store 文件存在，结构完整，可通过 `invoke` 调用后端（允许暂用 `todo!()` 后端实现）
- [ ] 5 个通用组件（EmptyState、LoadingSpinner、ErrorBoundary、ConfirmDialog、SearchInput）渲染正常
- [ ] 暗色模式切换正常（light/dark/system 三模式）
- [ ] 窗口缩放到最小 900×600 时内容可滚动，无布局断裂
- [ ] `data/` 目录在应用启动时自动创建（profiles/、positions/、applications/ 子目录）

---

## 4. 二次验证关注点

测试 Agent 完成后，PM 我将重点检查以下内容：

1. **路由覆盖完整性**：每个路由路径是否都有对应的页面组件，404 兜底是否生效
2. **Rust 编译质量**：`cargo build` 是否零 warning，代码风格是否一致（`cargo clippy`）
3. **类型定义准确性**：TypeScript 类型与 Rust 结构体是否字段一致（字段名、类型、可选性）
4. **暗色模式切换**：切换暗色/亮色时是否所有组件都正确跟随，无残留亮色区域
5. **Skeleton 骨架屏**：Loading 状态是否使用 Skeleton 组件而非 Spinner（架构文档要求）
6. **目录结构一致性**：实际代码目录结构是否与 `ARCHITECTURE.md` 第 3 节一致