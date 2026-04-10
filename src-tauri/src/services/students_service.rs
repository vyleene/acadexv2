use crate::models::database_model::DatabaseModel;
use crate::models::students_model::{CreateStudentPayload, Student, UpdateStudentPayload};
use crate::repositories::students_repository::StudentsRepository;

pub struct StudentsService;

impl StudentsService {
    pub async fn create(
        database: &DatabaseModel,
        payload: CreateStudentPayload,
    ) -> Result<Student, String> {
        StudentsRepository::create(database, payload).await
    }

    pub async fn read(database: &DatabaseModel, id: i32) -> Result<Option<Student>, String> {
        StudentsRepository::read(database, id).await
    }

    pub async fn update(
        database: &DatabaseModel,
        id: i32,
        payload: UpdateStudentPayload,
    ) -> Result<Student, String> {
        StudentsRepository::update(database, id, payload).await
    }

    pub async fn delete(database: &DatabaseModel, id: i32) -> Result<bool, String> {
        StudentsRepository::delete(database, id).await
    }

    pub async fn list(database: &DatabaseModel) -> Result<Vec<Student>, String> {
        StudentsRepository::list(database).await
    }
}
