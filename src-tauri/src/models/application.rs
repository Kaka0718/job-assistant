use serde::{Deserialize, Serialize};

/// 投递状态
#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ApplicationStatus {
    Draft,
    #[default]
    Applied,
    Read,
    Chatting,
    Interview,
    Offer,
    Rejected,
    Archived,
}

impl std::fmt::Display for ApplicationStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ApplicationStatus::Draft => write!(f, "draft"),
            ApplicationStatus::Applied => write!(f, "applied"),
            ApplicationStatus::Read => write!(f, "read"),
            ApplicationStatus::Chatting => write!(f, "chatting"),
            ApplicationStatus::Interview => write!(f, "interview"),
            ApplicationStatus::Offer => write!(f, "offer"),
            ApplicationStatus::Rejected => write!(f, "rejected"),
            ApplicationStatus::Archived => write!(f, "archived"),
        }
    }
}

/// 投递记录
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Application {
    pub id: String,
    pub position_id: String,
    pub company: String,
    pub position_title: String,
    pub created: String,
    pub status: ApplicationStatus,
    pub match_score: Option<u8>,
    pub has_progress: bool,
    pub keywords: Vec<String>,
    /// JD 原文
    pub jd_content: Option<String>,
    /// 生成的打招呼文案
    pub greeting: Option<String>,
}

/// 创建投递记录输入
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateApplicationInput {
    pub position_id: String,
    pub company: String,
    pub position_title: String,
    pub status: Option<ApplicationStatus>,
    pub match_score: Option<u8>,
    pub keywords: Vec<String>,
    pub jd_content: Option<String>,
    pub greeting: Option<String>,
}

/// 更新投递记录输入
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateApplicationInput {
    pub status: Option<ApplicationStatus>,
    pub has_progress: Option<bool>,
    pub keywords: Option<Vec<String>>,
    pub greeting: Option<String>,
}

/// 投递记录筛选条件
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApplicationFilter {
    pub status: Option<ApplicationStatus>,
    pub position_id: Option<String>,
    pub company: Option<String>,
    pub date_from: Option<String>,
    pub date_to: Option<String>,
}