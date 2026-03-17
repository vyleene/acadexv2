use tauri::State;

use crate::models::{
    colleges_model::{
        College, CollegeProgramLink, CollegesModel, CreateCollegePayload,
        CreateCollegeProgramLinkPayload, UpdateCollegePayload, UpdateCollegeProgramLinkPayload,
    },
    datatabase_model::DatabaseModel,
};

#[tauri::command]
pub async fn create_college(
    database: State<'_, DatabaseModel>,
    payload: CreateCollegePayload,
) -> Result<College, String> {
    CollegesModel::create(database.inner(), payload).await
}

#[tauri::command]
pub async fn read_college(
    database: State<'_, DatabaseModel>,
    code: String,
) -> Result<Option<College>, String> {
    CollegesModel::read(database.inner(), code).await
}

#[tauri::command]
pub async fn update_college(
    database: State<'_, DatabaseModel>,
    code: String,
    payload: UpdateCollegePayload,
) -> Result<College, String> {
    CollegesModel::update(database.inner(), code, payload).await
}

#[tauri::command]
pub async fn delete_college(database: State<'_, DatabaseModel>, code: String) -> Result<bool, String> {
    CollegesModel::delete(database.inner(), code).await
}

#[tauri::command]
pub async fn list_colleges(database: State<'_, DatabaseModel>) -> Result<Vec<College>, String> {
    CollegesModel::list(database.inner()).await
}

#[tauri::command]
pub async fn create_college_program_link(
    database: State<'_, DatabaseModel>,
    payload: CreateCollegeProgramLinkPayload,
) -> Result<CollegeProgramLink, String> {
    CollegesModel::create_program_link(database.inner(), payload).await
}

#[tauri::command]
pub async fn read_college_program_link(
    database: State<'_, DatabaseModel>,
    college_code: String,
    program_code: String,
) -> Result<Option<CollegeProgramLink>, String> {
    CollegesModel::read_program_link(database.inner(), college_code, program_code).await
}

#[tauri::command]
pub async fn update_college_program_link(
    database: State<'_, DatabaseModel>,
    college_code: String,
    program_code: String,
    payload: UpdateCollegeProgramLinkPayload,
) -> Result<CollegeProgramLink, String> {
    CollegesModel::update_program_link(database.inner(), college_code, program_code, payload).await
}

#[tauri::command]
pub async fn delete_college_program_link(
    database: State<'_, DatabaseModel>,
    college_code: String,
    program_code: String,
) -> Result<bool, String> {
    CollegesModel::delete_program_link(database.inner(), college_code, program_code).await
}

#[tauri::command]
pub async fn list_college_program_links(
    database: State<'_, DatabaseModel>,
) -> Result<Vec<CollegeProgramLink>, String> {
    CollegesModel::list_program_links(database.inner()).await
}
