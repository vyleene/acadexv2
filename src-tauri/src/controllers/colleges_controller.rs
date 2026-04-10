use tauri::State;

use crate::db::model::DatabaseModel;
use crate::models::colleges_model::{College, CreateCollegePayload, UpdateCollegePayload};
use crate::services::colleges_service::CollegesService;

#[tauri::command]
pub async fn create_college(
    database: State<'_, DatabaseModel>,
    payload: CreateCollegePayload,
) -> Result<College, String> {
    CollegesService::create(database.inner(), payload).await
}

#[tauri::command]
pub async fn read_college(
    database: State<'_, DatabaseModel>,
    code: String,
) -> Result<Option<College>, String> {
    CollegesService::read(database.inner(), code).await
}

#[tauri::command]
pub async fn update_college(
    database: State<'_, DatabaseModel>,
    code: String,
    payload: UpdateCollegePayload,
) -> Result<College, String> {
    CollegesService::update(database.inner(), code, payload).await
}

#[tauri::command]
pub async fn delete_college(database: State<'_, DatabaseModel>, code: String) -> Result<bool, String> {
    CollegesService::delete(database.inner(), code).await
}

#[tauri::command]
pub async fn list_colleges(database: State<'_, DatabaseModel>) -> Result<Vec<College>, String> {
    CollegesService::list(database.inner()).await
}
