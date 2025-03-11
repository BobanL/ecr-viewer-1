import { createMssqlDialect } from '../../../../../data/db/dialects/mssql/config';
import * as tedious from 'tedious';

// Mock tedious to provide a Connection constructor
jest.mock('tedious', () => ({
  Connection: jest.fn().mockImplementation(() => ({})),
}));

// Mock MssqlDialect to return the config for inspection
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

  // SQL_SERVER_HOST tests
  it('uses "localhost" as default host when SQL_SERVER_HOST is not set', () => {
    const dialect = createMssqlDialect();
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({ server: 'localhost' }));
  });

  it('uses SQL_SERVER_HOST value for host when set', () => {
    process.env.SQL_SERVER_HOST = 'env-host';
    const dialect = createMssqlDialect();
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({ server: 'env-host' }));
  });

  it('prefers explicit host config over SQL_SERVER_HOST', () => {
    process.env.SQL_SERVER_HOST = 'env-host';
    const dialect = createMssqlDialect({ host: 'config-host' });
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({ server: 'config-host' }));
  });

  // SQL_SERVER_DATABASE tests
  it('uses "master" as default database when SQL_SERVER_DATABASE is not set', () => {
    const dialect = createMssqlDialect();
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({ database: 'master' }),
    }));
  });

  it('uses SQL_SERVER_DATABASE value for database when set', () => {
    process.env.SQL_SERVER_DATABASE = 'env-db';
    const dialect = createMssqlDialect();
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({ database: 'env-db' }),
    }));
  });

  it('prefers explicit database config over SQL_SERVER_DATABASE', () => {
    process.env.SQL_SERVER_DATABASE = 'env-db';
    const dialect = createMssqlDialect({ database: 'config-db' });
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({ database: 'config-db' }),
    }));
  });

  // SQL_SERVER_USER tests
  it('uses "sa" as default user when SQL_SERVER_USER is not set', () => {
    const dialect = createMssqlDialect();
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({
      authentication: expect.objectContaining({ options: { userName: 'sa' } }),
    }));
  });

  it('uses SQL_SERVER_USER value for user when set', () => {
    process.env.SQL_SERVER_USER = 'env-user';
    const dialect = createMssqlDialect();
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({
      authentication: expect.objectContaining({ options: { userName: 'env-user' } }),
    }));
  });

  it('prefers explicit user config over SQL_SERVER_USER', () => {
    process.env.SQL_SERVER_USER = 'env-user';
    const dialect = createMssqlDialect({ user: 'config-user' });
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({
      authentication: expect.objectContaining({ options: { userName: 'config-user' } }),
    }));
  });

  // SQL_SERVER_PASSWORD tests
  it('uses undefined as default password when SQL_SERVER_PASSWORD is not set', () => {
    const dialect = createMssqlDialect();
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    const [connectionConfig] = (tedious.Connection as jest.Mock).mock.calls[0];
    expect(connectionConfig.authentication.options.password).toBeUndefined();
  });

  it('uses SQL_SERVER_PASSWORD value for password when set', () => {
    process.env.SQL_SERVER_PASSWORD = 'env-pass';
    const dialect = createMssqlDialect();
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    const [connectionConfig] = (tedious.Connection as jest.Mock).mock.calls[0];
    expect(connectionConfig.authentication.options.password).toBe('env-pass');
  });

  it('prefers explicit password config over SQL_SERVER_PASSWORD', () => {
    process.env.SQL_SERVER_PASSWORD = 'env-pass';
    const dialect = createMssqlDialect({ password: 'config-pass' });
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    const [connectionConfig] = (tedious.Connection as jest.Mock).mock.calls[0];
    expect(connectionConfig.authentication.options.password).toBe('config-pass');
  });

  // SQL_SERVER_PORT tests
  it('uses 1433 as default port when SQL_SERVER_PORT is not set', () => {
    const dialect = createMssqlDialect();
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({ port: 1433 }),
    }));
  });

  it('uses SQL_SERVER_PORT value for port when set', () => {
    process.env.SQL_SERVER_PORT = '5000';
    const dialect = createMssqlDialect();
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({ port: 5000 }),
    }));
  });

  it('prefers explicit port config over SQL_SERVER_PORT', () => {
    process.env.SQL_SERVER_PORT = '5000';
    const dialect = createMssqlDialect({ port: 6000 });
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({ port: 6000 }),
    }));
  });

  // SQL_SERVER_TRUST_CERT tests
  it('uses true as default trustServerCertificate when SQL_SERVER_TRUST_CERT is not set', () => {
    const dialect = createMssqlDialect();
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({ trustServerCertificate: true }),
    }));
  });

  it('uses SQL_SERVER_TRUST_CERT value for trustServerCertificate when set', () => {
    process.env.SQL_SERVER_TRUST_CERT = 'false';
    const dialect = createMssqlDialect();
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    const [connectionConfig] = (tedious.Connection as jest.Mock).mock.calls[0];
    expect(connectionConfig.options.trustServerCertificate).toBe(false);
  });

  it('prefers explicit trustServerCertificate config over SQL_SERVER_TRUST_CERT', () => {
    process.env.SQL_SERVER_TRUST_CERT = 'true';
    const dialect = createMssqlDialect({ trustServerCertificate: false });
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({ trustServerCertificate: false }),
    }));
  });

  // SQL_SERVER_CONNECT_TIMEOUT tests
  it('uses 30000 as default connectTimeout when SQL_SERVER_CONNECT_TIMEOUT is not set', () => {
    const dialect = createMssqlDialect();
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({ connectTimeout: 30000 }),
    }));
  });

  it('uses SQL_SERVER_CONNECT_TIMEOUT value for connectTimeout when set', () => {
    process.env.SQL_SERVER_CONNECT_TIMEOUT = '45000';
    const dialect = createMssqlDialect();
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({ connectTimeout: 45000 }),
    }));
  });

  it('prefers explicit connectTimeout config over SQL_SERVER_CONNECT_TIMEOUT', () => {
    process.env.SQL_SERVER_CONNECT_TIMEOUT = '45000';
    const dialect = createMssqlDialect({ connectTimeout: 60000 });
    const connectionFactory = dialect.tedious.connectionFactory;
    connectionFactory();
    expect(tedious.Connection).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({ connectTimeout: 60000 }),
    }));
  });

  // TARN_MIN tests
  it('uses 0 as default tarnMin when TARN_MIN is not set', () => {
    const dialect = createMssqlDialect();
    expect(dialect.tarn.options.min).toBe(0);
  });

  it('uses TARN_MIN value for tarnMin when set', () => {
    process.env.TARN_MIN = '5';
    const dialect = createMssqlDialect();
    expect(dialect.tarn.options.min).toBe(5);
  });

  it('prefers explicit tarnMin config over TARN_MIN', () => {
    process.env.TARN_MIN = '5';
    const dialect = createMssqlDialect({ tarnMin: 10 });
    expect(dialect.tarn.options.min).toBe(10);
  });

  // TARN_MAX tests
  it('uses 100 as default tarnMax when TARN_MAX is not set', () => {
    const dialect = createMssqlDialect();
    expect(dialect.tarn.options.max).toBe(100);
  });

  it('uses TARN_MAX value for tarnMax when set', () => {
    process.env.TARN_MAX = '50';
    const dialect = createMssqlDialect();
    expect(dialect.tarn.options.max).toBe(50);
  });

  it('prefers explicit tarnMax config over TARN_MAX', () => {
    process.env.TARN_MAX = '50';
    const dialect = createMssqlDialect({ tarnMax: 75 });
    expect(dialect.tarn.options.max).toBe(75);
  });
});
