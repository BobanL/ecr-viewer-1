import { MssqlDialect } from 'kysely';
import * as tarn from 'tarn';
import * as tedious from 'tedious';
import { MssqlConnectionConfig } from './types';

// Default values for environment variables
const defaults = {
  host: 'localhost',
  database: 'master',
  user: 'sa',
  port: 1433,
  trustServerCertificate: true,
  connectTimeout: 30000,
  tarnMin: 0,
  tarnMax: 100,
};

/**
 * Creates an MSSQL dialect instance based on provided or environment-based config.
 * @param config Optional configuration overrides
 * @returns MssqlDialect instance
 */
export function createMssqlDialect(config: Partial<MssqlConnectionConfig> = {}): MssqlDialect {
  const envConfig: MssqlConnectionConfig = {
    dialect: 'mssql',
    host: process.env.SQL_SERVER_HOST || defaults.host,
    database: process.env.SQL_SERVER_DATABASE || defaults.database,
    user: process.env.SQL_SERVER_USER || defaults.user,
    password: process.env.SQL_SERVER_PASSWORD, // No default for security
    port: parseInt(process.env.SQL_SERVER_PORT || String(defaults.port), 10),
    trustServerCertificate: process.env.SQL_SERVER_TRUST_CERT === 'true' || defaults.trustServerCertificate,
    connectTimeout: parseInt(process.env.SQL_SERVER_CONNECT_TIMEOUT || String(defaults.connectTimeout), 10),
    tarnMin: parseInt(process.env.TARN_MIN || String(defaults.tarnMin), 10),
    tarnMax: parseInt(process.env.TARN_MAX || String(defaults.tarnMax), 10),
  };

  const finalConfig = { ...envConfig, ...config };

  return new MssqlDialect({
    tarn: {
      ...tarn,
      options: {
        min: finalConfig.tarnMin,
        max: finalConfig.tarnMax,
      },
    },
    tedious: {
      ...tedious,
      connectionFactory: () =>
        new tedious.Connection({
          authentication: {
            options: {
              userName: finalConfig.user,
              password: finalConfig.password,
            },
            type: 'default',
          },
          options: {
            database: finalConfig.database,
            port: finalConfig.port,
            trustServerCertificate: finalConfig.trustServerCertificate,
            connectTimeout: finalConfig.connectTimeout,
          },
          server: finalConfig.host,
        }),
    },
  });
}
