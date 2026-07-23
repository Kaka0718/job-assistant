use crate::models::application::Application;
use crate::models::dashboard::DashboardStats;
use crate::storage;
use chrono::{Datelike, Local};

/// 获取仪表盘统计数据
#[tauri::command]
pub fn get_dashboard_stats() -> Result<DashboardStats, String> {
    let applications = storage::application_storage::list_applications(None)
        .map_err(|e| e.to_string())?;

    let today = Local::now().naive_local().date();
    let today_str = today.format("%Y-%m-%d").to_string();

    // 计算本周一的日期
    let week_start = {
        let weekday = today.weekday();
        let days_from_monday = weekday.num_days_from_monday();
        today - chrono::Duration::days(days_from_monday as i64)
    };
    let week_start_str = week_start.format("%Y-%m-%d").to_string();

    let mut today_count: u32 = 0;
    let mut week_count: u32 = 0;
    let mut total_match_score: f64 = 0.0;
    let mut match_score_count: u32 = 0;
    let mut progress_count: u32 = 0;

    for app in &applications {
        // 按日期筛选
        let app_date = &app.created;
        if app_date == &today_str {
            today_count += 1;
        }
        if app_date >= &week_start_str {
            week_count += 1;
        }

        // 匹配度统计
        if let Some(score) = app.match_score {
            total_match_score += score as f64;
            match_score_count += 1;
        }

        // 有进展统计
        if app.has_progress {
            progress_count += 1;
        }
    }

    let avg_match_score = if match_score_count > 0 {
        Some(total_match_score / match_score_count as f64)
    } else {
        None
    };

    // 最近 5 条（已按创建时间降序排列）
    let recent_applications: Vec<Application> = applications.into_iter().take(5).collect();

    Ok(DashboardStats {
        today_count,
        week_count,
        avg_match_score,
        progress_count,
        recent_applications,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::application::CreateApplicationInput;

    #[test]
    fn test_get_dashboard_stats() {
        // 创建一条测试投递记录
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

        let stats = get_dashboard_stats().unwrap();
        assert!(stats.today_count >= 1, "今日投递数应 >= 1");
        assert!(stats.week_count >= 1, "本周投递数应 >= 1");
        assert!(stats.avg_match_score.is_some(), "应有平均匹配度");
        // recent_applications 最多返回 5 条，不验证具体内容（避免与其他测试数据冲突）

        // 清理
        storage::application_storage::delete_application(&app.id).unwrap();
    }
}