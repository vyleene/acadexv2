use crate::models::students_model::{
    CreateStudentPayload, Student, UpdateStudentPayload,
};
use crate::models::database_model::DatabaseModel;

pub struct StudentsRepository;

impl StudentsRepository {
    pub async fn create(
        database: &DatabaseModel,
        payload: CreateStudentPayload,
    ) -> Result<Student, String> {
        let id = normalize_student_id(payload.id)?;
        let program_code = normalize_code(&payload.program_code, "program code")?;
        let firstname = normalize_name(&payload.firstname, "student firstname", 128)?;
        let lastname = normalize_name(&payload.lastname, "student lastname", 128)?;
        let year = normalize_year(&payload.year)?;
        let gender = normalize_gender(&payload.gender)?;
        let pool = database.pool()?;

        sqlx::query(
            "INSERT INTO students (id, program_code, firstname, lastname, `year`, gender) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(id)
        .bind(&program_code)
        .bind(&firstname)
        .bind(&lastname)
        .bind(&year)
        .bind(&gender)
        .execute(&pool)
        .await
        .map_err(|error| database_error("Failed to create student", error))?;

        Ok(Student {
            id,
            firstname,
            lastname,
            year,
            gender,
            program_code: Some(program_code),
        })
    }

    pub async fn read(database: &DatabaseModel, id: i32) -> Result<Option<Student>, String> {
        let id = normalize_student_id(id)?;
        let pool = database.pool()?;

        sqlx::query_as::<_, Student>(
            r#"
            SELECT
                s.id,
                s.firstname,
                s.lastname,
                s.`year`,
                s.gender,
                s.program_code
            FROM students s
            WHERE s.id = ?
            "#,
        )
        .bind(id)
        .fetch_optional(&pool)
        .await
        .map_err(|error| database_error("Failed to read student", error))
    }

    pub async fn update(
        database: &DatabaseModel,
        id: i32,
        payload: UpdateStudentPayload,
    ) -> Result<Student, String> {
        let id = normalize_student_id(id)?;
        let program_code = normalize_code(&payload.program_code, "program code")?;
        let firstname = normalize_name(&payload.firstname, "student firstname", 128)?;
        let lastname = normalize_name(&payload.lastname, "student lastname", 128)?;
        let year = normalize_year(&payload.year)?;
        let gender = normalize_gender(&payload.gender)?;
        let pool = database.pool()?;

        let update_result = sqlx::query(
            "UPDATE students SET program_code = ?, firstname = ?, lastname = ?, `year` = ?, gender = ? WHERE id = ?",
        )
        .bind(&program_code)
        .bind(&firstname)
        .bind(&lastname)
        .bind(&year)
        .bind(&gender)
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|error| database_error("Failed to update student", error))?;

        if update_result.rows_affected() == 0 {
            return Err(not_found_error("Student", "id", id));
        }

        Ok(Student {
            id,
            firstname,
            lastname,
            year,
            gender,
            program_code: Some(program_code),
        })
    }

    pub async fn delete(database: &DatabaseModel, id: i32) -> Result<bool, String> {
        let id = normalize_student_id(id)?;
        let pool = database.pool()?;

        let delete_result = sqlx::query("DELETE FROM students WHERE id = ?")
            .bind(id)
            .execute(&pool)
            .await
            .map_err(|error| database_error("Failed to delete student", error))?;

        Ok(delete_result.rows_affected() > 0)
    }

    pub async fn list(database: &DatabaseModel) -> Result<Vec<Student>, String> {
        let pool = database.pool()?;
        sqlx::query_as::<_, Student>(
            r#"
            SELECT
                s.id,
                s.firstname,
                s.lastname,
                s.`year`,
                s.gender,
                s.program_code
            FROM students s
            ORDER BY s.lastname, s.firstname, s.id
            "#,
        )
        .fetch_all(&pool)
        .await
        .map_err(|error| database_error("Failed to list students", error))
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

fn normalize_student_id(id: i32) -> Result<i32, String> {
    if id <= 0 {
        return Err("student id must be a positive integer.".to_string());
    }

    Ok(id)
}

fn normalize_year(year: &str) -> Result<String, String> {
    let normalized = year.trim();

    match normalized {
        "1" | "2" | "3" | "4" => Ok(normalized.to_string()),
        _ => Err("student year must be one of: 1, 2, 3, 4.".to_string()),
    }
}

fn normalize_gender(gender: &str) -> Result<String, String> {
    let normalized = gender.trim().to_uppercase();

    match normalized.as_str() {
        "M" | "F" => Ok(normalized),
        _ => Err("student gender must be either M or F.".to_string()),
    }
}
