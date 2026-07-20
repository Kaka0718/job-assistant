use serde::{Deserialize, Serialize};

/// 个人档案
#[derive(Debug, Clone, Serialize, Deserialize)]
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
    pub work_experience: String,
    /// Markdown 正文 — 项目经历
    pub projects: String,
    /// Markdown 正文 — 教育背景
    pub education: String,
}

/// 保存个人档案输入
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SaveProfileInput {
    pub name: String,
    pub title: String,
    pub city: String,
    pub email: String,
    pub phone: String,
    pub expect_salary: String,
    pub years_of_experience: u32,
    pub skills: Vec<String>,
    pub work_experience: String,
    pub projects: String,
    pub education: String,
}