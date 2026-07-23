use std::path::Path;

#[tauri::command]
pub fn write_text_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(&path, &content).map_err(|e| format!("写入文件失败: {}", e))
}

#[tauri::command]
pub fn read_text_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| format!("读取文件失败: {}", e))
}

#[tauri::command]
pub fn export_backup(path: String) -> Result<(), String> {
    let data_dir = Path::new("./data");
    if !data_dir.exists() {
        return Err("数据目录不存在".to_string());
    }

    let file = std::fs::File::create(&path)
        .map_err(|e| format!("创建备份文件失败: {}", e))?;
    let mut zip = zip::ZipWriter::new(file);
    let options = zip::write::FileOptions::<()>::default()
        .compression_method(zip::CompressionMethod::Deflated);

    // Recursively add files from data directory
    add_dir_to_zip(data_dir, data_dir, &mut zip, &options)
        .map_err(|e| format!("打包数据失败: {}", e))?;

    zip.finish().map_err(|e| format!("完成备份失败: {}", e))?;
    Ok(())
}

#[tauri::command]
pub fn import_backup(path: String) -> Result<(), String> {
    let backup_path = Path::new(&path);
    if !backup_path.exists() {
        return Err("备份文件不存在".to_string());
    }

    let file = std::fs::File::open(backup_path)
        .map_err(|e| format!("打开备份文件失败: {}", e))?;
    let mut archive = zip::ZipArchive::new(file)
        .map_err(|e| format!("读取备份文件失败: {}", e))?;

    let data_dir = Path::new("./data");

    // Backup current data first (rollback safety)
    let temp_dir = Path::new("./data_backup_temp");
    if temp_dir.exists() {
        std::fs::remove_dir_all(temp_dir).map_err(|e| format!("清理临时目录失败: {}", e))?;
    }
    if data_dir.exists() {
        copy_dir(data_dir, temp_dir)?;
    }

    // Extract zip to data directory
    for i in 0..archive.len() {
        let mut entry = archive.by_index(i)
            .map_err(|e| format!("读取备份条目失败: {}", e))?;
        let entry_path = entry.name().to_string();
        let target_path = data_dir.join(&entry_path);

        if entry.is_dir() {
            std::fs::create_dir_all(&target_path)
                .map_err(|e| format!("创建目录失败: {}", e))?;
        } else {
            if let Some(parent) = target_path.parent() {
                std::fs::create_dir_all(parent)
                    .map_err(|e| format!("创建目录失败: {}", e))?;
            }
            let mut outfile = std::fs::File::create(&target_path)
                .map_err(|e| format!("创建文件失败: {}", e))?;
            std::io::copy(&mut entry, &mut outfile)
                .map_err(|e| format!("写入文件失败: {}", e))?;
        }
    }

    // Clean up temp backup
    if temp_dir.exists() {
        std::fs::remove_dir_all(temp_dir).ok();
    }

    Ok(())
}

fn add_dir_to_zip(
    base: &Path,
    dir: &Path,
    zip: &mut zip::ZipWriter<std::fs::File>,
    options: &zip::write::FileOptions<()>,
) -> Result<(), String> {
    let entries = std::fs::read_dir(dir)
        .map_err(|e| format!("读取目录失败: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("读取目录项失败: {}", e))?;
        let path = entry.path();
        let relative = path.strip_prefix(base)
            .map_err(|e| format!("路径错误: {}", e))?;

        if path.is_dir() {
            zip.add_directory(relative.to_string_lossy(), *options)
                .map_err(|e| format!("添加目录到zip失败: {}", e))?;
            add_dir_to_zip(base, &path, zip, options)?;
        } else {
            let content = std::fs::read(&path)
                .map_err(|e| format!("读取文件失败: {}", e))?;
            zip.start_file(relative.to_string_lossy(), *options)
                .map_err(|e| format!("添加文件到zip失败: {}", e))?;
            std::io::Write::write_all(zip, &content)
                .map_err(|e| format!("写入zip失败: {}", e))?;
        }
    }
    Ok(())
}

fn copy_dir(src: &Path, dst: &Path) -> Result<(), String> {
    std::fs::create_dir_all(dst)
        .map_err(|e| format!("创建目标目录失败: {}", e))?;

    let entries = std::fs::read_dir(src)
        .map_err(|e| format!("读取源目录失败: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("读取目录项失败: {}", e))?;
        let path = entry.path();
        let target = dst.join(path.strip_prefix(src).unwrap());

        if path.is_dir() {
            copy_dir(&path, &target)?;
        } else {
            std::fs::copy(&path, &target)
                .map_err(|e| format!("复制文件失败: {}", e))?;
        }
    }
    Ok(())
}