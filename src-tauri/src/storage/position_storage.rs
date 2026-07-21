use crate::models::position::{Position, CreatePositionInput, UpdatePositionInput};

pub fn list_positions() -> Result<Vec<Position>, String> {
    todo!()
}

pub fn get_position(id: &str) -> Result<Option<Position>, String> {
    todo!()
}

pub fn create_position(input: CreatePositionInput) -> Result<Position, String> {
    todo!()
}

pub fn update_position(id: &str, input: UpdatePositionInput) -> Result<Position, String> {
    todo!()
}

pub fn delete_position(id: &str) -> Result<(), String> {
    todo!()
}