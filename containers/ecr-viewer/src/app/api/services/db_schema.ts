import { Kysely, sql } from "kysely";
import { db } from "./database";
import { Core } from "./core_types";
import { Extended } from "./extended_types";

/**
 * Builds the extended schema to a test database
 * @async
 * @function buildExtended
 */
export const buildExtended = async () => {
    await (db as Kysely<Extended>).schema
      .createTable("ecr_data")
      .addColumn("eICR_ID", "varchar(200)", (cb) => cb.primaryKey())
      .addColumn("set_id", "varchar(255)")
      .addColumn("fhir_reference_link", "varchar(255)")
      .addColumn("last_name", "varchar(255)", (cb) => cb.notNull())
      .addColumn("first_name", "varchar(255)", (cb) => cb.notNull())
      .addColumn("birth_date", "date", (cb) => cb.notNull())
      .addColumn("gender", "varchar(100)")
      .addColumn("birth_sex", "varchar(255)")
      .addColumn("gender_identity", "varchar(255)")
      .addColumn("race", "varchar(255)")
      .addColumn("ethnicity", "varchar(255)")
      .addColumn("latitude", "numeric")
      .addColumn("longitude", "numeric")
      .addColumn("homelessness_status", "varchar(255)")
      .addColumn("disabilities", "varchar(255)")
      .addColumn("tribal_affiliation", "varchar(255)")
      .addColumn("tribal_enrollment_status", "varchar(255)")
      .addColumn("current_job_title", "varchar(255)")
      .addColumn("current_job_industry", "varchar(255)")
      .addColumn("usual_occupation", "varchar(255)")
      .addColumn("usual_industry", "varchar(255)")
      .addColumn("preferred_language", "varchar(255)")
      .addColumn("pregnancy_status", "varchar(255)")
      .addColumn("rr_id", "varchar(255)")
      .addColumn("processing_status", "varchar(255)")
      .addColumn("eicr_version_number", "varchar(50)")
      .addColumn("authoring_date", "date")
      .addColumn("authoring_provider", "varchar(255)")
      .addColumn("provider_id", "varchar(255)")
      .addColumn("facility_id", "varchar(255)")
      .addColumn("facility_name", "varchar(255)")
      .addColumn("encounter_type", "varchar(255)")
      .addColumn("encounter_start_date", "date")
      .addColumn("encounter_end_date", "date")
      .addColumn("reason_for_visit", "text")
      .addColumn("active_problems", "text")
      .addColumn("date_created", "timestamptz", (cb) =>
        cb.notNull().defaultTo(sql`NOW()`),
      )
      .execute();
    await (db as Kysely<Extended>).schema
      .createTable("patient_address")
      .addColumn("uuid", "varchar(200)", (cb) => cb.primaryKey())
      .addColumn("use", "varchar(50)")
      .addColumn("type", "varchar(50)")
      .addColumn("text", "varchar(255)")
      .addColumn("line", "varchar(255)")
      .addColumn("city", "varchar(100)")
      .addColumn("district", "varchar(100)")
      .addColumn("state", "varchar(100)")
      .addColumn("postal_code", "varchar(20)")
      .addColumn("country", "varchar(100)")
      .addColumn("period_start", "date")
      .addColumn("period_end", "date")
      .addColumn("eICR_ID", "varchar(200)")
      .execute();
    await (db as Kysely<Extended>).schema
      .createTable("ecr_labs")
      .addColumn("uuid", "varchar(200)", (cb) => cb.primaryKey())
      .addColumn("eICR_ID", "varchar(200)")
      .addColumn("test_type", "varchar(255)")
      .addColumn("test_type_code", "varchar(255)")
      .addColumn("test_type_system", "varchar(255)")
      .addColumn("test_result_qualitative", "varchar(255)")
      .addColumn("test_result_quantitative", "numeric")
      .addColumn("test_result_units", "varchar(50)")
      .addColumn("test_result_code", "varchar(255)")
      .addColumn("test_result_code_display", "varchar(255)")
      .addColumn("test_result_code_system", "varchar(255)")
      .addColumn("test_result_interpretation", "varchar(255)")
      .addColumn("test_result_interpretation_code", "varchar(255)")
      .addColumn("test_result_interpretation_system", "varchar(255)")
      .addColumn("test_result_reference_range_low_value", "numeric")
      .addColumn("test_result_reference_range_low_units", "varchar(50)")
      .addColumn("test_result_reference_range_high_value", "numeric")
      .addColumn("test_result_reference_range_high_units", "varchar(50)")
      .addColumn("specimen_type", "varchar(255)")
      .addColumn("specimen_collection_date", "date")
      .addColumn("performing_lab", "varchar(255)")
      .execute();
    await (db as Kysely<Extended>).schema
      .createTable("ecr_rr_conditions")
      .addColumn("uuid", "varchar(200)", (cb) => cb.primaryKey())
      .addColumn("eICR_ID", "varchar(255)", (cb) => cb.notNull())
      .addColumn("condition", "varchar")
      .execute();
    await (db as Kysely<Extended>).schema
      .createTable("ecr_rr_rule_summaries")
      .addColumn("uuid", "varchar(200)", (cb) => cb.primaryKey())
      .addColumn("ecr_rr_conditions_id", "varchar(200)")
      .addColumn("rule_summary", "varchar")
      .execute();
}

/**
 * Drops the extended schema from a test database
 * @async
 * @function dropExtended
 */
