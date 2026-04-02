use crate::models::datatabase_model::DatabaseModel;
use crate::models::students_model::{
    CreateStudentPayload, CreateStudentProgramLinkPayload, Student, StudentProgramLink,
    UpdateStudentPayload, UpdateStudentProgramLinkPayload,
};
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

    pub async fn create_program_link(
        database: &DatabaseModel,
        payload: CreateStudentProgramLinkPayload,
    ) -> Result<StudentProgramLink, String> {
        StudentsRepository::create_program_link(database, payload).await
    }

    pub async fn read_program_link(
        database: &DatabaseModel,
        student_id: i32,
        program_code: String,
    ) -> Result<Option<StudentProgramLink>, String> {
        StudentsRepository::read_program_link(database, student_id, program_code).await
    }

    pub async fn update_program_link(
        database: &DatabaseModel,
        student_id: i32,
        program_code: String,
        payload: UpdateStudentProgramLinkPayload,
    ) -> Result<StudentProgramLink, String> {
        StudentsRepository::update_program_link(database, student_id, program_code, payload).await
    }

    pub async fn delete_program_link(
        database: &DatabaseModel,
        student_id: i32,
        program_code: String,
    ) -> Result<bool, String> {
        StudentsRepository::delete_program_link(database, student_id, program_code).await
    }

    pub async fn list_program_links(database: &DatabaseModel) -> Result<Vec<StudentProgramLink>, String> {
        StudentsRepository::list_program_links(database).await
    }
}
