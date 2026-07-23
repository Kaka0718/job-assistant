# 前端交付文档 — MODULE_B_AI打招呼生成

> **版本：** v1.0  
> **交付日期：** 2026-07-21  
> **Sprint：** 2 — AI 打招呼生成  
> **交付 Agent：** 前端开发 Agent

---

## 一、交付清单

### 1.1 新增文件

| 文件 | 模块 | 说明 |
|:-----|:-----|:------|
| `src/lib/ai.ts` | B2 | AI API 集成层：`generateGreeting()` + `testConnection()` |
| `src/components/greeting/JDPasteInput.tsx` | B3 | JD 粘贴输入区域（空态/有内容/过长三种状态） |
| `src/components/greeting/GenerationProgress.tsx` | B3 | 生成进度条（分步动画 + 脉冲效果） |
| `src/components/greeting/GreetingResult.tsx` | B3 | 结果展示（打招呼文案 + 编辑功能） |
| `src/components/greeting/DeepAnalysisCard.tsx` | B3 | 深度分析卡片（匹配度进度条 + 亮点/待提升/建议/硬性要求） |
| `src/components/greeting/GreetingActions.tsx` | B3 | 操作栏（复制/重新生成） |
| `src/components/position/PositionSelector.tsx` | B3 | 岗位档案选择器（加载/空数据/正常态） |

### 1.2 修改文件

| 文件 | 模块 | 改动说明 |
|:-----|:-----|:---------|
| `src/main.tsx` | B4 | 包裹 `ThemeProvider`（`next-themes`），支持 light/dark/system |
| `src/pages/SettingsPage.tsx` | B4 | 绑定 `settingsStore` 数据 + 主题切换 + 测试连接交互 |
| `src/stores/greetingStore.ts` | B3 | 完善 `generateGreeting()` 调用 AI API + 自动创建投递记录 |
| `src/pages/GreetingPage.tsx` | B3 | 整合所有组件 + 边界处理（API Key 未配置、档案未完善） |

---

## 二、页面路由与组件结构

### 2.1 GreetingPage (`/greeting`)

```
GreetingPage
├── Header (title="AI 打招呼", description="粘贴 JD，生成个性化打招呼文案")
├── API Key 未配置警告条 (→ 跳转 /settings)
├── 个人档案未完善警告条 (→ 跳转 /profile)
├── Grid 2-column (lg:grid-cols-2)
│   ├── Left Column
│   │   ├── Card
│   │   │   ├── JDPasteInput (value, onChange, disabled)
│   │   │   ├── PositionSelector (value, onChange, disabled)
│   │   │   └── Button "生成打招呼" (disabled when !canGenerate)
│   │   └── GenerationProgress (visible during generation)
│   └── Right Column
│       ├── GreetingResult (when result exists)
│       │   ├── 打招呼文案 (editable)
│       │   ├── GreetingActions (复制 / 重新生成)
│       │   └── DeepAnalysisCard
│       └── EmptyState (when no result)
```

### 2.2 SettingsPage (`/settings`)

```
SettingsPage
├── Header (title="设置", description="AI 配置与应用偏好")
├── Card: AI 配置
│   ├── Select: AI 提供商 (deepseek/openai/anthropic)
│   ├── Input: API Key (password toggle)
│   ├── Input: 模型
│   ├── Input: Base URL
│   ├── Input: Temperature
│   ├── Input: Max Tokens
│   ├── Button: 测试连接 (→ settingsStore.testConnection())
│   ├── TestResult (success/error)
│   └── Button: 保存设置
└── Card: 应用设置
    ├── Select: 主题 (light/dark/system → next-themes.setTheme())
    └── Select: 语言 (zh-CN/en)
```

---

## 三、核心交互逻辑说明

### 3.1 AI 打招呼生成流程