export const dropExtended = async () => {
    await (db as Kysely<Extended>).schema.dropTable("ecr_data").execute();
    await (db as Kysely<Extended>).schema.dropTable("patient_address").execute();
    await (db as Kysely<Extended>).schema.dropTable("ecr_labs").execute();
    await (db as Kysely<Extended>).schema.dropTable("ecr_rr_conditions").execute();
    await (db as Kysely<Extended>).schema.dropTable("ecr_rr_rule_summaries").execute();
}

/**
 * Clears the extended schema tables on a test database
 * @async
 * @function clearExtended
 */
export const clearExtended = async () => {
    await (db as Kysely<Extended>).deleteFrom("ecr_data").execute();
    await (db as Kysely<Extended>).deleteFrom("patient_address").execute();
    await (db as Kysely<Extended>).deleteFrom("ecr_labs").execute();
    await (db as Kysely<Extended>).deleteFrom("ecr_rr_conditions").execute();
    await (db as Kysely<Extended>).deleteFrom("ecr_rr_rule_summaries").execute();
}

/**
 * Builds the core schema to a test database
 * @async
 * @function buildCore
 */
export const buildCore = async () => {
    await (db as Kysely<Core>).schema
      .createTable("ecr_data")
      .addColumn("eICR_ID", "varchar(200)", (cb) => cb.primaryKey())
      .addColumn("set_id", "varchar(255)")
      .addColumn("eicr_version_number", "varchar(50)")
      .addColumn("data_source", "varchar(2)", (cb) => cb.notNull()) // S3 or DB
      .addColumn("fhir_reference_link", "varchar(500)")
      .addColumn("patient_name_first", "varchar(100)", (cb) => cb.notNull())
      .addColumn("patient_name_last", "varchar(100)", (cb) => cb.notNull())
      .addColumn("patient_birth_date", "date", (cb) => cb.notNull())
      .addColumn("date_created", "timestamptz", (cb) =>
        cb.notNull().defaultTo(sql`NOW()`),
      )
      .addColumn("report_date", "date", (cb) => cb.notNull())
      .execute();
    await (db as Kysely<Core>).schema
      .createTable("ecr_rr_conditions")
      .addColumn("uuid", "varchar(200)", (cb) => cb.primaryKey())
      .addColumn("eICR_ID", "varchar(255)", (cb) => cb.notNull())
      .addColumn("condition", "varchar")
      .execute();
    await (db as Kysely<Core>).schema
      .createTable("ecr_rr_rule_summaries")
      .addColumn("uuid", "varchar(200)", (cb) => cb.primaryKey())
      .addColumn("ecr_rr_conditions_id", "varchar(200)")
      .addColumn("rule_summary", "varchar")
      .execute();
}

/**
 * Drops the core schema from a test database
 * @async
 * @function dropCore
 */
export const dropCore = async () => {
    await (db as Kysely<Core>).schema.dropTable("ecr_data").execute();
    await (db as Kysely<Core>).schema.dropTable("ecr_rr_conditions").execute();
    await (db as Kysely<Core>).schema.dropTable("ecr_rr_rule_summaries").execute();
}

/**
 * Clears the core schema tables on a test database
 * @async
 * @function clearCore
 */
export const clearCore = async () => {
    await (db as Kysely<Core>).deleteFrom("ecr_data").execute();
    await (db as Kysely<Core>).deleteFrom("ecr_rr_conditions").execute();
    await (db as Kysely<Core>).deleteFrom("ecr_rr_rule_summaries").execute();
}

/**
 * Builds the aliased schema to a test database
 * @async
 * @function buildCoreAlias
 */
export const buildCoreAlias = async () => {
    await db.schema
      .createTable("ecr_viewer.ecr_data")
      .addColumn("eicr_id", "varchar(200)", (cb) => cb.primaryKey())
      .addColumn("set_id", "varchar(255)")
      .addColumn("eicr_version_number", "varchar(50)")
      .addColumn("data_source", "varchar(2)") // S3 or DB
      .addColumn("fhir_reference_link", "varchar(500)")
      .addColumn("patient_name_first", "varchar(100)")
      .addColumn("patient_name_last", "varchar(100)")
      .addColumn("patient_birth_date", "date")
      .addColumn("date_created", "timestamptz", (cb) =>
        cb.notNull().defaultTo(sql`NOW()`),
      )
      .addColumn("report_date", "date")
      .execute();
    await db.schema
      .createTable("ecr_viewer.ecr_rr_conditions")
      .addColumn("uuid", "varchar(200)", (cb) => cb.primaryKey())
      .addColumn("eicr_id", "varchar(255)", (cb) => cb.notNull())
      .addColumn("condition", "varchar")
      .execute();
    await db.schema
      .createTable("ecr_viewer.ecr_rr_rule_summaries")
      .addColumn("uuid", "varchar(200)", (cb) => cb.primaryKey())
      .addColumn("ecr_rr_conditions_id", "varchar(200)")
      .addColumn("rule_summary", "varchar")
      .execute();
}

/**
 * Drops the aliased schema from a test database
 * @async
 * @function dropCoreAlias
 */
export const dropCoreAlias = async () => {
    await db.schema.dropTable("ecr_viewer.ecr_data").execute();
    await db.schema.dropTable("ecr_viewer.ecr_rr_conditions").execute();
    await db.schema.dropTable("ecr_viewer.ecr_rr_rule_summaries").execute();
}

/**
 * Clears the aliased schema tables on a test database
 * @async
 * @function clearCoreAlias
 */
export const clearCoreAlias = async () => {
    await (db as any).deleteFrom("ecr_viewer.ecr_data").execute();
    await (db as any).deleteFrom("ecr_viewer.ecr_rr_conditions").execute();
    await (db as any).deleteFrom("ecr_viewer.ecr_rr_rule_summaries").execute();
}