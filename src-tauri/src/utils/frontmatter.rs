use serde::de::DeserializeOwned;
use serde::Serialize;
use crate::utils::error::AppError;

/// 解析 Markdown frontmatter
/// 按 `---\n` 分割，第一部分解析为 YAML，第二部分为正文
pub fn parse_frontmatter<T: DeserializeOwned>(content: &str) -> Result<(T, String), AppError> {
    let content = content.trim();

    // 检查是否以 --- 开头
    if !content.starts_with("---") {
        return Err(AppError::ParseError("Missing frontmatter delimiter".to_string()));
    }

    // 找到第二个 --- 的位置
    let rest = &content[3..]; // 跳过第一个 ---
    let end = rest.find("\n---").ok_or_else(|| {
        AppError::ParseError("Missing closing frontmatter delimiter".to_string())
    })?;

    let yaml_str = &rest[..end];
    let body = rest[end + 4..].trim().to_string(); // 跳过 \n---

    // 解析 YAML
    let data: T = serde_yaml::from_str(yaml_str).map_err(|e| {
        AppError::ParseError(format!("Failed to parse frontmatter: {}", e))
    })?;

    Ok((data, body))
}

/// 序列化 Markdown frontmatter
/// 将数据序列化为 YAML frontmatter + 正文
pub fn serialize_frontmatter<T: Serialize>(data: &T, content: &str) -> Result<String, AppError> {
    let yaml_str = serde_yaml::to_string(data).map_err(|e| {
        AppError::SerializeError(format!("Failed to serialize frontmatter: {}", e))
    })?;

    Ok(format!("---\n{}---\n{}", yaml_str, content))
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::{Deserialize, Serialize};

    #[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
    struct TestFrontmatter {
        title: String,
        version: i32,
    }

    #[test]
    fn test_parse_frontmatter() {
        let content = "---\ntitle: Test\nversion: 1\n---\n# Body\n\nSome content here";
        let (data, body): (TestFrontmatter, String) = parse_frontmatter(content).unwrap();
        assert_eq!(data.title, "Test");
        assert_eq!(data.version, 1);
        assert_eq!(body, "# Body\n\nSome content here");
    }

    #[test]
    fn test_parse_frontmatter_no_delimiter() {
        let content = "No frontmatter here";
        let result: Result<(TestFrontmatter, String), AppError> = parse_frontmatter(content);
        assert!(result.is_err());
    }

    #[test]
    fn test_serialize_frontmatter() {
        let data = TestFrontmatter {
            title: "Hello".to_string(),
            version: 2,
        };
        let result = serialize_frontmatter(&data, "Body text").unwrap();
        assert!(result.starts_with("---\n"));
        assert!(result.contains("title: Hello"));
        assert!(result.contains("version: 2"));
        assert!(result.ends_with("---\nBody text"));
    }

    #[test]
    fn test_roundtrip() {
        let data = TestFrontmatter {
            title: "Roundtrip".to_string(),
            version: 99,
        };
        let body = "## Section 1\n\nSome markdown here";
        let serialized = serialize_frontmatter(&data, body).unwrap();
        let (parsed_data, parsed_body): (TestFrontmatter, String) =
            parse_frontmatter(&serialized).unwrap();
        assert_eq!(parsed_data, data);
        assert_eq!(parsed_body, body);
    }
}