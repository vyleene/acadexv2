mod config;
mod seeding;

use config::DatabaseConfig;
use serde::{Deserialize, Serialize};
use sqlx::{mysql::MySqlPoolOptions, MySqlPool};
use std::sync::RwLock;

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
        seeding::run_schema_migrations(&pool).await?;
        seeding::seed_initial_data(&pool).await?;
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
