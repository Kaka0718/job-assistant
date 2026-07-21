use serde::{Deserialize, Serialize};

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
    pub work_experience: Option<String>,
    pub projects: Option<String>,
    pub education: Option<String>,
}