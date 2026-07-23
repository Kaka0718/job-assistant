use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use zip::read::ZipArchive;
use zip::write::FileOptions;
use zip::CompressionMethod;
use chrono::Local;

/// 导出备份 - 将 data/ 目录打包为 zip 文件
#[tauri::command]
pub fn export_backup(path: String) -> Result<(), String> {
    let data_dir = crate::get_data_dir();
    let backup_path = PathBuf::from(&path);

    let file = File::create(&backup_path)
        .map_err(|e| format!("无法创建备份文件: {}", e))?;
    let mut zip = zip::ZipWriter::new(file);
    let options: zip::write::FileOptions<'_, ()> = FileOptions::default()
        .compression_method(CompressionMethod::Deflated)
        .unix_permissions(0o644);

    // 收集 data/ 目录下所有文件
    let files = collect_files(data_dir.as_path())?;

    for (relative_path, content) in &files {
        // zip 中统一使用 / 作为路径分隔符
        let zip_path = relative_path.replace('\\', "/");
        zip.start_file(&zip_path, options)
            .map_err(|e| format!("无法写入 zip 条目: {}", e))?;
        zip.write_all(content)
            .map_err(|e| format!("无法写入文件内容: {}", e))?;
    }

    zip.finish()
        .map_err(|e| format!("无法完成备份: {}", e))?;

    Ok(())
}

/// 导入备份 - 从 zip 文件恢复 data/ 目录
/// 解压前自动备份当前数据，失败时自动回滚
#[tauri::command]
pub fn import_backup(path: String) -> Result<(), String> {
    let data_dir = crate::get_data_dir().clone();
    let backup_path = PathBuf::from(&path);

    // 1. 验证 zip 文件
    if !backup_path.exists() {
        return Err("备份文件不存在".to_string());
    }

    let file = File::open(&backup_path)
        .map_err(|e| format!("无法打开备份文件: {}", e))?;
    let mut archive = ZipArchive::new(file)
        .map_err(|e| format!("无效的 zip 文件: {}", e))?;

    if archive.is_empty() {
        return Err("备份文件为空".to_string());
    }

    // 2. 创建临时目录用于备份和恢复
    let timestamp = Local::now().format("%Y%m%d_%H%M%S").to_string();
    let parent = data_dir.parent().unwrap_or(Path::new("."));
    let backup_dir = parent.join(format!("data_backup_{}", timestamp));
    let temp_dir = parent.join(format!("data_restore_{}", timestamp));

    // 备份当前数据到临时目录
    let data_exists = data_dir.exists();
    if data_exists {
        copy_dir_all(&data_dir, &backup_dir)
            .map_err(|e| format!("备份当前数据失败: {}", e))?;
    }

    // 3. 执行恢复，失败时回滚
    let result = restore_from_archive(&mut archive, &data_dir, &temp_dir, data_exists);

    // 4. 清理临时目录
    let _ = fs::remove_dir_all(&temp_dir);

    match result {
        Ok(()) => {
            // 成功：删除备份目录
            let _ = fs::remove_dir_all(&backup_dir);
            Ok(())
        }
        Err(e) => {
            // 失败：从备份目录恢复
            eprintln!("恢复失败，正在回滚: {}", e);
            if data_exists {
                let _ = clear_dir_contents(&data_dir);
                let _ = copy_dir_all(&backup_dir, &data_dir);
            }
            let _ = fs::remove_dir_all(&backup_dir);
            Err(format!("恢复失败: {}", e))
        }
    }
}

/// 从 zip 归档恢复数据到目标目录
fn restore_from_archive(
    archive: &mut ZipArchive<File>,
    data_dir: &Path,
    temp_dir: &Path,
    data_exists: bool,
) -> Result<(), String> {
    // 解压到临时目录
    fs::create_dir_all(temp_dir)
        .map_err(|e| format!("无法创建临时目录: {}", e))?;

    for i in 0..archive.len() {
        let mut entry = archive.by_index(i)
            .map_err(|e| format!("无法读取 zip 条目: {}", e))?;
        let name = entry.name().to_string();

        // 跳过目录条目
        if name.ends_with('/') {
            continue;
        }

        // 将 zip 路径转换为 OS 本地路径
        let local_path = name.replace('/', "\\");
        let target_path = temp_dir.join(&local_path);

        // 确保父目录存在
        if let Some(parent) = target_path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("无法创建目录: {}", e))?;
        }

        // 写入文件
        let mut out = File::create(&target_path)
            .map_err(|e| format!("无法创建文件: {}", e))?;
        let mut content = Vec::new();
        entry.read_to_end(&mut content)
            .map_err(|e| format!("无法读取 zip 内容: {}", e))?;
        out.write_all(&content)
            .map_err(|e| format!("无法写入文件: {}", e))?;
    }

    // 清空 data/ 目录（如果存在）
    if data_exists {
        clear_dir_contents(data_dir)?;
    } else {
        fs::create_dir_all(data_dir)
            .map_err(|e| format!("无法创建数据目录: {}", e))?;
    }

    // 从临时目录复制到 data/ 目录
    copy_dir_contents(temp_dir, data_dir)?;

    Ok(())
}

