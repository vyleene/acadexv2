use tauri::State;

use crate::models::{
    datatabase_model::DatabaseModel,
    programs_model::{CreateProgramPayload, Program, ProgramsModel, UpdateProgramPayload},
};

#[tauri::command]
pub async fn create_program(
    database: State<'_, DatabaseModel>,
    payload: CreateProgramPayload,
) -> Result<Program, String> {
    ProgramsModel::create(database.inner(), payload).await
}

#[tauri::command]
pub async fn read_program(
    database: State<'_, DatabaseModel>,
    code: String,
) -> Result<Option<Program>, String> {
    ProgramsModel::read(database.inner(), code).await
}

#[tauri::command]
pub async fn update_program(
    database: State<'_, DatabaseModel>,
    code: String,
    payload: UpdateProgramPayload,
) -> Result<Program, String> {
    ProgramsModel::update(database.inner(), code, payload).await
}

#[tauri::command]
pub async fn delete_program(database: State<'_, DatabaseModel>, code: String) -> Result<bool, String> {
    ProgramsModel::delete(database.inner(), code).await
}

#[tauri::command]
pub async fn list_programs(database: State<'_, DatabaseModel>) -> Result<Vec<Program>, String> {
    ProgramsModel::list(database.inner()).await
}
