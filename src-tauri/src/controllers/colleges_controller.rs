use tauri::State;

use crate::models::{
    colleges_model::{
        College, CollegeProgramLink, CreateCollegePayload, CreateCollegeProgramLinkPayload,
        UpdateCollegePayload, UpdateCollegeProgramLinkPayload,
    },
    datatabase_model::DatabaseModel,
};
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

#[tauri::command]
pub async fn create_college_program_link(
    database: State<'_, DatabaseModel>,
    payload: CreateCollegeProgramLinkPayload,
) -> Result<CollegeProgramLink, String> {
    CollegesService::create_program_link(database.inner(), payload).await
}

#[tauri::command]
pub async fn read_college_program_link(
    database: State<'_, DatabaseModel>,
    college_code: String,
    program_code: String,
) -> Result<Option<CollegeProgramLink>, String> {
    CollegesService::read_program_link(database.inner(), college_code, program_code).await
}

#[tauri::command]
pub async fn update_college_program_link(
    database: State<'_, DatabaseModel>,
    college_code: String,
    program_code: String,
    payload: UpdateCollegeProgramLinkPayload,
) -> Result<CollegeProgramLink, String> {
    CollegesService::update_program_link(database.inner(), college_code, program_code, payload)
        .await
}

#[tauri::command]
pub async fn delete_college_program_link(
    database: State<'_, DatabaseModel>,
    college_code: String,
    program_code: String,
) -> Result<bool, String> {
    CollegesService::delete_program_link(database.inner(), college_code, program_code).await
}

#[tauri::command]
pub async fn list_college_program_links(
    database: State<'_, DatabaseModel>,
) -> Result<Vec<CollegeProgramLink>, String> {
    CollegesService::list_program_links(database.inner()).await
}
