import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Check if the schema already exists (MSSQL-specific)
  const schemaExists = await sql`
    SELECT 1 AS exists
    FROM sys.schemas
    WHERE name = 'ecr_viewer'
  `.execute(db);

  if (!schemaExists.rows.length) {
    // If schema doesn't exist (unlikely in production), create it
    await sql`CREATE SCHEMA ecr_viewer`.execute(db);
    await sql`
      CREATE TABLE ecr_viewer.ecr_data (
        eICR_ID VARCHAR(200) PRIMARY KEY,
        set_id VARCHAR(255),
        fhir_reference_link VARCHAR(255),
        last_name VARCHAR(255),
        first_name VARCHAR(255),
        birth_date DATE,
        gender VARCHAR(50),
        birth_sex VARCHAR(50),
        gender_identity VARCHAR(50),
        race VARCHAR(255),
        ethnicity VARCHAR(255),
        latitude FLOAT,
        longitude FLOAT,
        homelessness_status VARCHAR(255),
        disabilities VARCHAR(255),
        tribal_affiliation VARCHAR(255),
        tribal_enrollment_status VARCHAR(255),
        current_job_title VARCHAR(255),
        current_job_industry VARCHAR(255),
        usual_occupation VARCHAR(255),
        usual_industry VARCHAR(255),
        preferred_language VARCHAR(255),
        pregnancy_status VARCHAR(255),
        rr_id VARCHAR(255),
        processing_status VARCHAR(255),
        eicr_version_number VARCHAR(50),
        authoring_date DATETIME,
        authoring_provider VARCHAR(255),
        provider_id VARCHAR(255),
        facility_id VARCHAR(255),
        facility_name VARCHAR(255),
        encounter_type VARCHAR(255),
        encounter_start_date DATETIME,
        encounter_end_date DATETIME,
        reason_for_visit VARCHAR(MAX),
        active_problems VARCHAR(MAX),
        date_created DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
      );
      -- Add other tables (patient_address, ecr_rr_conditions, etc.)...
    `.execute(db);
  } else {
    console.log('Extended schema already exists. Marking migration as applied.');
    // No-op for existing production environments
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP SCHEMA ecr_viewer CASCADE`.execute(db);
}
