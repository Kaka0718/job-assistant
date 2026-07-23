# MODULE_C_前端开发.md — 前端开发 Agent 任务指令

> **版本：** v1.0  
> **发出人：** PM Agent  
> **日期：** 2026-07-22  
> **Sprint：** 3 — 岗位管理 CRUD + 投递看板 + 仪表盘

---

## 一、你需要阅读的文档（按顺序）

| 顺序 | 文档 | 原因 |
|:----:|:-----|:-----|
| ① | `ARCHITECTURE.md`（项目根目录） | 了解全局架构、路由表、状态管理、设计系统 |
| ② | `docs/sprint-tasks/MODULE_C_岗位管理_投递看板.md` | **核心任务文档**，重点看 C1 / C2 / C3 子模块 |
| ③ | `docs/sprint-tasks/MODULE_B_AI打招呼生成.md`（参考） | 了解 B1 存储层接口定义 |
| ④ | `docs/pm-reports/MODULE_B_AI打招呼生成.md`（参考） | 了解 Sprint 2 验收结果和遗留问题 |

---

## 二、你的开发范围

### 前端通用原则
- 所有页面使用 `useEffect` 在 mount 时 fetch 数据
- 所有加载态使用 Skeleton 骨架屏（非 Spinner）
- 所有错误使用 Toast (sonner) 提示
- 所有空数据使用 EmptyState 组件
- 表单校验即时反馈（输入时校验，非提交时）

---

### 模块 C1：岗位管理完整 CRUD（`src/pages/`）

#### PositionDetailPage.tsx（编辑/新建）
当前状态：71 行骨架，有表单布局但无数据绑定

**需要实现：**
1. 接入 `usePositionStore`：
   - `isNew` 模式：调用 `createPosition(data)` → 成功后 navigate 到 `/positions`
   - `edit` 模式：获取 `id` → 调用 `getPosition(id)` → 填充表单
2. 表单字段完整：
   - 岗位名称（title）— Input，必填
   - 岗位方向（category）— Select 下拉（测试/开发/运营/产品/设计/运维/数据/其他）
   - 技能标签（skills）— 输入框 + 回车添加 + Badge 展示，点击删除
   - 标签（tags）— 类似 skills
   - 备注（notes）— Textarea
   - 个人匹配分析（analysis）— Textarea，支持 Markdown
   - 面试问题（interviewQuestions）— Textarea，支持 Markdown
3. 表单校验：
   - title 必填
   - category 必选
   - 校验失败时字段标红 + 提示文字
4. 保存按钮：
   - 保存中显示 Spinner + 禁用
   - 成功 → Toast "保存成功" → navigate 到 `/positions`
   - 失败 → Toast "保存失败：{错误信息}"
5. 边界：
   - 编辑模式加载中显示 Skeleton
   - 编辑模式加载失败显示错误提示
   - 未保存离开 → 无提示（单用户场景可接受）

#### PositionListPage.tsx（列表）
当前状态：103 行，已接入 Store，有搜索和空态

**需要完善：**
1. 分类筛选：Tabs 组件（全部/测试/开发/运营/产品/设计/运维/数据）
2. 状态筛选：Tabs（全部/进行中/已归档）或 Select
3. 卡片操作：
   - 点击卡片 → navigate 到 `/positions/:id` 编辑
   - 卡片右下角操作按钮：归档 / 删除
   - 删除前弹出 ConfirmDialog（variant: danger）
   - 归档后卡片灰色调 + "已归档" Badge
4. 搜索：当前已实现，确认正常
5. 边界：
   - 加载中：Skeleton 卡片网格（6 个占位）
   - 空数据：EmptyState + "新建档案"按钮
   - 删除成功：Toast "已删除" + 列表更新
   - 归档成功：Toast "已归档" + 卡片样式更新

---

### 模块 C2：投递记录看板 + 状态流转（`src/pages/`）

#### ApplicationListPage.tsx
当前状态：106 行，已接入 Store，有搜索和状态 Badge

