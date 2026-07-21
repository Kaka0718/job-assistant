use uuid::Uuid;

pub fn generate_id(prefix: &str) -> String {
    let short = &Uuid::new_v4().to_string()[..8];
    format!("{}_{}", prefix, short)
}