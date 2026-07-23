# MODULE_E_后端开发.md — 后端开发 Agent 任务指令

> **版本：** v1.0  
> **发出人：** PM Agent  
> **日期：** 2026-07-23  
> **Sprint：** 5 — AI 智能增强与数据导出

---

## 一、你需要阅读的文档（按顺序）

| 顺序 | 文档 | 原因 |
|:----:|:-----|:-----|
| ① | `ARCHITECTURE.md`（项目根目录） | 了解全局架构、数据模型、存储层 |
| ② | `docs/sprint-tasks/MODULE_E_AI智能增强与数据导出.md` | **核心任务文档**，重点看 E4 后端任务 |
| ③ | `docs/sprint-tasks/MODULE_D_体验优化.md`（参考） | 了解 Sprint 4 的 backup.rs 代码风格 |

---

## 二、你的开发范围

### 模块 E1：流式输出

**后端任务：** 无

AI 调用从浏览器直接发往 API，不经过 Tauri 后端。前端使用 `fetch()` + `stream: true` 直接调用 OpenAI 兼容 API。

---

### 模块 E2：关键词手动勾选

**后端任务：** 无

关键词提取在前端使用正则实现，不涉及后端处理。

---

### 模块 E3：打招呼历史版本

**后端任务：** 无（可选）

版本数据优先使用前端 localStorage 存储。如需文件持久化，前端通过现有的 `safeInvoke` 机制读写文件，无需新增后端命令。

---

### 模块 E4：数据导出为 CSV

**核心目标：** Rust 后端提供 3 个 Tauri Command，将数据导出为 CSV 文件

#### 1. 新增 `src-tauri/src/commands/export.rs`

```rust
use std::fs;
use std::path::PathBuf;

/// 导出所有岗位档案为 CSV
#[tauri::command]
pub fn export_positions_csv(path: String) -> Result<(), String> {
    // 读取 data/positions/ 目录下所有 .md 文件
    // 解析 frontmatter 提取字段
    // 写入 CSV 文件到指定路径
    // 返回 Ok(()) 或 Err(String)
}

/// 导出所有投递记录为 CSV
#[tauri::command]
pub fn export_applications_csv(path: String) -> Result<(), String> {
    // 读取 data/applications/ 目录下所有 .md 文件
    // 解析 frontmatter 提取字段
    // 写入 CSV 文件到指定路径
    // 返回 Ok(()) 或 Err(String)
}

/// 导出仪表盘统计数据为 CSV
#[tauri::command]
pub fn export_dashboard_csv(path: String) -> Result<(), String> {
    // 读取所有投递记录，按状态聚合统计
    // 写入 CSV 文件到指定路径
    // 返回 Ok(()) 或 Err(String)
}
```

#### 2. CSV 格式规范

**positions.csv 字段顺序：**
```
title, company, location, salaryRange, status, type, description, skills, createdAt, updatedAt
```

**applications.csv 字段顺序：**
```
positionTitle, company, status, channel, matchScore, createdAt, updatedAt, notes
```

**dashboard.csv 字段顺序：**
```
status, count, percentage
```

#### 3. 编码要求

- 所有 CSV 文件必须包含 **UTF-8 BOM**（`\u{FEFF}`），确保 Windows 中文用户用 Excel 打开不乱码
- 字段值包含逗号、双引号或换行符时，必须用双引号包裹
- 字段值中的双引号用 `""` 转义

#### 4. 实现细节

**读取和解析数据：**
- 复用现有的文件读取逻辑（参考 `position.rs` 和 `application.rs` 的 CRUD 实现）
- 使用 `data_dir()` 函数获取数据目录路径（参考 `backup.rs` 的实现）
- 解析 frontmatter 提取字段（参考 `mod.rs` 中的 frontmatter 解析函数）

