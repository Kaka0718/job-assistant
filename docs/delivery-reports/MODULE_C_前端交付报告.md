# 前端交付文档 — MODULE_C_岗位管理_投递看板_仪表盘

> **版本：** v1.0  
> **交付日期：** 2026-07-22  
> **Sprint：** 3 — 岗位管理 CRUD + 投递看板 + 仪表盘  
> **交付 Agent：** 前端开发 Agent

---

## 一、交付清单

### 1.1 新增文件

| 文件 | 模块 | 说明 |
|:-----|:-----|:------|
| `src/components/ui/checkbox.tsx` | C2 | 复选框组件（shadcn/ui 补全） |
| `src/pages/ApplicationDetailPage.tsx` | C2 | 投递详情页（状态编辑 + hasProgress 标记） |

### 1.2 修改文件

| 文件 | 模块 | 改动说明 |
|:-----|:-----|:---------|
| `src/App.tsx` | C2 | 新增 `/applications/:id` 路由 |
| `src/pages/PositionDetailPage.tsx` | C1 | 完整表单（技能标签、方向Select、校验、保存） |
| `src/pages/PositionListPage.tsx` | C1 | 分类筛选Tabs + 状态筛选 + 归档/删除确认 |
| `src/pages/ApplicationListPage.tsx` | C2 | 列表/看板切换 + 8列看板 + 状态流转 + 分页 |
| `src/pages/Dashboard.tsx` | C3 | 真实数据统计 + 最近投递列表 + 引导流程 |

---

## 二、模块实现详情

### C1：岗位管理完整 CRUD

#### PositionDetailPage.tsx

| 功能 | 实现 |
|:-----|:------|
| 新建模式 | `isNew` 判断 → 空表单 → `createPosition(data)` → navigate |
| 编辑模式 | `getPosition(id)` 加载 → 填充表单 → `updatePosition(id, data)` |
| 技能标签 | 回车添加 + Badge 展示 + 点击 Badge 删除（X 图标） |
| 标签 | 同上，独立管理 |
| 岗位方向 | Select 下拉（测试/开发/运营/产品/设计/运维/数据/其他） |
| 表单校验 | title 必填 + category 必选 → 字段标红 + 错误提示 |
| 保存中 | Spinner + 按钮禁用 |
| 加载中 | Skeleton 骨架屏 |

#### PositionListPage.tsx

| 功能 | 实现 |
|:-----|:------|
| 分类筛选 | Tabs 组件 9 项（全部+8类） |
| 状态筛选 | Tabs 组件（全部/进行中/已归档） |
| 归档 | 按钮 → ConfirmDialog 确认 → `archivePosition()` → Toast |
| 删除 | 按钮 → ConfirmDialog（danger 变体） → `deletePosition()` → Toast |
| 已归档卡片 | `opacity-60` 灰色调 |
| 超长标题 | CSS `truncate` + `title` 属性 Tooltip |

---

### C2：投递记录看板 + 状态流转

#### ApplicationListPage.tsx

| 功能 | 实现 |
|:-----|:------|
| 视图切换 | 列表/看板切换按钮组（LayoutList / Columns3 图标） |
| 列表视图 | 状态筛选 Tabs + 搜索 + 分页（加载更多，每页20条） |
| 看板视图 | 8 列（草稿/已投递/已读/沟通中/面试中/Offer/拒绝/已归档） |
| 看板列标题 | 状态名 + 计数 Badge |
| 看板列颜色 | 顶部彩色边框（border-t-{color}-500） |
| 状态流转 | 点击状态 Badge → Select 弹出 → 选择新状态 → `updateStatus()` |
| 更新失败 | 回滚 UI + Toast 错误提示 |
| 空数据 | EmptyState + "去生成打招呼"按钮 |

#### ApplicationDetailPage.tsx

