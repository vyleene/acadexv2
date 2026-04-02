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
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct CollegeProgramLink {
    pub college_code: String,
    pub program_code: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateCollegeProgramLinkPayload {
    pub college_code: String,
    pub program_code: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCollegeProgramLinkPayload {
    pub new_college_code: String,
    pub new_program_code: String,
}
