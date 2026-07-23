# MODULE_B_AI打招呼生成.md — Sprint 2 开发任务

> **版本：** v1.0  
> **PM 分析师：** Claude PM Agent  
> **日期：** 2026-07-20  
> **Sprint 目标：** 实现 AI 打招呼生成核心功能，包括存储层补全、AI API 集成、打招呼页面、投递记录自动快照

---

## 1. 需求全景摘要

求职助手的核心价值功能。用户粘贴招聘 JD → 选择已维护的岗位档案 → AI 自动生成个性化打招呼文案 + 深度分析报告。每次生成自动记录为一条投递记录，用户只需标记"是否有进展"，零维护成本。

**前置依赖：** Sprint 1 基础设施已完成，但 Storage 层为 `todo!()` 桩代码，本 Sprint 需先补全。

---

## 2. 模块拆分与开发指令

### 模块 B1：Rust 存储层补全（先决条件）

> 所有 Sprint 1 遗留的 `todo!()` 存储实现必须在本 Sprint 先行完成，后续功能才可正常运作。

- **后端 (Backend) 任务清单**：
    1. **`position_storage.rs`** — 实现完整 CRUD
       - `list_positions()`：扫描 `data/positions/*.md`，解析 frontmatter，返回 `Vec<Position>`
       - `get_position(id)`：遍历查找匹配 ID
       - `create_position(input)`：生成 UUID（`pos_xxx`），写入 frontmatter，保存文件
       - `update_position(id, input)`：读取 → 合并字段 → 写回（使用 `serde_json::merge` 风格逻辑）
       - `delete_position(id)`：删除文件
       - 文件名格式：`{title}.md`，重复时自动加序号
    2. **`application_storage.rs`** — 实现完整 CRUD + 筛选
       - `list_applications(filter)`：按 `ApplicationFilter` 筛选（status/positionId/dateFrom/dateTo）
       - `get_application(id)`：遍历查找
       - `create_application(input)`：生成 UUID（`app_xxx`），文件名 `{日期}_{公司}_{岗位}.md`
       - `update_application(id, input)`：合并 → 写回
       - `delete_application(id)`：删除文件
    3. **`profile_storage.rs`** — 实现读写
       - `get_profile()`：读取 `data/profiles/profile.md`，不存在返回 `None`
       - `save_profile(input)`：写入或覆写单文件
    4. **`settings_storage.rs`** — 实现 JSON 读写
       - `get_settings()`：读取 `data/settings.json`，不存在返回默认值
       - `save_settings(data)`：写入 JSON（非 Markdown）
    5. **Commands 实装** — 将 commands/ 目录下的 `todo!()` 替换为真实存储调用
       - 每个 command 函数调用对应的 storage 函数
       - 错误向上传播，前端统一显示 Toast
    6. **非功能性要求**：
       - 文件操作使用 `PathBuf.join()`，禁止字符串拼接路径
       - 启动时自动创建 `data/profiles/`, `data/positions/`, `data/applications/` 目录
       - 文件不存在时返回 `None` 或空列表，不崩溃

- **前端 (Frontend) 任务清单**：
    1. 本模块无前端任务（但需验证所有 Store 能正确调用后端 API）

---

### 模块 B2：AI API 集成层

