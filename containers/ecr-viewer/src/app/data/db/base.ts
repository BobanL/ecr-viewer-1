import { Kysely } from 'kysely';
import { SupportedDialects, ConnectionConfig } from './dialects/config/types';
import { loadDialectConfig } from './dialects/registry';
import { loadSchema, SchemaRegistry } from './schemas/registry';

/**
 * Creates a Kysely instance for a given dialect and schema.
 * @param config Configuration object with dialect, schema, and connection details
 * @returns A promise resolving to a Kysely instance typed to the specified schema
 */
async function createDatabase<T extends keyof SchemaRegistry, D extends SupportedDialects>(
  config: { dialect: D; schema: T; connection: Partial<ConnectionConfig> }
): Promise<Kysely<SchemaRegistry[T]>> {
  const [schema, dialectFactory] = await Promise.all([
    loadSchema(config.schema),
    loadDialectConfig(config.dialect),
  ]);

  const dialect = dialectFactory(config.connection);

  const { Kysely } = await import('kysely');
  return new Kysely<SchemaRegistry[T]>({ dialect });
}

export { createDatabase };
