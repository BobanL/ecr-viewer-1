import type { MssqlDialect, PostgresDialect } from 'kysely';
import { SupportedDialects, ConnectionConfig } from './config/types';

type DialectModule = {
  mssql: typeof MssqlDialect;
  postgres: typeof PostgresDialect;
};

type DialectConfigFactory = {
  mssql: (config: Partial<ConnectionConfig>) => MssqlDialect;
  postgres: (config: Partial<ConnectionConfig>) => PostgresDialect;
};

/**
 * Loads a dialect class dynamically.
 * @param dialect The dialect name
 * @returns The dialect constructor
 */
async function loadDialect<T extends SupportedDialects>(
  dialect: T
): Promise<DialectModule[T]> {
  switch (dialect) {
    case 'mssql':
      return (await import('kysely')).MssqlDialect as DialectModule[T];
    case 'postgres':
      return (await import('kysely')).PostgresDialect as DialectModule[T];
    default:
      throw new Error(`Unsupported dialect: ${dialect}`);
  }
}

/**
 * Loads a dialect configuration factory dynamically.
 * @param dialect The dialect name
 * @returns A function to create a dialect instance
 */
async function loadDialectConfig<T extends SupportedDialects>(
  dialect: T
): Promise<DialectConfigFactory[T]> {
  switch (dialect) {
    case 'mssql':
      return (await import('./config/mssql')).createMssqlDialect as DialectConfigFactory[T];
    case 'postgres':
      return (await import('./config/postgres')).createPostgresDialect as DialectConfigFactory[T];
    default:
      throw new Error(`Unsupported dialect: ${dialect}`);
  }
}

export { loadDialect, loadDialectConfig, SupportedDialects };
