use crate::models::application::{Application, CreateApplicationInput, UpdateApplicationInput, ApplicationFilter, ApplicationStatus};

#[tauri::command]
pub fn list_applications(filter: Option<ApplicationFilter>) -> Result<Vec<Application>, String> {
    todo!()
}

#[tauri::command]
pub fn get_application(id: String) -> Result<Option<Application>, String> {
    todo!()
}

#[tauri::command]
pub fn create_application(data: CreateApplicationInput) -> Result<Application, String> {
    todo!()
}

#[tauri::command]
pub fn update_application(id: String, data: UpdateApplicationInput) -> Result<Application, String> {
    todo!()
}

#[tauri::command]
pub fn delete_application(id: String) -> Result<(), String> {
    todo!()
}

#[tauri::command]
pub fn update_application_status(id: String, status: ApplicationStatus) -> Result<Application, String> {
    todo!()
}