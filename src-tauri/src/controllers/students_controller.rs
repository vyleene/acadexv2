use tauri::State;

use crate::models::{
    datatabase_model::DatabaseModel,
    students_model::{
        CreateStudentPayload, CreateStudentProgramLinkPayload, Student, StudentProgramLink,
        StudentsModel, UpdateStudentPayload, UpdateStudentProgramLinkPayload,
    },
};

#[tauri::command]
pub async fn create_student(
    database: State<'_, DatabaseModel>,
    payload: CreateStudentPayload,
) -> Result<Student, String> {
    StudentsModel::create(database.inner(), payload).await
}

#[tauri::command]
pub async fn read_student(database: State<'_, DatabaseModel>, id: i32) -> Result<Option<Student>, String> {
    StudentsModel::read(database.inner(), id).await
}

#[tauri::command]
pub async fn update_student(
    database: State<'_, DatabaseModel>,
    id: i32,
    payload: UpdateStudentPayload,
) -> Result<Student, String> {
    StudentsModel::update(database.inner(), id, payload).await
}

#[tauri::command]
pub async fn delete_student(database: State<'_, DatabaseModel>, id: i32) -> Result<bool, String> {
    StudentsModel::delete(database.inner(), id).await
}

#[tauri::command]
pub async fn list_students(database: State<'_, DatabaseModel>) -> Result<Vec<Student>, String> {
    StudentsModel::list(database.inner()).await
}

#[tauri::command]
pub async fn create_student_program_link(
    database: State<'_, DatabaseModel>,
    payload: CreateStudentProgramLinkPayload,
) -> Result<StudentProgramLink, String> {
    StudentsModel::create_program_link(database.inner(), payload).await
}

#[tauri::command]
pub async fn read_student_program_link(
    database: State<'_, DatabaseModel>,
    student_id: i32,
    program_code: String,
) -> Result<Option<StudentProgramLink>, String> {
    StudentsModel::read_program_link(database.inner(), student_id, program_code).await
}

#[tauri::command]
pub async fn update_student_program_link(
    database: State<'_, DatabaseModel>,
    student_id: i32,
    program_code: String,
    payload: UpdateStudentProgramLinkPayload,
) -> Result<StudentProgramLink, String> {
    StudentsModel::update_program_link(database.inner(), student_id, program_code, payload).await
}

#[tauri::command]
pub async fn delete_student_program_link(
    database: State<'_, DatabaseModel>,
    student_id: i32,
    program_code: String,
) -> Result<bool, String> {
    StudentsModel::delete_program_link(database.inner(), student_id, program_code).await
}

#[tauri::command]
pub async fn list_student_program_links(
    database: State<'_, DatabaseModel>,
) -> Result<Vec<StudentProgramLink>, String> {
    StudentsModel::list_program_links(database.inner()).await
}
