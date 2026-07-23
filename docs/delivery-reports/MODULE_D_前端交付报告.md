# 前端交付文档 — MODULE_D_体验优化

> **版本：** v1.0  
> **交付日期：** 2026-07-23  
> **Sprint：** 4 — 体验优化（拖拽排序 + 数据可视化 + 导入导出 + 备份恢复）  
> **交付 Agent：** 前端开发 Agent

---

## 一、交付清单

### 1.1 新增文件

| 文件 | 模块 | 说明 |
|:-----|:-----|:------|
| `src-tauri/src/commands/backup.rs` | D4 | 后端备份/恢复命令（write_text_file, read_text_file, export_backup, import_backup） |

### 1.2 修改文件

| 文件 | 模块 | 改动说明 |
|:-----|:-----|:---------|
| `src/pages/ApplicationListPage.tsx` | D1 | 集成 @dnd-kit 拖拽系统（DndContext + useDraggable + useDroppable + DragOverlay） |
| `src/pages/Dashboard.tsx` | D2 | 集成 recharts（匹配度分布柱状图 + 每周趋势折线图 + 状态分布环形图） |
| `src/pages/PositionListPage.tsx` | D3 | 新增导入/导出按钮 + 批量创建 + 格式校验 + 进度提示 |
| `src/pages/SettingsPage.tsx` | D4 | 新增数据管理区域（导出备份 ZIP + 导入恢复 + ConfirmDialog 警告） |
| `src-tauri/Cargo.toml` | D4 | 新增 `zip = "2"` 依赖 |
| `src-tauri/src/commands/mod.rs` | D4 | 注册 backup 模块 |
| `src-tauri/src/lib.rs` | D4 | 注册所有 Tauri Command（position + application + profile + settings + backup） |

### 1.3 新增依赖

| 包名 | 用途 |
|:-----|:------|
| `@dnd-kit/core` | DnD 核心（DndContext, DragOverlay） |
| `@dnd-kit/sortable` | 排序支持 |
| `@dnd-kit/utilities` | 拖拽工具函数 |
| `recharts` | 图表可视化（BarChart, LineChart, PieChart） |
| `zip` (Rust) | ZIP 打包/解压（备份恢复） |

---

## 二、模块实现详情

### D1：投递看板拖拽排序

| 功能 | 实现 |
|:-----|:------|
| DndContext | 包裹看板区域，管理拖拽状态 |
| useDraggable | 每张卡片可拖拽，携带 app 数据和来源状态 |
| useDroppable | 每列作为拖拽目标区域 |
| DragOverlay | 拖拽中半透明卡片跟随 |
| 跨列拖拽 | `onDragEnd` 获取目标列 → 调用 `updateStatus(id, newStatus)` |
| 冲突处理 | 拖拽到非法区域回弹（无目标列时不更新） |
| 交互体验 | 拖拽源列 `opacity-50`，目标列 `ring-2 ring-primary` 高亮 |
| 列内/跨列 | 列内保持原有顺序，跨列自动触发状态变更 |

### D2：仪表盘数据可视化

| 图表 | 类型 | 数据源 |
|:-----|:------|:--------|
| 匹配度分布 | BarChart | 投递记录 matchScore，5 段（0-20/21-40/41-60/61-80/81-100） |
| 每周投递趋势 | LineChart | 最近 8 周按周聚合投递数量 |
| 状态分布 | PieChart（环形） | 8 种状态计数，颜色与设计系统状态色对齐 |

**无数据处理：** 各图表在无数据时显示 "暂无匹配度数据" / "暂无投递数据" 文字提示，而非空图表。

### D3：岗位档案批量导入/导出

| 功能 | 实现 |
|:-----|:------|
| 导出 | Tauri `save()` 对话框选择路径 → `invoke("write_text_file")` 写入 JSON |
| 导入 | Tauri `open()` 选择 JSON 文件 → 读取 → 解析 → 校验 → 批量 `createPosition()` |
| 字段校验 | `title` + `category` 必填，category 必须在合法列表内 |
| 重复检测 | 标题相同的岗位跳过（自动跳过） |
| 进度提示 | 按钮显示 "正在导入第 N/M 条..." |
| 结果汇总 | Toast 显示 "成功 N 条，跳过 M 条" |

### D4：数据备份/恢复

| 功能 | 实现 |
|:-----|:------|
| 后端 | `export_backup(path)` — 递归打包 data/ 目录为 ZIP |
| 后端 | `import_backup(path)` — 解压 ZIP 覆盖 data/ 目录，含回滚机制 |
| 前端 | 设置页新增"数据管理"Card，含导出/导入按钮 |
| 导出备份 | `save()` 对话框 → `invoke("export_backup")` → Toast |
| 导入恢复 | `open()` 选择 ZIP → ConfirmDialog 警告 → `invoke("import_backup")` → Toast |
| 回滚安全 | 导入前备份当前数据到临时目录，失败时保留原数据 |

---

## 三、数据流

```
D1: 拖拽卡片 → onDragEnd → 获取目标列 → updateStatus → Store 更新 → UI 重渲染
    ↓
    拖拽失败 → 回滚（不更新）

D2: Dashboard → fetchApplications → 前端聚合计算 → 3 个图表渲染

D3: 导出: positions → serialize → invoke("write_text_file") → 保存 JSON
     导入: open JSON → invoke("read_text_file") → parse → validate → batch createPosition

D4: 备份: save() → invoke("export_backup") → zip crate → 打包 data/ 目录
     恢复: open() → ConfirmDialog → invoke("import_backup") → zip crate → 解压覆盖
```

---

## 四、自测情况

- [x] TypeScript 编译通过 (`npx tsc --noEmit` → 零错误)
- [x] Rust 后端编译通过 (`cargo check` → 零错误)
- [x] D1: 看板拖拽 — DndContext + useDraggable + useDroppable + DragOverlay
- [x] D1: 跨列拖拽自动调用 updateStatus
- [x] D1: 拖拽目标列高亮 + 非法区域回弹
- [x] D2: 匹配度分布柱状图（5段 + 颜色编码）
- [x] D2: 每周投递趋势折线图（最近8周）
- [x] D2: 状态分布环形图（8种状态色 + 百分比标签）
- [x] D2: 无数据时显示 EmptyState 文字而非空图表
- [x] D3: 导出 JSON（Tauri save dialog）
- [x] D3: 导入 JSON + 格式校验 + 字段校验 + 重复跳过
- [x] D3: 导入进度提示 + 完成汇总 Toast
- [x] D4: 备份为 ZIP（后端 export_backup）
- [x] D4: 从 ZIP 恢复（后端 import_backup + 回滚机制）
- [x] D4: 恢复前 ConfirmDialog 警告
- [x] D4: 备份中/恢复中 Spinner + 禁用按钮