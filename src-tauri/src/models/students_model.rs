use serde::{Deserialize, Serialize};
use sqlx::FromRow;


#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Student {
    pub id: i32,
    pub firstname: String,
    pub lastname: String,
    pub year: String,
    pub gender: String,
    pub program_code: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateStudentPayload {
    pub id: i32,
    pub program_code: String,
    pub firstname: String,
    pub lastname: String,
    pub year: String,
    pub gender: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStudentPayload {
    pub program_code: String,
    pub firstname: String,
    pub lastname: String,
    pub year: String,
    pub gender: String,
}
