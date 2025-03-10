import { Kysely, PostgresDialect, SqlServerDialect } from 'kysely';
import { Pool } from 'pg';
import * as mssql from 'mssql';

export async function createTestDatabase() {
  const dialectType = process.env.DIALECT as 'mssql' | 'postgres';
  const schema = process.env.METADATA_DATABASE_SCHEMA || 'core';

  const dialect =
    dialectType === 'mssql'
      ? new SqlServerDialect({
          mssql: {
            server: process.env.SQL_SERVER_HOST!,
            authentication: {
              type: 'default',
              options: {
                userName: process.env.SQL_SERVER_USER!,
                password: process.env.SQL_SERVER_PASSWORD!,
              },
            },
            database: process.env.SQL_SERVER_DATABASE!,
            port: 1433,
          } as mssql.config,
        })
      : new PostgresDialect({
          pool: new Pool({
            host: process.env.POSTGRES_HOST,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DATABASE,
            port: 5432,
          }),
        });

  const db = new Kysely<any>({ dialect });

  // Create schema and tables
  await db.schema.createSchema('ecr_viewer').ifNotExists().execute();

  await db.schema
    .createTable('ecr_viewer.ecr_data')
    .addColumn('eICR_ID', 'varchar(200)', (col) => col.primaryKey())
    .addColumn('set_id', 'varchar(255)')
    .addColumn('last_name', 'varchar(255)')
    .addColumn('first_name', 'varchar(255)')
    .addColumn('birth_date', 'date')
    .addColumn('patient_name_last', 'varchar(255)') // For core
    .addColumn('patient_name_first', 'varchar(255)') // For core
    .addColumn('report_date', 'date') // For core
    .addColumn('eicr_version_number', 'varchar(50)')
    .execute();

  await db.schema
    .createTable('ecr_viewer.patient_address')
    .addColumn('uuid', 'varchar(200)', (col) => col.primaryKey())
    .addColumn('eICR_ID', 'varchar(200)', (col) => col.references('ecr_viewer.ecr_data.eICR_ID'))
    .addColumn('use', 'varchar(7)')
    .addColumn('line', 'varchar(255)')
    .execute();

  await db.schema
    .createTable('ecr_viewer.ecr_labs')
    .addColumn('uuid', 'varchar(200)', (col) => col.primaryKey())
    .addColumn('eICR_ID', 'varchar(200)', (col) => col.references('ecr_viewer.ecr_data.eICR_ID'))
    .addColumn('test_type', 'varchar(255)')
    .execute();

  await db.schema
    .createTable('ecr_viewer.ecr_rr_conditions')
    .addColumn('uuid', 'varchar(200)', (col) => col.primaryKey())
    .addColumn('eICR_ID', 'varchar(200)', (col) => col.references('ecr_viewer.ecr_data.eICR_ID'))
    .addColumn('condition', 'varchar(255)')
    .execute();

  await db.schema
    .createTable('ecr_viewer.ecr_rr_rule_summaries')
    .addColumn('uuid', 'varchar(200)', (col) => col.primaryKey())
    .addColumn('ecr_rr_conditions_id', 'varchar(200)', (col) => col.references('ecr_viewer.ecr_rr_conditions.uuid'))
    .addColumn('rule_summary', 'varchar(255)')
    .execute();

  return db;
}

export async function teardownDatabase(db: Kysely<any>) {
  await db.schema.dropTable('ecr_viewer.ecr_rr_rule_summaries').ifExists().execute();
  await db.schema.dropTable('ecr_viewer.ecr_rr_conditions').ifExists().execute();
  await db.schema.dropTable('ecr_viewer.ecr_labs').ifExists().execute();
  await db.schema.dropTable('ecr_viewer.patient_address').ifExists().execute();
  await db.schema.dropTable('ecr_viewer.ecr_data').ifExists().execute();
  await db.schema.dropSchema('ecr_viewer').ifExists().execute();
  await db.destroy();
}
