use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use crate::models::datatabase_model::DatabaseModel;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Student {
    pub id: i32,
    pub firstname: String,
    pub lastname: String,
    pub year: String,
    pub gender: String,
    pub program_code: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateStudentPayload {
    pub id: i32,
    pub firstname: String,
    pub lastname: String,
    pub year: String,
    pub gender: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStudentPayload {
    pub firstname: String,
    pub lastname: String,
    pub year: String,
    pub gender: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct StudentProgramLink {
    pub student_id: i32,
    pub program_code: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateStudentProgramLinkPayload {
    pub student_id: i32,
    pub program_code: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStudentProgramLinkPayload {
    pub new_student_id: i32,
    pub new_program_code: String,
}

pub struct StudentsModel;

impl StudentsModel {
    pub async fn create(
        database: &DatabaseModel,
        payload: CreateStudentPayload,
    ) -> Result<Student, String> {
        let id = normalize_student_id(payload.id)?;
        let firstname = normalize_name(&payload.firstname, "student firstname", 32)?;
        let lastname = normalize_name(&payload.lastname, "student lastname", 32)?;
        let year = normalize_year(&payload.year)?;
        let gender = normalize_gender(&payload.gender)?;

        sqlx::query(
            "INSERT INTO students (id, firstname, lastname, `year`, gender) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(id)
        .bind(&firstname)
        .bind(&lastname)
        .bind(&year)
        .bind(&gender)
        .execute(database.pool())
        .await
        .map_err(|error| database_error("Failed to create student", error))?;

        Ok(Student {
            id,
            firstname,
            lastname,
            year,
            gender,
            program_code: None,
        })
    }

    pub async fn read(database: &DatabaseModel, id: i32) -> Result<Option<Student>, String> {
        let id = normalize_student_id(id)?;

        sqlx::query_as::<_, Student>(
            r#"
            SELECT
                s.id,
                s.firstname,
                s.lastname,
                s.`year`,
                s.gender,
                (
                    SELECT sp.program_code
                    FROM students_programs sp
                    WHERE sp.student_id = s.id
                    ORDER BY sp.date_enrolled DESC, sp.program_code DESC
                    LIMIT 1
                ) AS program_code
            FROM students s
            WHERE s.id = ?
            "#,
        )
        .bind(id)
        .fetch_optional(database.pool())
        .await
        .map_err(|error| database_error("Failed to read student", error))
    }

    pub async fn update(
        database: &DatabaseModel,
        id: i32,
        payload: UpdateStudentPayload,
    ) -> Result<Student, String> {
        let id = normalize_student_id(id)?;
        let firstname = normalize_name(&payload.firstname, "student firstname", 20)?;
        let lastname = normalize_name(&payload.lastname, "student lastname", 20)?;
        let year = normalize_year(&payload.year)?;
        let gender = normalize_gender(&payload.gender)?;

        let update_result = sqlx::query(
            "UPDATE students SET firstname = ?, lastname = ?, `year` = ?, gender = ? WHERE id = ?",
        )
        .bind(&firstname)
        .bind(&lastname)
        .bind(&year)
        .bind(&gender)
        .bind(id)
        .execute(database.pool())
        .await
        .map_err(|error| database_error("Failed to update student", error))?;

        if update_result.rows_affected() == 0 {
            return Err(format!("Student with id '{}' was not found.", id));
        }

        Ok(Student {
            id,
            firstname,
            lastname,
            year,
            gender,
            program_code: None,
        })
    }

    pub async fn delete(database: &DatabaseModel, id: i32) -> Result<bool, String> {
        let id = normalize_student_id(id)?;

        let delete_result = sqlx::query("DELETE FROM students WHERE id = ?")
            .bind(id)
            .execute(database.pool())
            .await
            .map_err(|error| database_error("Failed to delete student", error))?;

        Ok(delete_result.rows_affected() > 0)
    }

    pub async fn list(database: &DatabaseModel) -> Result<Vec<Student>, String> {
        sqlx::query_as::<_, Student>(
            r#"
            SELECT
                s.id,
                s.firstname,
                s.lastname,
                s.`year`,
                s.gender,
                (
                    SELECT sp.program_code
                    FROM students_programs sp
                    WHERE sp.student_id = s.id
                    ORDER BY sp.date_enrolled DESC, sp.program_code DESC
                    LIMIT 1
                ) AS program_code
            FROM students s
            ORDER BY s.lastname, s.firstname, s.id
            "#,
        )
        .fetch_all(database.pool())
        .await
        .map_err(|error| database_error("Failed to list students", error))
    }

    pub async fn create_program_link(
        database: &DatabaseModel,
        payload: CreateStudentProgramLinkPayload,
    ) -> Result<StudentProgramLink, String> {
        let student_id = normalize_student_id(payload.student_id)?;
        let program_code = normalize_code(&payload.program_code, "program code")?;

        sqlx::query("INSERT INTO students_programs (student_id, program_code) VALUES (?, ?)")
            .bind(student_id)
            .bind(&program_code)
            .execute(database.pool())
            .await
            .map_err(|error| database_error("Failed to create student-program link", error))?;

        Ok(StudentProgramLink {
            student_id,
            program_code,
        })
    }

    pub async fn read_program_link(
        database: &DatabaseModel,
        student_id: i32,
        program_code: String,
    ) -> Result<Option<StudentProgramLink>, String> {
        let student_id = normalize_student_id(student_id)?;
        let program_code = normalize_code(&program_code, "program code")?;

        sqlx::query_as::<_, StudentProgramLink>(
            "SELECT student_id, program_code FROM students_programs WHERE student_id = ? AND program_code = ?",
        )
        .bind(student_id)
        .bind(&program_code)
        .fetch_optional(database.pool())
        .await
        .map_err(|error| database_error("Failed to read student-program link", error))
    }

    pub async fn update_program_link(
        database: &DatabaseModel,
        student_id: i32,
        program_code: String,
        payload: UpdateStudentProgramLinkPayload,
    ) -> Result<StudentProgramLink, String> {
        let student_id = normalize_student_id(student_id)?;
        let program_code = normalize_code(&program_code, "program code")?;
        let new_student_id = normalize_student_id(payload.new_student_id)?;
        let new_program_code = normalize_code(&payload.new_program_code, "new program code")?;

        let update_result = sqlx::query(
            "UPDATE students_programs SET student_id = ?, program_code = ? WHERE student_id = ? AND program_code = ?",
        )
        .bind(new_student_id)
        .bind(&new_program_code)
        .bind(student_id)
        .bind(&program_code)
        .execute(database.pool())
        .await
        .map_err(|error| database_error("Failed to update student-program link", error))?;

        if update_result.rows_affected() == 0 {
            return Err("Student-program link was not found.".to_string());
        }

        Ok(StudentProgramLink {
            student_id: new_student_id,
            program_code: new_program_code,
        })
    }

    pub async fn delete_program_link(
        database: &DatabaseModel,
        student_id: i32,
        program_code: String,
    ) -> Result<bool, String> {
        let student_id = normalize_student_id(student_id)?;
        let program_code = normalize_code(&program_code, "program code")?;

        let delete_result =
            sqlx::query("DELETE FROM students_programs WHERE student_id = ? AND program_code = ?")
                .bind(student_id)
                .bind(&program_code)
                .execute(database.pool())
                .await
                .map_err(|error| database_error("Failed to delete student-program link", error))?;

        Ok(delete_result.rows_affected() > 0)
    }

    pub async fn list_program_links(database: &DatabaseModel) -> Result<Vec<StudentProgramLink>, String> {
        sqlx::query_as::<_, StudentProgramLink>(
            "SELECT student_id, program_code FROM students_programs ORDER BY student_id, program_code",
        )
        .fetch_all(database.pool())
        .await
        .map_err(|error| database_error("Failed to list student-program links", error))
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

fn database_error(context: &str, error: sqlx::Error) -> String {
    format!("{}: {}", context, error)
}
