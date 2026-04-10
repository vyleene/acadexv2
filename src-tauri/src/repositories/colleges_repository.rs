use crate::models::colleges_model::{College, CreateCollegePayload, UpdateCollegePayload};
use crate::models::database_model::DatabaseModel;

pub struct CollegesRepository;

impl CollegesRepository {
    pub async fn create(
        database: &DatabaseModel,
        payload: CreateCollegePayload,
    ) -> Result<College, String> {
        let code = normalize_code(&payload.code, "college code")?;
        let name = normalize_name(&payload.name, "college name", 128)?;
        let pool = database.pool()?;

        sqlx::query("INSERT INTO colleges (code, name) VALUES (?, ?)")
            .bind(&code)
            .bind(&name)
            .execute(&pool)
            .await
            .map_err(|error| database_error("Failed to create college", error))?;

        Ok(College { code, name })
    }

    pub async fn read(database: &DatabaseModel, code: String) -> Result<Option<College>, String> {
        let code = normalize_code(&code, "college code")?;
        let pool = database.pool()?;

        sqlx::query_as::<_, College>("SELECT code, name FROM colleges WHERE code = ?")
            .bind(&code)
            .fetch_optional(&pool)
            .await
            .map_err(|error| database_error("Failed to read college", error))
    }

    pub async fn update(
        database: &DatabaseModel,
        code: String,
        payload: UpdateCollegePayload,
    ) -> Result<College, String> {
        let code = normalize_code(&code, "college code")?;
        let name = normalize_name(&payload.name, "college name", 128)?;
        let pool = database.pool()?;

        let update_result = sqlx::query("UPDATE colleges SET name = ? WHERE code = ?")
            .bind(&name)
            .bind(&code)
            .execute(&pool)
            .await
            .map_err(|error| database_error("Failed to update college", error))?;

        if update_result.rows_affected() == 0 {
            return Err(not_found_error("College", "code", &code));
        }

        Ok(College { code, name })
    }

    pub async fn delete(database: &DatabaseModel, code: String) -> Result<bool, String> {
        let code = normalize_code(&code, "college code")?;
        let pool = database.pool()?;

        let delete_result = sqlx::query("DELETE FROM colleges WHERE code = ?")
            .bind(&code)
            .execute(&pool)
            .await
            .map_err(|error| database_error("Failed to delete college", error))?;

        Ok(delete_result.rows_affected() > 0)
    }

    pub async fn list(database: &DatabaseModel) -> Result<Vec<College>, String> {
        let pool = database.pool()?;
        sqlx::query_as::<_, College>("SELECT code, name FROM colleges ORDER BY name, code")
            .fetch_all(&pool)
            .await
            .map_err(|error| database_error("Failed to list colleges", error))
    }

}

fn normalize_code(value: &str, field_name: &str) -> Result<String, String> {
    normalize_name(value, field_name, 16)
}

fn normalize_name(value: &str, field_name: &str, max_length: usize) -> Result<String, String> {
    let normalized = value.trim();

    if normalized.is_empty() {
        return Err(format!("{} is required.", field_name));
    }

    if normalized.chars().count() > max_length {
        return Err(format!("{} must be at most {} characters.", field_name, max_length));
    }

    Ok(normalized.to_string())
}

fn not_found_error(entity: &str, field_name: &str, value: impl std::fmt::Display) -> String {
    format!("{} with {} '{}' was not found.", entity, field_name, value)
}

fn database_error(context: &str, error: sqlx::Error) -> String {
    format!("{}: {}", context, error)
}
