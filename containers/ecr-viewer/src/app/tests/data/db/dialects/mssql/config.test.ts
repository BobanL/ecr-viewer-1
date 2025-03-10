import { createMssqlDialect } from '../../../../../data/db/dialects/mssql/config'; 
import { MssqlDialect } from 'kysely';
import * as tedious from 'tedious';

jest.mock('kysely', () => ({
  MssqlDialect: jest.fn().mockImplementation((config) => config),
}));

describe('createMssqlDialect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables before each test
    delete process.env.SQL_SERVER_HOST;
    delete process.env.SQL_SERVER_DATABASE;
    delete process.env.SQL_SERVER_USER;
    delete process.env.SQL_SERVER_PASSWORD;
    delete process.env.SQL_SERVER_PORT;
    delete process.env.SQL_SERVER_TRUST_CERT;
    delete process.env.SQL_SERVER_CONNECT_TIMEOUT;
    delete process.env.TARN_MIN;
    delete process.env.TARN_MAX;
  });

  it('uses default values when no environment variables or config are provided', () => {
    const dialect = createMssqlDialect();
    expect(MssqlDialect).toHaveBeenCalledWith(expect.objectContaining({
      tedious: expect.objectContaining({
        connectionFactory: expect.any(Function),
      }),
    }));

    const connectionFactory = dialect.tedious.connectionFactory;
    const connection = connectionFactory();
    expect(connection.server).toBe('localhost');
    expect(connection.authentication.options.userName).toBe('sa');
    expect(connection.options.database).toBe('master');
    expect(connection.options.port).toBe(1433);
    expect(connection.options.trustServerCertificate).toBe(true);
    expect(connection.options.connectTimeout).toBe(30000);
    expect(dialect.tarn.options.min).toBe(0);
    expect(dialect.tarn.options.max).toBe(100);
  });

  it('overrides defaults with environment variables', () => {
    process.env.SQL_SERVER_HOST = 'test-host';
    process.env.SQL_SERVER_DATABASE = 'test-db';
    process.env.SQL_SERVER_USER = 'test-user';
    process.env.SQL_SERVER_PASSWORD = 'test-pass';
    process.env.SQL_SERVER_PORT = '5000';
    process.env.SQL_SERVER_TRUST_CERT = 'false';
    process.env.SQL_SERVER_CONNECT_TIMEOUT = '10000';
    process.env.TARN_MIN = '5';
    process.env.TARN_MAX = '50';

    const dialect = createMssqlDialect();
    const connectionFactory = dialect.tedious.connectionFactory;
    const connection = connectionFactory();
    expect(connection.server).toBe('test-host');
    expect(connection.authentication.options.userName).toBe('test-user');
    expect(connection.authentication.options.password).toBe('test-pass');
    expect(connection.options.database).toBe('test-db');
    expect(connection.options.port).toBe(5000);
    expect(connection.options.trustServerCertificate).toBe(false);
    expect(connection.options.connectTimeout).toBe(10000);
    expect(dialect.tarn.options.min).toBe(5);
    expect(dialect.tarn.options.max).toBe(50);
  });

  it('overrides environment variables with provided config', () => {
    process.env.SQL_SERVER_HOST = 'env-host';
    process.env.SQL_SERVER_PORT = '7000';
    const configOverride = { host: 'override-host', port: 6000 };
    const dialect = createMssqlDialect(configOverride);
    const connectionFactory = dialect.tedious.connectionFactory;
    const connection = connectionFactory();
    expect(connection.server).toBe('override-host');
    expect(connection.options.port).toBe(6000);
  });

  it('handles missing password gracefully', () => {
    process.env.SQL_SERVER_PASSWORD = undefined;
    const dialect = createMssqlDialect();
    const connectionFactory = dialect.tedious.connectionFactory;
    const connection = connectionFactory();
    expect(connection.authentication.options.password).toBeUndefined();
  });
});
