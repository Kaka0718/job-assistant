use std::fmt;

#[derive(Debug)]
pub enum AppError {
    NotFound(String),
    InvalidInput(String),
    FileOperation(String),
    ParseError(String),
    Internal(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::NotFound(msg) => write!(f, "未找到: {}", msg),
            AppError::InvalidInput(msg) => write!(f, "无效输入: {}", msg),
            AppError::FileOperation(msg) => write!(f, "文件操作失败: {}", msg),
            AppError::ParseError(msg) => write!(f, "解析失败: {}", msg),
            AppError::Internal(msg) => write!(f, "内部错误: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::FileOperation(e.to_string())
    }
}

impl From<serde_yaml::Error> for AppError {
    fn from(e: serde_yaml::Error) -> Self {
        AppError::ParseError(e.to_string())
    }
}

impl From<String> for AppError {
    fn from(msg: String) -> Self {
        AppError::Internal(msg)
    }
}