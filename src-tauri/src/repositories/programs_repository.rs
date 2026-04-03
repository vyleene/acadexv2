use crate::models::datatabase_model::DatabaseModel;
use crate::models::programs_model::{CreateProgramPayload, Program, UpdateProgramPayload};

pub struct ProgramsRepository;

impl ProgramsRepository {
    pub async fn create(
        database: &DatabaseModel,
        payload: CreateProgramPayload,
    ) -> Result<Program, String> {
        let code = normalize_code(&payload.code, "program code")?;
        let name = normalize_name(&payload.name, "program name", 128)?;
        let college_code = normalize_code(&payload.college_code, "college code")?;
        let pool = database.pool()?;

        sqlx::query("INSERT INTO programs (code, name, college_code) VALUES (?, ?, ?)")
            .bind(&code)
            .bind(&name)
            .bind(&college_code)
            .execute(&pool)
            .await
            .map_err(|error| database_error("Failed to create program", error))?;

        Ok(Program {
            code,
            name,
            college_code: Some(college_code),
        })
    }

    pub async fn read(database: &DatabaseModel, code: String) -> Result<Option<Program>, String> {
        let code = normalize_code(&code, "program code")?;
        let pool = database.pool()?;

        sqlx::query_as::<_, Program>(
            "SELECT code, name, college_code FROM programs WHERE code = ?",
        )
            .bind(&code)
            .fetch_optional(&pool)
            .await
            .map_err(|error| database_error("Failed to read program", error))
    }

    pub async fn update(
        database: &DatabaseModel,
        code: String,
        payload: UpdateProgramPayload,
    ) -> Result<Program, String> {
        let code = normalize_code(&code, "program code")?;
        let name = normalize_name(&payload.name, "program name", 128)?;
        let college_code = normalize_code(&payload.college_code, "college code")?;
        let pool = database.pool()?;

        let update_result =
            sqlx::query("UPDATE programs SET name = ?, college_code = ? WHERE code = ?")
            .bind(&name)
            .bind(&college_code)
            .bind(&code)
            .execute(&pool)
            .await
            .map_err(|error| database_error("Failed to update program", error))?;

        if update_result.rows_affected() == 0 {
            return Err(format!("Program with code '{}' was not found.", code));
        }

        Ok(Program {
            code,
            name,
            college_code: Some(college_code),
        })
    }

    pub async fn delete(database: &DatabaseModel, code: String) -> Result<bool, String> {
        let code = normalize_code(&code, "program code")?;
        let pool = database.pool()?;

        let delete_result = sqlx::query("DELETE FROM programs WHERE code = ?")
            .bind(&code)
            .execute(&pool)
            .await
            .map_err(|error| database_error("Failed to delete program", error))?;

        Ok(delete_result.rows_affected() > 0)
    }

    pub async fn list(database: &DatabaseModel) -> Result<Vec<Program>, String> {
        let pool = database.pool()?;
        sqlx::query_as::<_, Program>(
            "SELECT code, name, college_code FROM programs ORDER BY name, code",
        )
            .fetch_all(&pool)
            .await
            .map_err(|error| database_error("Failed to list programs", error))
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

fn database_error(context: &str, error: sqlx::Error) -> String {
    format!("{}: {}", context, error)
}
