use serde::{Deserialize, Serialize};
use sqlx::FromRow;


#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Program {
    pub code: String,
    pub name: String,
    pub college_code: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateProgramPayload {
    pub code: String,
    pub name: String,
    pub college_code: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProgramPayload {
    pub name: String,
    pub college_code: String,
}