/// 递归收集目录下所有文件及其相对路径和内容
fn collect_files(dir: &Path) -> Result<Vec<(String, Vec<u8>)>, String> {
    let mut files = Vec::new();
    if !dir.exists() {
        return Ok(files);
    }
    collect_files_recursive(dir, dir, &mut files)?;
    Ok(files)
}

fn collect_files_recursive(
    base: &Path,
    current: &Path,
    files: &mut Vec<(String, Vec<u8>)>,
) -> Result<(), String> {
    let entries = fs::read_dir(current)
        .map_err(|e| format!("无法读取目录: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("无法读取目录条目: {}", e))?;
        let path = entry.path();

        if path.is_file() {
            let relative = path.strip_prefix(base)
                .map_err(|e| format!("路径错误: {}", e))?;
            let relative_str = relative.to_str()
                .ok_or("路径包含非 UTF-8 字符")?
                .to_string();
            let content = fs::read(&path)
                .map_err(|e| format!("无法读取文件: {}", e))?;
            files.push((relative_str, content));
        } else if path.is_dir() {
            collect_files_recursive(base, &path, files)?;
        }
    }

    Ok(())
}

/// 递归复制目录
fn copy_dir_all(src: &Path, dst: &Path) -> Result<(), String> {
    fs::create_dir_all(dst)
        .map_err(|e| format!("无法创建目录: {}", e))?;

    let entries = fs::read_dir(src)
        .map_err(|e| format!("无法读取目录: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("无法读取目录条目: {}", e))?;
        let path = entry.path();
        let dest_path = dst.join(entry.file_name());

        if path.is_file() {
            fs::copy(&path, &dest_path)
                .map_err(|e| format!("无法复制文件: {}", e))?;
        } else if path.is_dir() {
            copy_dir_all(&path, &dest_path)?;
        }
    }

    Ok(())
}

/// 复制目录内容（不包含目录本身）
fn copy_dir_contents(src: &Path, dst: &Path) -> Result<(), String> {
    fs::create_dir_all(dst)
        .map_err(|e| format!("无法创建目录: {}", e))?;

    let entries = fs::read_dir(src)
        .map_err(|e| format!("无法读取目录: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("无法读取目录条目: {}", e))?;
        let path = entry.path();
        let file_name = entry.file_name();
        let dest_path = dst.join(&file_name);

        if path.is_file() {
            fs::copy(&path, &dest_path)
                .map_err(|e| format!("无法复制文件: {}", e))?;
        } else if path.is_dir() {
            copy_dir_all(&path, &dest_path)?;
        }
    }

    Ok(())
}

/// 清空目录内容（保留目录本身）
fn clear_dir_contents(dir: &Path) -> Result<(), String> {
    if !dir.exists() {
        return Ok(());
    }

    let entries = fs::read_dir(dir)
        .map_err(|e| format!("无法读取目录: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("无法读取目录条目: {}", e))?;
        let path = entry.path();

        if path.is_file() {
            fs::remove_file(&path)
                .map_err(|e| format!("无法删除文件: {}", e))?;
        } else if path.is_dir() {
            fs::remove_dir_all(&path)
                .map_err(|e| format!("无法删除目录: {}", e))?;
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    /// 创建测试数据到指定目录
    fn setup_test_data(data_dir: &Path) {
        fs::create_dir_all(data_dir.join("profiles")).unwrap();
        fs::create_dir_all(data_dir.join("positions")).unwrap();
        fs::create_dir_all(data_dir.join("applications")).unwrap();

        fs::write(data_dir.join("settings.json"), r#"{"app":{"theme":"system"}}"#).unwrap();
        fs::write(
            data_dir.join("profiles").join("profile.md"),
            "---\nname: 测试\n---\n## 简历",
        )
        .unwrap();
        fs::write(
            data_dir.join("positions").join("测试工程师.md"),
            "---\ntitle: 测试工程师\n---\n## 匹配分析",
        )
        .unwrap();
        fs::write(
            data_dir.join("applications").join("2026-07-23_测试.md"),
            "---\ncompany: 测试\n---\n## JD",
        )
        .unwrap();
    }

    /// 从 zip 文件中提取所有条目到指定目录
    fn extract_zip(zip_path: &Path, output_dir: &Path) -> Result<(), String> {
        let file = File::open(zip_path).map_err(|e| format!("无法打开文件: {}", e))?;
        let mut archive = ZipArchive::new(file).map_err(|e| format!("无效的 zip 文件: {}", e))?;

        for i in 0..archive.len() {
            let mut entry = archive.by_index(i).map_err(|e| format!("读取条目失败: {}", e))?;
            let name = entry.name().to_string();
            if name.ends_with('/') {
                continue;
            }
            let local_path = name.replace('/', "\\");
            let target_path = output_dir.join(&local_path);
            if let Some(parent) = target_path.parent() {
                fs::create_dir_all(parent).map_err(|e| format!("创建目录失败: {}", e))?;
            }
            let mut out = File::create(&target_path).map_err(|e| format!("创建文件失败: {}", e))?;
            let mut content = Vec::new();
            entry.read_to_end(&mut content).map_err(|e| format!("读取内容失败: {}", e))?;
            out.write_all(&content).map_err(|e| format!("写入文件失败: {}", e))?;
        }

        Ok(())
    }

    #[test]
    fn test_collect_files() {
        let temp_dir = PathBuf::from(std::env::temp_dir()).join("test_backup_collect");
        let _ = fs::remove_dir_all(&temp_dir);
        let data_dir = temp_dir.join("data");
        setup_test_data(&data_dir);

        // 测试 collect_files
        let files = collect_files(&data_dir).unwrap();
        assert!(!files.is_empty(), "应有文件被收集");
        assert!(files.iter().any(|(p, _)| p.contains("settings.json")));
        assert!(files.iter().any(|(p, _)| p.contains("profile.md")));
        assert!(files.iter().any(|(p, _)| p.contains("测试工程师.md")));
        assert!(files.iter().any(|(p, _)| p.contains("2026-07-23_测试.md")));

        let _ = fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn test_collect_files_empty_dir() {
        let temp_dir = PathBuf::from(std::env::temp_dir()).join("test_backup_empty");
        let _ = fs::remove_dir_all(&temp_dir);
        let empty_dir = temp_dir.join("empty");
        fs::create_dir_all(&empty_dir).unwrap();

        let files = collect_files(&empty_dir).unwrap();
        assert!(files.is_empty(), "空目录应返回空列表");

        // 不存在的目录
        let files = collect_files(&temp_dir.join("nonexistent")).unwrap();
        assert!(files.is_empty(), "不存在的目录应返回空列表");

        let _ = fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn test_zip_roundtrip() {
        let temp_dir = PathBuf::from(std::env::temp_dir()).join("test_backup_zip_roundtrip");
        let _ = fs::remove_dir_all(&temp_dir);
        let data_dir = temp_dir.join("data");
        let restore_dir = temp_dir.join("restore");
        setup_test_data(&data_dir);

        // 1. 收集文件并打包
        let files = collect_files(&data_dir).unwrap();
        let backup_file = temp_dir.join("backup.zip");
        {
            let file = File::create(&backup_file).unwrap();
            let mut zip = zip::ZipWriter::new(file);
            let options: zip::write::FileOptions<'_, ()> = FileOptions::default()
                .compression_method(CompressionMethod::Deflated)
                .unix_permissions(0o644);

            for (relative_path, content) in &files {
                let zip_path = relative_path.replace('\\', "/");
                zip.start_file(&zip_path, options).unwrap();
                zip.write_all(content).unwrap();
            }
            zip.finish().unwrap();
        }

        // 2. 验证 zip 内容
        {
            let file = File::open(&backup_file).unwrap();
            let archive = ZipArchive::new(file).unwrap();
            assert_eq!(archive.len(), files.len(), "zip 条目数应匹配");
        }

        // 3. 解压到 restore 目录
        extract_zip(&backup_file, &restore_dir).unwrap();

        // 4. 验证恢复的文件内容一致
        let original_settings = fs::read_to_string(data_dir.join("settings.json")).unwrap();
        let restored_settings = fs::read_to_string(restore_dir.join("settings.json")).unwrap();
        assert_eq!(original_settings, restored_settings);

        let original_profile = fs::read_to_string(data_dir.join("profiles/profile.md")).unwrap();
        let restored_profile = fs::read_to_string(restore_dir.join("profiles/profile.md")).unwrap();
        assert_eq!(original_profile, restored_profile);

        let _ = fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn test_copy_dir_functions() {
        let temp_dir = PathBuf::from(std::env::temp_dir()).join("test_backup_copy_dir");
        let _ = fs::remove_dir_all(&temp_dir);

        let src = temp_dir.join("src");
        let dst = temp_dir.join("dst");
        setup_test_data(&src);

        // 测试 copy_dir_all
        copy_dir_all(&src, &dst).unwrap();
        assert!(dst.join("settings.json").exists());
        assert!(dst.join("profiles/profile.md").exists());

        let original = fs::read_to_string(src.join("settings.json")).unwrap();
        let copied = fs::read_to_string(dst.join("settings.json")).unwrap();
        assert_eq!(original, copied);

        // 测试 clear_dir_contents
        clear_dir_contents(&dst).unwrap();
        assert!(dst.exists(), "目录本身应保留");
        assert!(!dst.join("settings.json").exists(), "文件应被清空");
        assert!(!dst.join("profiles").exists(), "子目录应被清空");

        let _ = fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn test_import_invalid_zip() {
        let temp_dir = PathBuf::from(std::env::temp_dir()).join("test_backup_invalid");
        let _ = fs::remove_dir_all(&temp_dir);
        fs::create_dir_all(&temp_dir).unwrap();

        let invalid_file = temp_dir.join("not_a_zip.txt");
        fs::write(&invalid_file, "this is not a zip file").unwrap();

        let result = import_backup(invalid_file.to_str().unwrap().to_string());
        assert!(result.is_err(), "应返回错误");
        assert!(result.unwrap_err().contains("无效的 zip 文件"));

        let _ = fs::remove_dir_all(&temp_dir);
    }
}