- **前端 (Frontend) 任务清单**：
    1. **AI 调用封装**（`src/lib/ai.ts`）：
       - `generateGreeting(params)`：接收 `{ profile, position, jdContent, settings }`，调用 AI API
       - 调用格式：OpenAI 兼容格式（Deepseek 使用此格式）
       - 请求体：`{ model, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }], temperature, max_tokens }`
       - 解析响应：提取 `choices[0].message.content`，JSON 解析为 `GreetingResult`
       - `testConnection(settings)`：发送简短请求验证 API Key 有效性
       - 支持 `onProgress` 回调：分步通知（"正在分析JD...", "正在生成打招呼..."）
    2. **核心 Prompt 实现**（直接嵌入 `ai.ts` 或单独 `prompts.ts`）：
       - **System Prompt**：要求输出 JSON 格式，包含 `greeting` 和 `analysis`（含 matchScore, highlights, gaps, suggestions, keyRequirements）
       - **强制要求**：打招呼文案中必须自然融入 1-2 个 JD 具体关键词 + 公司名称
       - **User Message 模板**：拼接 Profile + Position + JD 内容
    3. **边界逻辑**：
       - **API Key 未配置**：生成前检查，未配置时引导跳转 `/settings`
       - **网络超时**：30s 超时，显示"生成超时，请重试"
       - **模型返回格式异常**：JSON 解析失败时，兜底展示原始内容 + "格式异常"提示
       - **JD 过长**：自动截断到 8000 字 + 提示"已自动截断"
       - **余额不足**：捕获 429/402 状态码，提示"API 余额不足"
       - **401 错误**：提示"API Key 无效，请检查设置"

- **后端 (Backend) 任务清单**：
    1. 本模块无后端任务（AI 调用从 React 前端直接发起，不经过 Rust 后端）

---

### 模块 B3：打招呼页面（GreetingPage）

- **前端 (Frontend) 任务清单**：
    1. **页面路由**：`/greeting` → GreetingPage（Sprint 1 已配置，仅需完善组件）
    2. **UI 组件**：
       - **JDPasteInput**：JD 粘贴区域
         - 空态：虚线边框，居中提示文字 + 粘贴图标
         - 有内容：实线边框，右下角字符数
         - 过长：红色边框 + 警告"已超过 8000 字，将自动截断"
       - **PositionSelector**：岗位档案选择器（下拉或卡片选择）
         - 从 `usePositionStore` 获取列表
         - 空数据时引导"先去新建岗位档案"
       - **GenerateButton**：生成按钮
         - 禁用条件：JD 为空 或 未选档案
         - 生成中：按钮内 Spinner + 禁用
       - **GenerationProgress**：生成进度条
         - 分步提示："正在分析JD...", "正在生成打招呼...", "生成完成！"
         - 脉冲动画效果
       - **GreetingResult**：结果展示区
         - 分两栏：左侧打招呼文案 + 右侧深度分析卡片
         - 打招呼文案区域：可编辑、可复制（复制按钮）
         - 深度分析卡片：matchScore 进度条 + highlights 列表 + gaps 列表 + suggestions 列表 + keyRequirements 列表
       - **GreetingActions**：操作栏
         - "复制"按钮（复制打招呼文案到剪贴板）
         - "重新生成"按钮（重新调用 AI）
         - "编辑"按钮（切换文案为可编辑状态）
       - **AutoSaveApplication**：生成成功后自动记录投递
         - 调用 `applicationStore.createApplication()`
         - 生成成功后，底部出现 Toast "已自动记录投递"
    3. **状态管理**（`greetingStore.ts`，Sprint 1 已定义接口，需完善实现）：
       - `setJdContent(content)`：更新 JD 内容
       - `setSelectedPosition(id)`：选择岗位档案
       - `generateGreeting()`：调用 AI API，更新进度
       - `reset()`：清空所有状态
    4. **边界逻辑**：
       - **初始态**：空输入框 + 档案选择器，生成按钮禁用
       - **粘贴 JD 后**：自动检测是否已选档案，若未选提示
       - **生成中**：Progress 动画 + 分步提示，按钮禁用
       - **生成成功**：展示结果 + 自动记录投递
       - **生成失败**：错误提示（区分 API 错误/网络错误/格式错误）+ 重试按钮
       - **API Key 未配置**：引导跳转到设置页
       - **JD 粘贴后内容过长**：字符数提示 + 自动截断

- **后端 (Backend) 任务清单**：
    1. 本模块无后端任务

---

### 模块 B4：设置页数据绑定

