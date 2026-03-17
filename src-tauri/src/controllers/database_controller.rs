use tauri::State;

use crate::models::datatabase_model::DatabaseModel;

#[tauri::command]
pub async fn initialize_mysql_schema(database: State<'_, DatabaseModel>) -> Result<(), String> {
    database.initialize_schema().await
}