use crate::models::settings::Settings;
use crate::storage;

/// 获取设置
#[tauri::command]
pub fn get_settings() -> Result<Settings, String> {
    storage::settings_storage::get_settings().map_err(|e| e.to_string())
}

/// 保存设置
#[tauri::command]
pub fn save_settings(data: Settings) -> Result<Settings, String> {
    storage::settings_storage::save_settings(&data).map_err(|e| e.to_string())
}

/// 测试 AI 连接
#[tauri::command]
pub fn test_ai_connection(data: Settings) -> Result<bool, String> {
    storage::settings_storage::test_ai_connection(&data).map_err(|e| e.to_string())
}