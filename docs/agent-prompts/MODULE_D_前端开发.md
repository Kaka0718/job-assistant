# MODULE_D_前端开发.md — 前端开发 Agent 任务指令

> **版本：** v1.0  
> **发出人：** PM Agent  
> **日期：** 2026-07-23  
> **Sprint：** 4 — 体验优化（拖拽排序 + 数据可视化 + 导入导出 + 备份恢复）

---

## 一、你需要阅读的文档（按顺序）

| 顺序 | 文档 | 原因 |
|:----:|:-----|:-----|
| ① | `ARCHITECTURE.md`（项目根目录） | 了解全局架构、设计系统、状态管理 |
| ② | `docs/sprint-tasks/MODULE_D_体验优化.md` | **核心任务文档**，重点看 D1 / D2 / D3 / D4 |
| ③ | `docs/pm-reports/MODULE_C_岗位管理_投递看板.md`（参考） | 了解现有看板和仪表盘实现 |

---

## 二、你的开发范围

### 模块 D1：投递看板拖拽排序

**核心文件：** `src/pages/ApplicationListPage.tsx`（当前 404 行）

**需要修改：**
1. 安装 `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
2. 在看板视图（kanban）中集成 `DndContext`、`SortableContext`、`useSortable`
3. 每列内部卡片可拖拽排序（垂直拖动）
4. 跨列拖拽：将卡片拖到另一列时，自动调用 `updateStatus(id, newStatus)`
5. 拖拽时卡片显示 DragOverlay（半透明跟随）
6. 拖拽失败时回滚

**状态覆盖：** 拖拽中 / 拖拽成功 / 更新失败回滚

---

### 模块 D2：仪表盘数据可视化

**核心文件：** `src/pages/Dashboard.tsx`（当前 292 行）

**需要修改：**
1. 安装 `recharts`
2. 新增"匹配度分布"柱状图（BarChart）
   - 5 个分数段：0-20 / 21-40 / 41-60 / 61-80 / 81-100
   - 颜色使用设计系统状态色
3. 新增"每周投递趋势"折线图（LineChart）
   - 最近 8 周
   - 从 `list_applications()` 数据聚合
4. 新增"状态分布"环形图（PieChart）
   - 8 种状态的颜色与设计系统状态色对齐
5. 无数据时显示 EmptyState 而非空图表
6. 图表响应式（`ResponsiveContainer`）

**状态覆盖：** 加载中 Skeleton / 有数据图表 / 无数据 EmptyState / 错误重试

---

### 模块 D3：岗位档案批量导入/导出

**核心文件：** `src/pages/PositionListPage.tsx`（当前 264 行）

**需要修改：**
1. 列表页增加"导出"按钮 → 导出 JSON
2. 列表页增加"导入"按钮 → 选择 JSON 文件 → 批量创建
3. 导入进度提示（Toast 或进度条）
4. 导入格式校验 + 错误跳过 + 汇总报告

**状态覆盖：** 导入中进度 / 导入成功汇总 / 格式错误 / 字段校验失败

---

### 模块 D4：数据备份/恢复

**核心文件：** `src/pages/SettingsPage.tsx`

**需要修改：**
1. 设置页新增"数据管理"区域（Card）
2. "导出备份"按钮 → 调用后端 `export_backup(path)` → 保存 zip
3. "导入备份"按钮 → 选择 zip → ConfirmDialog 确认 → 调用后端 `import_backup(path)`
4. 备份中显示进度
5. 恢复前显示警告 + 备份文件信息

**状态覆盖：** 备份中进度 / 恢复前确认 / 恢复成功 / 恢复失败回滚

---

## 三、你的输出规范

### 代码输出
- 所有代码输出到 `src/` 目录下
- 需要修改的文件：
  - `src/pages/ApplicationListPage.tsx`（D1 拖拽）
  - `src/pages/Dashboard.tsx`（D2 图表）
  - `src/pages/PositionListPage.tsx`（D3 导入导出）
  - `src/pages/SettingsPage.tsx`（D4 备份恢复）

### 文档输出
- 交付后输出交付报告到 `docs/delivery-reports/MODULE_D_前端交付报告.md`
- 遵循命名规范：`MODULE_{字母}_{功能描述}.md`

---

## 四、注意事项

1. **@dnd-kit 集成**：看板列使用 `useDroppable`，卡片使用 `useSortable`
2. **Recharts 颜色**：使用 `ARCHITECTURE.md` 8.2 节的语义色（success/warning/error/info）
3. **导入安全**：文件校验在前端做，不合法文件不上传
4. **备份恢复**：依赖后端 `export_backup` / `import_backup` 命令，需联调