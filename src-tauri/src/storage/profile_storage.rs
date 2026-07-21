use std::path::PathBuf;
use crate::models::profile::{Profile, SaveProfileInput};
use crate::storage::file_ops;
use crate::utils::error::AppError;
use crate::utils::frontmatter;
use crate::utils::id::generate_id;
use chrono::Local;

/// 获取个人档案文件路径
fn get_profile_path() -> PathBuf {
    crate::get_data_dir().join("profiles/profile.md")
}

/// Frontmatter 中间结构体
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct ProfileFrontmatter {
    id: String,
    created: String,
    updated: String,
    name: String,
    title: String,
    city: String,
    email: String,
    phone: String,
    expect_salary: String,
    years_of_experience: u32,
    skills: Vec<String>,
}

/// 获取个人档案
pub fn get_profile() -> Result<Option<Profile>, AppError> {
    let path = get_profile_path();
    if !path.exists() {
        return Ok(None);
    }

    let content = file_ops::read_file(&path)?;
    let (front_data, body): (ProfileFrontmatter, String) =
        frontmatter::parse_frontmatter(&content)?;

    // 解析正文各章节
    let body = body.trim();
    let mut work_experience = String::new();
    let mut projects = String::new();
    let mut education = String::new();

    let sections = split_into_sections(body);
    for (title, content) in &sections {
        match title.as_str() {
            "工作经历" => work_experience = content.clone(),
            "项目经历" => projects = content.clone(),
            "教育背景" => education = content.clone(),
            _ => {}
        }
    }

    Ok(Some(Profile {
        id: front_data.id,
        created: front_data.created,
        updated: front_data.updated,
        name: front_data.name,
        title: front_data.title,
        city: front_data.city,
        email: front_data.email,
        phone: front_data.phone,
        expect_salary: front_data.expect_salary,
        years_of_experience: front_data.years_of_experience,
        skills: front_data.skills,
        work_experience: if work_experience.is_empty() { None } else { Some(work_experience) },
        projects: if projects.is_empty() { None } else { Some(projects) },
        education: if education.is_empty() { None } else { Some(education) },
    }))
}

/// 将 Markdown 正文按 H2 标题分割成章节
fn split_into_sections(body: &str) -> Vec<(String, String)> {
    let mut sections = Vec::new();
    let mut current_title = String::new();
    let mut current_content = String::new();

    for line in body.lines() {
        if let Some(stripped) = line.strip_prefix("## ") {
            if !current_title.is_empty() {
                sections.push((current_title.clone(), current_content.trim().to_string()));
            }
            current_title = stripped.trim().to_string();
            current_content.clear();
        } else {
            if !current_content.is_empty() {
                current_content.push('\n');
            }
            current_content.push_str(line);
        }
    }
    if !current_title.is_empty() {
        sections.push((current_title, current_content.trim().to_string()));
    }

    sections
}

/// 保存个人档案（创建或更新）
pub fn save_profile(input: SaveProfileInput) -> Result<Profile, AppError> {
    let now = Local::now().format("%Y-%m-%d").to_string();
    let path = get_profile_path();

    // 检查是否已存在
    let (id, created) = match get_profile() {
        Ok(Some(existing)) => (existing.id, existing.created),
        Ok(None) => (generate_id("prof"), now.clone()),
        Err(_) => (generate_id("prof"), now.clone()),
    };

    let profile = Profile {
        id,
        created,
        updated: now,
        name: input.name,
        title: input.title,
        city: input.city,
        email: input.email,
        phone: input.phone,
        expect_salary: input.expect_salary,
        years_of_experience: input.years_of_experience,
        skills: input.skills,
        work_experience: input.work_experience,
        projects: input.projects,
        education: input.education,
    };

    let frontmatter_data = ProfileFrontmatter {
        id: profile.id.clone(),
        created: profile.created.clone(),
        updated: profile.updated.clone(),
        name: profile.name.clone(),
        title: profile.title.clone(),
        city: profile.city.clone(),
        email: profile.email.clone(),
        phone: profile.phone.clone(),
        expect_salary: profile.expect_salary.clone(),
        years_of_experience: profile.years_of_experience,
        skills: profile.skills.clone(),
    };

    let mut body_parts = Vec::new();
    if let Some(ref exp) = profile.work_experience {
        if !exp.is_empty() {
            body_parts.push(format!("## 工作经历\n\n{}", exp));
        }
    }
    if let Some(ref proj) = profile.projects {
        if !proj.is_empty() {
            body_parts.push(format!("## 项目经历\n\n{}", proj));
        }
    }
    if let Some(ref edu) = profile.education {
        if !edu.is_empty() {
            body_parts.push(format!("## 教育背景\n\n{}", edu));
        }
    }
    let body = body_parts.join("\n\n");

    let content = frontmatter::serialize_frontmatter(&frontmatter_data, &body)?;
    file_ops::write_file(&path, &content)?;

    Ok(profile)
}

/// 删除个人档案
pub fn delete_profile() -> Result<(), AppError> {
    let path = get_profile_path();
    file_ops::delete_file(&path)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_save_and_get_profile() {
        let input = SaveProfileInput {
            name: "张三".to_string(),
            title: "测试工程师".to_string(),
            city: "北京".to_string(),
            email: "zhangsan@example.com".to_string(),
            phone: "13800138000".to_string(),
            expect_salary: "15K-20K".to_string(),
            years_of_experience: 3,
            skills: vec!["功能测试".to_string(), "自动化测试".to_string()],
            work_experience: Some("3 年测试经验".to_string()),
            projects: Some("自动化测试框架搭建".to_string()),
            education: Some("本科 计算机科学".to_string()),
        };

        let profile = save_profile(input).unwrap();
        assert!(profile.id.starts_with("prof_"));

        let fetched = get_profile().unwrap().unwrap();
        assert_eq!(fetched.name, "张三");

        // 清理
        delete_profile().unwrap();
        assert!(get_profile().unwrap().is_none());
    }

    #[test]
    fn test_get_profile_not_exists() {
        // 确保 profile 不存在
        let _ = delete_profile();
        let result = get_profile().unwrap();
        assert!(result.is_none());
    }
}