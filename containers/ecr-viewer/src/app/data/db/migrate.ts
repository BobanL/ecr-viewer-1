import { Kysely, Migrator, FileMigrationProvider } from 'kysely';
import { createDatabase } from './base';
import * as path from 'path';
import { promises as fs } from 'fs';

async function ensureMigrations(
  schema: 'core' | 'extended',
  dialect: 'mssql' | 'postgres',
  connection: any
): Promise<void> {
  const db = await createDatabase({ dialect, schema, connection });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'schemas', schema, 'migrations'),
    }),
    migrationTableName: 'kysely_migration',
    migrationTableSchema: 'ecr_viewer',
  });

  const migrations = await migrator.getMigrations();
  const pendingMigrations = migrations.filter((m) => !m.executedAt);

  if (pendingMigrations.length > 0) {
    console.log(`Found ${pendingMigrations.length} pending migrations. Attempting to apply...`);
    const { error, results } = await migrator.migrateToLatest();

    if (error) {
      console.error('Migration failed:', error);
      console.error(`
        Automatic migration failed. Please run migrations manually:
        1. Backup your database.
        2. Run: npm run migrate -- --schema ${schema} --dialect ${dialect}
        3. Restart the application after successful migration.
      `);
      await db.destroy();
      throw new Error('Migration failure. Manual intervention required.');
    }

    console.log('Migrations applied successfully:', results);
  } else {
    console.log('All migrations are up to date.');
  }

  await db.destroy();
}

// TODO: Extract this to actual launch point of the application
// async function startApp() {
//   try {
//     const schema = process.env.METADATA_DATABASE_SCHEMA as 'core' | 'extended';
//     const dialect = process.env.DIALECT as 'mssql' | 'postgres';
//     await ensureMigrations(schema, dialect, {
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_NAME,
//       port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
//     });
//     console.log('App starting...');
//     // Proceed with app initialization
//   } catch (error) {
//     console.error('Startup failed:', error);
//     process.exit(1);
//   }
// }

// startApp();

if (process.argv.includes('--schema') && process.argv.includes('--dialect')) {
  const schemaIndex = process.argv.indexOf('--schema') + 1;
  const dialectIndex = process.argv.indexOf('--dialect') + 1;
  const schema = process.argv[schemaIndex] as 'core' | 'extended';
  const dialect = process.argv[dialectIndex] as 'mssql' | 'postgres';
  ensureMigrations(schema, dialect, {/* connection config */}).then(() => process.exit(0)).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
