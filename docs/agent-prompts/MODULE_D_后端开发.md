# MODULE_D_后端开发.md — 后端开发 Agent 任务指令

> **版本：** v1.0  
> **发出人：** PM Agent  
> **日期：** 2026-07-23  
> **Sprint：** 4 — 体验优化（备份/恢复 + 导入/导出）

---

## 一、你需要阅读的文档（按顺序）

| 顺序 | 文档 | 原因 |
|:----:|:-----|:-----|
| ① | `ARCHITECTURE.md`（项目根目录） | 了解全局架构、数据模型、存储层 |
| ② | `docs/sprint-tasks/MODULE_D_体验优化.md` | **核心任务文档**，重点看 D3 / D4 |
| ③ | `docs/sprint-tasks/MODULE_B_AI打招呼生成.md`（参考） | 了解 B1 存储层实现 |

---

## 二、你的开发范围

### 模块 D3：岗位档案导入/导出

**后端任务：**
- 本模块无后端任务。前端直接序列化/反序列化 JSON，通过 Tauri dialog 保存/读取文件

---

### 模块 D4：数据备份/恢复

**后端任务：**

#### 1. 新增 `commands/backup.rs`

```
pub fn export_backup(path: String) -> Result<(), String>
  → 将 data/ 目录打包为 zip 文件到指定路径

pub fn import_backup(path: String) -> Result<(), String>
  → 解压 zip 文件覆盖 data/ 目录
  → 解压前备份当前 data/ 到临时目录
  → 失败时自动回滚
```

#### 2. 新增 `Cargo.toml` 依赖

```toml
zip = "2"         # zip 打包/解压
```

#### 3. 在 `lib.rs` 注册新 Command

```rust
.invoke_handler(tauri::generate_handler![
    // ... 现有命令
    crate::commands::backup::export_backup,
    crate::commands::backup::import_backup,
])
```

#### 4. 实现细节

**export_backup：**
- 读取 `data/` 目录下所有文件（profiles/*.md, positions/*.md, applications/*.md, settings.json）
- 使用 `zip::ZipWriter` 打包
- 写入到参数 `path` 指定的位置

**import_backup：**
- 校验 zip 文件格式（是否包含 profiles/、positions/ 等目录）
- 备份当前 `data/` 目录到临时路径（如 `data_backup_20260723_235959/`）
- 解压 zip 覆盖 `data/`
- 解压失败时从临时路径恢复
- 成功时删除临时备份

#### 5. 非功能性要求

- 备份/恢复操作在异步线程执行（使用 `tokio::task::spawn_blocking`）
- 大文件操作时返回进度回调（可选，可先用同步阻塞方案）
- 备份文件路径使用 `PathBuf` 确保跨平台安全

---

## 三、你的输出规范

### 代码输出
- 所有 Rust 代码输出到 `src-tauri/src/` 目录下
- 新增文件：
  - `src-tauri/src/commands/backup.rs`
- 修改文件：
  - `src-tauri/Cargo.toml`（新增 zip 依赖）
  - `src-tauri/src/commands/mod.rs`（注册新模块）
  - `src-tauri/src/lib.rs`（注册新 Command）

### 文档输出
- 交付后输出交付报告到 `docs/delivery-reports/MODULE_D_后端交付报告.md`
- 遵循命名规范：`MODULE_{字母}_{功能描述}.md`

---

## 四、注意事项

1. **zip crate 版本**：使用 `zip = "2"`（最新稳定版）
2. **路径安全**：所有文件操作使用 `PathBuf::join()`，禁止字符串拼接
3. **回滚安全**：import_backup 必须先备份再解压，确保失败时可恢复
4. **跨平台**：zip 路径分隔符使用 `/`，确保 Windows/macOS/Linux 兼容
5. **与前端联调**：`export_backup(path)` 的 `path` 由前端通过 Tauri dialog 获取