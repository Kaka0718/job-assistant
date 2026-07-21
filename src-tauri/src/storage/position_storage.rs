use std::path::PathBuf;
use crate::models::position::{
    CreatePositionInput, Position, PositionCategory, PositionStatus, UpdatePositionInput,
};
use crate::storage::file_ops;
use crate::utils::error::AppError;
use crate::utils::frontmatter;
use crate::utils::id::generate_id;
use chrono::Local;

/// 获取岗位档案存储目录
fn get_positions_dir() -> PathBuf {
    crate::get_data_dir().join("positions")
}

#[allow(dead_code)]
/// 从文件名中提取岗位 ID
fn position_id_from_filename(filename: &str) -> Option<String> {
    // 文件名格式: {id}_{title}.md
    if let Some(pos) = filename.find('_') {
        let id_part = &filename[..pos];
        if id_part.starts_with("pos") {
            return Some(id_part.to_string());
        }
    }
    None
}

/// 构建岗位档案文件路径
fn position_file_path(id: &str, title: &str) -> PathBuf {
    let filename = format!("{}_{}.md", id, title.replace(['/', '\\', ':', '*', '?', '"', '<', '>', '|'], "_"));
    get_positions_dir().join(filename)
}

/// 列出所有岗位档案
pub fn list_positions() -> Result<Vec<Position>, AppError> {
    let dir = get_positions_dir();
    file_ops::ensure_dir(&dir)?;
    let files = file_ops::list_files(&dir)?;

    let mut positions = Vec::new();
    for file_path in &files {
        if let Some(ext) = file_path.extension() {
            if ext == "md" {
                match get_position_from_file(file_path) {
                    Ok(Some(pos)) => positions.push(pos),
                    Ok(None) => continue,
                    Err(e) => {
                        eprintln!("Warning: Failed to parse position file {:?}: {}", file_path, e);
                        continue;
                    }
                }
            }
        }
    }
    Ok(positions)
}

/// 从文件中读取并解析岗位档案
fn get_position_from_file(path: &std::path::Path) -> Result<Option<Position>, AppError> {
    if !path.exists() {
        return Ok(None);
    }
    let content = file_ops::read_file(path)?;
    let (front_data, body): (PositionFrontmatter, String) =
        frontmatter::parse_frontmatter(&content)?;

    Ok(Some(Position {
        id: front_data.id,
        title: front_data.title,
        category: front_data.category,
        created: front_data.created,
        updated: front_data.updated,
        status: front_data.status,
        skills: front_data.skills,
        tags: front_data.tags,
        notes: front_data.notes,
        analysis: Some(body.clone()),
        interview_questions: Some(String::new()), // 通过正文分割处理
    }))
}

/// Frontmatter 中间结构体（用于序列化/反序列化）
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct PositionFrontmatter {
    id: String,
    title: String,
    category: PositionCategory,
    created: String,
    updated: String,
    status: PositionStatus,
    skills: Vec<String>,
    tags: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    notes: Option<String>,
}

/// 按 ID 获取岗位档案
pub fn get_position(id: &str) -> Result<Option<Position>, AppError> {
    let dir = get_positions_dir();
    file_ops::ensure_dir(&dir)?;
    let files = file_ops::list_files(&dir)?;

    for file_path in &files {
        if let Some(filename) = file_path.file_name().and_then(|n| n.to_str()) {
            if filename.starts_with(id) {
                return get_position_from_file(file_path);
            }
        }
    }
    Ok(None)
}

/// 创建岗位档案
pub fn create_position(input: CreatePositionInput) -> Result<Position, AppError> {
    let now = Local::now().format("%Y-%m-%d").to_string();
    let id = generate_id("pos");

    let position = Position {
        id: id.clone(),
        title: input.title.clone(),
        category: input.category,
        created: now.clone(),
        updated: now.clone(),
        status: PositionStatus::Active,
        skills: input.skills,
        tags: input.tags,
        notes: input.notes,
        analysis: input.analysis,
        interview_questions: input.interview_questions,
    };

    // 构建 frontmatter
    let frontmatter_data = PositionFrontmatter {
        id: position.id.clone(),
        title: position.title.clone(),
        category: position.category.clone(),
        created: position.created.clone(),
        updated: position.updated.clone(),
        status: position.status.clone(),
        skills: position.skills.clone(),
        tags: position.tags.clone(),
        notes: position.notes.clone(),
    };

    // 构建正文（analysis + interview_questions）
    let analysis_text = position.analysis.clone().unwrap_or_default();
    let interview_text = position.interview_questions.clone().unwrap_or_default();
    let body = if interview_text.is_empty() {
        analysis_text
    } else {
        format!(
            "{}\n\n## 常见面试问题\n\n{}",
            analysis_text, interview_text
        )
    };

    let content = frontmatter::serialize_frontmatter(&frontmatter_data, &body)?;
    let file_path = position_file_path(&position.id, &position.title);
    file_ops::write_file(&file_path, &content)?;

    Ok(position)
}