**需要实现：**
1. 视图切换：列表视图 / 看板（Kanban）视图
   - 使用 Tabs 或按钮切换
   - 状态记忆在 URL query 或 local state
2. 列表视图完善：
   - 分页（每页 20 条，使用"加载更多"或分页按钮）
   - 状态筛选 Tabs（全部/已投递/已读/沟通中/面试中/Offer/拒绝）
   - 日期范围筛选（可选）
3. 看板视图：
   - 按状态分 8 列（草稿/已投递/已读/沟通中/面试中/Offer/拒绝/已归档）
   - 每列标题：状态名 + 卡片计数
   - 列内卡片可滚动
   - 横向滚动（当窗口缩小时）
4. 状态流转：
   - 点击卡片上的状态 Badge → 弹出 Select 下拉选择新状态
   - 选择后调用 `updateApplicationStatus(id, newStatus)`
   - 看板模式下，卡片自动移动到目标列
   - 更新失败时回滚 UI + Toast 错误提示
5. 投递详情页（`/applications/:id`）：
   - 展示：公司名、岗位名、投递日期、状态、匹配度、JD 原文、打招呼文案
   - 可编辑 hasProgress 标记（复选框）
   - 可编辑状态
6. 边界：
   - 加载中：Skeleton 列表
   - 空数据：EmptyState + "去生成打招呼"按钮（navigate 到 `/greeting`）
   - 状态更新失败：Toast 错误 + UI 回滚

---

### 模块 C3：仪表盘数据可视化（`src/pages/`）

#### Dashboard.tsx
当前状态：84 行，有统计卡片骨架但使用 "--" 占位

**需要实现：**
1. 统计卡片接入真实数据：
   - 从 `useApplicationStore` 获取所有投递记录
   - 计算今日投递数（`created` 是今天）
   - 计算本周投递数（`created` 在本周内）
   - 计算平均匹配度（有 matchScore 的记录取平均，无数据时显示 "--"）
   - 计算有进展数（`hasProgress === true`）
2. 最近投递列表：
   - 展示最近 5 条投递记录（按 `created` 降序）
   - 每行显示：公司名、岗位名、状态 Badge、日期
   - 点击跳转到详情页
3. 欢迎引导（首次使用）：
   - 当无投递记录且无个人档案时，显示引导卡片
   - 两个按钮："完善个人档案" → `/profile`、"配置 API Key" → `/settings`
4. 边界：
   - 加载中：4 个统计卡片 Skeleton + 列表 Skeleton
   - 有数据无匹配度：显示 "--" 非 0
   - 错误：错误提示卡片 + 重试按钮

---

## 三、你的输出规范

### 代码输出
- 所有前端代码输出到 `src/` 目录下
- 需要修改的文件：
  - `src/pages/PositionDetailPage.tsx`
  - `src/pages/PositionListPage.tsx`
  - `src/pages/ApplicationListPage.tsx`
  - `src/pages/Dashboard.tsx`
  - 可能新增：`src/pages/ApplicationDetailPage.tsx`

### 文档输出
- 交付后输出交付报告到 `docs/delivery-reports/MODULE_C_前端交付报告.md`
- 遵循命名规范：`MODULE_{字母}_{功能描述}.md`

---

## 四、注意事项

1. **后端存储层已就绪**：所有 CRUD 方法已在 Sprint 2 实现，前端直接调用 `invoke()` 即可
2. **现有 Store 可直接使用**：`positionStore`、`applicationStore` 已在 Sprint 2 完善
3. **shadcn/ui 组件**：已安装 Tabs、Select、Dialog、Badge、Skeleton、Button、Card、Input、Textarea、Label 等，直接使用
4. **设计系统参考**：`ARCHITECTURE.md` 第 8 节（色彩体系、组件规范、动画）
5. **投递状态色**：见 `ARCHITECTURE.md` 8.2 节 — draft(灰)/applied(蓝)/read(青)/chatting(紫)/interview(橙)/offer(绿)/rejected(红)/archived(灰浅)