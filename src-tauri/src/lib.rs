pub mod commands;
pub mod models;
pub mod storage;
pub mod utils;

use std::path::PathBuf;
use std::sync::OnceLock;
use storage::file_ops;
use tauri::Manager;

/// 全局数据目录（由 Tauri setup 初始化，测试时使用默认路径）
static DATA_DIR: OnceLock<PathBuf> = OnceLock::new();

/// 设置数据目录（在 Tauri setup 中调用）
pub fn init_data_dir(path: PathBuf) {
    let _ = DATA_DIR.set(path);
}

/// 获取数据目录，未初始化时使用开发环境默认路径
pub fn get_data_dir() -> &'static PathBuf {
    DATA_DIR.get_or_init(|| PathBuf::from("../data"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // 使用 Tauri 标准的应用数据目录
            if let Ok(app_data) = app.path().app_data_dir() {
                init_data_dir(app_data.clone());
                // 确保子目录存在
                for dir in &["profiles", "positions", "applications"] {
                    let path = app_data.join(dir);
                    if let Err(e) = file_ops::ensure_dir(&path) {
                        eprintln!("Warning: Failed to create data dir {:?}: {}", path, e);
                    }
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::dashboard::get_dashboard_stats,
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