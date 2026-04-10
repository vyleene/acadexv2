use crate::db::model::DatabaseModel;
use crate::models::colleges_model::{College, CreateCollegePayload, UpdateCollegePayload};
use crate::repositories::colleges_repository::CollegesRepository;

pub struct CollegesService;

impl CollegesService {
    pub async fn create(
        database: &DatabaseModel,
        payload: CreateCollegePayload,
    ) -> Result<College, String> {
        CollegesRepository::create(database, payload).await
    }

    pub async fn read(database: &DatabaseModel, code: String) -> Result<Option<College>, String> {
        CollegesRepository::read(database, code).await
    }

    pub async fn update(
        database: &DatabaseModel,
        code: String,
        payload: UpdateCollegePayload,
    ) -> Result<College, String> {
        CollegesRepository::update(database, code, payload).await
    }

    pub async fn delete(database: &DatabaseModel, code: String) -> Result<bool, String> {
        CollegesRepository::delete(database, code).await
    }

    pub async fn list(database: &DatabaseModel) -> Result<Vec<College>, String> {
        CollegesRepository::list(database).await
    }
}