| 功能 | 实现 |
|:-----|:------|
| 基本信息 | 公司、岗位、投递日期、匹配度 |
| 状态编辑 | Select 下拉切换状态 |
| hasProgress | Checkbox 标记 |
| JD 原文 | Card 展示（whitespace-pre-wrap） |
| 打招呼文案 | Card 展示 |
| 关键词 | Badge 列表展示 |

---

### C3：仪表盘数据可视化

#### Dashboard.tsx

| 功能 | 实现 |
|:-----|:------|
| 今日投递 | `isToday()` 筛选当天记录 |
| 本周投递 | `isWithinInterval()` + `startOfWeek/endOfWeek` |
| 平均匹配度 | 有 matchScore 的记录取平均，无数据时显示 "--" |
| 有进展数 | `hasProgress === true` 计数 |
| 最近投递 | 最近 5 条，按 created 降序，点击跳转详情 |
| 欢迎引导 | 无投递 + 无档案时显示引导卡片（完善档案/配置API Key） |
| 错误态 | 错误提示卡片 + 重试按钮 |
| 加载态 | 4 个统计卡片 Skeleton + 列表 Skeleton |

---

## 三、数据流

```
C1: 用户操作 → PositionDetailPage → positionStore.create/update → invoke → Rust → 文件
    ↓
    navigate → PositionListPage → positionStore.fetchPositions → 列表更新

C2: 用户操作 → ApplicationListPage → applicationStore.updateStatus → invoke → Rust → 文件
    ↓
    Store 更新 → UI 自动重渲染（列表/看板均响应）

C3: Dashboard → applicationStore.fetchApplications + profileStore.fetchProfile
    ↓
    前端聚合计算 → 统计卡片 + 最近投递列表
```

---

## 四、组件状态覆盖

### PositionDetailPage
| 状态 | 表现 |
|:-----|:------|
| 加载中（编辑模式） | Skeleton 骨架屏 |
| 新建模式 | 空表单 |
| 校验失败 | 字段标红 + 错误文字 |
| 保存中 | Spinner + 按钮禁用 |
| 保存成功 | Toast + navigate 到列表 |
| 保存失败 | Toast 错误信息 |

### PositionListPage
| 状态 | 表现 |
|:-----|:------|
| 加载中 | 6 个 Skeleton 卡片 |
| 空数据（无筛选） | EmptyState + 新建按钮 |
| 空数据（有筛选） | EmptyState + "调整筛选条件" |
| 删除确认 | ConfirmDialog（danger） |
| 归档确认 | ConfirmDialog（info） |

### ApplicationListPage
| 状态 | 表现 |
|:-----|:------|
| 加载中 | 5 个 Skeleton 列表项 |
| 空数据 | EmptyState + 去生成打招呼 |
| 状态更新中 | 对应 Select 禁用 |
| 状态更新失败 | Toast + UI 回滚 |
| 加载更多 | 按钮显示剩余条数 |

### Dashboard
| 状态 | 表现 |
|:-----|:------|
| 加载中 | 4 个统计卡片 Skeleton + 列表 Skeleton |
| 无数据 + 无档案 | 欢迎引导卡片 |
| 无数据 + 有档案 | "开始投递"引导 |
| 有数据 | 统计卡片 + 最近投递列表 |
| 错误 | 错误提示卡片 + 重试按钮 |
| 无匹配度数据 | 显示 "--" 非 0 |

---

## 五、自测情况

- [x] TypeScript 编译通过 (`npx tsc --noEmit` → 零错误)
- [x] 所有页面接入 Zustand Store 真实数据
- [x] 组件状态覆盖：加载/空数据/正常/错误/边界
- [x] 技能标签：回车添加 + Badge 展示 + 点击删除
- [x] 表单校验：title 必填 + category 必选
- [x] 分页加载更多（每页 20 条）
- [x] 看板视图 8 列状态分组 + 计数
- [x] 状态流转：点击 Badge → Select → 更新
- [x] 归档/删除：ConfirmDialog 确认
- [x] 仪表盘统计：今日/本周/平均匹配度/有进展
- [x] 最近投递列表：按时间降序，点击跳转详情
- [x] 首次使用引导