use std::path::PathBuf;
use crate::models::application::{
    Application, ApplicationFilter, ApplicationStatus, CreateApplicationInput,
    UpdateApplicationInput,
};
use crate::storage::file_ops;
use crate::utils::error::AppError;
use crate::utils::frontmatter;
use crate::utils::id::generate_id;
use chrono::Local;

/// 获取投递记录存储目录
fn get_applications_dir() -> PathBuf {
    crate::get_data_dir().join("applications")
}

/// 文件名格式: {日期}_{公司名}_{岗位}.md
fn application_file_path(
    date: &str,
    company: &str,
    position_title: &str,
    id: &str,
) -> PathBuf {
    let safe_company = company.replace(['/', '\\', ':', '*', '?', '"', '<', '>', '|'], "_");
    let safe_title = position_title
        .replace(['/', '\\', ':', '*', '?', '"', '<', '>', '|'], "_");
    let filename = format!("{}_{}_{}_{}.md", date, safe_company, safe_title, id);
    get_applications_dir().join(filename)
}

#[allow(dead_code)]
/// 从文件路径解析投递记录 ID
fn application_id_from_filename(filename: &str) -> Option<String> {
    // 格式: {date}_{company}_{title}_{id}.md
    let without_ext = filename.strip_suffix(".md")?;
    let parts: Vec<&str> = without_ext.split('_').collect();
    if parts.len() >= 4 {
        Some(parts.last().unwrap().to_string())
    } else {
        None
    }
}

/// Frontmatter 中间结构体
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct ApplicationFrontmatter {
    id: String,
    position_id: String,
    company: String,
    position_title: String,
    created: String,
    #[serde(default)]
    status: ApplicationStatus,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    match_score: Option<u8>,
    has_progress: bool,
    keywords: Vec<String>,
}

/// 从文件读取并解析投递记录
fn get_application_from_file(path: &std::path::Path) -> Result<Option<Application>, AppError> {
    if !path.exists() {
        return Ok(None);
    }
    let content = file_ops::read_file(path)?;
    let (front_data, body): (ApplicationFrontmatter, String) =
        frontmatter::parse_frontmatter(&content)?;

    // 正文格式: ## JD 原文\n\n{jd}\n\n## 生成的打招呼\n\n{greeting}
    let mut jd_content = String::new();
    let mut greeting = String::new();

    let body = body.trim();
    let jd_header = "## JD 原文";
    let greeting_header = "## 生成的打招呼";
    if let Some(jd_pos) = body.find(jd_header) {
        let after_jd = &body[jd_pos + jd_header.len()..];
        if let Some(greeting_pos) = after_jd.find(greeting_header) {
            jd_content = after_jd[..greeting_pos].trim().to_string();
            greeting = after_jd[greeting_pos + greeting_header.len()..].trim().to_string();
        } else {
            jd_content = after_jd.trim().to_string();
        }
    }

    Ok(Some(Application {
        id: front_data.id,
        position_id: front_data.position_id,
        company: front_data.company,
        position_title: front_data.position_title,
        created: front_data.created,
        status: front_data.status,
        match_score: front_data.match_score,
        has_progress: front_data.has_progress,
        keywords: front_data.keywords,
        jd_content: if jd_content.is_empty() { None } else { Some(jd_content) },
        greeting: if greeting.is_empty() { None } else { Some(greeting) },
    }))
}

/// 列出投递记录（支持筛选）
pub fn list_applications(filter: Option<ApplicationFilter>) -> Result<Vec<Application>, AppError> {
    let dir = get_applications_dir();
    file_ops::ensure_dir(&dir)?;
    let files = file_ops::list_files(&dir)?;

    let mut applications = Vec::new();
    for file_path in &files {
        if let Some(ext) = file_path.extension() {
            if ext == "md" {
                match get_application_from_file(file_path) {
                    Ok(Some(app)) => {
                        // 应用筛选条件
                        if let Some(ref filter) = filter {
                            if !matches_filter(&app, filter) {
                                continue;
                            }
                        }
                        applications.push(app);
                    }
                    Ok(None) => continue,
                    Err(e) => {
                        eprintln!(
                            "Warning: Failed to parse application file {:?}: {}",
                            file_path, e
                        );
                        continue;
                    }
                }
            }
        }
    }

    // 按创建时间降序排列
    applications.sort_by(|a, b| b.created.cmp(&a.created));
    Ok(applications)
}

