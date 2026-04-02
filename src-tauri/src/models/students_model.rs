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
    pub firstname: String,
    pub lastname: String,
    pub year: String,
    pub gender: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStudentPayload {
    pub firstname: String,
    pub lastname: String,
    pub year: String,
    pub gender: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct StudentProgramLink {
    pub student_id: i32,
    pub program_code: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateStudentProgramLinkPayload {
    pub student_id: i32,
    pub program_code: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStudentProgramLinkPayload {
    pub new_student_id: i32,
    pub new_program_code: String,
}
