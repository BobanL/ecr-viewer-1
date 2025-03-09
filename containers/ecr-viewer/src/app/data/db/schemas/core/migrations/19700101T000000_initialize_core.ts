import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Check if schema exists
  const schemaExists = await db
    .selectFrom('information_schema.schemata')
    .select('schema_name')
    .where('schema_name', '=', 'ecr_viewer')
    .execute();

  if (!schemaExists.length) {
    await db.schema.createSchema('ecr_viewer').ifNotExists().execute();

    await db.schema
      .createTable('ecr_viewer.ecr_data')
      .addColumn('eICR_ID', 'varchar(200)', (col) => col.primaryKey())
      .addColumn('set_id', 'varchar(255)')
      .addColumn('eicr_version_number', 'varchar(50)')
      .addColumn('data_source', 'varchar(2)')
      .addColumn('fhir_reference_link', 'varchar(500)')
      .addColumn('patient_name_first', 'varchar(100)')
      .addColumn('patient_name_last', 'varchar(100)')
      .addColumn('patient_birth_date', 'date')
      .addColumn('date_created', 'timestamp', (col) => col.notNull().defaultTo('now()'))
      .addColumn('report_date', 'date')
      .execute();

    await db.schema
      .createTable('ecr_viewer.ecr_rr_conditions')
      .addColumn('uuid', 'varchar(200)', (col) => col.primaryKey())
      .addColumn('eICR_ID', 'varchar(200)', (col) =>
        col.notNull().references('ecr_viewer.ecr_data.eICR_ID')
      )
      .addColumn('condition', 'varchar')
      .execute();

    await db.schema
      .createTable('ecr_viewer.ecr_rr_rule_summaries')
      .addColumn('uuid', 'varchar(200)', (col) => col.primaryKey())
      .addColumn('ecr_rr_conditions_id', 'varchar(200)', (col) =>
        col.references('ecr_viewer.ecr_rr_conditions.uuid')
      )
      .addColumn('rule_summary', 'varchar')
      .execute();
  } else {
    console.log('Core schema already exists. Marking migration as applied.');
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropSchema('ecr_viewer').cascade().execute();
}