/// 检查投递记录是否匹配筛选条件
fn matches_filter(application: &Application, filter: &ApplicationFilter) -> bool {
    if let Some(ref status) = filter.status {
        if application.status != *status {
            return false;
        }
    }
    if let Some(ref position_id) = filter.position_id {
        if application.position_id != *position_id {
            return false;
        }
    }
    if let Some(ref company) = filter.company {
        if application.company != *company {
            return false;
        }
    }
    if let Some(ref date_from) = filter.date_from {
        if application.created.as_str() < date_from.as_str() {
            return false;
        }
    }
    if let Some(ref date_to) = filter.date_to {
        if application.created.as_str() > date_to.as_str() {
            return false;
        }
    }
    true
}

/// 按 ID 获取投递记录
pub fn get_application(id: &str) -> Result<Option<Application>, AppError> {
    let dir = get_applications_dir();
    file_ops::ensure_dir(&dir)?;
    let files = file_ops::list_files(&dir)?;

    for file_path in &files {
        if let Some(filename) = file_path.file_name().and_then(|n| n.to_str()) {
            if filename.contains(id) {
                return get_application_from_file(file_path);
            }
        }
    }
    Ok(None)
}

/// 创建投递记录
pub fn create_application(input: CreateApplicationInput) -> Result<Application, AppError> {
    let now = Local::now().format("%Y-%m-%d").to_string();
    let id = generate_id("app");

    let application = Application {
        id: id.clone(),
        position_id: input.position_id,
        company: input.company.clone(),
        position_title: input.position_title.clone(),
        created: now.clone(),
        status: input.status.unwrap_or(ApplicationStatus::Applied),
        match_score: input.match_score,
        has_progress: false,
        keywords: input.keywords,
        jd_content: input.jd_content,
        greeting: input.greeting,
    };

    let frontmatter_data = ApplicationFrontmatter {
        id: application.id.clone(),
        position_id: application.position_id.clone(),
        company: application.company.clone(),
        position_title: application.position_title.clone(),
        created: application.created.clone(),
        status: application.status.clone(),
        match_score: application.match_score,
        has_progress: application.has_progress,
        keywords: application.keywords.clone(),
    };

    let body = format!(
        "## JD 原文\n\n{}\n\n## 生成的打招呼\n\n{}",
        application.jd_content.clone().unwrap_or_default(),
        application.greeting.clone().unwrap_or_default()
    );

    let content = frontmatter::serialize_frontmatter(&frontmatter_data, &body)?;
    let file_path = application_file_path(&now, &application.company, &application.position_title, &application.id);
    file_ops::write_file(&file_path, &content)?;

    Ok(application)
}

/// 更新投递记录
pub fn update_application(id: &str, input: UpdateApplicationInput) -> Result<Application, AppError> {
    let existing = get_application(id)?
        .ok_or_else(|| AppError::NotFound(format!("投递记录不存在: {}", id)))?;

    // 更新字段
    let updated = Application {
        status: input.status.unwrap_or(existing.status),
        has_progress: input.has_progress.unwrap_or(existing.has_progress),
        keywords: input.keywords.unwrap_or(existing.keywords),
        greeting: input.greeting.or(existing.greeting),
        ..existing
    };

    // 删除旧文件
    delete_application(id)?;

    // 写入新文件
    let frontmatter_data = ApplicationFrontmatter {
        id: updated.id.clone(),
        position_id: updated.position_id.clone(),
        company: updated.company.clone(),
        position_title: updated.position_title.clone(),
        created: updated.created.clone(),
        status: updated.status.clone(),
        match_score: updated.match_score,
        has_progress: updated.has_progress,
        keywords: updated.keywords.clone(),
    };

    let body = format!(
        "## JD 原文\n\n{}\n\n## 生成的打招呼\n\n{}",
        updated.jd_content.clone().unwrap_or_default(),
        updated.greeting.clone().unwrap_or_default()
    );

    let content = frontmatter::serialize_frontmatter(&frontmatter_data, &body)?;
    let file_path = application_file_path(
        &updated.created,
        &updated.company,
        &updated.position_title,
        &updated.id,
    );
    file_ops::write_file(&file_path, &content)?;

    Ok(updated)
}

