#![allow(unused_variables)]

pub mod commands;
pub mod models;
pub mod storage;
pub mod utils;

use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("你好, {}! 欢迎使用求职助手", name)
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::position::list_positions,
            commands::position::get_position,
            commands::position::create_position,
            commands::position::update_position,
            commands::position::delete_position,
            commands::position::archive_position,
            commands::application::list_applications,
            commands::application::get_application,
            commands::application::create_application,
            commands::application::update_application,
            commands::application::delete_application,
            commands::application::update_application_status,
            commands::profile::get_profile,
            commands::profile::save_profile,
            commands::profile::delete_profile,
            commands::settings::get_settings,
            commands::settings::save_settings,
            commands::settings::test_ai_connection,
            commands::backup::write_text_file,
            commands::backup::read_text_file,
            commands::backup::export_backup,
            commands::backup::import_backup,
        ])
        .setup(|app| {
            // Ensure data directories exist on startup
            let data_dir = app.path().app_data_dir().unwrap_or_else(|_| std::path::PathBuf::from("./data"));
            let dirs = ["profiles", "positions", "applications"];
            for dir in &dirs {
                let path = data_dir.join(dir);
                std::fs::create_dir_all(&path).ok();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}