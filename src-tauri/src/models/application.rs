use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Application {
    pub id: String,
    pub position_id: String,
    pub company: String,
    pub position_title: String,
    pub created: String,
    pub match_score: Option<u32>,
    pub has_progress: bool,
    pub keywords: Vec<String>,
    pub jd_content: Option<String>,
    pub greeting: Option<String>,
    pub status: ApplicationStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ApplicationStatus {
    Draft,
    Applied,
    Read,
    Chatting,
    Interview,
    Offer,
    Rejected,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApplicationFilter {
    pub status: Option<ApplicationStatus>,
    pub position_id: Option<String>,
    pub date_from: Option<String>,
    pub date_to: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateApplicationInput {
    pub position_id: String,
    pub company: String,
    pub position_title: String,
    pub match_score: Option<u32>,
    pub keywords: Vec<String>,
    pub jd_content: Option<String>,
    pub greeting: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateApplicationInput {
    pub has_progress: Option<bool>,
    pub status: Option<ApplicationStatus>,
    pub keywords: Option<Vec<String>>,
    pub greeting: Option<String>,
}