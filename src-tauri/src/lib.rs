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
        .invoke_handler(tauri::generate_handler![greet])
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