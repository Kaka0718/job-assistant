# 求职助手 — 完整项目架构文档

> **版本：** v1.1  
> **最后更新：** 2026-07-18  
> **技术栈：** Tauri 2.0 + React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS v4
> **设计系统：** ui-ux-pro-max Skill (Flat Design + Micro-interactions)

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈详解](#2-技术栈详解)
3. [目录结构](#3-目录结构)
4. [数据模型与存储](#4-数据模型与存储)
5. [前端架构](#5-前端架构)
6. [Rust 后端架构](#6-rust-后端架构)
7. [AI 集成层](#7-ai-集成层)
8. [UI/UX 设计系统](#8-uiux-设计系统)
9. [路由与页面流](#9-路由与页面流)
10. [状态管理](#10-状态管理)
11. [错误处理与边界情况](#11-错误处理与边界情况)
12. [开发环境搭建](#12-开发环境搭建)
13. [构建与打包](#13-构建与打包)
14. [未来扩展路线](#14-未来扩展路线)

---

## 1. 项目概述

### 1.1 产品定位

一款本地运行的桌面端求职辅助工具，帮助求职者管理岗位档案、智能生成打招呼文案、追踪投递进度。

### 1.2 核心功能

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 岗位档案管理 | 按岗位方向（测试/开发/运营等）建立档案，CRUD | P0 |
| 个人档案管理 | 维护个人基础信息、技能、经历 | P0 |
| AI 打招呼生成 | 粘贴 JD → 选择档案 → 生成打招呼文案 + 深度分析 | P0 |
| 投递记录追踪 | 每次投递一条记录，跟踪状态流转 | P0 |
| 设置管理 | API Key、模型选择、全局配置 | P0 |
| 截图 OCR（后续） | 通过截图识别 JD 文字 | P1 |

### 1.3 用户角色

- **单一用户**：本地桌面端应用，无多用户需求

---

## 2. 技术栈详解

### 2.1 技术选型一览

| 层级 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| 桌面框架 | **Tauri** | 2.x | 包体极小 (~5MB)，Rust 性能，安全 |
| 前端框架 | **React** | 19.x | 最新版本，并发模式，Server Components 可选 |
| 语言 | **TypeScript** | 5.8 | 类型安全，IDE 友好 |
| 构建工具 | **Vite** | 6.x | 极速 HMR，原生 ESM |
| CSS 框架 | **Tailwind CSS** | 4.x | 原子化 CSS，设计系统友好，v4 性能大幅提升 |
| UI 组件 | **shadcn/ui** | latest | 基于 Radix UI，可定制，美观，与 Tailwind 原生集成 |
| 图标 | **Lucide React** | latest | 轻量，纯净，现代化图标集 |
| 状态管理 | **Zustand** | 5.x | 极其轻量，无 boilerplate，TypeScript 友好 |
| 数据存储 | **Markdown 文件** | — | 人类可读，零依赖，可手动编辑，可 Git 管理 |
| 前端路由 | **React Router** | 7.x | 标准 SPA 路由 |
| 日期处理 | **date-fns** | 4.x | 轻量，按需引入，Tree-shakeable |
| 代码格式化 | **Prettier** | 3.x | 统一代码风格 |
| 代码检查 | **ESLint** | 9.x | Flat config，现代化 lint |

### 2.2 为什么不是其他方案？

| 淘汰方案 | 理由 |
|----------|------|
| Electron | 包体过大 (~150MB)，内存占用高，违背"轻量"初衷 |
| Flutter | 需要安装 Dart SDK + Flutter SDK，环境配置重；桌面端生态不够成熟 |
| Plain SQLite | 不如 Markdown 直观，且当前数据量完全不需要 |
| Redux | 太重，Zustand 对于单页应用足够 |
| CSS Modules | 维护成本高，不如 Tailwind 的 utility-first 配合设计系统 |

---

## 3. 目录结构

```
job-assistant/
├── src/                                # React 前端源码
│   ├── main.tsx                        # 入口文件
│   ├── App.tsx                         # 根组件 + 路由配置
│   ├── index.css                       # 全局样式 + Tailwind 指令
│   │
│   ├── components/                     # 可复用组件
│   │   ├── ui/                         # 基础 UI 组件（shadcn/ui 生成）
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                     # 布局组件
│   │   │   ├── Sidebar.tsx             # 侧边导航栏
│   │   │   ├── Header.tsx              # 顶部栏
│   │   │   ├── MainLayout.tsx          # 主布局容器
│   │   │   └── AppShell.tsx            # 应用外壳（sidebar + header + content）
│   │   │
│   │   ├── position/                   # 岗位档案相关组件
│   │   │   ├── PositionCard.tsx        # 档案卡片
│   │   │   ├── PositionForm.tsx        # 档案编辑表单
│   │   │   ├── PositionList.tsx        # 档案列表
│   │   │   └── PositionSelector.tsx    # 档案选择器（用于打招呼页）
│   │   │
│   │   ├── greeting/                   # 打招呼相关组件
│   │   │   ├── JDPasteInput.tsx        # JD 粘贴输入区域
│   │   │   ├── GreetingResult.tsx      # 打招呼结果展示
│   │   │   ├── DeepAnalysisCard.tsx    # 深度分析卡片
│   │   │   ├── GreetingActions.tsx     # 复制/编辑/重新生成操作栏
│   │   │   └── GenerationProgress.tsx  # 生成过程中的加载状态
│   │   │
│   │   ├── application/                # 投递记录相关组件
│   │   │   ├── ApplicationRow.tsx      # 投递记录行
│   │   │   ├── ApplicationTable.tsx    # 投递记录表格
│   │   │   ├── ApplicationForm.tsx     # 投递记录表单
│   │   │   └── StatusBadge.tsx         # 状态标签（彩色）
│   │   │
│   │   ├── profile/                    # 个人档案相关组件
│   │   │   ├── ProfileForm.tsx         # 个人档案编辑表单
│   │   │   ├── ProfileView.tsx         # 个人档案展示
│   │   │   └── SkillTags.tsx           # 技能标签编辑
│   │   │
│   │   └── common/                     # 通用组件
│   │       ├── EmptyState.tsx          # 空状态占位
│   │       ├── LoadingSpinner.tsx      # 加载动画
│   │       ├── ErrorBoundary.tsx       # 错误边界
│   │       ├── ConfirmDialog.tsx       # 确认对话框
│   │       ├── MarkdownRenderer.tsx    # Markdown 渲染器
│   │       └── SearchInput.tsx         # 搜索输入框
│   │
│   ├── pages/                          # 页面级组件
│   │   ├── Dashboard.tsx               # 首页/仪表盘
│   │   ├── PositionListPage.tsx        # 岗位档案列表页
│   │   ├── PositionDetailPage.tsx      # 岗位档案详情页
│   │   ├── GreetingPage.tsx            # 打招呼生成页
│   │   ├── ApplicationListPage.tsx     # 投递记录列表页
│   │   ├── ProfilePage.tsx             # 个人档案页
│   │   ├── SettingsPage.tsx            # 设置页
│   │   └── NotFoundPage.tsx            # 404 页面
│   │
│   ├── hooks/                          # 自定义 Hooks
│   │   ├── usePositions.ts             # 操作岗位档案
│   │   ├── useApplications.ts          # 操作投递记录
│   │   ├── useProfile.ts               # 操作个人档案
│   │   ├── useGreeting.ts              # 生成打招呼（AI 调用）
│   │   ├── useSettings.ts              # 读取/写入设置
│   │   ├── useAI.ts                    # AI API 调用封装
│   │   └── useDebounce.ts              # 防抖
│   │
│   ├── stores/                         # Zustand 状态仓库
│   │   ├── positionStore.ts            # 岗位档案状态
│   │   ├── applicationStore.ts         # 投递记录状态
│   │   ├── profileStore.ts             # 个人档案状态
│   │   ├── greetingStore.ts            # 打招呼生成状态
│   │   └── settingsStore.ts            # 设置状态
│   │
│   ├── lib/                            # 工具函数
│   │   ├── ai.ts                       # AI API 调用封装（Deepseek/OpenAI/Anthropic）
│   │   ├── markdown.ts                 # Markdown 解析/生成工具
│   │   ├── file.ts                     # 文件操作工具
│   │   ├── date.ts                     # 日期格式化
│   │   ├── id.ts                       # ID 生成器
│   │   ├── constants.ts                # 常量定义
│   │   └── validators.ts               # 表单验证
│   │
│   ├── types/                          # TypeScript 类型定义
│   │   ├── position.ts                 # 岗位档案类型
│   │   ├── application.ts              # 投递记录类型
│   │   ├── profile.ts                  # 个人档案类型
│   │   ├── greeting.ts                 # 打招呼相关类型
│   │   ├── settings.ts                 # 设置类型
│   │   └── api.ts                      # API 响应类型
│   │
│   └── styles/                         # 样式文件
│       └── globals.css                 # Tailwind + shadcn 基础样式
│
├── src-tauri/                          # Tauri Rust 后端
│   ├── Cargo.toml                      # Rust 依赖配置
│   ├── tauri.conf.json                 # Tauri 配置
│   ├── build.rs                        # 构建脚本
│   ├── icons/                          # 应用图标
│   ├── src/
│   │   ├── main.rs                     # 入口
│   │   ├── lib.rs                      # 库入口
│   │   ├── commands/                   # Tauri Command 命令
│   │   │   ├── mod.rs
│   │   │   ├── position.rs             # 岗位档案 CRUD
│   │   │   ├── application.rs          # 投递记录 CRUD
│   │   │   ├── profile.rs              # 个人档案 CRUD
│   │   │   └── settings.rs             # 设置读写
│   │   │
│   │   ├── models/                     # 数据模型
│   │   │   ├── mod.rs
│   │   │   ├── position.rs
│   │   │   ├── application.rs
│   │   │   ├── profile.rs
│   │   │   └── settings.rs
│   │   │
│   │   ├── storage/                    # 文件存储层
│   │   │   ├── mod.rs
│   │   │   ├── file_ops.rs             # 文件读写基础操作
│   │   │   ├── position_storage.rs     # 岗位档案存储
│   │   │   ├── application_storage.rs  # 投递记录存储
│   │   │   ├── profile_storage.rs      # 个人档案存储
│   │   │   └── settings_storage.rs     # 设置存储
│   │   │
│   │   └── utils/                      # Rust 工具
│   │       ├── mod.rs
│   │       ├── frontmatter.rs          # Markdown frontmatter 解析/生成
│   │       ├── id.rs                   # UUID 生成
│   │       └── error.rs                # 错误类型定义
│   │
│   └── capabilities/                   # Tauri 权限配置
│       └── default.json
│
├── data/                               # 本地数据存储目录（运行时生成）
│   ├── profiles/                       # 个人档案（只有一个）
│   │   └── profile.md
│   ├── positions/                      # 岗位档案
│   │   ├── 测试工程师.md
│   │   ├── 后端开发工程师.md
│   │   └── 运营专员.md
│   └── applications/                   # 投递记录
│       ├── 2026-07-18_字节跳动_测试工程师.md
│       └── 2026-07-18_腾讯_后端开发.md
│
├── public/                             # 静态资源
│   └── favicon.svg
│
├── package.json                        # Node 依赖配置
├── tsconfig.json                       # TypeScript 配置
├── tsconfig.node.json                  # Node 端 TypeScript 配置
├── vite.config.ts                      # Vite 构建配置
├── tailwind.config.ts                  # Tailwind CSS 配置
├── eslint.config.js                    # ESLint 配置
├── prettier.config.js                  # Prettier 配置
├── .gitignore                          # Git 忽略规则
├── README.md                           # 项目说明
└── CLINE.md                            # 项目规范（给 AI 助手的说明）
```

---

## 4. 数据模型与存储

### 4.1 数据存储策略

采用 **Markdown 文件 + Frontmatter** 方案，每个实体对应一个 `.md` 文件。

**优势：**
- ✅ 人类可读，可直接用文本编辑器打开编辑
- ✅ 零依赖，无需数据库驱动
- ✅ 可用 Git 做版本管理（后悔药）
- ✅ 迁移到 SQLite 时，可写脚本批量导入

**劣势及应对：**
- ⚠️ 大量数据下查询性能下降 → 但个人用户数据量极小（<1000 条），完全够用
- ⚠️ 并发写冲突 → 单用户桌面应用，无并发问题

### 4.2 个人档案 (Profile)

**文件路径：** `data/profiles/profile.md`

```markdown
---
id: prof_001
created: 2026-07-18
updated: 2026-07-18
name: 张三
title: 测试工程师
city: 北京
email: zhangsan@example.com
phone: "13800138000"
expectSalary: "15K-20K"
yearsOfExperience: 3
skills:
  - 功能测试
  - 自动化测试
  - Python
  - Selenium
  - 接口测试
  - SQL
---

## 工作经历

### ABC 科技有限公司 | 测试工程师 | 2023.06 - 至今
- 负责电商平台核心交易链路的功能测试和自动化测试
- 搭建自动化测试框架，覆盖 200+ 核心用例
- 参与 3 个大版本迭代，保障零线上事故

### XYZ 互联网公司 | 初级测试工程师 | 2021.07 - 2023.05
- 负责 APP 端功能测试，编写测试用例 500+
- 参与接口自动化测试脚本编写

## 项目经历

### 电商平台自动化测试体系建设
- 基于 Python + Selenium 搭建 Web UI 自动化框架
- 集成 Jenkins 实现每日回归测试
- 缺陷发现率提升 40%

## 教育背景
- XX大学 | 计算机科学与技术 | 本科 | 2017 - 2021
```

**TypeScript 类型：**

```typescript
interface Profile {
  id: string
  created: string
  updated: string
  name: string
  title: string
  city: string
  email: string
  phone: string
  expectSalary: string
  yearsOfExperience: number
  skills: string[]
  workExperience: string    // Markdown 正文
  projects: string          // Markdown 正文
  education: string         // Markdown 正文
}
```

### 4.3 岗位档案 (Position)

**文件路径：** `data/positions/{岗位名称}.md`

```markdown
---
id: pos_001
title: 测试工程师
category: 测试
created: 2026-07-18
updated: 2026-07-18
status: active
skills:
  - 功能测试
  - 自动化测试
  - Python
tags:
  - 软件测试
  - 质量保障
notes: "偏向自动化测试方向的岗位"
---

## 个人匹配分析
- 3 年测试经验，熟悉自动化测试
- 有电商经验，匹配市面上大部分互联网公司
- 欠缺：性能测试、安全测试经验

## 常见面试问题
- 如何设计测试用例？
- 自动化框架如何选型？
```

**TypeScript 类型：**

```typescript
interface Position {
  id: string
  title: string
  category: PositionCategory
  created: string
  updated: string
  status: 'active' | 'archived'
  skills: string[]
  tags: string[]
  notes: string
  analysis: string          // Markdown 正文
  interviewQuestions: string // Markdown 正文
}

type PositionCategory = '测试' | '开发' | '运营' | '产品' | '设计' | '运维' | '数据' | '其他'
```

### 4.4 投递记录 (Application)

**文件路径：** `data/applications/{日期}_{公司名}_{岗位}.md`

```markdown
---
id: app_001
positionId: pos_001
company: 字节跳动
positionTitle: 测试工程师
jobUrl: "https://www.zhipin.com/job_detail/xxx.html"
status: applied
created: 2026-07-18
updated: 2026-07-18
salary: "15K-25K"
location: 北京
source: Boss直聘
---

## JD 原文

[这里粘贴岗位 JD 原文]

## 生成的打招呼

> 您好，我对贵公司的测试工程师岗位很感兴趣。我有 3 年测试经验...

## 深度分析

- **匹配度**：85%
- **岗位亮点**：自动化测试、接口测试
- **建议补充**：CI/CD 经验

## 沟通记录

- 2026-07-18 14:00 已发送打招呼
- 2026-07-19 10:00 HR 已读，等待回复
```

**TypeScript 类型：**

```typescript
interface Application {
  id: string
  positionId: string        // 关联岗位档案
  company: string
  positionTitle: string
  jobUrl: string
  status: ApplicationStatus
  created: string
  updated: string
  salary: string
  location: string
  source: string
  jdContent: string
  greeting: string
  analysis: string
  timeline: TimelineEntry[]
}

type ApplicationStatus =
  | 'draft'        // 草稿/待投递
  | 'applied'      // 已投递
  | 'read'         // 已读
  | 'chatting'     // 沟通中
  | 'interview'    // 面试中
  | 'offer'        // 已拿 Offer
  | 'rejected'     // 不合适
  | 'archived'     // 已归档

interface TimelineEntry {
  date: string
  time: string
  action: string
  note?: string
}
```

### 4.5 设置 (Settings)

**文件路径：** `data/settings.json` （用 JSON 而非 Markdown，因为纯配置）

```json
{
  "ai": {
    "provider": "deepseek",
    "apiKey": "sk-xxxxxxxxxxxxxxxx",
    "model": "deepseek-chat",
    "baseUrl": "https://api.deepseek.com",
    "temperature": 0.7,
    "maxTokens": 2048
  },
  "app": {
    "theme": "system",
    "language": "zh-CN",
    "dataDir": "./data"
  }
}
```

**TypeScript 类型：**

```typescript
interface Settings {
  ai: {
    provider: 'deepseek' | 'openai' | 'anthropic'
    apiKey: string
    model: string
    baseUrl: string
    temperature: number
    maxTokens: number
  }
  app: {
    theme: 'light' | 'dark' | 'system'
    language: 'zh-CN' | 'en'
    dataDir: string
  }
}
```

---

## 5. 前端架构

### 5.1 组件树

```
<App>
  <ErrorBoundary>
    <BrowserRouter>
      <AppShell>
        <Sidebar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/positions" element={<PositionListPage />} />
            <Route path="/positions/:id" element={<PositionDetailPage />} />
            <Route path="/greeting" element={<GreetingPage />} />
            <Route path="/applications" element={<ApplicationListPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Toaster />
      </AppShell>
    </BrowserRouter>
  </ErrorBoundary>
</App>
```

### 5.2 各页面状态覆盖

#### Dashboard（首页/仪表盘）
| 状态 | 行为 |
|------|------|
| 加载中 | Skeleton 骨架屏，3 个统计卡片 + 列表占位 |
| 空数据 | 欢迎引导页，提示"添加第一个岗位档案" |
| 有数据 | 统计概览（档案数/投递数/面试数/Offer数）+ 最近投递列表 |
| 错误 | 错误提示卡片 + 重试按钮 |

#### PositionListPage（岗位档案列表）
| 状态 | 行为 |
|------|------|
| 加载中 | 列表 Skeleton（5 条卡片占位） |
| 空数据 | EmptyState 插画 + "新建档案"按钮 |
| 有数据 | 卡片网格 + 搜索/筛选 |
| 错误 | 错误提示 + 重试 |
| 边界：超长标题 | 文字截断 + Tooltip 显示完整 |
| 边界：无分类 | 归入"其他"分类 |

#### GreetingPage（打招呼生成页）
| 状态 | 行为 |
|------|------|
| 初始 | 空输入框 + 档案选择器 |
| 粘贴 JD 后 | 自动检测是否已选档案，若未选则提示 |
| 生成中 | Progress 动画 + "正在分析JD..." 分步提示 |
| 生成成功 | 打招呼文案展示 + 深度分析卡片 |
| 生成失败 | 错误提示（区分 API 错误/网络错误/格式错误）+ 重试按钮 |
| 边界：JD 为空 | 按钮禁用，提示"请粘贴 JD" |
| 边界：JD 过长 | 字符数提示，截断到模型最大上下文 |
| 边界：API Key 未配置 | 引导跳转到设置页 |
| 边界：模型返回格式异常 | 兜底解析 + 展示原始内容 |

#### ApplicationListPage（投递记录列表）
| 状态 | 行为 |
|------|------|
| 加载中 | 表格 Skeleton |
| 空数据 | EmptyState + "去生成打招呼"引导 |
| 有数据 | 表格列表 + 状态筛选 + 搜索 |
| 错误 | 错误提示 + 重试 |
| 边界：极多记录 | 分页（每页 20 条） |

#### ProfilePage（个人档案页）
| 状态 | 行为 |
|------|------|
| 未创建 | 空表单，引导填写 |
| 已创建 | 展示模式 + 编辑按钮切换 |
| 编辑中 | 表单编辑模式，实时保存或保存按钮 |
| 保存失败 | Toast 提示 + 自动重试 |

#### SettingsPage（设置页）
| 状态 | 行为 |
|------|------|
| 默认 | 从文件加载设置 |
| 修改中 | 实时保存到文件 |
| API Key 可见性 | 默认隐藏，点击眼睛图标切换可见 |
| 测试连接 | 点击"测试连接"按钮，调用一次 AI 检查连通性 |
| 连接失败 | 红色提示 + 错误详情 |

### 5.3 核心组件状态覆盖

#### PositionCard
- **正常**：展示岗位名称、分类、技能标签、投递数
- **已归档**：灰色调，右下角 "已归档" 标记
- **选中态**：蓝色边框 + 阴影

#### JDPasteInput
- **空态**：虚线边框，居中提示文字 + 粘贴图标
- **有内容**：实线边框，显示文字预览（截断），右下角字符数
- **过长**：红色边框 + 警告提示
- **自动检测到URL**：提取 URL 中的岗位信息

#### GreetingResult
- **加载中**：打字机效果骨架（逐行亮起）
- **成功**：分两栏展示（打招呼 + 深度分析）
- **空内容**：显示"未生成内容"

#### StatusBadge
| 状态 | 颜色 |
|------|------|
| draft | 灰色 |
| applied | 蓝色 |
| read | 青色 |
| chatting | 紫色 |
| interview | 橙色 |
| offer | 绿色 |
| rejected | 红色 |
| archived | 灰色（浅） |

---

## 6. Rust 后端架构

### 6.1 Tauri Commands

所有命令通过 `#[tauri::command]` 暴露给前端。

```
├── position.rs
│   ├── list_positions()          → Vec<Position>
│   ├── get_position(id: String)  → Option<Position>
│   ├── create_position(data)     → Position
│   ├── update_position(id, data) → Position
│   ├── delete_position(id)       → ()
│   └── archive_position(id)      → Position
│
├── application.rs
│   ├── list_applications(filter) → Vec<Application>
│   ├── get_application(id)       → Option<Application>
│   ├── create_application(data)  → Application
│   ├── update_application(data)  → Application
│   ├── delete_application(id)    → ()
│   └── update_status(id, status) → Application
│
├── profile.rs
│   ├── get_profile()             → Option<Profile>
│   ├── save_profile(data)        → Profile
│   └── delete_profile()          → ()
│
└── settings.rs
    ├── get_settings()            → Settings
    ├── save_settings(data)       → Settings
    └── test_ai_connection()      → Result<boolean, String>
```

### 6.2 Rust 依赖 (Cargo.toml)

```toml
[dependencies]
tauri = { version = "2", features = ["dialog"] }
tauri-plugin-dialog = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
serde_yaml = "0.9"           # 用于 frontmatter 解析（YAML）
chrono = "0.4"               # 日期处理
uuid = { version = "1", features = ["v4"] }
tokio = { version = "1", features = ["full"] }  # 异步运行时
thiserror = "2"              # 错误处理
```

### 6.3 文件存储层设计

```
storage/
├── file_ops.rs              # 通用文件操作
│   ├── read_file(path)      → String
│   ├── write_file(path, content) → ()
│   ├── list_files(dir)      → Vec<Path>
│   └── ensure_dir(path)     → ()
│
├── position_storage.rs      # 岗位档案存储
│   ├── 从 data/positions/ 目录读取全部 .md 文件
│   ├── 解析 frontmatter + 正文
│   ├── 写入时生成 frontmatter
│   └── 删除时移除文件
│
├── application_storage.rs   # 投递记录存储
│   ├── 同上，在 data/applications/ 目录操作
│   └── 支持按状态/日期/公司筛选
│
├── profile_storage.rs       # 个人档案存储
│   ├── 单文件 data/profiles/profile.md
│   └── 不存在时返回 None
│
└── settings_storage.rs      # 设置存储
    └── JSON 文件读写，非 Markdown
```

### 6.4 Frontmatter 解析流程

```
读取 .md 文件
    ↓
按 "---" 分割
    ↓
第一部分 → 用 serde_yaml 解析为 Frontmatter 结构体
    ↓
第二部分 → 剩余正文作为 Markdown content
    ↓
合并为完整数据模型 → 返回给前端
```

写入流程相反：将结构体序列化为 YAML → 拼接 `---\n{yaml}\n---\n{content}` → 写文件。

---

## 7. AI 集成层

### 7.1 架构设计

AI 调用**直接从 React 前端发起**，不经过 Rust 后端。原因：

- Deepseek 和 OpenAI 都是 HTTP API，前端 fetch 直接调
- 减少 Rust 后端的职责，保持文件操作单一职责
- 避免跨语言序列化/反序列化开销

### 7.2 支持的 API 格式

```typescript
// OpenAI 兼容格式（Deepseek 使用此格式）
interface OpenAIRequest {
  model: string
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
  temperature?: number
  max_tokens?: number
}

interface OpenAIResponse {
  choices: {
    message: { content: string }
  }[]
}

// Anthropic 格式（预留）
interface AnthropicRequest {
  model: string
  messages: { role: 'user' | 'assistant'; content: string }[]
  system?: string
  max_tokens: number
}
```

### 7.3 核心 Prompt 设计

**System Prompt：**

```
你是一个求职助手，帮助求职者生成个性化的打招呼文案和岗位分析。
你需要根据求职者的个人档案和招聘岗位的 JD，生成合适的打招呼内容。

## 输出格式要求
请严格按照以下 JSON 格式输出，不要包含其他内容：

{
  "greeting": "生成的打招呼文案，50-100字，语气礼貌专业，突出匹配点",
  "analysis": {
    "matchScore": 85,
    "highlights": ["亮点1", "亮点2", "亮点3"],
    "gaps": ["不足1", "不足2"],
    "suggestions": ["建议1", "建议2"],
    "keyRequirements": ["硬性要求1", "硬性要求2"]
  }
}

## 打招呼文案要求
- 语气礼貌、专业
- 突出个人与岗位的匹配点
- 控制 50-100 字
- 不要包含联系方式
- 不要过度承诺

## 深度分析要求
- matchScore：0-100 的匹配度评分
- highlights：候选人最匹配该岗位的 2-3 个亮点
- gaps：候选人可能欠缺的方面
- suggestions：针对该岗位的投递建议
- keyRequirements：该岗位最关键的 2-3 个硬性要求
```

**User Message 模板：**

```
请根据以下信息生成打招呼文案：

## 我的个人档案
{profile 内容}

## 目标岗位档案
{position 内容}

## 招聘岗位 JD
{jd 内容}
```

### 7.4 AI 调用封装 (`src/lib/ai.ts`)

```typescript
// 核心函数
async function generateGreeting(
  params: {
    profile: Profile
    position: Position
    jdContent: string
    settings: Settings
  },
  onProgress?: (stage: string) => void
): Promise<GreetingResult>

// 测试连接
async function testConnection(settings: Settings): Promise<boolean>

// 流式调用（优化项，让用户看到打字机效果）
async function generateGreetingStream(
  params: { ... },
  onChunk: (text: string) => void
): Promise<GreetingResult>
```

### 7.5 错误处理

| 错误类型 | 表现 | 用户看到 |
|----------|------|----------|
| API Key 无效 | 401 错误 | "API Key 无效，请检查设置" |
| 网络错误 | fetch 超时/失败 | "网络连接失败，请检查网络" |
| 模型返回格式异常 | JSON 解析失败 | 兜底展示原始内容 + "格式异常，请重试" |
| 请求超时 | 30s 超时 | "生成超时，请重试" |
| 内容过长 | Token 超限 | 自动截断 JD + 提示"已自动截断过长内容" |
| 余额不足 | 429/402 | "API 余额不足，请充值" |

---

## 8. UI/UX 设计系统

> 本设计系统由 `ui-ux-pro-max` Skill 根据产品类型分析自动生成，完整版本见 `design-system/job-assistant/MASTER.md`。
> 设计 Skill 位于 `.agents/skills/ui-ux-pro-max/`，可通过 `python .agents/skills/ui-ux-pro-max/scripts/search.py` 查询详细规则。

### 8.1 设计风格

| 维度 | 选择 | 理由 |
|------|------|------|
| **主风格** | Flat Design + Micro-interactions | UI-ux-pro-max 对 Productivity Tool 类产品的推荐方案 |
| **辅助风格** | Minimalism, Soft UI Evolution | 保底方案，提升精致感 |
| **设计关键词** | clean, functional, spacious, professional, trust |

**风格规范：**
- 2D 平面化设计，无冗余装饰
- 微交互（hover 变色、点击 scale(0.97) 缩放、过渡动画）
- 大量留白，内容呼吸感
- 几何图形 + 简洁图标（Lucide，非 emoji）
- 无渐变/大阴影，使用扁平色块区分层级
- 圆角 6-12px 克制使用

### 8.2 色彩体系

#### 主色

| Token | 色值 | 用途 |
|-------|------|------|
| `--primary` | `#2563EB` (Blue 600) | 主色、按钮、链接，专业信任感 |
| `--primary-light` | `#3B82F6` (Blue 500) | hover 态 |
| `--primary-dark` | `#1D4ED8` (Blue 700) | 激活态 |
| `--primary-bg` | `#EFF6FF` (Blue 50) | 浅色背景 |

#### 语义色

| Token | 色值 | 用途 |
|-------|------|------|
| `--success` | `#059669` (Emerald 600) | 已投递、Offer、成功 |
| `--warning` | `#D97706` (Amber 600) | 面试中、待处理 |
| `--error` | `#DC2626` (Red 600) | 拒绝、错误、删除 |
| `--info` | `#0284C7` (Sky 600) | 已读、信息提示 |

#### 中性色

| Token | 色值 | 用途 |
|-------|------|------|
| `--bg` | `#F8FAFC` (Slate 50) | 页面背景 |
| `--surface` | `#FFFFFF` | 卡片/面板背景 |
| `--surface-hover` | `#F1F5F9` (Slate 100) | 卡片 hover |
| `--border` | `#E2E8F0` (Slate 200) | 边框/分割线 |
| `--text-primary` | `#0F172A` (Slate 900) | 主文字 |
| `--text-secondary` | `#475569` (Slate 600) | 次要文字 |
| `--text-muted` | `#94A3B8` (Slate 400) | 弱化文字 |

#### 投递状态色

| 状态 | 色值 | 对应 Token |
|------|------|------------|
| 草稿 (draft) | `#94A3B8` | Slate 400 |
| 已投递 (applied) | `#2563EB` | Blue 600 |
| 已读 (read) | `#0284C7` | Sky 600 |
| 沟通中 (chatting) | `#7C3AED` | Violet 600 |
| 面试中 (interview) | `#D97706` | Amber 600 |
| Offer (offer) | `#059669` | Emerald 600 |
| 拒绝 (rejected) | `#DC2626` | Red 600 |
| 已归档 (archived) | `#CBD5E1` | Slate 300 |

### 8.3 字体

```
字体族：
  - 英文字体：Inter (Variable) — 无衬线，现代，可读性强
  - 中文字体：系统默认（PingFang SC / Microsoft YaHei）
  - 等宽字体：JetBrains Mono — 数据展示、代码块

字体层级：
  - h1: 24px (text-2xl)  Semibold 600  行高 1.2  字距 -0.02em  页面标题
  - h2: 20px (text-xl)   Semibold 600  行高 1.3  字距 -0.01em  区块标题
  - h3: 16px (text-base) Semibold 600  行高 1.4  字距 0       卡片标题
  - body: 14px (text-sm) Regular 400   行高 1.5  字距 0       正文
  - caption: 12px (text-xs) Regular 400 行高 1.5 字距 0       辅助文字
  - badge: 11px         Medium 500    行高 1    字距 0.05em   标签/徽标
  - code: 13px (text-sm) Mono          行高 1.5  字距 0       数据/代码
```

### 8.4 间距

基于 4px 基数，使用 Tailwind 默认间距体系：

| Token | 值 | 用途 |
|-------|-----|------|
| space-1 | 4px | 微间距 |
| space-2 | 8px | 紧凑元素间距 |
| space-3 | 12px | 内边距紧凑 |
| space-4 | 16px | 标准内边距 |
| space-5 | 20px | 卡片内边距 |
| space-6 | 24px | 区块间距 |
| space-8 | 32px | 大区块间距 |
| space-10 | 40px | 页面间距 |
| space-12 | 48px | 大幅留白 |

### 8.5 圆角

| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | 4px | 输入框、小元素 |
| `--radius-md` | 6px | 按钮、卡片 |
| `--radius-lg` | 8px | 大卡片、弹窗 |
| `--radius-xl` | 12px | 顶部弹窗 |
| `--radius-full` | 9999px | 标签、头像 |

### 8.6 阴影

遵循 Flat Design 原则，阴影克制使用，主要用于层级区分：

| Token | 值 | 用途 |
|-------|-----|------|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.04)` | 轻微悬浮 |
| `--shadow-md` | `0 4px 12px -2px rgb(0 0 0 / 0.06)` | 卡片、下拉菜单 |
| `--shadow-lg` | `0 8px 24px -4px rgb(0 0 0 / 0.08)` | 弹窗、侧边栏 |

### 8.7 动画与过渡

| 场景 | 时长 | 缓动 |
|------|------|------|
| hover 态 | 150ms | ease |
| 点击反馈 | 100ms | ease-out |
| 页面切换 | 200ms | ease |
| 弹窗出现 | 250ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Toast 出现 | 300ms | ease-out |

**微交互：**
- 卡片 hover：轻微上移 (translateY -2px) + shadow 加深
- 按钮点击：scale(0.97) 缩放
- 列表项：hover 背景变色 (--surface-hover)
- 生成过程：脉冲动画 + 分步进度提示
- 状态切换：颜色过渡 200ms

### 8.8 布局结构

```
┌──────────────────────────────────────────────┐
│  Sidebar (w-56)   │   Main Content Area       │
│  ┌──────────────┐  │  ┌────────────────────┐  │
│  │  Logo         │  │  │  Page Header       │  │
│  │               │  │  │                    │  │
│  │  ● 仪表盘     │  │  │  Content Container │  │
│  │  ● 岗位档案   │  │  │  max-w-4xl mx-auto │  │
│  │  ● 打招呼     │  │  │                    │  │
│  │  ● 投递记录   │  │  │                    │  │
│  │  ● 个人档案   │  │  │                    │  │
│  │  ● 设置       │  │  │                    │  │
│  └──────────────┘  │  └────────────────────┘  │
└──────────────────────────────────────────────┘
```

- **Sidebar**：固定宽度 224px (w-56)，白色底 + 蓝色选中态
- **主内容区**：自适应剩余宽度，`max-w-4xl` (896px) 居中，内边距 `p-6`
- **Header**：页面标题 + 面包屑 + 操作按钮

### 8.9 暗色模式

支持 light / dark / system 三模式，通过 Tailwind `dark:` 前缀 + shadcn/ui CSS 变量实现。

| Light | Dark |
|-------|------|
| `--bg: #F8FAFC` | `#0F172A` (Slate 900) |
| `--surface: #FFFFFF` | `#1E293B` (Slate 800) |
| `--surface-hover: #F1F5F9` | `#334155` (Slate 700) |
| `--border: #E2E8F0` | `#475569` (Slate 600) |
| `--text-primary: #0F172A` | `#F8FAFC` (Slate 50) |

### 8.10 组件规范

| 组件 | 规范 |
|------|------|
| **Primary 按钮** | 蓝色实底 `bg-primary` + 白色文字，hover 变深，点击 scale(0.97) |
| **Secondary 按钮** | 灰色实底 `bg-slate-100`，次要操作 |
| **Outline 按钮** | 透明 + 边框 `border-slate-200`，辅助操作 |
| **卡片** | 白色底，`rounded-lg`(8px)，`border border-slate-200`，`p-5` |
| **输入框** | `bg-white`，`border-slate-200`，聚焦时 `ring-1 ring-primary`，`rounded-md`(6px) |
| **标签 Badge** | `rounded-full`，`px-2.5 py-0.5`，`text-xs`，对应语义色 |
| **空状态** | 居中布局，64-96px 图标 + 标题 + 描述 + CTA 按钮 |

### 8.11 无障碍 (Accessibility)

- 所有交互元素最小 44×44px 触控区域
- 文本对比度 ≥ 4.5:1 (WCAG AA)
- 焦点环可见 (`focus-visible:ring-2`)
- 按钮/链接有 aria-label
- 支持键盘导航 (Tab/Enter/Escape)
- 尊重 `prefers-reduced-motion`

### 8.12 反模式 (Avoid)

| 反模式 | 正确的做法 |
|--------|-----------|
| 使用 emoji 作为图标 | 必须使用 SVG 图标 (Lucide) |
| 纯色区分信息 | 配合图标 + 文字 |
| 禁用缩放 | 保留用户缩放能力 |
| 过度动画 | 动画需有意义，非装饰性 |
| 表单无即时验证 | 输入时即时反馈 |
| 灰度文字过多 | 保证可读性，最小 12px |
| 层级过深的导航 | 保持扁平（最多 2 层） |
| 不一致的圆角 | 统一使用设计系统圆角 |

---

## 9. 路由与页面流

### 9.1 路由表

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Dashboard | 仪表盘首页 |
| `/positions` | PositionListPage | 岗位档案列表 |
| `/positions/new` | PositionDetailPage | 新建岗位档案 |
| `/positions/:id` | PositionDetailPage | 编辑岗位档案 |
| `/greeting` | GreetingPage | 打招呼生成 |
| `/applications` | ApplicationListPage | 投递记录列表 |
| `/profile` | ProfilePage | 个人档案 |
| `/settings` | SettingsPage | 设置页 |
| `*` | NotFoundPage | 404 |

### 9.2 核心用户流程

```
用户打开应用
    ↓
┌─ 首次使用？─────────────┐
│  1. 跳转到 ProfilePage    │
│  2. 填写个人档案           │
│  3. 跳转到 SettingsPage    │
│  4. 配置 API Key          │
└──────────────────────────┘
    ↓
┌─ 正常工作流 ─────────────┐
│                           │
│  在 Boss 上看到岗位        │
│       ↓                   │
│  复制 JD 文字             │
│       ↓                   │
│  打开工具 → 打招呼页       │
│       ↓                   │
│  粘贴 JD → 选择岗位档案    │
│       ↓                   │
│  点击"生成打招呼"         │
│       ↓                   │
│  AI 生成结果              │
│   ├─ 打招呼文案 ← 复制    │
│   └─ 深度分析 ← 参考      │
│       ↓                   │
│  粘贴到 Boss 发送         │
│       ↓                   │
│  记录投递状态             │
│                           │
└──────────────────────────┘
```

### 9.3 页面间导航关系

```
Dashboard
  ├── → /positions          (查看所有档案)
  ├── → /greeting           (快速生成打招呼)
  └── → /applications       (查看最近投递)

PositionListPage
  ├── → /positions/new       (新建档案)
  ├── → /positions/:id       (编辑档案)
  └── → /greeting            (从该档案生成打招呼)

GreetingPage
  ├── → /positions/new       (新建档案，如果还没有)
  ├── → /settings            (配置 API Key，如果未配置)
  └── → /applications/new    (生成后记录投递)

ApplicationListPage
  └── → /applications/:id    (查看投递详情)
```

---

## 10. 状态管理

### 10.1 Zustand Store 设计

每个 Store 负责一个领域，通过 Tauri `invoke` 调用 Rust 后端读写文件。

```typescript
// positionStore.ts
interface PositionStore {
  positions: Position[]
  loading: boolean
  error: string | null

  // Actions
  fetchPositions: () => Promise<void>
  getPosition: (id: string) => Position | undefined
  createPosition: (data: CreatePositionInput) => Promise<Position>
  updatePosition: (id: string, data: UpdatePositionInput) => Promise<Position>
  deletePosition: (id: string) => Promise<void>
  archivePosition: (id: string) => Promise<Position>
}

// applicationStore.ts
interface ApplicationStore {
  applications: Application[]
  filter: { status?: ApplicationStatus; positionId?: string }
  loading: boolean
  error: string | null

  fetchApplications: (filter?: ApplicationFilter) => Promise<void>
  createApplication: (data: CreateApplicationInput) => Promise<Application>
  updateApplication: (id: string, data: UpdateApplicationInput) => Promise<Application>
  updateStatus: (id: string, status: ApplicationStatus) => Promise<void>
  deleteApplication: (id: string) => Promise<void>
}

// greetingStore.ts
interface GreetingStore {
  jdContent: string
  selectedPositionId: string | null
  result: GreetingResult | null
  generating: boolean
  error: string | null
  progress: string  // 当前生成进度描述

  setJdContent: (content: string) => void
  setSelectedPosition: (id: string) => void
  generateGreeting: () => Promise<void>
  reset: () => void
}

// profileStore.ts
interface ProfileStore {
  profile: Profile | null
  loading: boolean
  saving: boolean

  fetchProfile: () => Promise<void>
  saveProfile: (data: Profile) => Promise<void>
}

// settingsStore.ts
interface SettingsStore {
  settings: Settings
  loaded: boolean
  testing: boolean
  testResult: { success: boolean; message: string } | null

  fetchSettings: () => Promise<void>
  saveSettings: (data: Settings) => Promise<void>
  testConnection: () => Promise<void>
}
```

### 10.2 数据流

```
用户操作 → 页面组件 → Zustand Action → invoke Tauri Command → Rust 读写文件 → 返回数据
                                                              ↓
Zustand Store 更新 ← 解析返回数据 ←───────────────────────────┘
    ↓
React 重渲染 → 用户看到更新
```

---

## 11. 错误处理与边界情况

### 11.1 全局错误处理

```typescript
// ErrorBoundary 组件
// 捕获 React 渲染过程中的错误
// 显示友好错误页面 + "重新加载"按钮

// Rust 端错误处理
// 所有 Command 返回 Result<T, String>
// 前端 invoke 统一 catch 并显示 Toast
```

### 11.2 边界情况清单

| 场景 | 处理方式 |
|------|----------|
| data 目录不存在 | 启动时自动创建 |
| 文件被外部删除 | 刷新列表时自动消失，不崩溃 |
| 文件被外部修改 | 下次读取时获取最新内容 |
| 两个页面同时操作同一文件 | 最后一次写入覆盖（单用户场景可接受） |
| JD 内容为空 | 生成按钮禁用，提示粘贴 |
| JD 内容超过 8000 字 | 自动截断 + 提示 |
| 选择档案后档案被删除 | 显示"档案已删除"提示，重置选择器 |
| API Key 中途失效 | 生成时 401 错误 → 提示跳转设置 |
| 应用窗口极小 | 设置最小窗口 900×600，低于时出现滚动条 |
| 特殊字符 (emoji/HTML) | 正常渲染，不转义 |
| 路径名含特殊字符 | Rust 端使用 PathBuf 处理，不拼接字符串 |

### 11.3 加载状态策略

```
页面加载：Skeleton 骨架屏（非 Spinner）
操作加载：按钮内 Spinner + 禁用
生成加载：分步进度提示（"正在分析JD...分析完成，正在生成打招呼..."）
列表加载：Skeleton 卡片（5 条占位）
背景操作：Toast 提示（如自动保存）
```

---

## 12. 开发环境搭建

### 12.1 依赖清单

| 工具 | 版本要求 | 用途 |
|------|----------|------|
| Node.js | ≥ 20.0 | 前端开发 |
| npm 或 pnpm | ≥ 10.0 | 包管理 |
| Rust | ≥ 1.80 | Tauri 后端 |
| VS Code | latest | 编辑器 |
| Git | ≥ 2.30 | 版本控制 |

### 12.2 安装步骤

```bash
# 1. 安装 Rust 工具链
# Windows: 下载 https://rustup.rs/ 运行
# 或命令行: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup update

# 2. 安装 Tauri CLI
npm install -g @tauri-apps/cli@latest

# 3. 创建项目（实际我会直接提供完整项目，无需手动创建）
npm create tauri-app@latest job-assistant -- --template react-ts

# 4. 安装前端依赖
cd job-assistant
npm install
npm install tailwindcss @tailwindcss/vite lucide-react zustand react-router-dom date-fns
npm install @tauri-apps/api @tauri-apps/plugin-dialog

# 5. 初始化 shadcn/ui
npx shadcn@latest init

# 6. 安装 shadcn 组件
npx shadcn@latest add button card input textarea select dialog badge tabs toast skeleton

# 7. 安装 Rust 依赖
cd src-tauri
# 编辑 Cargo.toml 添加 serde_yaml, chrono, uuid, thiserror 等
cargo build

# 8. 启动开发
cd ..
npm run tauri dev
```

### 12.3 环境检测脚本

```bash
# check-env.sh — 检测开发环境
echo "=== 环境检测 ==="
echo "Node.js: $(node -v 2>/dev/null || echo '❌ 未安装')"
echo "npm: $(npm -v 2>/dev/null || echo '❌ 未安装')"
echo "Rust: $(rustc -V 2>/dev/null || echo '❌ 未安装')"
echo "Cargo: $(cargo -V 2>/dev/null || echo '❌ 未安装')"
echo "Tauri CLI: $(npx tauri --version 2>/dev/null || echo '❌ 未安装')"
echo "Git: $(git --version 2>/dev/null || echo '❌ 未安装')"
```

---

## 13. 构建与打包

### 13.1 开发模式

```bash
npm run tauri dev
# 启动 Vite 开发服务器 (热更新) + Tauri 窗口
```

### 13.2 构建发布

```bash
npm run tauri build
# 输出到 src-tauri/target/release/
# Windows: job-assistant_x.x.x_x64-setup.exe + .msi
# 包体预计: ~5-8MB
```

### 13.3 Tauri 配置 (`tauri.conf.json`)

```json
{
  "productName": "求职助手",
  "version": "0.1.0",
  "identifier": "com.job-assistant.app",
  "build": {
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "求职助手",
        "width": 1200,
        "height": 800,
        "minWidth": 900,
        "minHeight": 600,
        "resizable": true,
        "center": true
      }
    ]
  },
  "bundle": {
    "active": true,
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/icon.ico"
    ],
    "targets": ["msi", "nsis"]
  }
}
```

---

## 14. 未来扩展路线

### 阶段一：MVP（当前项目范围）

| 功能 | 状态 |
|------|------|
| 岗位档案 CRUD | ✅ P0 |
| 个人档案管理 | ✅ P0 |
| AI 打招呼生成（粘贴文字） | ✅ P0 |
| 投递记录追踪 | ✅ P0 |
| 设置管理（API Key 配置） | ✅ P0 |

### 阶段二：体验优化

| 功能 | 说明 |
|------|------|
| 流式输出 | 生成打招呼时逐字显示，减少等待焦虑 |
| 打招呼历史 | 同一个岗位可生成多个版本，切换选择 |
| 打招呼模板 | 用户可保存自定义模板 |
| 数据导出 | 导出为 CSV/Excel 投递报告 |
| 自动深色模式 | 跟随系统主题 |

### 阶段三：截图 OCR 识别

| 功能 | 说明 |
|------|------|
| 截图粘贴 | 从剪贴板读取截图，OCR 识别 JD |
| OCR 引擎 | 初期使用 Tesseract 本地 OCR，或对接多模态模型 |
| 区域截图 | 内置截图工具，框选屏幕区域 |

### 阶段四：扩展功能

| 功能 | 说明 |
|------|------|
| 多平台适配 | 移动端（React Native / Flutter） |
| 数据同步 | 可选的 WebDAV / iCloud 同步 |
| 面试题库 | 基于岗位档案生成面试题 |
| 薪资分析 | 基于岗位 + 地区统计薪资范围 |
| 浏览器插件 | 直接在 Boss 页面嵌入"一键生成"按钮 |

---

## 设计系统引用

> 完整的 UI/UX 设计系统（含色彩、字体、间距、圆角、阴影、动画、组件规范、暗色模式、无障碍）已根据 `ui-ux-pro-max` Skill 生成，详见：
> - **`design-system/job-assistant/MASTER.md`** — 全局设计系统
> - **`design-system/job-assistant/pages/`** — 页面级覆盖规则
> - **`.agents/skills/ui-ux-pro-max/`** — 设计 Skill 数据库（含 84 种风格、192 色板、74 字体组合等）

## 结语

以上就是完整的架构文档。这个设计有以下几个核心原则：

1. **极简存储** — Markdown 文件，零数据库依赖，人类可读可改
2. **轻量体验** — Tauri 打包，5MB 搞定，秒开
3. **AI 灵活** — OpenAI 兼容格式，你现在用 Deepseek，以后可以换任何兼容的 API
4. **渐进增强** — 先桌面，后移动；先文字，后截图；先本地，后同步
5. **设计系统驱动** — 使用 `ui-ux-pro-max` Skill 保证设计一致性，所有 UI 决策有据可查