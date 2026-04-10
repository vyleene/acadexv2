use tauri::State;

use crate::models::database_model::{DatabaseConfigPayload, DatabaseModel, DatabaseStatus};

#[tauri::command]
pub async fn initialize_mysql_schema(database: State<'_, DatabaseModel>) -> Result<(), String> {
    database.initialize_schema().await
}

#[tauri::command]
pub async fn configure_mysql_database(
    database: State<'_, DatabaseModel>,
    payload: DatabaseConfigPayload,
) -> Result<DatabaseStatus, String> {
    database.configure(payload).await
}

#[tauri::command]
pub async fn get_mysql_database_status(
    database: State<'_, DatabaseModel>,
) -> Result<DatabaseStatus, String> {
    database.status()
}

#[tauri::command]
pub async fn test_mysql_database_connection(payload: DatabaseConfigPayload) -> Result<(), String> {
    DatabaseModel::test_connection(payload).await
}

#[tauri::command]
pub async fn disconnect_mysql_database(database: State<'_, DatabaseModel>) -> Result<(), String> {
    database.disconnect().await
}