use crate::models::settings::Settings;

#[tauri::command]
pub fn get_settings() -> Result<Settings, String> {
    todo!()
}

#[tauri::command]
pub fn save_settings(data: Settings) -> Result<Settings, String> {
    todo!()
}

#[tauri::command]
pub fn test_ai_connection(data: Settings) -> Result<bool, String> {
    todo!()
}