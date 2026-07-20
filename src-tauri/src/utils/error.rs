use std::fmt;

/// 自定义应用错误类型
#[derive(Debug, Clone)]
pub enum AppError {
    /// 文件未找到
    NotFound(String),
    /// 文件读取/写入错误
    IoError(String),
    /// Frontmatter 解析错误
    ParseError(String),
    /// 序列化错误
    SerializeError(String),
    /// 输入验证错误
    ValidationError(String),
    /// 不支持的操作
    Unsupported(String),
    /// 通用错误
    General(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::NotFound(msg) => write!(f, "未找到: {}", msg),
            AppError::IoError(msg) => write!(f, "文件操作错误: {}", msg),
            AppError::ParseError(msg) => write!(f, "解析错误: {}", msg),
            AppError::SerializeError(msg) => write!(f, "序列化错误: {}", msg),
            AppError::ValidationError(msg) => write!(f, "验证错误: {}", msg),
            AppError::Unsupported(msg) => write!(f, "不支持的操作: {}", msg),
            AppError::General(msg) => write!(f, "{}", msg),
        }
    }
}

impl std::error::Error for AppError {}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::IoError(err.to_string())
    }
}

impl From<serde_yaml::Error> for AppError {
    fn from(err: serde_yaml::Error) -> Self {
        AppError::ParseError(err.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::SerializeError(err.to_string())
    }
}

// 为了 Tauri Command 返回 Result<T, String>，需要 Into<String>
impl From<AppError> for String {
    fn from(err: AppError) -> Self {
        err.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_error_display_chinese() {
        let err = AppError::NotFound("文件不存在".to_string());
        assert_eq!(err.to_string(), "未找到: 文件不存在");
    }

    #[test]
    fn test_app_error_into_string() {
        let err = AppError::ValidationError("请输入名称".to_string());
        let s: String = err.into();
        assert_eq!(s, "验证错误: 请输入名称");
    }

    #[test]
    fn test_io_error_conversion() {
        let io_err = std::io::Error::new(std::io::ErrorKind::NotFound, "file not found");
        let app_err: AppError = io_err.into();
        assert!(matches!(app_err, AppError::IoError(_)));
    }
}