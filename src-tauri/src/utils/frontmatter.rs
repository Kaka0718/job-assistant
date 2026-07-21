use serde::de::DeserializeOwned;
use serde::Serialize;

pub fn parse_frontmatter<T: DeserializeOwned>(content: &str) -> Result<(T, String), String> {
    let parts: Vec<&str> = content.splitn(3, "---\n").collect();
    if parts.len() < 3 {
        return Err("无效的 frontmatter 格式".to_string());
    }
    let yaml_part = parts[1];
    let body = parts[2..].join("---\n");
    let data: T = serde_yaml::from_str(yaml_part).map_err(|e| format!("YAML 解析失败: {}", e))?;
    Ok((data, body))
}

pub fn serialize_frontmatter<T: Serialize>(data: &T, content: &str) -> Result<String, String> {
    let yaml_part = serde_yaml::to_string(data).map_err(|e| format!("YAML 序列化失败: {}", e))?;
    Ok(format!("---\n{}---\n{}", yaml_part, content))
}