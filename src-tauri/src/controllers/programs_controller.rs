use tauri::State;

use crate::models::{
    datatabase_model::DatabaseModel,
    programs_model::{CreateProgramPayload, Program, UpdateProgramPayload},
};
use crate::services::programs_service::ProgramsService;

#[tauri::command]
pub async fn create_program(
    database: State<'_, DatabaseModel>,
    payload: CreateProgramPayload,
) -> Result<Program, String> {
    ProgramsService::create(database.inner(), payload).await
}

#[tauri::command]
pub async fn read_program(
    database: State<'_, DatabaseModel>,
    code: String,
) -> Result<Option<Program>, String> {
    ProgramsService::read(database.inner(), code).await
}

#[tauri::command]
pub async fn update_program(
    database: State<'_, DatabaseModel>,
    code: String,
    payload: UpdateProgramPayload,
) -> Result<Program, String> {
    ProgramsService::update(database.inner(), code, payload).await
}

#[tauri::command]
pub async fn delete_program(database: State<'_, DatabaseModel>, code: String) -> Result<bool, String> {
    ProgramsService::delete(database.inner(), code).await
}

#[tauri::command]
pub async fn list_programs(database: State<'_, DatabaseModel>) -> Result<Vec<Program>, String> {
    ProgramsService::list(database.inner()).await
}
