use std::fs;
use std::path::PathBuf;

use crate::models::application::ApplicationStatus;
use crate::storage;

/// 导出所有岗位档案为 CSV
#[tauri::command]
pub fn export_positions_csv(path: String) -> Result<(), String> {
    let positions = storage::position_storage::list_positions().map_err(|e| e.to_string())?;

    let headers = &[
        "title",
        "category",
        "status",
        "skills",
        "tags",
        "notes",
        "analysis",
        "createdAt",
        "updatedAt",
    ];

    let mut rows: Vec<Vec<String>> = Vec::with_capacity(positions.len());
    for pos in &positions {
        rows.push(vec![
            pos.title.clone(),
            pos.category.to_string(),
            pos.status.to_string(),
            pos.skills.join("; "),
            pos.tags.join("; "),
            pos.notes.clone().unwrap_or_default(),
            pos.analysis.clone().unwrap_or_default(),
            pos.created.clone(),
            pos.updated.clone(),
        ]);
    }

    write_csv_with_bom(&path, headers, &rows)
}

/// 导出所有投递记录为 CSV
#[tauri::command]
pub fn export_applications_csv(path: String) -> Result<(), String> {
    let applications =
        storage::application_storage::list_applications(None).map_err(|e| e.to_string())?;

    let headers = &[
        "positionTitle",
        "company",
        "status",
        "matchScore",
        "createdAt",
        "hasProgress",
        "keywords",
        "jdContent",
    ];

    let mut rows: Vec<Vec<String>> = Vec::with_capacity(applications.len());
    for app in &applications {
        rows.push(vec![
            app.position_title.clone(),
            app.company.clone(),
            app.status.to_string(),
            app.match_score
                .map(|s| s.to_string())
                .unwrap_or_default(),
            app.created.clone(),
            if app.has_progress { "是" } else { "否" }.to_string(),
            app.keywords.join("; "),
            app.jd_content.clone().unwrap_or_default(),
        ]);
    }

    write_csv_with_bom(&path, headers, &rows)
}

/// 导出仪表盘统计数据为 CSV
#[tauri::command]
pub fn export_dashboard_csv(path: String) -> Result<(), String> {
    let applications =
        storage::application_storage::list_applications(None).map_err(|e| e.to_string())?;

    // 按状态聚合统计
    let mut status_counts: std::collections::HashMap<String, u32> = std::collections::HashMap::new();
    let total = applications.len() as f64;

    for app in &applications {
        let status_str = app.status.to_string();
        *status_counts.entry(status_str).or_insert(0) += 1;
    }

    let headers = &["status", "count", "percentage"];

    // 按状态顺序输出
    let ordered_statuses = [
        ApplicationStatus::Draft,
        ApplicationStatus::Applied,
        ApplicationStatus::Read,
        ApplicationStatus::Chatting,
        ApplicationStatus::Interview,
        ApplicationStatus::Offer,
        ApplicationStatus::Rejected,
        ApplicationStatus::Archived,
    ];

    let mut rows: Vec<Vec<String>> = Vec::with_capacity(ordered_statuses.len() + 1);
    let mut total_count: u32 = 0;

    for status in &ordered_statuses {
        let key = status.to_string();
        let count = status_counts.get(&key).copied().unwrap_or(0);
        total_count += count;
        let percentage = if total > 0.0 {
            format!("{:.1}%", (count as f64 / total) * 100.0)
        } else {
            "0.0%".to_string()
        };
        rows.push(vec![status_name_cn(status), count.to_string(), percentage]);
    }

    // 合计行
    rows.push(vec![
        "合计".to_string(),
        total_count.to_string(),
        if total > 0.0 {
            "100.0%".to_string()
        } else {
            "0.0%".to_string()
        },
    ]);

    write_csv_with_bom(&path, headers, &rows)
}

/// 获取状态的中文名称
fn status_name_cn(status: &ApplicationStatus) -> String {
    match status {
        ApplicationStatus::Draft => "草稿".to_string(),
        ApplicationStatus::Applied => "已投递".to_string(),
        ApplicationStatus::Read => "已读".to_string(),
        ApplicationStatus::Chatting => "沟通中".to_string(),
        ApplicationStatus::Interview => "面试".to_string(),
        ApplicationStatus::Offer => "Offer".to_string(),
        ApplicationStatus::Rejected => "已拒绝".to_string(),
        ApplicationStatus::Archived => "已归档".to_string(),
    }
}

