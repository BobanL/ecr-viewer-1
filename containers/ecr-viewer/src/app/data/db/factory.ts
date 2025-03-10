// src/app/data/db/factory.ts
import { Kysely } from 'kysely';
import { ConnectionConfig } from './dialects/registry'; // Adjust import as needed
import { SchemaRegistry } from './schemas/registry'; // Adjust import as needed
import { SupportedDialects, loadDialectConfig } from './dialects/registry'; // Adjust import as needed
import { loadSchema } from './schemas/registry'; // Adjust import as needed

// Global registry to store established connections
const connectionRegistry: Map<string, Kysely<any>> = new Map();

// Helper function to generate a unique key for the registry
function generateKey(dialect: SupportedDialects, schema: keyof SchemaRegistry): string {
  return `${dialect}-${schema}`;
}

/**
 * Creates a Kysely instance for a given dialect and schema.
 * @param config Configuration object with dialect, schema, and connection details
 * @returns A promise resolving to a Kysely instance typed to the specified schema
 */
export async function createDatabase<T extends keyof SchemaRegistry, D extends SupportedDialects>(
  config: { dialect: D; schema: T; connection: Partial<ConnectionConfig> }
): Promise<Kysely<SchemaRegistry[T]>> {
  const [schema, dialectFactory] = await Promise.all([
    loadSchema(config.schema),
    loadDialectConfig(config.dialect),
  ]);

  const dialect = dialectFactory(config.connection);
  return new Kysely<SchemaRegistry[T]>({ dialect });
}

// Define default values
const DEFAULT_SCHEMA: keyof SchemaRegistry = 'core';
const DEFAULT_DIALECT: SupportedDialects = 'postgres';

/**
 * Creates a Kysely instance using environment variables for schema and dialect.
 * @param connectionConfig Partial connection configuration for the database
 * @returns A promise resolving to a Kysely instance
 */
export async function createDatabaseFromEnvironment(
  connectionConfig: Partial<ConnectionConfig>
): Promise<Kysely<any>> {
  // Retrieve schema and dialect from environment variables or use defaults
  const schema = process.env.SCHEMA as keyof SchemaRegistry ?? DEFAULT_SCHEMA;
  const dialect = process.env.DIALECT as SupportedDialects ?? DEFAULT_DIALECT;

  // Call createDatabase with the schema, dialect, and connection config
  return await createDatabase({
    schema,
    dialect,
    connection: connectionConfig,
  });
}

/**
 * Retrieves or creates a database connection for the given dialect and schema.
 * @param dialect The database dialect (e.g., 'postgres', 'mssql')
 * @param schema The schema name (e.g., 'core', 'extended')
 * @param config Optional connection configuration
 * @returns A promise resolving to a Kysely instance for the specified schema
 */
export async function dbFor<T extends keyof SchemaRegistry, D extends SupportedDialects>(
  dialect: D,
  schema: T,
  config: Partial<ConnectionConfig> = {}
): Promise<Kysely<SchemaRegistry[T]>> {
  const key = generateKey(dialect, schema);

  if (connectionRegistry.has(key)) {
    return connectionRegistry.get(key) as Kysely<SchemaRegistry[T]>;
  }

  const db = await createDatabase({ dialect, schema, connection: config });
  connectionRegistry.set(key, db);
  return db;
}
