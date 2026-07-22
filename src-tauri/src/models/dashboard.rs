use crate::models::application::Application;
use serde::{Deserialize, Serialize};

/// 仪表盘统计数据
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardStats {
    /// 今日投递数
    pub today_count: u32,
    /// 本周投递数
    pub week_count: u32,
    /// 平均匹配度
    pub avg_match_score: Option<f64>,
    /// 有进展数量
    pub progress_count: u32,
    /// 最近 5 条投递记录
    pub recent_applications: Vec<Application>,
}