use std::path::Path;
use std::fs;

pub fn read_file(path: &Path) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| format!("读取文件失败: {}", e))
}

pub fn write_file(path: &Path, content: &str) -> Result<(), String> {
    fs::write(path, content).map_err(|e| format!("写入文件失败: {}", e))
}

pub fn list_files(dir: &Path) -> Result<Vec<std::path::PathBuf>, String> {
    let mut files = Vec::new();
    let entries = fs::read_dir(dir).map_err(|e| format!("读取目录失败: {}", e))?;
    for entry in entries {
        let entry = entry.map_err(|e| format!("读取目录项失败: {}", e))?;
        if entry.path().extension().is_some_and(|ext| ext == "md") {
            files.push(entry.path());
        }
    }
    Ok(files)
}

pub fn ensure_dir(path: &Path) -> Result<(), String> {
    fs::create_dir_all(path).map_err(|e| format!("创建目录失败: {}", e))
}

pub fn delete_file(path: &Path) -> Result<(), String> {
    fs::remove_file(path).map_err(|e| format!("删除文件失败: {}", e))
}