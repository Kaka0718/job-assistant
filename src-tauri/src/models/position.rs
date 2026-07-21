use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Position {
    pub id: String,
    pub title: String,
    pub category: PositionCategory,
    pub created: String,
    pub updated: String,
    pub status: PositionStatus,
    pub skills: Vec<String>,
    pub tags: Vec<String>,
    pub notes: Option<String>,
    pub analysis: Option<String>,
    pub interview_questions: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PositionCategory {
    #[serde(rename = "测试")]
    Test,
    #[serde(rename = "开发")]
    Dev,
    #[serde(rename = "运营")]
    Ops,
    #[serde(rename = "产品")]
    Product,
    #[serde(rename = "设计")]
    Design,
    #[serde(rename = "运维")]
    DevOps,
    #[serde(rename = "数据")]
    Data,
    #[serde(other)]
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PositionStatus {
    Active,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePositionInput {
    pub title: String,
    pub category: PositionCategory,
    pub skills: Vec<String>,
    pub tags: Vec<String>,
    pub notes: Option<String>,
    pub analysis: Option<String>,
    pub interview_questions: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
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