# 求职助手 — 设计系统 (Master)

> 生成时间：2026-07-18
> 产品类型：Productivity Tool（求职辅助工具）
> 目标用户：求职者（23-35岁，中国互联网行业）
> 技术栈：Tauri 2.0 + React 19 + Tailwind CSS v4 + shadcn/ui

---

## 一、设计风格

| 维度 | 选择 | 理由 |
|------|------|------|
| **主风格** | Flat Design + Micro-interactions | 生产力工具推荐，清晰高效，无视觉干扰 |
| **辅助风格** | Minimalism, Soft UI Evolution | 保底方案，提升精致感 |
| **设计关键词** | clean, functional, spacious, professional, trust |

### 风格规范

```
- 2D 平面化设计，无冗余装饰
- 微交互（hover 变色、点击缩放、过渡动画）
- 大量留白，内容呼吸感
- 几何图形 + 简洁图标
- 无渐变/大阴影，使用扁平色块区分层级
- 圆角 6-12px（非极端圆角）
```

---

## 二、色彩体系

### 2.1 主色调

| Token | 色值 | 用途 | 说明 |
|-------|------|------|------|
| `--primary` | `#2563EB` (Blue 600) | 主色、按钮、链接 | 专业、信任感，适合求职场景 |
| `--primary-light` | `#3B82F6` (Blue 500) | hover 态 | |
| `--primary-dark` | `#1D4ED8` (Blue 700) | 激活态 | |
| `--primary-bg` | `#EFF6FF` (Blue 50) | 浅色背景 | |

### 2.2 语义色

| Token | 色值 | 用途 |
|-------|------|------|
| `--success` | `#059669` (Emerald 600) | 已投递、Offer、成功 |
| `--warning` | `#D97706` (Amber 600) | 面试中、待处理 |
| `--error` | `#DC2626` (Red 600) | 拒绝、错误、删除 |
| `--info` | `#0284C7` (Sky 600) | 已读、信息提示 |

### 2.3 中性色

| Token | 色值 | 用途 |
|-------|------|------|
| `--bg` | `#F8FAFC` (Slate 50) | 页面背景 |
| `--surface` | `#FFFFFF` | 卡片/面板背景 |
| `--surface-hover` | `#F1F5F9` (Slate 100) | 卡片 hover |
| `--border` | `#E2E8F0` (Slate 200) | 边框/分割线 |
| `--text-primary` | `#0F172A` (Slate 900) | 主文字 |
| `--text-secondary` | `#475569` (Slate 600) | 次要文字 |
| `--text-muted` | `#94A3B8` (Slate 400) | 弱化文字 |
| `--text-inverse` | `#FFFFFF` | 反色文字 |

### 2.4 投递状态色

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

---

## 三、字体体系

### 3.1 字体族

```
英文: Inter (Variable) — 无衬线，现代，可读性强
中文: 系统默认 (PingFang SC / Microsoft YaHei)
等宽: JetBrains Mono — 数据展示、代码块
```

### 3.2 字体层级

| 层级 | 大小 | 字重 | 行高 | 字距 | 用途 |
|------|------|------|------|------|------|
| h1 | 24px (text-2xl) | Semibold 600 | 1.2 | -0.02em | 页面标题 |
| h2 | 20px (text-xl) | Semibold 600 | 1.3 | -0.01em | 区块标题 |
| h3 | 16px (text-base) | Semibold 600 | 1.4 | 0 | 卡片标题 |
| body | 14px (text-sm) | Regular 400 | 1.5 | 0 | 正文 |
| caption | 12px (text-xs) | Regular 400 | 1.5 | 0 | 辅助文字 |
| badge | 11px | Medium 500 | 1 | 0.05em | 标签/徽标 |
| code | 13px (text-sm) | Mono | 1.5 | 0 | 数据/代码 |

---

## 四、间距系统

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

---

## 五、圆角

| Token | 值 | 用途 |
|-------|-----|------|
| --radius-sm | 4px | 输入框、小元素 |
| --radius-md | 6px | 按钮、卡片 |
| --radius-lg | 8px | 大卡片、弹窗 |
| --radius-xl | 12px | 顶部弹窗 |
| --radius-full | 9999px | 标签、头像 |

---

## 六、阴影

| Token | 值 | 用途 |
|-------|-----|------|
| --shadow-sm | `0 1px 2px 0 rgb(0 0 0 / 0.04)` | 轻微悬浮 |
| --shadow-md | `0 4px 12px -2px rgb(0 0 0 / 0.06)` | 卡片、下拉菜单 |
| --shadow-lg | `0 8px 24px -4px rgb(0 0 0 / 0.08)` | 弹窗、侧边栏 |

> 遵循 Flat Design 原则，阴影克制使用，主要用于层级区分。

---

## 七、动画与过渡

### 7.1 持续时间

| 场景 | 时长 | 缓动 |
|------|------|------|
| hover 态 | 150ms | ease |
| 点击反馈 | 100ms | ease-out |
| 页面切换 | 200ms | ease |
| 弹窗出现 | 250ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Toast 出现 | 300ms | ease-out |

### 7.2 微交互

- 卡片 hover：轻微上移 (translateY -2px) + shadow 加深
- 按钮点击：scale(0.97) 缩放
- 列表项：hover 背景变色 (--surface-hover)
- 生成过程：脉冲动画 + 分步进度提示
- 状态切换：颜色过渡 200ms

---

## 八、布局规范

### 8.1 整体结构

