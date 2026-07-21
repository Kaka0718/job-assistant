use crate::models::profile::Profile;

#[tauri::command]
pub fn get_profile() -> Result<Option<Profile>, String> {
    todo!()
}

#[tauri::command]
pub fn save_profile(data: Profile) -> Result<Profile, String> {
    todo!()
}

#[tauri::command]
pub fn delete_profile() -> Result<(), String> {
    todo!()
}