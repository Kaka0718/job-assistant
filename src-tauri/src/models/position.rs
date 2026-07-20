use serde::{Deserialize, Serialize};

/// 岗位分类
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum PositionCategory {
    #[serde(rename = "测试")]
    Testing,
    #[serde(rename = "开发")]
    Development,
    #[serde(rename = "运营")]
    Operations,
    #[serde(rename = "产品")]
    Product,
    #[serde(rename = "设计")]
    Design,
    #[serde(rename = "运维")]
    DevOps,
    #[serde(rename = "数据")]
    Data,
    #[serde(rename = "其他")]
    Other,
}

impl std::fmt::Display for PositionCategory {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PositionCategory::Testing => write!(f, "测试"),
            PositionCategory::Development => write!(f, "开发"),
            PositionCategory::Operations => write!(f, "运营"),
            PositionCategory::Product => write!(f, "产品"),
            PositionCategory::Design => write!(f, "设计"),
            PositionCategory::DevOps => write!(f, "运维"),
            PositionCategory::Data => write!(f, "数据"),
            PositionCategory::Other => write!(f, "其他"),
        }
    }
}

/// 岗位状态
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum PositionStatus {
    Active,
    Archived,
}

impl std::fmt::Display for PositionStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PositionStatus::Active => write!(f, "active"),
            PositionStatus::Archived => write!(f, "archived"),
        }
    }
}

/// 岗位档案
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub id: String,
    pub title: String,
    pub category: PositionCategory,
    pub created: String,
    pub updated: String,
    pub status: PositionStatus,
    pub skills: Vec<String>,
    pub tags: Vec<String>,
    pub notes: String,
    /// Markdown 正文 — 个人匹配分析
    pub analysis: String,
    /// Markdown 正文 — 常见面试问题
    pub interview_questions: String,
}

/// 创建岗位档案输入
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePositionInput {
    pub title: String,
    pub category: PositionCategory,
    pub skills: Vec<String>,
    pub tags: Vec<String>,
    pub notes: String,
    pub analysis: String,
    pub interview_questions: String,
}

/// 更新岗位档案输入
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdatePositionInput {
    pub title: Option<String>,
    pub category: Option<PositionCategory>,
    pub status: Option<PositionStatus>,
    pub skills: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
    pub notes: Option<String>,
    pub analysis: Option<String>,
    pub interview_questions: Option<String>,
}