# 求职助手 — 开发环境需求

> 本文档列出开发「求职助手」桌面应用所需的全部环境和工具。

---

## 一、最低系统要求

| 项目 | 要求 |
|------|------|
| 操作系统 | Windows 10 1809+ / macOS 12+ / Linux (X11/Wayland) |
| CPU | 双核 2.0GHz+ |
| 内存 | 8GB+（推荐 16GB） |
| 磁盘 | 5GB+ 可用空间 |
| 网络 | 需要连接 internet（首次安装依赖） |

---

## 二、核心依赖

### 1. Node.js

| 项目 | 值 |
|------|------|
| 版本 | **≥ 20.0**（推荐 22.x LTS） |
| 用途 | 运行前端开发环境、包管理、构建脚本 |
| 下载 | https://nodejs.org/ |
| 验证 | `node -v` 应输出 `v20.x.x` 或更高 |
| 附带 | npm ≥ 10.0（`npm -v` 验证） |

### 2. Rust 工具链

| 项目 | 值 |
|------|------|
| 版本 | **≥ 1.80** |
| 用途 | 编译 Tauri 桌面端后端 |
| 下载 | https://rustup.rs/ |
| 验证 | `rustc -V` 应输出 `rustc 1.80.x` 或更高 |
| 附带 | Cargo ≥ 1.80（`cargo -V` 验证） |

> **Windows 用户额外注意：**  
> Rust 需要 **Visual Studio Build Tools** 或 **Visual Studio 2022**（含 C++ 工作负载）。  
> 安装方式：`rustup-init.exe` 会自动提示安装，或手动安装 [VS Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022) 勾选"使用 C++ 的桌面开发"。

### 3. Git

| 项目 | 值 |
|------|------|
| 版本 | **≥ 2.30** |
| 用途 | 版本控制、代码管理 |
| 下载 | https://git-scm.com/ |
| 验证 | `git --version` 应输出 `git version 2.30.x` 或更高 |

---

## 三、编辑器

| 工具 | 推荐原因 |
|------|----------|
| **VS Code** | 最佳 TypeScript / React / Rust 开发体验 |
| 扩展推荐 | 见下方清单 |

### 推荐 VS Code 扩展

```
✅ 必装扩展：
  - Tailwind CSS IntelliSense          — Tailwind 类名补全
  - ESLint                             — 代码检查
  - Prettier - Code formatter          — 代码格式化
  - rust-analyzer                      — Rust 语言支持
  - Tauri                              — Tauri 项目支持

💡 推荐扩展：
  - GitHub Copilot / Codeium           — AI 辅助编码
  - Material Icon Theme                — 文件图标
  - Error Lens                         — 行内错误提示
  - GitLens                            — Git 历史可视化
  - Thunder Client                     — API 调试（测试 Deepseek 接口）
```

---

## 四、项目依赖（由包管理器自动安装）

### 前端依赖 (`package.json`)

| 包名 | 用途 |
|------|------|
| `react` / `react-dom` | 前端 UI 框架 |
| `typescript` | 类型安全 |
| `vite` | 构建工具 |
| `@tauri-apps/cli` | Tauri 命令行工具 |
| `@tauri-apps/api` | Tauri 前端 API |
| `@tauri-apps/plugin-dialog` | 对话框插件 |
| `tailwindcss` / `@tailwindcss/vite` | CSS 框架 |
| `lucide-react` | 图标库 |
| `zustand` | 状态管理 |
| `react-router-dom` | 路由 |
| `date-fns` | 日期处理 |
| `shadcn/ui` 组件 (button/card/input/textarea/select/dialog/badge/tabs/toast/skeleton) | 基础 UI 组件 |

### Rust 后端依赖 (`Cargo.toml`)

| crate 名 | 用途 |
|----------|------|
| `tauri` | 桌面框架核心 |
| `tauri-plugin-dialog` | 系统对话框 |
| `serde` / `serde_json` | 序列化/反序列化 |
| `serde_yaml` | YAML 解析（Markdown frontmatter） |
| `chrono` | 日期时间处理 |
| `uuid` | UUID 生成 |
| `tokio` | 异步运行时 |
| `thiserror` | 错误处理 |

---

## 五、硬件需求

| 环境 | 推荐配置 | 说明 |
|------|----------|------|
| 开发 | 16GB RAM, SSD, 4 核 CPU | 编译 Rust 较吃内存，首次 `cargo build` 可能需要 2-5 分钟 |
| 运行（用户） | 4GB RAM, 双核 CPU | 打包后应用仅 ~5MB，内存占用 ~200MB |

---

## 六、网络需求

| 时机 | 需要访问 | 用途 |
|------|----------|------|
| 首次开发 | `registry.npmjs.org` | 下载 npm 包 |
| 首次开发 | `static.crates.io` | 下载 Rust crate |
| 首次开发 | `github.com` | 下载 Tauri 模板 |
| 运行时 | `api.deepseek.com` | 调用 Deepseek AI API |
| 运行时（可选） | `api.openai.com` | 如果切换为 OpenAI 模型 |

---

## 七、环境检测脚本

项目根目录已包含 `scripts/check-env.sh`，运行即可检测环境是否就绪：

```bash
# Windows (Git Bash)
bash scripts/check-env.sh

# macOS / Linux
./scripts/check-env.sh
```

### 预期输出示例

```
=== 环境检测 ===
Node.js:    v22.5.0 ✅
npm:        10.8.0 ✅
Rust:       rustc 1.81.0 ✅
Cargo:      cargo 1.81.0 ✅
Git:        git version 2.45.0 ✅
Tauri CLI:  @tauri-apps/cli 2.0.0 ✅
VS Code:    Code 1.92.0 ✅
系统:       Windows 10 ✅
架构:       x86_64 ✅
```

---

## 八、快速安装指南

### Windows 一键安装

```bash
# 1. 安装 Rust
# 下载 https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe
# 运行并选择 "default installation"

# 2. 安装 Node.js
# 下载 https://nodejs.org/ 安装 LTS 版本

# 3. 安装 Git
# 下载 https://git-scm.com/download/win 安装

# 4. 安装 Tauri CLI
npm install -g @tauri-apps/cli@latest

# 5. 验证安装
node -v
npm -v
rustc -V
cargo -V
git --version
npx tauri --version
```

### macOS 一键安装

```bash
# 1. 安装 Homebrew（如未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安装依赖
brew install node rust git

# 3. 安装 Tauri CLI
npm install -g @tauri-apps/cli@latest

# 4. 验证
node -v && npm -v && rustc -V && cargo -V && git --version
```

---

## 九、常见问题

### Q: Rust 安装失败 / 安装慢？
- 国内用户可设置镜像源：`export RUSTUP_DIST_SERVER=https://mirrors.ustc.edu.cn/rust-static`
- 或使用 `--toolchain` 指定版本

### Q: npm install 报错？
- 清缓存：`npm cache clean --force`
- 删除 `node_modules` 和 `package-lock.json` 重试

### Q: `cargo build` 编译很慢？
- 首次编译确实慢（下载 + 编译所有 crate）
- 后续编译会利用增量缓存，速度快很多
- 确保使用 `cargo build`（debug 模式），`cargo build --release` 更慢

### Q: 需要安装 WebView2 吗？
- **Windows 10+ 已内置**，无需额外安装
- 如果使用 Windows 7，需要手动安装 [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

### Q: 可以用 pnpm 或 yarn 替代 npm 吗？
- 可以，推荐 pnpm（更快、省磁盘）
- 安装：`npm install -g pnpm`
- 使用：`pnpm install` 替代 `npm install`