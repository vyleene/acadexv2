use tauri::State;

use crate::models::{
    datatabase_model::DatabaseModel,
    students_model::{CreateStudentPayload, Student, UpdateStudentPayload},
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
