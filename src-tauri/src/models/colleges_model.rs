use serde::{Deserialize, Serialize};
use sqlx::FromRow;


#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct College {
    pub code: String,
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateCollegePayload {
    pub code: String,
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCollegePayload {
    pub code: String,
    pub name: String,
}
