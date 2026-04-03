use serde::{Deserialize, Serialize};
use sqlx::{mysql::MySqlPoolOptions, MySqlPool};
use std::sync::RwLock;

const DEFAULT_DATABASE_HOST: &str = "localhost";
const DEFAULT_DATABASE_PORT: u16 = 3306;
const DEFAULT_DATABASE_NAME: &str = "acadex";
const DEFAULT_DATABASE_USERNAME: &str = "root";
const DEFAULT_DATABASE_PASSWORD: &str = "password";
const DEFAULT_MAX_CONNECTIONS: u32 = 10;
const SCHEMA_MIGRATION_SQL: &[&str] = &[
    r#"CREATE TABLE IF NOT EXISTS colleges (
        code char(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        name varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        PRIMARY KEY (code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"#,
    r#"CREATE TABLE IF NOT EXISTS programs (
        code char(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        name varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        college_code char(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
        PRIMARY KEY (code)
        , KEY college_code (college_code)
        , CONSTRAINT programs_ibfk_1 FOREIGN KEY (college_code) REFERENCES colleges (code) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"#,
    r#"CREATE TABLE IF NOT EXISTS students (
        id int NOT NULL,
        program_code char(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
        firstname varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        lastname varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        `year` enum('1','2','3','4') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        gender enum('M','F') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        PRIMARY KEY (id)
        , KEY program_code (program_code)
        , CONSTRAINT students_ibfk_1 FOREIGN KEY (program_code) REFERENCES programs (code) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"#,
];

#[derive(Debug, Clone, Deserialize)]
pub struct DatabaseConfigPayload {
    pub host: String,
    pub port: u16,
    pub database: String,
    pub username: String,
    pub password: String,
    pub max_connections: Option<u32>,
}

#[derive(Debug, Clone, Serialize)]
pub struct DatabaseStatus {
    pub configured: bool,
    pub host: Option<String>,
    pub port: Option<u16>,
    pub database: Option<String>,
    pub username: Option<String>,
    pub max_connections: Option<u32>,
}

#[derive(Debug, Clone)]
struct DatabaseConfig {
    host: String,
    port: u16,
    database: String,
    username: String,
    password: String,
    max_connections: u32,
}

#[derive(Debug)]
struct DatabaseState {
    config: Option<DatabaseConfig>,
    pool: Option<MySqlPool>,
}

#[derive(Debug)]
pub struct DatabaseModel {
    state: RwLock<DatabaseState>,
}

impl DatabaseModel {
    pub fn new() -> Self {
        Self {
            state: RwLock::new(DatabaseState {
                config: None,
                pool: None,
            }),
        }
    }

    pub async fn configure_placeholder(&self) -> Result<DatabaseStatus, String> {
        let config = DatabaseConfig::placeholder();
        self.configure_with(config).await
    }

    pub async fn configure(&self, payload: DatabaseConfigPayload) -> Result<DatabaseStatus, String> {
        let config = DatabaseConfig::from_payload(payload)?;
        self.configure_with(config).await
    }

    pub async fn test_connection(payload: DatabaseConfigPayload) -> Result<(), String> {
        let mut config = DatabaseConfig::from_payload(payload)?;
        config.max_connections = 1;
        let pool = Self::connect(&config).await?;
        pool.close().await;
        Ok(())
    }

    pub fn status(&self) -> Result<DatabaseStatus, String> {
        let state = self
            .state
            .read()
            .map_err(|_| "Database state lock is unavailable.".to_string())?;
        match &state.config {
            Some(config) => Ok(config.to_status(state.pool.is_some())),
            None => Ok(DatabaseStatus {
                configured: false,
                host: None,
                port: None,
                database: None,
                username: None,
                max_connections: None,
            }),
        }
    }

    pub fn pool(&self) -> Result<MySqlPool, String> {
        let state = self
            .state
            .read()
            .map_err(|_| "Database state lock is unavailable.".to_string())?;

        state
            .pool
            .clone()
            .ok_or_else(|| "MySQL database is not configured.".to_string())
    }

    pub async fn disconnect(&self) -> Result<(), String> {
        let pool = {
            let mut state = self
                .state
                .write()
                .map_err(|_| "Database state lock is unavailable.".to_string())?;
            state.config = None;
            state.pool.take()
        };

        if let Some(pool) = pool {
            pool.close().await;
        }

        Ok(())
    }

    pub async fn initialize_schema(&self) -> Result<(), String> {
        let pool = self.pool()?;
        for statement in SCHEMA_MIGRATION_SQL {
            sqlx::query(statement)
                .execute(&pool)
                .await
                .map_err(|error| format!("Failed to execute schema statement: {}", error))?;
        }
        Ok(())
    }

    async fn configure_with(&self, config: DatabaseConfig) -> Result<DatabaseStatus, String> {
        let pool = Self::connect(&config).await?;
        let mut state = self
            .state
            .write()
            .map_err(|_| "Database state lock is unavailable.".to_string())?;
        state.pool = Some(pool);
        state.config = Some(config.clone());
        Ok(config.to_status(true))
    }

    async fn connect(config: &DatabaseConfig) -> Result<MySqlPool, String> {
        MySqlPoolOptions::new()
            .max_connections(config.max_connections)
            .connect(&config.to_url())
            .await
            .map_err(|error| format!("Failed to connect to MySQL: {}", error))
    }
}

impl DatabaseConfig {
    fn placeholder() -> Self {
        Self {
            host: DEFAULT_DATABASE_HOST.to_string(),
            port: DEFAULT_DATABASE_PORT,
            database: DEFAULT_DATABASE_NAME.to_string(),
            username: DEFAULT_DATABASE_USERNAME.to_string(),
            password: DEFAULT_DATABASE_PASSWORD.to_string(),
            max_connections: DEFAULT_MAX_CONNECTIONS,
        }
    }

    fn from_payload(payload: DatabaseConfigPayload) -> Result<Self, String> {
        let host = normalize_required(&payload.host, "host")?;
        let database = normalize_required(&payload.database, "database")?;
        let username = normalize_required(&payload.username, "username")?;
        let max_connections = normalize_max_connections(payload.max_connections)?;

        if payload.port == 0 {
            return Err("port must be greater than 0.".to_string());
        }

        Ok(Self {
            host,
            port: payload.port,
            database,
            username,
            password: payload.password,
            max_connections,
        })
    }

    fn to_url(&self) -> String {
        format!(
            "mysql://{}:{}@{}:{}/{}",
            self.username, self.password, self.host, self.port, self.database
        )
    }

    fn to_status(&self, configured: bool) -> DatabaseStatus {
        DatabaseStatus {
            configured,
            host: Some(self.host.clone()),
            port: Some(self.port),
            database: Some(self.database.clone()),
            username: Some(self.username.clone()),
            max_connections: Some(self.max_connections),
        }
    }
}

fn normalize_required(value: &str, field_name: &str) -> Result<String, String> {
    let normalized = value.trim();

    if normalized.is_empty() {
        return Err(format!("{} is required.", field_name));
    }

    Ok(normalized.to_string())
}

fn normalize_max_connections(value: Option<u32>) -> Result<u32, String> {
    let connections = value.unwrap_or(DEFAULT_MAX_CONNECTIONS);

    if connections == 0 {
        return Err("max_connections must be at least 1.".to_string());
    }

    Ok(connections)
}
