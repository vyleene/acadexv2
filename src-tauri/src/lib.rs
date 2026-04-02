mod controllers;
mod models;
mod repositories;
mod services;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let database_model = models::datatabase_model::DatabaseModel::new();
    tauri::async_runtime::block_on(async {
        database_model.configure_placeholder().await
    })
    .expect("failed to configure MySQL database model");

    tauri::Builder::default()
        .manage(database_model)
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            controllers::database_controller::initialize_mysql_schema,
            controllers::database_controller::configure_mysql_database,
            controllers::database_controller::get_mysql_database_status,
            controllers::database_controller::test_mysql_database_connection,
            controllers::colleges_controller::create_college,
            controllers::colleges_controller::read_college,
            controllers::colleges_controller::update_college,
            controllers::colleges_controller::delete_college,
            controllers::colleges_controller::list_colleges,
            controllers::programs_controller::create_program,
            controllers::programs_controller::read_program,
            controllers::programs_controller::update_program,
            controllers::programs_controller::delete_program,
            controllers::programs_controller::list_programs,
            controllers::colleges_controller::create_college_program_link,
            controllers::colleges_controller::read_college_program_link,
            controllers::colleges_controller::update_college_program_link,
            controllers::colleges_controller::delete_college_program_link,
            controllers::colleges_controller::list_college_program_links,
            controllers::students_controller::create_student,
            controllers::students_controller::read_student,
            controllers::students_controller::update_student,
            controllers::students_controller::delete_student,
            controllers::students_controller::list_students,
            controllers::students_controller::create_student_program_link,
            controllers::students_controller::read_student_program_link,
            controllers::students_controller::update_student_program_link,
            controllers::students_controller::delete_student_program_link,
            controllers::students_controller::list_student_program_links
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