**CSV 写入（手动拼接，不强制引入 csv crate）：**
```rust
fn write_csv_with_bom(path: &str, headers: &[&str], rows: &[Vec<String>]) -> Result<(), String> {
    let mut csv_content = String::new();
    
    // UTF-8 BOM
    csv_content.push('\u{FEFF}');
    
    // Header row
    csv_content.push_str(&headers.join(","));
    csv_content.push('\n');
    
    // Data rows
    for row in rows {
        let escaped: Vec<String> = row.iter().map(|field| {
            if field.contains(',') || field.contains('"') || field.contains('\n') {
                format!("\"{}\"", field.replace('"', "\"\""))
            } else {
                field.clone()
            }
        }).collect();
        csv_content.push_str(&escaped.join(","));
        csv_content.push('\n');
    }
    
    fs::write(path, csv_content).map_err(|e| format!("写入文件失败: {}", e))?;
    Ok(())
}
```

**数据读取：**
- `positions`：读取 `data/positions/` 下所有 `.md` 文件，解析 YAML frontmatter
- `applications`：读取 `data/applications/` 下所有 `.md` 文件，解析 YAML frontmatter
- `dashboard`：读取所有投递记录，按 status 字段分组统计

#### 5. 修改 `src-tauri/src/commands/mod.rs`

```rust
pub mod export;
```

#### 6. 修改 `src-tauri/src/lib.rs`

```rust
.invoke_handler(tauri::generate_handler![
    // ... 现有命令
    crate::commands::export::export_positions_csv,
    crate::commands::export::export_applications_csv,
    crate::commands::export::export_dashboard_csv,
])
```

#### 7. 新增 `Cargo.toml` 依赖（可选）

```toml
csv = "1.3"    # 如使用 csv crate 替代手动拼接，则添加此依赖
```

如果使用手动拼接方式（`write_csv_with_bom` 函数），则无需新增依赖。

#### 验收标准

| 检查项 | 预期结果 |
|:-------|:---------|
| 岗位导出 | 导出 CSV 包含所有岗位字段（title/company/location/status/salaryRange 等） |
| 投递导出 | 导出 CSV 包含所有投递字段（positionTitle/company/status/createdAt 等） |
| 仪表盘导出 | 导出 CSV 包含各状态数量统计 |
| 中文编码 | 使用 UTF-8 BOM，Excel 打开无乱码 |
| 空数据 | 无数据时导出空文件（仅表头） |
| 错误处理 | 文件写入失败时返回错误信息 |

---

## 三、你的输出规范

### 代码输出

所有 Rust 代码输出到 `src-tauri/src/` 目录下：

| 操作 | 文件 | 说明 |
|:-----|:-----|:-----|
| 新增 | `src-tauri/src/commands/export.rs` | 3 个 CSV 导出 Command |
| 修改 | `src-tauri/src/commands/mod.rs` | 注册 export 模块 |
| 修改 | `src-tauri/src/lib.rs` | 注册 3 个新 Command |
| 修改（可选） | `src-tauri/Cargo.toml` | 如需 csv crate 则添加 |

### 文档输出

- 交付后输出交付报告到 `docs/delivery-reports/MODULE_E_后端交付报告.md`
- 遵循命名规范：`MODULE_{字母}_{功能描述}.md`

---

## 四、注意事项

1. **UTF-8 BOM 必须**：Windows 中文用户的 Excel 需要 BOM 才能正确识别 UTF-8 编码
2. **CSV 转义**：字段中的逗号、双引号、换行符必须正确处理，否则 Excel 解析错误
3. **路径安全**：使用 `PathBuf::join()` 拼接路径，禁止字符串拼接
4. **复用现有代码**：参考 `backup.rs` 的 `data_dir()` 实现和文件读取方式
5. **字段顺序**：保持固定的字段顺序，确保导出的 CSV 列顺序一致
6. **空数据处理**：某个字段可能为空，CSV 中应保留空字段位置（`value,,next`）

---

*本任务指令由 PM Agent 基于 Sprint 5 任务文档自动生成。*