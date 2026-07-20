use crate::models::position::{
    CreatePositionInput, Position, UpdatePositionInput,
};
use crate::storage;

/// 列出所有岗位档案
#[tauri::command]
pub fn list_positions() -> Result<Vec<Position>, String> {
    storage::position_storage::list_positions().map_err(|e| e.to_string())
}

/// 按 ID 获取岗位档案
#[tauri::command]
pub fn get_position(id: String) -> Result<Option<Position>, String> {
    storage::position_storage::get_position(&id).map_err(|e| e.to_string())
}

/// 创建岗位档案
#[tauri::command]
pub fn create_position(data: CreatePositionInput) -> Result<Position, String> {
    storage::position_storage::create_position(data).map_err(|e| e.to_string())
}

/// 更新岗位档案
#[tauri::command]
pub fn update_position(id: String, data: UpdatePositionInput) -> Result<Position, String> {
    storage::position_storage::update_position(&id, data).map_err(|e| e.to_string())
}

/// 删除岗位档案
#[tauri::command]
pub fn delete_position(id: String) -> Result<(), String> {
    storage::position_storage::delete_position(&id).map_err(|e| e.to_string())
}

/// 归档岗位档案
#[tauri::command]
pub fn archive_position(id: String) -> Result<Position, String> {
    storage::position_storage::archive_position(&id).map_err(|e| e.to_string())
}