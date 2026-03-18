use sqlx::{mysql::MySqlPoolOptions, MySqlPool};
use std::env;

const DATABASE_URL_ENV: &str = "ACADEX_DATABASE_URL";
const DEFAULT_DATABASE_URL: &str = "mysql://root:password@localhost:3306/acadex";
const SCHEMA_MIGRATION_SQL: &[&str] = &[
    r#"CREATE TABLE IF NOT EXISTS colleges (
        code varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        name varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        PRIMARY KEY (code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"#,
    r#"CREATE TABLE IF NOT EXISTS programs (
        code varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        name varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        PRIMARY KEY (code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"#,
    r#"CREATE TABLE IF NOT EXISTS students (
        id int NOT NULL,
        firstname varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        lastname varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        `year` enum('1','2','3','4') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        gender enum('M','F') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"#,
    r#"CREATE TABLE IF NOT EXISTS colleges_programs (
        college_code varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        program_code varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        KEY college_code (college_code),
        KEY program_code (program_code),
        CONSTRAINT colleges_programs_ibfk_1 FOREIGN KEY (college_code) REFERENCES colleges (code) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT colleges_programs_ibfk_2 FOREIGN KEY (program_code) REFERENCES programs (code) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"#,
    r#"CREATE TABLE IF NOT EXISTS students_programs (
        student_id int NOT NULL,
        program_code varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        date_enrolled datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY program_code (program_code),
        KEY student_id (student_id),
        CONSTRAINT students_programs_ibfk_1 FOREIGN KEY (program_code) REFERENCES programs (code) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT students_programs_ibfk_2 FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"#,
];

#[derive(Debug, Clone)]
pub struct DatabaseModel {
    pool: MySqlPool,
}

impl DatabaseModel {
    pub fn from_env() -> Result<Self, String> {
        let database_url =
            env::var(DATABASE_URL_ENV).unwrap_or_else(|_| DEFAULT_DATABASE_URL.to_string());

        let pool = MySqlPoolOptions::new()
            .max_connections(10)
            .connect_lazy(&database_url)
            .map_err(|error| {
                format!(
                    "Failed to create MySQL pool. Set {} to a valid URL: {}",
                    DATABASE_URL_ENV, error
                )
            })?;

        Ok(Self { pool })
    }

    pub fn pool(&self) -> &MySqlPool {
        &self.pool
    }

    pub async fn initialize_schema(&self) -> Result<(), String> {
        for statement in SCHEMA_MIGRATION_SQL {
            sqlx::query(statement)
                .execute(&self.pool)
                .await
                .map_err(|error| format!("Failed to execute schema statement: {}", error))?;
        }
        Ok(())
    }
}
