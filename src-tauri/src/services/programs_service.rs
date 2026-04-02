use crate::models::datatabase_model::DatabaseModel;
use crate::models::programs_model::{CreateProgramPayload, Program, UpdateProgramPayload};
use crate::repositories::programs_repository::ProgramsRepository;

pub struct ProgramsService;

impl ProgramsService {
    pub async fn create(
        database: &DatabaseModel,
        payload: CreateProgramPayload,
    ) -> Result<Program, String> {
        ProgramsRepository::create(database, payload).await
    }

    pub async fn read(database: &DatabaseModel, code: String) -> Result<Option<Program>, String> {
        ProgramsRepository::read(database, code).await
    }

    pub async fn update(
        database: &DatabaseModel,
        code: String,
        payload: UpdateProgramPayload,
    ) -> Result<Program, String> {
        ProgramsRepository::update(database, code, payload).await
    }

    pub async fn delete(database: &DatabaseModel, code: String) -> Result<bool, String> {
        ProgramsRepository::delete(database, code).await
    }

    pub async fn list(database: &DatabaseModel) -> Result<Vec<Program>, String> {
        ProgramsRepository::list(database).await
    }
}