- **前端 (Frontend) 任务清单**：
    1. **设置页数据绑定**（`SettingsPage.tsx`）：
       - 从 `settingsStore` 加载数据到表单
       - 表单修改时调用 `updateSettings()` 或直接 `saveSettings()`
       - API Key 可见性切换（眼睛图标）
       - "测试连接"按钮调用 `settingsStore.testConnection()`
       - 连接结果展示（成功绿色/失败红色）
    2. **主题切换集成**：
       - 集成 `next-themes` 的 `ThemeProvider` 到 `main.tsx` 或 `App.tsx`
       - 主题选择联动 `setTheme()`
       - 支持 light/dark/system 三模式
    3. **边界逻辑**：
       - API Key 输入框默认 password 类型，眼睛图标切换可见
       - 测试连接时按钮显示 Spinner + 禁用
       - 设置保存失败时 Toast 提示

- **后端 (Backend) 任务清单**：
    1. 本模块无后端任务（设置存储由 B1 实现）

---

## 3. 验收标准 (Definition of Done)

### 存储层验收
- [ ] `position_storage.rs` 5 个 CRUD 方法全部实现，无 `todo!()`
- [ ] `application_storage.rs` 5 个 CRUD 方法 + 筛选全部实现
- [ ] `profile_storage.rs` 读写实现
- [ ] `settings_storage.rs` JSON 读写实现
- [ ] `cargo build` 编译通过，无 warning
- [ ] 应用启动时自动创建 `data/profiles/`, `data/positions/`, `data/applications/` 目录
- [ ] 文件不存在时优雅降级（返回 None/空列表）

### 打招呼功能验收
- [ ] `/greeting` 页面渲染正常，含 JD 输入框 + 档案选择器 + 生成按钮
- [ ] JD 粘贴后可正常显示字符数
- [ ] 选择岗位档案后，档案列表从 `usePositionStore` 加载
- [ ] 点击"生成"后显示分步进度动画
- [ ] AI 返回结果后，打招呼文案 + 深度分析卡片正常展示
- [ ] 复制按钮正常工作
- [ ] 重新生成按钮正常工作
- [ ] 生成成功后自动创建投递记录
- [ ] API Key 未配置时引导跳转设置页
- [ ] 网络错误/API 错误显示友好提示 + 重试按钮

### 设置页验收
- [ ] 设置页表单加载当前配置
- [ ] API Key 可见性切换正常
- [ ] "测试连接"按钮调用后端并展示结果
- [ ] 主题切换器正常工作（light/dark/system）
- [ ] 设置修改后保存到文件

---

## 4. 二次验证关注点

1. **存储层数据一致性**：写入文件后重新读取，确保 frontmatter 解析正确，无数据丢失
2. **AI 生成质量**：打招呼文案是否自然融入了 JD 关键词 + 公司名称，是否 50-100 字
3. **投递记录自动生成**：每次生成打招呼是否确实创建了一条记录，文件名格式是否正确
4. **错误处理覆盖**：API Key 无效、网络超时、余额不足、格式异常四种错误场景是否都有对应提示
5. **主题切换彻底性**：切换暗色模式后，GreetingPage 所有组件是否都正确跟随，无残留亮色区域
6. **设置持久化**：修改设置后关闭重开，设置是否保持

---

## 5. 依赖关系图

```
Sprint 2 模块依赖关系：

B1 (存储层补全) ──┬──→ B3 (GreetingPage) ──→ 核心功能完成
                  │         │
                  └──→ B4 (设置页绑定) ────→ 设置功能完成
                          │
                          └──→ B2 (AI API 集成)
                                   │
                                   └──→ B3 调用 AI 生成打招呼

开发顺序：B1 → B2 → B4(并行) → B3
```

**建议开发顺序：**
1. **B1（存储层）** → 必须先完成，所有功能依赖
2. **B2（AI 集成层）** → 可并行于 B1 之后，纯前端
3. **B4（设置页绑定）** → 可并行于 B2，依赖 B1 的设置存储
4. **B3（打招呼页面）** → 依赖 B1+B2，最后集成