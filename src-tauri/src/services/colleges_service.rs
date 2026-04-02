use crate::models::colleges_model::{
    College, CollegeProgramLink, CreateCollegePayload, CreateCollegeProgramLinkPayload,
    UpdateCollegePayload, UpdateCollegeProgramLinkPayload,
};
use crate::models::datatabase_model::DatabaseModel;
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

    pub async fn create_program_link(
        database: &DatabaseModel,
        payload: CreateCollegeProgramLinkPayload,
    ) -> Result<CollegeProgramLink, String> {
        CollegesRepository::create_program_link(database, payload).await
    }

    pub async fn read_program_link(
        database: &DatabaseModel,
        college_code: String,
        program_code: String,
    ) -> Result<Option<CollegeProgramLink>, String> {
        CollegesRepository::read_program_link(database, college_code, program_code).await
    }

    pub async fn update_program_link(
        database: &DatabaseModel,
        college_code: String,
        program_code: String,
        payload: UpdateCollegeProgramLinkPayload,
    ) -> Result<CollegeProgramLink, String> {
        CollegesRepository::update_program_link(database, college_code, program_code, payload).await
    }

    pub async fn delete_program_link(
        database: &DatabaseModel,
        college_code: String,
        program_code: String,
    ) -> Result<bool, String> {
        CollegesRepository::delete_program_link(database, college_code, program_code).await
    }

    pub async fn list_program_links(
        database: &DatabaseModel,
    ) -> Result<Vec<CollegeProgramLink>, String> {
        CollegesRepository::list_program_links(database).await
    }
}