/// 写入 CSV 文件（含 UTF-8 BOM，自动转义特殊字符）
fn write_csv_with_bom(path: &str, headers: &[&str], rows: &[Vec<String>]) -> Result<(), String> {
    let mut csv_content = String::new();

    // UTF-8 BOM — 确保 Excel 正确识别中文编码
    csv_content.push('\u{FEFF}');

    // Header row
    csv_content.push_str(&headers.join(","));
    csv_content.push('\n');

    // Data rows
    for row in rows {
        let escaped: Vec<String> = row
            .iter()
            .map(|field| escape_csv_field(field))
            .collect();
        csv_content.push_str(&escaped.join(","));
        csv_content.push('\n');
    }

    // 确保父目录存在
    let path_buf = PathBuf::from(path);
    if let Some(parent) = path_buf.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("无法创建目录: {}", e))?;
    }

    fs::write(path, csv_content.as_bytes())
        .map_err(|e| format!("写入文件失败: {}", e))?;

    Ok(())
}

/// 转义 CSV 字段值
/// 如果字段包含逗号、双引号或换行符，用双引号包裹并转义内部双引号
fn escape_csv_field(field: &str) -> String {
    if field.contains(',') || field.contains('"') || field.contains('\n') || field.contains('\r') {
        format!("\"{}\"", field.replace('"', "\"\""))
    } else {
        field.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::application::CreateApplicationInput;
    use crate::models::position::{CreatePositionInput, PositionCategory};
    use std::fs;
    use std::path::PathBuf;

    /// 读取 CSV 文件并解析为行
    fn read_csv_lines(path: &PathBuf) -> Vec<String> {
        let content = fs::read_to_string(path).unwrap();
        // 去掉 BOM
        let content = if content.starts_with('\u{FEFF}') {
            content[3..].to_string()
        } else {
            content
        };
        content.lines().map(|l| l.to_string()).collect()
    }

    #[test]
    fn test_escape_csv_field() {
        assert_eq!(escape_csv_field("hello"), "hello");
        assert_eq!(escape_csv_field("hello, world"), "\"hello, world\"");
        assert_eq!(escape_csv_field("hello \"world\""), "\"hello \"\"world\"\"\"");
        assert_eq!(escape_csv_field("hello\nworld"), "\"hello\nworld\"");
    }

    #[test]
    fn test_write_csv_with_bom() {
        let temp_dir = PathBuf::from(std::env::temp_dir()).join("test_csv_export");
        let _ = fs::remove_dir_all(&temp_dir);
        fs::create_dir_all(&temp_dir).unwrap();

        let csv_path = temp_dir.join("test.csv");
        let headers = &["name", "age", "city"];
        let rows = vec![
            vec!["张三".to_string(), "28".to_string(), "北京".to_string()],
            vec!["李四".to_string(), "35".to_string(), "上海, 浦东".to_string()],
        ];

        write_csv_with_bom(csv_path.to_str().unwrap(), headers, &rows).unwrap();

        let lines = read_csv_lines(&csv_path);
        assert_eq!(lines.len(), 3, "应有 1 行表头 + 2 行数据");
        assert_eq!(lines[0], "name,age,city");
        assert!(lines[1].contains("张三"));
        assert!(lines[2].contains("\"上海, 浦东\""));

        let _ = fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn test_export_positions_csv() {
        // 创建测试数据
        let input = CreatePositionInput {
            title: "测试工程师".to_string(),
            category: PositionCategory::Testing,
            skills: vec!["功能测试".to_string(), "自动化测试".to_string()],
            tags: vec!["软件测试".to_string()],
            notes: Some("偏向自动化方向".to_string()),
            analysis: Some("3 年测试经验".to_string()),
            interview_questions: None,
        };
        let pos = storage::position_storage::create_position(input).unwrap();

        let temp_dir = PathBuf::from(std::env::temp_dir()).join("test_csv_export_positions");
        let _ = fs::remove_dir_all(&temp_dir);
        fs::create_dir_all(&temp_dir).unwrap();

        let csv_path = temp_dir.join("positions.csv");
        let result = export_positions_csv(csv_path.to_str().unwrap().to_string());
        assert!(result.is_ok(), "CSV 导出应成功: {:?}", result.err());

        let lines = read_csv_lines(&csv_path);
        assert!(lines.len() >= 2, "应有表头 + 至少 1 行数据");
        assert_eq!(lines[0], "title,category,status,skills,tags,notes,analysis,createdAt,updatedAt");
        // 不固定行号：list_positions 返回全量数据，刚创建的记录未必在第一行
        assert!(
            lines.iter().any(|l| l.contains("测试工程师")),
            "导出文件应包含新创建的岗位"
        );
        assert!(
            lines.iter().any(|l| l.contains("功能测试; 自动化测试")),
            "导出文件应包含 skills 拼接"
        );

        // 清理
        storage::position_storage::delete_position(&pos.id).unwrap();
        let _ = fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn test_export_applications_csv() {
        // 创建测试数据
        let input = CreateApplicationInput {
            position_id: "pos_001".to_string(),
            company: "字节跳动".to_string(),
            position_title: "测试工程师".to_string(),
            status: None,
            match_score: Some(85),
            keywords: vec!["自动化测试".to_string(), "性能测试".to_string()],
            jd_content: Some("招聘测试工程师...".to_string()),
            greeting: Some("您好...".to_string()),
        };
        let app = storage::application_storage::create_application(input).unwrap();

        let temp_dir = PathBuf::from(std::env::temp_dir()).join("test_csv_export_applications");
        let _ = fs::remove_dir_all(&temp_dir);
        fs::create_dir_all(&temp_dir).unwrap();

        let csv_path = temp_dir.join("applications.csv");
        let result = export_applications_csv(csv_path.to_str().unwrap().to_string());
        assert!(result.is_ok(), "CSV 导出应成功: {:?}", result.err());

        let lines = read_csv_lines(&csv_path);
        assert!(lines.len() >= 2, "应有表头 + 至少 1 行数据");
        assert_eq!(
            lines[0],
            "positionTitle,company,status,matchScore,createdAt,hasProgress,keywords,jdContent"
        );
        // 不固定行号：list_applications 返回全量数据，刚创建的记录未必在第一行
        assert!(
            lines.iter().any(|l| l.contains("测试工程师")),
            "导出文件应包含新创建的投递记录"
        );
        assert!(
            lines.iter().any(|l| l.contains("字节跳动")),
            "导出文件应包含公司名"
        );

        // 清理
        storage::application_storage::delete_application(&app.id).unwrap();
        let _ = fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn test_export_dashboard_csv() {
        // 创建测试数据
        let input = CreateApplicationInput {
            position_id: "pos_001".to_string(),
            company: "测试公司".to_string(),
            position_title: "测试岗位".to_string(),
            status: None,
            match_score: Some(85),
            keywords: vec![],
            jd_content: Some("JD".to_string()),
            greeting: Some("Hello".to_string()),
        };
        let app = storage::application_storage::create_application(input).unwrap();

        let temp_dir = PathBuf::from(std::env::temp_dir()).join("test_csv_export_dashboard");
        let _ = fs::remove_dir_all(&temp_dir);
        fs::create_dir_all(&temp_dir).unwrap();

        let csv_path = temp_dir.join("dashboard.csv");
        let result = export_dashboard_csv(csv_path.to_str().unwrap().to_string());
        assert!(result.is_ok(), "CSV 导出应成功: {:?}", result.err());

        let lines = read_csv_lines(&csv_path);
        assert!(lines.len() >= 2, "应有表头 + 至少 1 行数据");
        assert_eq!(lines[0], "status,count,percentage");
        // 应包含"已投递"状态行
        assert!(lines.iter().any(|l| l.contains("已投递")));
        // 最后一行应为合计
        assert!(lines.last().unwrap().contains("合计"));

        // 清理
        storage::application_storage::delete_application(&app.id).unwrap();
        let _ = fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn test_export_csv_empty_data() {
        let temp_dir = PathBuf::from(std::env::temp_dir()).join("test_csv_export_empty");
        let _ = fs::remove_dir_all(&temp_dir);
        fs::create_dir_all(&temp_dir).unwrap();

        // 空数据导出 — 仅表头
        let csv_path = temp_dir.join("empty.csv");
        let headers = &["col1", "col2"];
        let rows: Vec<Vec<String>> = vec![];
        write_csv_with_bom(csv_path.to_str().unwrap(), headers, &rows).unwrap();

        let lines = read_csv_lines(&csv_path);
        assert_eq!(lines.len(), 1, "空数据应只有表头");
        assert_eq!(lines[0], "col1,col2");

        let _ = fs::remove_dir_all(&temp_dir);
    }
}