/// 更新投递状态
pub fn update_application_status(id: &str, status: ApplicationStatus) -> Result<Application, AppError> {
    let existing = get_application(id)?
        .ok_or_else(|| AppError::NotFound(format!("投递记录不存在: {}", id)))?;

    let updated = Application {
        status,
        ..existing
    };

    // 删除旧文件
    delete_application(id)?;

    // 写入新文件
    let frontmatter_data = ApplicationFrontmatter {
        id: updated.id.clone(),
        position_id: updated.position_id.clone(),
        company: updated.company.clone(),
        position_title: updated.position_title.clone(),
        created: updated.created.clone(),
        status: updated.status.clone(),
        match_score: updated.match_score,
        has_progress: updated.has_progress,
        keywords: updated.keywords.clone(),
    };

    let body = format!(
        "## JD 原文\n\n{}\n\n## 生成的打招呼\n\n{}",
        updated.jd_content.clone().unwrap_or_default(),
        updated.greeting.clone().unwrap_or_default()
    );

    let content = frontmatter::serialize_frontmatter(&frontmatter_data, &body)?;
    let file_path = application_file_path(
        &updated.created,
        &updated.company,
        &updated.position_title,
        &updated.id,
    );
    file_ops::write_file(&file_path, &content)?;

    Ok(updated)
}

/// 删除投递记录
pub fn delete_application(id: &str) -> Result<(), AppError> {
    let dir = get_applications_dir();
    let files = file_ops::list_files(&dir)?;

    for file_path in &files {
        if let Some(filename) = file_path.file_name().and_then(|n| n.to_str()) {
            if filename.contains(id) {
                return file_ops::delete_file(file_path);
            }
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_and_list_application() {
        let input = CreateApplicationInput {
            position_id: "pos_001".to_string(),
            company: "字节跳动".to_string(),
            position_title: "测试工程师".to_string(),
            status: None,
            match_score: Some(85),
            keywords: vec!["自动化测试".to_string(), "性能测试".to_string()],
            jd_content: Some("招聘测试工程师...".to_string()),
            greeting: Some("您好，我有3年测试经验...".to_string()),
        };

        let app = create_application(input).unwrap();
        assert!(app.id.starts_with("app_"));
        assert_eq!(app.status, ApplicationStatus::Applied);

        let apps = list_applications(None).unwrap();
        assert!(!apps.is_empty());

        // 清理
        delete_application(&app.id).unwrap();
    }

    #[test]
    fn test_filter_by_company() {
        let input = CreateApplicationInput {
            position_id: "pos_001".to_string(),
            company: "腾讯".to_string(),
            position_title: "后端开发".to_string(),
            status: None,
            match_score: Some(90),
            keywords: vec![],
            jd_content: Some("JD content".to_string()),
            greeting: Some("Greeting".to_string()),
        };

        let app = create_application(input).unwrap();

        let filter = ApplicationFilter {
            status: None,
            position_id: None,
            company: Some("腾讯".to_string()),
            date_from: None,
            date_to: None,
        };
        let filtered = list_applications(Some(filter)).unwrap();
        assert!(filtered.iter().any(|a| a.id == app.id));

        // 清理
        delete_application(&app.id).unwrap();
    }
}