pub mod commands;
pub mod models;
pub mod storage;
pub mod utils;

use std::path::PathBuf;
use storage::file_ops;

/// 应用数据目录路径
/// 在 Tauri 中通过 app_data_dir 获取，开发时使用项目根目录下的 data/
pub fn get_data_dir() -> PathBuf {
    PathBuf::from("../data")
}

/// 初始化数据目录
fn init_data_dirs() {
    let base = get_data_dir();
    let dirs = ["profiles", "positions", "applications"];
    for dir in &dirs {
        let path = base.join(dir);
        if let Err(e) = file_ops::ensure_dir(&path) {
            eprintln!("Warning: Failed to create data dir {:?}: {}", path, e);
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    init_data_dirs();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
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
            commands::application::update_status,
            commands::profile::get_profile,
            commands::profile::save_profile,
            commands::profile::delete_profile,
            commands::settings::get_settings,
            commands::settings::save_settings,
            commands::settings::test_ai_connection,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}