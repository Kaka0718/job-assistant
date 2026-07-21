use serde::{Deserialize, Serialize};

/// 个人档案
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Profile {
    pub id: String,
    pub created: String,
    pub updated: String,
    pub name: String,
    pub title: String,
    pub city: String,
    pub email: String,
    pub phone: String,
    pub expect_salary: String,
    pub years_of_experience: u32,
    pub skills: Vec<String>,
    /// Markdown 正文 — 工作经历
    pub work_experience: Option<String>,
    /// Markdown 正文 — 项目经历
    pub projects: Option<String>,
    /// Markdown 正文 — 教育背景
    pub education: Option<String>,
}

/// 保存个人档案输入
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveProfileInput {
    pub name: String,
    pub title: String,
    pub city: String,
    pub email: String,
    pub phone: String,
    pub expect_salary: String,
    pub years_of_experience: u32,
    pub skills: Vec<String>,
    pub work_experience: Option<String>,
    pub projects: Option<String>,
    pub education: Option<String>,
}