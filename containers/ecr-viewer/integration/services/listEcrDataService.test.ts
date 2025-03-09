// app/services/listEcrDataService.integration.test.ts
import { createDatabase } from '@/app/data/db/base';
import { Kysely, sql } from 'kysely';
import { listEcrData } from './listEcrDataService';
import { CoreSchema } from '@/app/data/db/schemas/core';
import { ExtendedSchema } from '@/app/data/db/schemas/extended';

describe('listEcrData Integration', () => {
  let db: Kysely<CoreSchema | ExtendedSchema>;
  const filterDates = { startDate: new Date('2023-01-01'), endDate: new Date('2023-12-31') };

  beforeAll(async () => {
    const dialect = process.env.DIALECT as 'mssql' | 'postgres';
    const schema = process.env.METADATA_DATABASE_SCHEMA as 'core' | 'extended';

    db = await createDatabase({
      dialect,
      schema,
      connection: {
        host: dialect === 'mssql' ? process.env.SQL_SERVER_HOST : process.env.POSTGRES_HOST,
        user: dialect === 'mssql' ? process.env.SQL_SERVER_USER : process.env.POSTGRES_USER,
        password: dialect === 'mssql' ? process.env.SQL_SERVER_PASSWORD : process.env.POSTGRES_PASSWORD,
        database: dialect === 'mssql' ? process.env.SQL_SERVER_DATABASE : process.env.POSTGRES_DATABASE,
        port: dialect === 'mssql' ? 1433 : 5432,
      },
    });

    // Apply schema
    await sql`DROP SCHEMA IF EXISTS ecr_viewer CASCADE;`.execute(db);
    await sql`CREATE SCHEMA ecr_viewer;`.execute(db);

    if (schema === 'core') {
      await sql`
        CREATE TABLE ecr_viewer.ecr_data (
          eICR_ID VARCHAR(200) PRIMARY KEY,
          set_id VARCHAR(255),
          eicr_version_number VARCHAR(50),
          data_source VARCHAR(2),
          fhir_reference_link VARCHAR(500),
          patient_name_first VARCHAR(100),
          patient_name_last VARCHAR(100),
          patient_birth_date DATE,
          date_created ${dialect === 'mssql' ? 'DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()' : 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'},
          report_date DATE
        );
        CREATE TABLE ecr_viewer.ecr_rr_conditions (
          uuid VARCHAR(200) PRIMARY KEY,
          eICR_ID VARCHAR(200) NOT NULL REFERENCES ecr_viewer.ecr_data(eICR_ID),
          condition VARCHAR
        );
        CREATE TABLE ecr_viewer.ecr_rr_rule_summaries (
          uuid VARCHAR(200) PRIMARY KEY,
          ecr_rr_conditions_id VARCHAR(200) REFERENCES ecr_viewer.ecr_rr_conditions(uuid),
          rule_summary VARCHAR
        );
      `.execute(db);
    } else {
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
          authoring_date ${dialect === 'mssql' ? 'DATETIME' : 'TIMESTAMP'},
          authoring_provider VARCHAR(255),
          provider_id VARCHAR(255),
          facility_id VARCHAR(255),
          facility_name VARCHAR(255),
          encounter_type VARCHAR(255),
          encounter_start_date ${dialect === 'mssql' ? 'DATETIME' : 'TIMESTAMP'},
          encounter_end_date ${dialect === 'mssql' ? 'DATETIME' : 'TIMESTAMP'},
          reason_for_visit VARCHAR(${dialect === 'mssql' ? 'MAX' : 'TEXT'}),
          active_problems VARCHAR(${dialect === 'mssql' ? 'MAX' : 'TEXT'}),
          date_created ${dialect === 'mssql' ? 'DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()' : 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'}
        );
        CREATE TABLE ecr_viewer.patient_address (
          uuid VARCHAR(200) PRIMARY KEY,
          "use" VARCHAR(7),
          type VARCHAR(8),
          text VARCHAR(${dialect === 'mssql' ? 'MAX' : 'TEXT'}),
          line VARCHAR(255),
          city VARCHAR(255),
          district VARCHAR(255),
          state VARCHAR(255),
          postal_code VARCHAR(20),
          country VARCHAR(255),
          period_start ${dialect === 'mssql' ? 'DATETIMEOFFSET' : 'TIMESTAMP'},
          period_end ${dialect === 'mssql' ? 'DATETIMEOFFSET' : 'TIMESTAMP'},
          eICR_ID VARCHAR(200) REFERENCES ecr_viewer.ecr_data(eICR_ID)
        );
        CREATE TABLE ecr_viewer.ecr_rr_conditions (
          uuid VARCHAR(200) PRIMARY KEY,
          eICR_ID VARCHAR(200) NOT NULL REFERENCES ecr_viewer.ecr_data(eICR_ID),
          condition VARCHAR(${dialect === 'mssql' ? 'MAX' : 'TEXT'})
        );
        CREATE TABLE ecr_viewer.ecr_rr_rule_summaries (
          uuid VARCHAR(200) PRIMARY KEY,
          ecr_rr_conditions_id VARCHAR(200) REFERENCES ecr_viewer.ecr_rr_conditions(uuid),
          rule_summary VARCHAR(${dialect === 'mssql' ? 'MAX' : 'TEXT'})
        );
        CREATE TABLE ecr_viewer.ecr_labs (
          uuid VARCHAR(200),
          eICR_ID VARCHAR(200) REFERENCES ecr_viewer.ecr_data(eICR_ID),
          test_type VARCHAR(255),
          test_type_code VARCHAR(50),
          test_type_system VARCHAR(255),
          test_result_qualitative VARCHAR(${dialect === 'mssql' ? 'MAX' : 'TEXT'}),
          test_result_quantitative FLOAT,
          test_result_units VARCHAR(50),
          test_result_code VARCHAR(50),
          test_result_code_display VARCHAR(255),
          test_result_code_system VARCHAR(50),
          test_result_interpretation VARCHAR(255),
          test_result_interpretation_code VARCHAR(50),
          test_result_interpretation_system VARCHAR(255),
          test_result_reference_range_low_value FLOAT,
          test_result_reference_range_low_units VARCHAR(50),
          test_result_reference_range_high_value FLOAT,
          test_result_reference_range_high_units VARCHAR(50),
          specimen_type VARCHAR(255),
          specimen_collection_date DATE,
          performing_lab VARCHAR(255),
          PRIMARY KEY (uuid, eICR_ID)
        );
      `.execute(db);
    }

    // Insert test data
    await db.insertInto('ecr_viewer.ecr_data').values(
      schema === 'core'
        ? { eICR_ID: '1', patient_name_first: 'John', patient_name_last: 'Doe', patient_birth_date: '1990-01-01', report_date: '2023-01-01', date_created: '2023-01-02' }
        : { eICR_ID: '1', first_name: 'John', last_name: 'Doe', birth_date: '1990-01-01', encounter_start_date: '2023-01-01', date_created: '2023-01-02' }
    ).execute();
    await db.insertInto('ecr_viewer.ecr_rr_conditions').values({ uuid: 'c1', eICR_ID: '1', condition: 'Flu' }).execute();
    await db.insertInto('ecr_viewer.ecr_rr_rule_summaries').values({ uuid: 'r1', ecr_rr_conditions_id: 'c1', rule_summary: 'Summary1' }).execute();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('lists ECR data correctly', async () => {
    const result = await listEcrData(0, 10, 'date_created', 'DESC', filterDates, 'John', ['Flu']);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ ecrId: '1', patient_first_name: 'John', patient_last_name: 'Doe' });
  });

  it('filters by conditions', async () => {
    const result = await listEcrData(0, 10, 'date_created', 'DESC', filterDates, undefined, ['Covid']);
    expect(result).toHaveLength(0);
  });

  it('paginates correctly', async () => {
    const result = await listEcrData(1, 1, 'date_created', 'DESC', filterDates);
    expect(result).toHaveLength(0);
  });
});
