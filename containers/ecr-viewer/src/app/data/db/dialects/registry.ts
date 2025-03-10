import { MssqlDialect, PostgresDialect } from 'kysely';
import { ConnectionConfig } from './connection';

export type SupportedDialects = 'mssql' | 'postgres';

type DialectConfigFactory = {
  mssql: (config: Partial<ConnectionConfig>) => MssqlDialect;
  postgres: (config: Partial<ConnectionConfig>) => PostgresDialect;
};

const dialectFactories: DialectConfigFactory = {
  mssql: (config) => new MssqlDialect(config as any),
  postgres: (config) => new PostgresDialect(config as any),
};

export function loadDialect<T extends SupportedDialects>(
  dialect: T,
  config: Partial<ConnectionConfig> = {}
): MssqlDialect | PostgresDialect {
  const factory = dialectFactories[dialect];
  if (!factory) throw new Error(`Unsupported dialect: ${dialect}`);
  return factory(config);
}
