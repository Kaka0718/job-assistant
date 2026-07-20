use crate::models::application::{
    Application, ApplicationFilter, ApplicationStatus, CreateApplicationInput,
    UpdateApplicationInput,
};
use crate::storage;

/// 列出投递记录（支持筛选）
#[tauri::command]
pub fn list_applications(filter: Option<ApplicationFilter>) -> Result<Vec<Application>, String> {
    storage::application_storage::list_applications(filter).map_err(|e| e.to_string())
}

/// 按 ID 获取投递记录
#[tauri::command]
pub fn get_application(id: String) -> Result<Option<Application>, String> {
    storage::application_storage::get_application(&id).map_err(|e| e.to_string())
}

/// 创建投递记录
#[tauri::command]
pub fn create_application(data: CreateApplicationInput) -> Result<Application, String> {
    storage::application_storage::create_application(data).map_err(|e| e.to_string())
}

/// 更新投递记录
#[tauri::command]
pub fn update_application(id: String, data: UpdateApplicationInput) -> Result<Application, String> {
    storage::application_storage::update_application(&id, data).map_err(|e| e.to_string())
}

/// 删除投递记录
#[tauri::command]
pub fn delete_application(id: String) -> Result<(), String> {
    storage::application_storage::delete_application(&id).map_err(|e| e.to_string())
}

/// 更新投递状态
#[tauri::command]
pub fn update_status(id: String, status: ApplicationStatus) -> Result<Application, String> {
    storage::application_storage::update_application_status(&id, status)
        .map_err(|e| e.to_string())
}