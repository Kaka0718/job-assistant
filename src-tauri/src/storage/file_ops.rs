use std::path::Path;
use std::io::Read;
use std::fs;
use crate::utils::error::AppError;

/// 读取文件内容
pub fn read_file(path: &Path) -> Result<String, AppError> {
    if !path.exists() {
        return Err(AppError::NotFound(format!(
            "文件不存在: {}",
            path.display()
        )));
    }
    let mut file = fs::File::open(path)?;
    let mut content = String::new();
    file.read_to_string(&mut content)?;
    Ok(content)
}

/// 写入文件内容（自动创建父目录）
pub fn write_file(path: &Path, content: &str) -> Result<(), AppError> {
    if let Some(parent) = path.parent() {
        ensure_dir(parent)?;
    }
    fs::write(path, content)?;
    Ok(())
}

/// 列出目录下所有文件（非递归）
pub fn list_files(dir: &Path) -> Result<Vec<std::path::PathBuf>, AppError> {
    if !dir.exists() {
        return Ok(Vec::new());
    }
    let mut files = Vec::new();
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_file() {
            files.push(path);
        }
    }
    // 按文件名排序，保证稳定顺序
    files.sort();
    Ok(files)
}

/// 确保目录存在，不存在则创建
pub fn ensure_dir(path: &Path) -> Result<(), AppError> {
    if !path.exists() {
        fs::create_dir_all(path)?;
    }
    Ok(())
}

/// 删除文件
pub fn delete_file(path: &Path) -> Result<(), AppError> {
    if path.exists() {
        fs::remove_file(path)?;
    }
    Ok(())
}

/// 文件名合法性检查（防止路径注入）
pub fn validate_filename(name: &str) -> Result<(), AppError> {
    if name.is_empty() {
        return Err(AppError::ValidationError("文件名不能为空".to_string()));
    }
    // 不允许路径分隔符
    if name.contains('/') || name.contains('\\') {
        return Err(AppError::ValidationError(
            "文件名不能包含路径分隔符".to_string(),
        ));
    }
    // 不允许 ../
    if name.contains("..") {
        return Err(AppError::ValidationError(
            "文件名不能包含相对路径".to_string(),
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn test_validate_filename() {
        assert!(validate_filename("test.md").is_ok());
        assert!(validate_filename("").is_err());
        assert!(validate_filename("path/to/file.md").is_err());
        assert!(validate_filename("../file.md").is_err());
    }

    #[test]
    fn test_ensure_dir_and_write_read() {
        let dir = PathBuf::from(std::env::temp_dir()).join("test_job_assistant");
        let file_path = dir.join("test.txt");

        // 清理
        let _ = delete_file(&file_path);
        let _ = fs::remove_dir(&dir);

        // 测试写入
        write_file(&file_path, "Hello, World!").unwrap();
        assert!(file_path.exists());

        // 测试读取
        let content = read_file(&file_path).unwrap();
        assert_eq!(content, "Hello, World!");

        // 测试读取不存在的文件
        let result = read_file(&dir.join("nonexistent.txt"));
        assert!(result.is_err());

        // 清理
        delete_file(&file_path).unwrap();
    }

    #[test]
    fn test_list_files() {
        let dir = PathBuf::from(std::env::temp_dir()).join("test_job_assistant_list");
        let _ = ensure_dir(&dir);

        let f1 = dir.join("a.md");
        let f2 = dir.join("b.md");
        write_file(&f1, "a").unwrap();
        write_file(&f2, "b").unwrap();

        let files = list_files(&dir).unwrap();
        assert_eq!(files.len(), 2);

        // 清理
        delete_file(&f1).unwrap();
        delete_file(&f2).unwrap();
        let _ = fs::remove_dir(&dir);
    }
}