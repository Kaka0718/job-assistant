use crate::models::application::{Application, CreateApplicationInput, UpdateApplicationInput, ApplicationFilter};

pub fn list_applications(filter: Option<ApplicationFilter>) -> Result<Vec<Application>, String> {
    todo!()
}

pub fn get_application(id: &str) -> Result<Option<Application>, String> {
    todo!()
}

pub fn create_application(input: CreateApplicationInput) -> Result<Application, String> {
    todo!()
}

pub fn update_application(id: &str, input: UpdateApplicationInput) -> Result<Application, String> {
    todo!()
}

pub fn delete_application(id: &str) -> Result<(), String> {
    todo!()
}