```
┌──────────────────────────────────────────────────┐
│  Sidebar (w-56)  │  Main Content Area             │
│  ┌─────────────┐  │  ┌─────────────────────────┐  │
│  │ Logo        │  │  │  Page Header (optional)  │  │
│  │             │  │  │                          │  │
│  │ 导航项      │  │  │  Content Container       │  │
│  │ 导航项      │  │  │  max-w-4xl mx-auto       │  │
│  │ 导航项      │  │  │                          │  │
│  │             │  │  │                          │  │
│  │ 用户信息    │  │  │                          │  │
│  └─────────────┘  │  └─────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### 8.2 响应式断点

| 断点 | 宽度 | 行为 |
|------|------|------|
| sm | 640px | 保持桌面布局（窗口最小 900px） |
| md | 768px | — |
| lg | 1024px | 标准桌面 |
| xl | 1280px | 宽屏 |

### 8.3 内容区域

- 主内容区最大宽度：`max-w-4xl` (896px)
- 内部间距：`p-6` (24px)
- 卡片间距：`gap-4` (16px) 或 `gap-6` (24px)

---

## 九、组件规范

### 9.1 按钮

| 类型 | 样式 | 用途 |
|------|------|------|
| Primary | 蓝色实底 + 白色文字 | 主要操作（生成打招呼、保存） |
| Secondary | 灰色实底 | 次要操作（取消、返回） |
| Outline | 透明 + 边框 | 辅助操作（预览、编辑） |
| Ghost | 透明 + hover 背景 | 列表操作 |
| Icon | 正方形 + 图标 | 工具栏操作 |

### 9.2 卡片

- 背景：白色
- 圆角：`rounded-lg` (8px)
- 边框：`border border-slate-200`
- 内边距：`p-5` (20px)
- 阴影：无（flat）或 `shadow-sm`

### 9.3 输入框

- 背景：`bg-white` 或 `bg-slate-50`
- 边框：`border border-slate-200`
- 聚焦：`border-primary + ring-1 ring-primary`
- 圆角：`rounded-md` (6px)
- 高度：`h-10` (40px) 或 `h-9` (36px)

### 9.4 标签/Badge

- 圆角：`rounded-full`
- 内边距：`px-2.5 py-0.5`
- 字号：`text-xs` (11-12px)
- 状态色对应语义色

### 9.5 空状态

- 居中布局
- 插画或图标（64-96px）
- 标题 + 描述文字
- CTA 按钮引导操作

---

## 十、暗色模式

### 10.1 配色映射

| Light | Dark |
|-------|------|
| `--bg: #F8FAFC` | `#0F172A` (Slate 900) |
| `--surface: #FFFFFF` | `#1E293B` (Slate 800) |
| `--surface-hover: #F1F5F9` | `#334155` (Slate 700) |
| `--border: #E2E8F0` | `#475569` (Slate 600) |
| `--text-primary: #0F172A` | `#F8FAFC` (Slate 50) |
| `--text-secondary: #475569` | `#CBD5E1` (Slate 300) |
| `--text-muted: #94A3B8` | `#64748B` (Slate 500) |

### 10.2 实现方式

- Tailwind `dark:` 前缀
- shadcn/ui 原生支持 CSS 变量切换
- 设置页提供 light / dark / system 三选项

---

## 十一、交互规范

### 11.1 加载状态

| 场景 | 组件 |
|------|------|
| 页面加载 | Skeleton 骨架屏（shadcn/ui Skeleton） |
| 列表加载 | 3-5 条卡片状 Skeleton |
| 按钮操作 | 按钮内 Spinner + 禁用 |
| AI 生成 | 分步进度提示 + 脉冲动画 |
| 背景保存 | Toast 轻提示 |

### 11.2 空状态

| 页面 | 空状态文案 |
|------|-----------|
| 岗位档案列表 | "还没有岗位档案，新建一个开始求职吧" |
| 投递记录 | "还没有投递记录，去生成第一条打招呼" |
| 仪表盘 | "欢迎使用求职助手！先完善个人档案吧" |

### 11.3 错误处理

| 场景 | 提示 |
|------|------|
| API Key 无效 | Toast: "API Key 无效，请检查设置" |
| 网络错误 | Toast: "网络连接失败，请稍后重试" |
| 生成超时 | Toast: "生成超时，请重试" |
| 保存失败 | Toast: "保存失败，已自动重试" |
| 整体崩溃 | ErrorBoundary 页面 + "重新加载"按钮 |

---

## 十二、无障碍 (Accessibility)

- 所有交互元素最小 44×44px 触控区域
- 文本对比度 ≥ 4.5:1 (WCAG AA)
- 焦点环可见 (focus-visible:ring-2)
- 按钮/链接有 aria-label
- 支持键盘导航 (Tab/Enter/Escape)
- 尊重 prefers-reduced-motion

---

## 十三、反模式 (Avoid)

| 反模式 | 说明 |
|--------|------|
| 使用 emoji 作为图标 | 必须使用 SVG 图标 (Lucide) |
| 纯色区分信息 | 配合图标 + 文字 |
| 禁用缩放 | 保留用户缩放能力 |
| 过度动画 | 动画需有意义，非装饰性 |
| 表单无即时验证 | 输入时即时反馈 |
| 灰度文字过多 | 保证可读性 |
| 层级过深的导航 | 保持扁平（最多 2 层） |
| 不一致的圆角 | 统一使用设计系统圆角 |