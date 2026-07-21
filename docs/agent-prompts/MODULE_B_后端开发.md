# MODULE_B_后端开发.md — 后端开发 Agent 任务指令

> **版本：** v1.0  
> **发出人：** PM Agent  
> **日期：** 2026-07-20  
> **Sprint：** 2 — AI 打招呼生成（存储层补全）

---

## 一、你需要阅读的文档（按顺序）

| 顺序 | 文档 | 原因 |
|:----:|:-----|:-----|
| ① | `ARCHITECTURE.md`（项目根目录） | 了解全局架构、数据模型、存储层设计、Tauri Commands |
| ② | `docs/sprint-tasks/MODULE_B_AI打招呼生成.md` | **核心任务文档**，重点看 B1 子模块 |
| ③ | `docs/sprint-tasks/MODULE_A_基础设施搭建.md`（参考） | 了解 Sprint 1 已搭建的 Rust 结构体和存储层接口 |
| ④ | `docs/pm-reports/MODULE_A_基础设施搭建.md`（参考） | 了解 Sprint 1 验收结果，特别是缺陷修复的代码规范 |

---

## 二、你的开发范围

### 子模块 B1：Rust 存储层补全（`src-tauri/src/storage/`）

你需要将 Sprint 1 遗留的所有 `todo!()` 桩代码替换为真实实现。

#### 1. `position_storage.rs` — 岗位档案存储

| 方法 | 当前状态 | 需要实现 |
|:-----|:--------:|:---------|
| `list_positions()` | `todo!()` | 扫描 `data/positions/*.md`，解析 frontmatter，返回 `Vec<Position>` |
| `get_position(id)` | `todo!()` | 遍历查找匹配 ID 的 Position |
| `create_position(input)` | `todo!()` | 生成 UUID（`pos_xxx`），写入 frontmatter，保存文件 |
| `update_position(id, input)` | `todo!()` | 读取 → 合并字段 → 写回 |
| `delete_position(id)` | `todo!()` | 删除文件 |

#### 2. `application_storage.rs` — 投递记录存储

| 方法 | 当前状态 | 需要实现 |
|:-----|:--------:|:---------|
| `list_applications(filter)` | `todo!()` | 按 `ApplicationFilter` 筛选（status/positionId/dateFrom/dateTo） |
| `get_application(id)` | `todo!()` | 遍历查找匹配 ID 的 Application |
| `create_application(input)` | `todo!()` | 生成 UUID（`app_xxx`），文件名 `{日期}_{公司}_{岗位}.md` |
| `update_application(id, input)` | `todo!()` | 合并字段 → 写回 |
| `delete_application(id)` | `todo!()` | 删除文件 |

#### 3. `profile_storage.rs` — 个人档案存储

| 方法 | 当前状态 | 需要实现 |
|:-----|:--------:|:---------|
| `get_profile()` | `todo!()` | 读取 `data/profiles/profile.md`，不存在返回 `None` |
| `save_profile(input)` | `todo!()` | 写入或覆写单文件 |

#### 4. `settings_storage.rs` — 设置存储

| 方法 | 当前状态 | 需要实现 |
|:-----|:--------:|:---------|
| `get_settings()` | `todo!()` | 读取 `data/settings.json`，不存在返回默认值 |
| `save_settings(data)` | `todo!()` | 写入 JSON（非 Markdown） |

#### 5. `commands/` — Tauri Commands 实装

将以下 commands 的 `todo!()` 替换为真实存储调用：

| Command | 调用存储方法 |
|:--------|:------------|
| `commands/position.rs` | `position_storage::list_positions()`, `create_position()`, 等 |
| `commands/application.rs` | `application_storage::list_applications()`, `create_application()`, 等 |
| `commands/profile.rs` | `profile_storage::get_profile()`, `save_profile()` |
| `commands/settings.rs` | `settings_storage::get_settings()`, `save_settings()`, `test_ai_connection()` |

---

## 三、你的输出规范

### 代码输出
- 所有 Rust 代码输出到 `src-tauri/src/` 目录下
- 严格遵循 `ARCHITECTURE.md` 第 6 节的目录结构
- 文件命名：snake_case（如 `position_storage.rs`）

### 文档输出（如需要记录）
- 如果有 QA 测试需求，测试报告存到 `docs/test-reports/MODULE_B_AI打招呼生成.md`
- 遵循命名规范：`MODULE_{字母}_{功能描述}.md`

---

## 四、注意事项（Sprint 1 验收遗留规范）

### 必须遵守的代码规范（来自 Sprint 1 缺陷修复）
1. ✅ **所有结构体添加 `#[serde(rename_all = "camelCase")]`**（Sprint 1 缺陷 001）
2. ✅ **`Application` 必须含 `status: ApplicationStatus` 字段**（Sprint 1 缺陷 002）
3. ✅ **可选字段使用 `Option<T>`**，与前端 `?` 标记对齐（Sprint 1 缺陷 003）
4. ✅ **禁止硬编码路径**，使用 `crate::get_data_dir().join(...)`（Sprint 1 缺陷 004）
5. ✅ **文件操作使用 `PathBuf.join()`**，禁止字符串拼接路径
6. ✅ **文件不存在时返回 `None` 或空列表**，不 panic

### 实现细节
- `app.path().app_data_dir()` 获取 Tauri 标准数据目录（已在 `lib.rs` 中通过 `OnceLock` 初始化）
- 启动时自动创建子目录：`profiles/`, `positions/`, `applications/`
- 使用 `crate::utils::frontmatter::parse_frontmatter()` 和 `serialize_frontmatter()` 解析 Markdown
- 错误类型使用 `AppError`，通过 `.map_err(|e| format!(...))` 转换为 `String`
- 前端通过 `invoke()` 调用，返回 `Result<T, String>`