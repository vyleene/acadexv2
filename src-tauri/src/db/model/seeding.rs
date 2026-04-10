use sqlx::{MySql, MySqlPool, QueryBuilder};

const MIN_STUDENT_SEED_COUNT: i64 = 5000;
const STUDENT_SEED_BATCH_SIZE: i64 = 500;
const STUDENT_SEED_START_ID: i32 = 20240000;
const SEEDED_COLLEGES: &[(&str, &str)] = &[
    ("CASS", "College of Arts and Science"),
    ("CCS", "College of Computer Science"),
    (
        "CEBA",
        "College of Business Administration and Accountancy",
    ),
    ("CED", "College of Education"),
    ("CHS", "College of Health Sciences"),
    ("COE", "College of Engineering and Technology"),
    ("CSM", "College of Science and Mathematics"),
];
const SEEDED_PROGRAMS: &[(&str, &str, &str)] = &[
    ("BAELS", "Bachelor of Arts in English Language Studies", "CASS"),
    ("BAFil", "Batsilyer ng Sining sa Filipino", "CASS"),
    ("BAHis", "Bachelor of Arts in History", "CASS"),
    ("BALCS", "Bachelor of Arts in Literary and Cultural Studies", "CASS"),
    ("BAPan", "Batsilyer ng Sining sa Panitikan", "CASS"),
    ("BAPos", "Bachelor of Arts in Political Science", "CASS"),
    ("BAPsych", "Bachelor of Arts in Psychology", "CASS"),
    ("BASoc", "Bachelor of Arts in Sociology", "CASS"),
    (
        "BEEd-LE",
        "Bachelor of Elementary Education Major in Language Education",
        "CED",
    ),
    (
        "BEEd-SM",
        "Bachelor of Elementary Education Major in Science and Mathematics",
        "CED",
    ),
    (
        "BET-CET",
        "Bachelor of Engineering Technology Major in Civil Engineering Technology",
        "COE",
    ),
    (
        "BET-CHET",
        "Bachelor of Engineering Technology Major in Chemical Engineering Technology",
        "COE",
    ),
    (
        "BET-ELET",
        "Bachelor of Engineering Technology Major in Electrical Engineering Technology",
        "COE",
    ),
    (
        "BET-ESET",
        "Bachelor of Engineering Technology Major in Electronics Engineering Technology",
        "COE",
    ),
    (
        "BET-MET",
        "Bachelor of Engineering Technology Major in Mechanical Engineering Technology",
        "COE",
    ),
    (
        "BET-MMT",
        "Bachelor of Engineering Technology Major in Metallurgical and Materials Engineering Technology",
        "COE",
    ),
    ("BPEd", "Bachelor of Physical Education", "CED"),
    ("BS-MB", "Bachelor of Science in Marine Biology", "CSM"),
    ("BSA", "Bachelor of Science in Accountancy", "CEBA"),
    (
        "BSBA-BE",
        "Bachelor of Science in Business Administration Major in Business Economics",
        "CEBA",
    ),
    (
        "BSBA-MM",
        "Bachelor of Science in Business Administration Major in Marketing Management",
        "CEBA",
    ),
    (
        "BSBio-AB",
        "Bachelor of Science in Biology Major in Animal Biology",
        "CSM",
    ),
    (
        "BSBio-Bdv",
        "Bachelor of Science in Biology Major in Biodiversity",
        "CSM",
    ),
    (
        "BSBio-Micro",
        "Bachelor of Science in Biology Major in Microbiology",
        "CSM",
    ),
    (
        "BSBio-PB",
        "Bachelor of Science in Biology Major in Plant Biology",
        "CSM",
    ),
    ("BSCA", "Bachelor of Science in Computer Application", "CCS"),
    ("BSCE", "Bachelor of Science in Civil Engineering", "COE"),
    ("BSCERE", "Bachelor of Science in Ceramic Engineering", "COE"),
    ("BSCHE", "Bachelor of Science in Chemical Engineering", "COE"),
    ("BSChem", "Bachelor of Science in Chemistry", "CSM"),
    ("BSCPE", "Bachelor of Science in Computer Engineering", "COE"),
    ("BSCS", "Bachelor of Science in Computer Science", "CCS"),
    ("BSEcon", "Bachelor of Science in Economics", "CEBA"),
    (
        "BSEd-Bio",
        "Bachelor of Secondary Education Major in Biology",
        "CED",
    ),
    (
        "BSEd-Chem",
        "Bachelor of Secondary Education Major in Chemistry",
        "CED",
    ),
    (
        "BSEd-Fil",
        "Bachelor of Secondary Education Major in Filipino",
        "CED",
    ),
    (
        "BSEd-Math",
        "Bachelor of Secondary Education Major in Mathematics",
        "CED",
    ),
    (
        "BSEd-Phys",
        "Bachelor of Secondary Education Major in Physics",
        "CED",
    ),
    ("BSEE", "Bachelor of Science in Electrical Engineering", "COE"),
    ("BSEM", "Bachelor of Science in Mining Engineering", "COE"),
    ("BSEnE", "Bachelor of Science in Environmental Engineering", "COE"),
    ("BSEntrep", "Bachelor of Science in Entrepreneurship", "CEBA"),
    ("BSEsE", "Bachelor of Science in Electronics Engineering", "COE"),
    ("BSHM", "Bachelor of Science in Hospitality Management", "CEBA"),
    (
        "BSIAM",
        "Bachelor of Science in Industrial Automation and Mechatronics",
        "COE",
    ),
    ("BSIS", "Bachelor of Science in Information System", "CCS"),
    ("BSIT", "Bachelor of Science in Information Technology", "CCS"),
    ("BSMath", "Bachelor of Science in Mathematics", "CSM"),
    ("BSME", "Bachelor of Science in Mechanical Engineering", "COE"),
    (
        "BSMETE",
        "Bachelor of Science in Metallurgical Engineering",
        "COE",
    ),
    ("BSN", "Bachelor of Science in Nursing", "CHS"),
    (
        "BSPhil",
        "Bachelor of Science in Philosophy Applied Ethics",
        "CASS",
    ),
    ("BSPhys", "Bachelor of Science in Physics", "CSM"),
    ("BSPsych", "Bachelor of Science in Psychology", "CASS"),
    ("BSStat", "Bachelor of Science in Statistics", "CSM"),
    (
        "BTLEd-HE",
        "Bachelor of Technology and Livelihood Education Major in Home Economics",
        "CED",
    ),
    (
        "BTLEd-IA",
        "Bachelor of Technology and Livelihood Education Major in Industrial Arts",
        "CED",
    ),
    (
        "BTVTEd-DT",
        "Bachelor of Technical-Vocational Teacher Education Major in Drafting Technology",
        "CED",
    ),
];
const STUDENT_FIRST_NAMES: &[&str] = &[
    "Alex", "Avery", "Blake", "Casey", "Cameron", "Dakota", "Devon", "Drew", "Elliot", "Emerson",
    "Finley", "Harper", "Hayden", "Jamie", "Jordan", "Kai", "Logan", "Morgan", "Parker", "Quinn",
    "Reese", "Riley", "Rowan", "Sage", "Shawn", "Taylor", "Skyler", "Tristan", "Wesley", "Zion",
];
const STUDENT_LAST_NAMES: &[&str] = &[
    "Santos", "Reyes", "Cruz", "Garcia", "Mendoza", "Torres", "Ramos", "Navarro", "Aquino", "Castro",
    "Flores", "Manalo", "Salazar", "Dela Cruz", "Molina", "Bautista", "Pascual", "Villanueva", "Soriano", "Francisco",
    "Velasco", "Luna", "Mercado", "Del Rosario", "Domingo", "Santiago", "Gonzales", "Escobar", "Abad", "Ferrer",
];
const SCHEMA_MIGRATION_SQL: &[&str] = &[
    r#"CREATE TABLE IF NOT EXISTS colleges (
        code char(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        name varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        PRIMARY KEY (code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"#,
    r#"CREATE TABLE IF NOT EXISTS programs (
        code char(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        name varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        college_code char(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
        PRIMARY KEY (code)
        , KEY college_code (college_code)
        , CONSTRAINT programs_ibfk_1 FOREIGN KEY (college_code) REFERENCES colleges (code) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"#,
    r#"CREATE TABLE IF NOT EXISTS students (
        id int NOT NULL,
        program_code char(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
        firstname varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        lastname varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        `year` enum('1','2','3','4') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        gender enum('M','F') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        PRIMARY KEY (id)
        , KEY program_code (program_code)
        , CONSTRAINT students_ibfk_1 FOREIGN KEY (program_code) REFERENCES programs (code) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"#,
];

pub(super) async fn run_schema_migrations(pool: &MySqlPool) -> Result<(), String> {
    for statement in SCHEMA_MIGRATION_SQL {
        sqlx::query(statement)
            .execute(pool)
            .await
            .map_err(|error| format!("Failed to execute schema statement: {}", error))?;
    }

    Ok(())
}

pub(super) async fn seed_initial_data(pool: &MySqlPool) -> Result<(), String> {
    seed_colleges(pool).await?;
    seed_programs(pool).await?;
    seed_students(pool, MIN_STUDENT_SEED_COUNT).await?;
    Ok(())
}

async fn seed_colleges(pool: &MySqlPool) -> Result<(), String> {
    for &(code, name) in SEEDED_COLLEGES {
        sqlx::query(
            "INSERT INTO colleges (code, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)",
        )
        .bind(code)
        .bind(name)
        .execute(pool)
        .await
        .map_err(|error| format!("Failed to seed colleges: {}", error))?;
    }

    Ok(())
}

async fn seed_programs(pool: &MySqlPool) -> Result<(), String> {
    for &(code, name, college_code) in SEEDED_PROGRAMS {
        sqlx::query(
            "INSERT INTO programs (code, name, college_code) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), college_code = VALUES(college_code)",
        )
        .bind(code)
        .bind(name)
        .bind(college_code)
        .execute(pool)
        .await
        .map_err(|error| format!("Failed to seed programs: {}", error))?;
    }

    Ok(())
}

async fn seed_students(pool: &MySqlPool, minimum_count: i64) -> Result<(), String> {
    if minimum_count <= 0 {
        return Ok(());
    }

    let existing_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM students")
        .fetch_one(pool)
        .await
        .map_err(|error| format!("Failed to read student count: {}", error))?;

    if existing_count >= minimum_count {
        return Ok(());
    }

    let program_codes: Vec<String> = sqlx::query_scalar("SELECT code FROM programs ORDER BY code")
        .fetch_all(pool)
        .await
        .map_err(|error| format!("Failed to read program codes for seeding: {}", error))?;

    if program_codes.is_empty() {
        return Err(
            "Cannot seed students because no programs are available in the database.".to_string(),
        );
    }

    let max_student_id: Option<i32> = sqlx::query_scalar("SELECT MAX(id) FROM students")
        .fetch_one(pool)
        .await
        .map_err(|error| format!("Failed to read max student id: {}", error))?;

    let mut next_student_id = max_student_id
        .unwrap_or(STUDENT_SEED_START_ID - 1)
        .max(STUDENT_SEED_START_ID - 1);

    let mut remaining = minimum_count - existing_count;
    let mut generated_index = existing_count as usize;
    let mut transaction = pool
        .begin()
        .await
        .map_err(|error| format!("Failed to start student seeding transaction: {}", error))?;

    while remaining > 0 {
        let batch_size = remaining.min(STUDENT_SEED_BATCH_SIZE);
        let mut query_builder = QueryBuilder::<MySql>::new(
            "INSERT INTO students (id, program_code, firstname, lastname, `year`, gender) ",
        );

        query_builder.push_values(0..batch_size, |mut builder, offset| {
            next_student_id += 1;

            let row_index = generated_index + offset as usize;
            let program_code = &program_codes[row_index % program_codes.len()];
            let firstname = STUDENT_FIRST_NAMES[row_index % STUDENT_FIRST_NAMES.len()];
            let lastname =
                STUDENT_LAST_NAMES[(row_index / STUDENT_FIRST_NAMES.len()) % STUDENT_LAST_NAMES.len()];
            let year = match row_index % 4 {
                0 => "1",
                1 => "2",
                2 => "3",
                _ => "4",
            };
            let gender = if row_index % 2 == 0 { "M" } else { "F" };

            builder
                .push_bind(next_student_id)
                .push_bind(program_code)
                .push_bind(firstname)
                .push_bind(lastname)
                .push_bind(year)
                .push_bind(gender);
        });

        query_builder
            .build()
            .execute(&mut *transaction)
            .await
            .map_err(|error| format!("Failed to seed students: {}", error))?;

        remaining -= batch_size;
        generated_index += batch_size as usize;
    }

    transaction
        .commit()
        .await
        .map_err(|error| format!("Failed to commit student seeding transaction: {}", error))?;

    Ok(())
}
