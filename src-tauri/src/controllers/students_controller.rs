use tauri::State;

use crate::models::{
    datatabase_model::DatabaseModel,
    students_model::{
        CreateStudentPayload, CreateStudentProgramLinkPayload, Student, StudentProgramLink,
        UpdateStudentPayload, UpdateStudentProgramLinkPayload,
    },
};
use crate::services::students_service::StudentsService;

#[tauri::command]
pub async fn create_student(
    database: State<'_, DatabaseModel>,
    payload: CreateStudentPayload,
) -> Result<Student, String> {
    StudentsService::create(database.inner(), payload).await
}

#[tauri::command]
pub async fn read_student(database: State<'_, DatabaseModel>, id: i32) -> Result<Option<Student>, String> {
    StudentsService::read(database.inner(), id).await
}

#[tauri::command]
pub async fn update_student(
    database: State<'_, DatabaseModel>,
    id: i32,
    payload: UpdateStudentPayload,
) -> Result<Student, String> {
    StudentsService::update(database.inner(), id, payload).await
}

#[tauri::command]
pub async fn delete_student(database: State<'_, DatabaseModel>, id: i32) -> Result<bool, String> {
    StudentsService::delete(database.inner(), id).await
}

#[tauri::command]
pub async fn list_students(database: State<'_, DatabaseModel>) -> Result<Vec<Student>, String> {
    StudentsService::list(database.inner()).await
}

#[tauri::command]
pub async fn create_student_program_link(
    database: State<'_, DatabaseModel>,
    payload: CreateStudentProgramLinkPayload,
) -> Result<StudentProgramLink, String> {
    StudentsService::create_program_link(database.inner(), payload).await
}

#[tauri::command]
pub async fn read_student_program_link(
    database: State<'_, DatabaseModel>,
    student_id: i32,
    program_code: String,
) -> Result<Option<StudentProgramLink>, String> {
    StudentsService::read_program_link(database.inner(), student_id, program_code).await
}

#[tauri::command]
pub async fn update_student_program_link(
    database: State<'_, DatabaseModel>,
    student_id: i32,
    program_code: String,
    payload: UpdateStudentProgramLinkPayload,
) -> Result<StudentProgramLink, String> {
    StudentsService::update_program_link(database.inner(), student_id, program_code, payload).await
}

#[tauri::command]
pub async fn delete_student_program_link(
    database: State<'_, DatabaseModel>,
    student_id: i32,
    program_code: String,
) -> Result<bool, String> {
    StudentsService::delete_program_link(database.inner(), student_id, program_code).await
}

#[tauri::command]
pub async fn list_student_program_links(
    database: State<'_, DatabaseModel>,
) -> Result<Vec<StudentProgramLink>, String> {
    StudentsService::list_program_links(database.inner()).await
}
