use std::path::PathBuf;
use crate::models::settings::Settings;
use crate::storage::file_ops;
use crate::utils::error::AppError;

/// 获取设置文件路径（JSON 文件）
fn get_settings_path() -> PathBuf {
    crate::get_data_dir().join("settings.json")
}

/// 获取默认设置
fn default_settings() -> Settings {
    Settings::default()
}

/// 读取设置
pub fn get_settings() -> Result<Settings, AppError> {
    let path = get_settings_path();
    if !path.exists() {
        // 不存在则返回默认设置
        return Ok(default_settings());
    }

    let content = file_ops::read_file(&path)?;
    let settings: Settings = serde_json::from_str(&content)?;
    Ok(settings)
}

/// 保存设置
pub fn save_settings(settings: &Settings) -> Result<Settings, AppError> {
    let path = get_settings_path();
    let content = serde_json::to_string_pretty(settings)?;
    file_ops::write_file(&path, &content)?;
    Ok(settings.clone())
}

/// 测试 AI 连接（在当前实现中返回模拟结果）
pub fn test_ai_connection(settings: &Settings) -> Result<bool, AppError> {
    // 验证 API Key 是否有值
    if settings.ai.api_key.is_empty() {
        return Err(AppError::ValidationError("API Key 未配置".to_string()));
    }
    if settings.ai.base_url.is_empty() {
        return Err(AppError::ValidationError("API 地址未配置".to_string()));
    }

    // 注意：实际 AI 连接测试由前端发起 HTTP 请求
    // 这里仅做基本配置验证
    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::settings::{AISettings, AppSettings};

    #[test]
    fn test_default_settings() {
        let settings = default_settings();
        assert_eq!(settings.ai.provider, "deepseek");
        assert_eq!(settings.app.theme, "system");
    }

    #[test]
    fn test_save_and_get_settings() {
        let settings = Settings {
            ai: AISettings {
                provider: "openai".to_string(),
                api_key: "sk-test".to_string(),
                model: "gpt-4".to_string(),
                base_url: "https://api.openai.com".to_string(),
                temperature: 0.5,
                max_tokens: 4096,
            },
            app: AppSettings {
                theme: "dark".to_string(),
                language: "en".to_string(),
                data_dir: "./data".to_string(),
            },
        };

        save_settings(&settings).unwrap();
        let loaded = get_settings().unwrap();
        assert_eq!(loaded.ai.provider, "openai");
        assert_eq!(loaded.app.theme, "dark");

        // 清理
        let path = get_settings_path();
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn test_ai_connection_validation() {
        let settings = Settings::default();
        // 空的 API Key 应该返回错误
        let result = test_ai_connection(&settings);
        assert!(result.is_err());
    }
}