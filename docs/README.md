# 项目文档索引

> 按文档类型分类存放，开发 Agent 和测试 Agent 可直接按目录查找。

---

## 目录结构

```
docs/
├── README.md                       ← 本文档索引
├── agent-prompts/                  ← 🤖 开发 Agent 任务指令（PM 输出）
│   ├── MODULE_B_前端开发.md
│   ├── MODULE_B_后端开发.md
│   ├── MODULE_C_前端开发.md
│   └── MODULE_C_后端开发.md
│
├── sprint-tasks/                   ← 📋 开发任务文档（PM 输出）
│   ├── MODULE_A_基础设施搭建.md
│   ├── MODULE_B_AI打招呼生成.md
│   └── MODULE_C_岗位管理_投递看板.md
│
├── delivery-reports/               ← 📦 开发交付报告（Dev Agent 输出）
│   ├── MODULE_A_前端交付报告.md
│   ├── MODULE_A_后端交付报告.md
│   ├── MODULE_B_前端交付报告.md
│   └── MODULE_B_后端交付报告.md
│
├── test-reports/                   ← 🧪 QA 测试报告（QA Agent 输出）
│   ├── MODULE_A_基础设施搭建.md
│   ├── QA_TEST_REPORT_MODULE_B.md
│   └── PM_SPRINT2_ACCEPTANCE.md
│
└── pm-reports/                     ← ✅ PM 验收报告（PM Agent 输出）
    ├── MODULE_A_基础设施搭建.md
    ├── MODULE_A_QA质量门禁报告.md
    ├── MODULE_B_AI打招呼生成.md
    └── PM_SPRINT2_ACCEPTANCE.md
```

---

## 命名规范

```
MODULE_{模块字母}_{功能描述}.md
```

- **模块字母**：A → Z，按 Sprint 顺序递增
- **功能描述**：简短中文，概括该模块的核心内容
- **跨目录同名**：同一模块的三个目录文件名保持一致，方便查找

### 示例

| 文件名 | 所属目录 | 内容 |
|:-------|:---------|:-----|
| `MODULE_A_基础设施搭建.md` | `sprint-tasks/` | Sprint 1: 项目脚手架 + 路由 + 数据模型 + 组件库 |
| `MODULE_A_基础设施搭建.md` | `test-reports/` | Sprint 1: QA 集成测试报告 |
| `MODULE_A_基础设施搭建.md` | `pm-reports/` | Sprint 1: PM 二次验收报告 |
| `MODULE_B_AI打招呼生成.md` | `sprint-tasks/` | Sprint 2: AI 打招呼核心功能 |
| `MODULE_B_前端开发.md` | `agent-prompts/` | Sprint 2: 前端开发 Agent 任务指令 |
| `MODULE_B_后端开发.md` | `agent-prompts/` | Sprint 2: 后端开发 Agent 任务指令 |
| `MODULE_C_岗位管理_投递看板.md` | `sprint-tasks/` | Sprint 3: 岗位管理 + 投递看板 |
| `MODULE_C_前端开发.md` | `agent-prompts/` | Sprint 3: 前端开发 Agent 任务指令 |

---

## 开发 Agent 快速导航

| 你是什么角色？ | 读哪个目录？ | 说明 |
|:--------------|:------------|:-----|
| 🤖 **前端 Dev Agent** | `docs/agent-prompts/MODULE_C_前端开发.md` | 明确你的开发范围和输出规范 |
| 🤖 **后端 Dev Agent** | `docs/agent-prompts/MODULE_C_后端开发.md` | 明确你的开发范围和输出规范 |
| 🧪 **QA Agent** | `docs/sprint-tasks/` 对应模块 + 输出到 `docs/test-reports/` | 先读任务文档了解需求，再出测试报告 |
| ✅ **PM Agent** | `docs/sprint-tasks/` 对应模块 + 输出到 `docs/pm-reports/` | 先读任务文档对照需求，再出验收报告 |

---

## 相关文档（根目录）

- `ARCHITECTURE.md` — 完整项目架构（全局参考，所有 Agent 必读）
- `ENVIRONMENT.md` — 开发环境需求
- `CLAUDE.md` — 项目规范（AI 助手说明）