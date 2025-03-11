import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { BaseConnectionConfig } from '../_shared/types';

// Postgres-specific connection config
export type PostgresConnectionConfig = BaseConnectionConfig & {
  dialect: 'postgres';
  maxThreadPool?: number;
};

// Default values
const defaults = {
  host: 'localhost',
  database: 'ecr_viewer_db',
  port: 5432,
  maxThreadPool: 10,
};

/**
 * Creates a Postgres dialect instance based on provided or environment-based config.
 * @param config Optional configuration overrides
 * @returns PostgresDialect instance
 */
export function createPostgresDialect(config: Partial<PostgresConnectionConfig> = {}): PostgresDialect {
  const envConfig: PostgresConnectionConfig = {
    dialect: 'postgres',
    host: process.env.POSTGRES_HOST || defaults.host,
    database: process.env.POSTGRES_DATABASE || defaults.database,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || String(defaults.port), 10),
    maxThreadPool: parseInt(process.env.POSTGRES_MAX_THREADPOOL || String(defaults.maxThreadPool), 10),
  };

  const finalConfig = { ...envConfig, ...config };

  return new PostgresDialect({
    pool: new Pool({
      host: finalConfig.host,
      database: finalConfig.database,
      user: finalConfig.user,
      password: finalConfig.password,
      port: finalConfig.port,
      max: finalConfig.maxThreadPool,
    }),
  });
}
