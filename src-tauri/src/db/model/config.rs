use super::{DatabaseConfigPayload, DatabaseStatus};

const DEFAULT_DATABASE_HOST: &str = "localhost";
const DEFAULT_DATABASE_PORT: u16 = 3306;
const DEFAULT_DATABASE_NAME: &str = "acadex";
const DEFAULT_DATABASE_USERNAME: &str = "root";
const DEFAULT_DATABASE_PASSWORD: &str = "password";
const DEFAULT_MAX_CONNECTIONS: u32 = 10;

#[derive(Debug, Clone)]
pub(super) struct DatabaseConfig {
    pub(super) host: String,
    pub(super) port: u16,
    pub(super) database: String,
    pub(super) username: String,
    pub(super) password: String,
    pub(super) max_connections: u32,
}

impl DatabaseConfig {
    pub(super) fn placeholder() -> Self {
        Self {
            host: DEFAULT_DATABASE_HOST.to_string(),
            port: DEFAULT_DATABASE_PORT,
            database: DEFAULT_DATABASE_NAME.to_string(),
            username: DEFAULT_DATABASE_USERNAME.to_string(),
            password: DEFAULT_DATABASE_PASSWORD.to_string(),
            max_connections: DEFAULT_MAX_CONNECTIONS,
        }
    }

    pub(super) fn from_payload(payload: DatabaseConfigPayload) -> Result<Self, String> {
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

    pub(super) fn to_url(&self) -> String {
        format!(
            "mysql://{}:{}@{}:{}/{}",
            self.username, self.password, self.host, self.port, self.database
        )
    }

    pub(super) fn to_status(&self, configured: bool) -> DatabaseStatus {
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