/// 更新岗位档案
pub fn update_position(id: &str, input: UpdatePositionInput) -> Result<Position, AppError> {
    let existing = get_position(id)?
        .ok_or_else(|| AppError::NotFound(format!("岗位档案不存在: {}", id)))?;

    let now = Local::now().format("%Y-%m-%d").to_string();

    let updated = Position {
        id: existing.id.clone(),
        title: input.title.unwrap_or(existing.title.clone()),
        category: input.category.unwrap_or(existing.category),
        created: existing.created,
        updated: now,
        status: input.status.unwrap_or(existing.status),
        skills: input.skills.unwrap_or(existing.skills),
        tags: input.tags.unwrap_or(existing.tags),
        notes: input.notes.or(existing.notes),
        analysis: input.analysis.or(existing.analysis),
        interview_questions: input
            .interview_questions
            .or(existing.interview_questions),
    };

    // 删除旧文件
    delete_position(id)?;

    // 写入新文件
    let frontmatter_data = PositionFrontmatter {
        id: updated.id.clone(),
        title: updated.title.clone(),
        category: updated.category.clone(),
        created: updated.created.clone(),
        updated: updated.updated.clone(),
        status: updated.status.clone(),
        skills: updated.skills.clone(),
        tags: updated.tags.clone(),
        notes: updated.notes.clone(),
    };

    let body = if updated.interview_questions.clone().unwrap_or_default().is_empty() {
        updated.analysis.clone().unwrap_or_default()
    } else {
        format!(
            "{}\n\n## 常见面试问题\n\n{}",
            updated.analysis.clone().unwrap_or_default(),
            updated.interview_questions.clone().unwrap_or_default()
        )
    };

    let content = frontmatter::serialize_frontmatter(&frontmatter_data, &body)?;
    let file_path = position_file_path(&updated.id, &updated.title);
    file_ops::write_file(&file_path, &content)?;

    Ok(updated)
}

/// 删除岗位档案
pub fn delete_position(id: &str) -> Result<(), AppError> {
    let dir = get_positions_dir();
    let files = file_ops::list_files(&dir)?;

    for file_path in &files {
        if let Some(filename) = file_path.file_name().and_then(|n| n.to_str()) {
            if filename.starts_with(id) {
                return file_ops::delete_file(file_path);
            }
        }
    }
    Ok(())
}

/// 归档岗位档案
pub fn archive_position(id: &str) -> Result<Position, AppError> {
    update_position(
        id,
        UpdatePositionInput {
            title: None,
            category: None,
            status: Some(PositionStatus::Archived),
            skills: None,
            tags: None,
            notes: None,
            analysis: None,
            interview_questions: None,
        },
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_and_get_position() {
        let input = CreatePositionInput {
            title: "测试工程师".to_string(),
            category: PositionCategory::Testing,
            skills: vec!["功能测试".to_string(), "自动化测试".to_string()],
            tags: vec!["软件测试".to_string()],
            notes: Some("偏向自动化方向".to_string()),
            analysis: Some("## 个人匹配分析\n\n3 年测试经验".to_string()),
            interview_questions: Some("如何设计测试用例？".to_string()),
        };

        let pos = create_position(input).unwrap();
        assert!(pos.id.starts_with("pos_"));

        let fetched = get_position(&pos.id).unwrap().unwrap();
        assert_eq!(fetched.title, "测试工程师");

        // 清理
        delete_position(&pos.id).unwrap();
    }

    #[test]
    fn test_archive_position() {
        let input = CreatePositionInput {
            title: "开发工程师".to_string(),
            category: PositionCategory::Development,
            skills: vec!["Rust".to_string()],
            tags: vec![],
            notes: None,
            analysis: None,
            interview_questions: None,
        };

        let pos = create_position(input).unwrap();
        let archived = archive_position(&pos.id).unwrap();
        assert_eq!(archived.status, PositionStatus::Archived);

        // 清理
        delete_position(&pos.id).unwrap();
    }
}