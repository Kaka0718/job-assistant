use crate::models::profile::{Profile, SaveProfileInput};
use crate::storage;

/// 获取个人档案
#[tauri::command]
pub fn get_profile() -> Result<Option<Profile>, String> {
    storage::profile_storage::get_profile().map_err(|e| e.to_string())
}

/// 保存个人档案
#[tauri::command]
pub fn save_profile(data: SaveProfileInput) -> Result<Profile, String> {
    storage::profile_storage::save_profile(data).map_err(|e| e.to_string())
}

/// 删除个人档案
#[tauri::command]
pub fn delete_profile() -> Result<(), String> {
    storage::profile_storage::delete_profile().map_err(|e| e.to_string())
}