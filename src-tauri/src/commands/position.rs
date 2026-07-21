use crate::models::position::{Position, CreatePositionInput, UpdatePositionInput};

#[tauri::command]
pub fn list_positions() -> Result<Vec<Position>, String> {
    todo!()
}

#[tauri::command]
pub fn get_position(id: String) -> Result<Option<Position>, String> {
    todo!()
}

#[tauri::command]
pub fn create_position(data: CreatePositionInput) -> Result<Position, String> {
    todo!()
}

#[tauri::command]
pub fn update_position(id: String, data: UpdatePositionInput) -> Result<Position, String> {
    todo!()
}

#[tauri::command]
pub fn delete_position(id: String) -> Result<(), String> {
    todo!()
}

#[tauri::command]
pub fn archive_position(id: String) -> Result<Position, String> {
    todo!()
}