use crate::models::colleges_model::{
    College, CollegeProgramLink, CreateCollegePayload, CreateCollegeProgramLinkPayload,
    UpdateCollegePayload, UpdateCollegeProgramLinkPayload,
};
use crate::models::datatabase_model::DatabaseModel;

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
        let name = normalize_name(&payload.name, "college name", 64)?;
        let pool = database.pool()?;

        let update_result = sqlx::query("UPDATE colleges SET name = ? WHERE code = ?")
            .bind(&name)
            .bind(&code)
            .execute(&pool)
            .await
            .map_err(|error| database_error("Failed to update college", error))?;

        if update_result.rows_affected() == 0 {
            return Err(format!("College with code '{}' was not found.", code));
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

    pub async fn create_program_link(
        database: &DatabaseModel,
        payload: CreateCollegeProgramLinkPayload,
    ) -> Result<CollegeProgramLink, String> {
        let college_code = normalize_code(&payload.college_code, "college code")?;
        let program_code = normalize_code(&payload.program_code, "program code")?;
        let pool = database.pool()?;

        sqlx::query("INSERT INTO colleges_programs (college_code, program_code) VALUES (?, ?)")
            .bind(&college_code)
            .bind(&program_code)
            .execute(&pool)
            .await
            .map_err(|error| database_error("Failed to create college-program link", error))?;

        Ok(CollegeProgramLink {
            college_code,
            program_code,
        })
    }

    pub async fn read_program_link(
        database: &DatabaseModel,
        college_code: String,
        program_code: String,
    ) -> Result<Option<CollegeProgramLink>, String> {
        let college_code = normalize_code(&college_code, "college code")?;
        let program_code = normalize_code(&program_code, "program code")?;
        let pool = database.pool()?;

        sqlx::query_as::<_, CollegeProgramLink>(
            "SELECT college_code, program_code FROM colleges_programs WHERE college_code = ? AND program_code = ?",
        )
        .bind(&college_code)
        .bind(&program_code)
        .fetch_optional(&pool)
        .await
        .map_err(|error| database_error("Failed to read college-program link", error))
    }

    pub async fn update_program_link(
        database: &DatabaseModel,
        college_code: String,
        program_code: String,
        payload: UpdateCollegeProgramLinkPayload,
    ) -> Result<CollegeProgramLink, String> {
        let college_code = normalize_code(&college_code, "college code")?;
        let program_code = normalize_code(&program_code, "program code")?;
        let new_college_code = normalize_code(&payload.new_college_code, "new college code")?;
        let new_program_code = normalize_code(&payload.new_program_code, "new program code")?;
        let pool = database.pool()?;

        let update_result = sqlx::query(
            "UPDATE colleges_programs SET college_code = ?, program_code = ? WHERE college_code = ? AND program_code = ?",
        )
        .bind(&new_college_code)
        .bind(&new_program_code)
        .bind(&college_code)
        .bind(&program_code)
        .execute(&pool)
        .await
        .map_err(|error| database_error("Failed to update college-program link", error))?;

        if update_result.rows_affected() == 0 {
            return Err("College-program link was not found.".to_string());
        }

        Ok(CollegeProgramLink {
            college_code: new_college_code,
            program_code: new_program_code,
        })
    }

    pub async fn delete_program_link(
        database: &DatabaseModel,
        college_code: String,
        program_code: String,
    ) -> Result<bool, String> {
        let college_code = normalize_code(&college_code, "college code")?;
        let program_code = normalize_code(&program_code, "program code")?;
        let pool = database.pool()?;

        let delete_result = sqlx::query(
            "DELETE FROM colleges_programs WHERE college_code = ? AND program_code = ?",
        )
        .bind(&college_code)
        .bind(&program_code)
        .execute(&pool)
        .await
        .map_err(|error| database_error("Failed to delete college-program link", error))?;

        Ok(delete_result.rows_affected() > 0)
    }

    pub async fn list_program_links(
        database: &DatabaseModel,
    ) -> Result<Vec<CollegeProgramLink>, String> {
        let pool = database.pool()?;
        sqlx::query_as::<_, CollegeProgramLink>(
            "SELECT college_code, program_code FROM colleges_programs ORDER BY college_code, program_code",
        )
        .fetch_all(&pool)
        .await
        .map_err(|error| database_error("Failed to list college-program links", error))
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
