import { MssqlConnectionConfig } from './mssql/config';
import { PostgresConnectionConfig } from './postgres/config';

export type ConnectionConfig = MssqlConnectionConfig | PostgresConnectionConfig;
