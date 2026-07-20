use uuid::Uuid;

/// 生成带前缀的唯一 ID
/// 例如: `generate_id("pos")` → `pos_abc123...`
pub fn generate_id(prefix: &str) -> String {
    let uid = Uuid::new_v4();
    let uid_str = uid.to_string();
    // 取前 8 位短 ID 便于阅读
    let short = uid_str.split('-').next().unwrap_or("unknown");
    format!("{}_{}", prefix, short)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_id_with_prefix() {
        let id = generate_id("pos");
        assert!(id.starts_with("pos_"));
        assert!(id.len() > 4);
    }

    #[test]
    fn test_generate_id_unique() {
        let id1 = generate_id("app");
        let id2 = generate_id("app");
        assert_ne!(id1, id2);
    }

    #[test]
    fn test_generate_id_prefixes() {
        for prefix in &["pos", "app", "prof"] {
            let id = generate_id(prefix);
            assert!(id.starts_with(&format!("{}_", prefix)));
        }
    }
}