# MODULE_C_后端开发.md — 后端开发 Agent 任务指令

> **版本：** v1.0  
> **发出人：** PM Agent  
> **日期：** 2026-07-22  
> **Sprint：** 3 — 岗位管理 CRUD + 投递看板 + 仪表盘

---

## 一、你需要阅读的文档（按顺序）

| 顺序 | 文档 | 原因 |
|:----:|:-----|:-----|
| ① | `ARCHITECTURE.md`（项目根目录） | 了解全局架构、数据模型、Tauri Commands |
| ② | `docs/sprint-tasks/MODULE_C_岗位管理_投递看板.md` | **核心任务文档**，重点看 C3 的统计查询部分 |
| ③ | `docs/sprint-tasks/MODULE_B_AI打招呼生成.md`（参考） | 了解 B1 存储层现有接口 |
| ④ | `docs/pm-reports/MODULE_B_AI打招呼生成.md`（参考） | 了解 Sprint 2 验收结果 |

---

## 二、你的开发范围

### 后端任务说明

Sprint 2 的 B1 存储层已完整实现所有 CRUD 操作，包括：
- `position_storage.rs` — 5 个方法（list/get/create/update/delete）
- `application_storage.rs` — 6 个方法（list+filter/get/create/update/update_status/delete）
- `profile_storage.rs` — 2 个方法（get/save）
- `settings_storage.rs` — 2 个方法（get/save）

**本 Sprint 后端工作量极小，前端是主要开发方。** 后端只需完成以下可选任务：

---

### 新增：仪表盘统计查询接口（可选，推荐方式见备注）

**方案一（推荐）：** 前端直接通过 `list_applications()` 获取全部记录，在前端聚合计算。
- 优点：零后端改动，减少跨层通信
- 缺点：数据量大时性能略低（但个人用户 <1000 条，无影响）

**方案二（如果前端需要）：** 新增 `commands/dashboard.rs`

1. **新增 `commands/dashboard.rs`**：
   - `get_dashboard_stats()` → 返回 `DashboardStats`
   - 返回统计数据：今日投递数、本周投递数、平均匹配度、有进展数、最近 5 条投递记录
2. **新增 `models/dashboard.rs`**：
   - `DashboardStats` 结构体：
     - `today_count: u32`
     - `week_count: u32`
     - `avg_match_score: Option<f64>`
     - `progress_count: u32`
     - `recent_applications: Vec<Application>`
3. **注册 Command**：在 `lib.rs` 的 `invoke_handler` 中注册

⚠️ **与前端协调：** 先确认前端是否需要此接口。如果前端选择方案一（前端聚合），则后端无需任何改动。

---

## 三、你的输出规范

### 代码输出
- 所有 Rust 代码输出到 `src-tauri/src/` 目录下
- 如需新增文件：`src-tauri/src/commands/dashboard.rs` + `src-tauri/src/models/dashboard.rs`

### 文档输出
- 交付后输出交付报告到 `docs/delivery-reports/MODULE_C_后端交付报告.md`
- 遵循命名规范：`MODULE_{字母}_{功能描述}.md`

---

## 四、注意事项

1. **本 Sprint 后端工作量极小**，重点是前端三个页面的交互完善
2. **统计接口可选**：推荐前端直接聚合，除非前端明确要求后端提供
3. **现有代码规范保持**：所有结构体 `#[serde(rename_all = "camelCase")]`、`Option<T>` 可选字段、`PathBuf` 路径安全、`AppError` 错误处理
4. **如无后端任务**：交付报告写"本 Sprint 后端无变更"即可