```
用户粘贴 JD → 选择岗位档案 → 点击"生成打招呼"
    ↓
greetingStore.generateGreeting()
    ├── 校验：JD 不为空、已选档案、已配置 API Key、已完善个人档案
    ├── 从 profileStore 获取 Profile
    ├── 从 positionStore 获取 Position
    ├── 从 settingsStore 获取 Settings
    ├── 调用 ai.ts generateGreeting()
    │   ├── 构建 System Prompt (JSON 输出格式要求)
    │   ├── 构建 User Message (Profile + Position + JD)
    │   ├── POST {baseUrl}/chat/completions (OpenAI 兼容格式)
    │   ├── 解析响应 JSON → GreetingResult
    │   └── 返回结果
    ├── 更新 store: result = GreetingResult
    └── 自动调用 applicationStore.createApplication() 记录投递
```

### 3.2 设置页交互

```
修改表单 → updateSettings() 更新本地状态
点击"保存设置" → saveSettings() 调用 invoke("save_settings", { data })
点击"测试连接" → testConnection() 调用 settingsStore.testConnection()
    └─→ ai.ts testConnection() 发送简短请求验证 API Key

主题切换 → next-themes setTheme() + 联动 settings.app.theme
```

### 3.3 错误处理

| 错误场景 | 表现 |
|:---------|:-----|
| API Key 未配置 | 黄色警告条 + 生成按钮禁用 + 跳转设置页链接 |
| 个人档案未完善 | 蓝色提示条 + 跳转个人档案链接 |
| API Key 无效 (401) | Toast 红色提示 "API Key 无效，请检查设置" |
| 网络超时 (30s) | Toast 提示 "生成超时，请重试" |
| 余额不足 (429/402) | Toast 提示 "API 余额不足，请充值" |
| 格式异常 | 兜底渲染原始内容 + Toast 提示 |
| JD 过长 | 自动截断到 8000 字 + 红色边框提示 |

---

## 四、组件状态覆盖

### JDPasteInput
| 状态 | 表现 |
|:-----|:------|
| 空态 | 虚线边框 + 居中图标 + "粘贴 JD 或拖拽文本..." |
| 有内容 | 实线边框 + 右下角字符数 |
| 过长 (>8000) | 红色边框 + 警告文字 |
| 禁用 | 半透明 + 不可交互 |

### PositionSelector
| 状态 | 表现 |
|:-----|:------|
| 加载中 | 骨架屏占位 (animate-pulse) |
| 空数据 | 虚线边框 + "暂无岗位档案" + "先去新建岗位档案"按钮 |
| 正常 | 下拉选择器 + 岗位名称 + 分类标签 |

### GenerationProgress
| 阶段 | 进度条 | 文案 |
|:-----|:-------|:-----|
| 正在分析 JD | 33% | "正在分析 JD..." |
| 正在生成打招呼 | 66% | "正在生成打招呼..." |
| 生成完成 | 100% (绿色) | "生成完成" ✅ |

### GreetingActions
| 状态 | 表现 |
|:-----|:------|
| 默认 | "复制文案" + "重新生成" 按钮 |
| 复制成功 | "已复制" (绿色对勾) → 2s 后恢复 |
| 禁用 | 按钮禁用 (生成中) |

---

## 五、数据流

```
用户操作 → 页面组件 → Zustand Action → lib/ai.ts (AI API) → 更新 Store → React 重渲染
                                ↓
                         applicationStore.createApplication() (自动记录投递)
```

### 设置页数据流

```
用户操作 → 页面组件 → settingsStore.updateSettings() (本地状态)
                     settingsStore.saveSettings() → invoke("save_settings") → Rust 写文件
                     settingsStore.testConnection() → ai.ts testConnection() → API 验证
                     useTheme().setTheme() → next-themes → .dark class 切换
```

---

## 六、自测情况

- [x] TypeScript 编译通过 (`npx tsc --noEmit` → 零错误)
- [x] Rust 后端编译通过 (`cargo build` → 零错误)
- [x] 所有组件按设计系统规范实现（Flat Design + Micro-interactions）
- [x] 组件状态覆盖：空态/加载/正常/错误/过长
- [x] AI API 调用封装完整（OpenAI 兼容格式，支持 Deepseek）
- [x] 错误处理覆盖：API Key 无效、网络超时、余额不足、格式异常
- [x] 主题切换：light/dark/system 三模式通过 next-themes 集成
- [x] 设置页数据绑定：表单 ↔ settingsStore 双向绑定
- [x] 生成成功后自动创建投递记录