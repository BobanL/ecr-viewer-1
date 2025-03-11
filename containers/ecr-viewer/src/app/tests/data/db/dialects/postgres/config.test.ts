import { createPostgresDialect } from '../../../../../data/db/dialects/postgres/config';
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';

jest.mock('kysely', () => ({
  PostgresDialect: jest.fn().mockImplementation((config) => config),
}));

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation((config) => config),
}));

describe('createPostgresDialect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.POSTGRES_HOST;
    delete process.env.POSTGRES_DATABASE;
    delete process.env.POSTGRES_USER;
    delete process.env.POSTGRES_PASSWORD;
    delete process.env.POSTGRES_PORT;
    delete process.env.POSTGRES_MAX_THREADPOOL;
  });

  // Host tests
  it('sets host to "localhost" by default when no config or POSTGRES_HOST is provided', () => {
    const dialect = createPostgresDialect();
    expect(dialect.pool.host).toBe('localhost');
  });

  it('overrides host default with POSTGRES_HOST environment variable', () => {
    process.env.POSTGRES_HOST = 'env-host';
    const dialect = createPostgresDialect();
    expect(dialect.pool.host).toBe('env-host');
  });

  it('overrides POSTGRES_HOST with explicit host config parameter', () => {
    process.env.POSTGRES_HOST = 'env-host';
    const dialect = createPostgresDialect({ host: 'config-host' });
    expect(dialect.pool.host).toBe('config-host');
  });

  // Database tests
  it('sets database to "ecr_viewer_db" by default when no config or POSTGRES_DATABASE is provided', () => {
    const dialect = createPostgresDialect();
    expect(dialect.pool.database).toBe('ecr_viewer_db');
  });

  it('overrides database default with POSTGRES_DATABASE environment variable', () => {
    process.env.POSTGRES_DATABASE = 'env-db';
    const dialect = createPostgresDialect();
    expect(dialect.pool.database).toBe('env-db');
  });

  it('overrides POSTGRES_DATABASE with explicit database config parameter', () => {
    process.env.POSTGRES_DATABASE = 'env-db';
    const dialect = createPostgresDialect({ database: 'config-db' });
    expect(dialect.pool.database).toBe('config-db');
  });

  // User tests
  it('sets user to undefined by default when no config or POSTGRES_USER is provided', () => {
    const dialect = createPostgresDialect();
    expect(dialect.pool.user).toBeUndefined();
  });

  it('overrides user default with POSTGRES_USER environment variable', () => {
    process.env.POSTGRES_USER = 'env-user';
    const dialect = createPostgresDialect();
    expect(dialect.pool.user).toBe('env-user');
  });

  it('overrides POSTGRES_USER with explicit user config parameter', () => {
    process.env.POSTGRES_USER = 'env-user';
    const dialect = createPostgresDialect({ user: 'config-user' });
    expect(dialect.pool.user).toBe('config-user');
  });

  // Password tests
  it('sets password to undefined by default when no config or POSTGRES_PASSWORD is provided', () => {
    const dialect = createPostgresDialect();
    expect(dialect.pool.password).toBeUndefined();
  });

  it('overrides password default with POSTGRES_PASSWORD environment variable', () => {
    process.env.POSTGRES_PASSWORD = 'env-pass';
    const dialect = createPostgresDialect();
    expect(dialect.pool.password).toBe('env-pass');
  });

  it('overrides POSTGRES_PASSWORD with explicit password config parameter', () => {
    process.env.POSTGRES_PASSWORD = 'env-pass';
    const dialect = createPostgresDialect({ password: 'config-pass' });
    expect(dialect.pool.password).toBe('config-pass');
  });

  // Port tests
  it('sets port to 5432 by default when no config or POSTGRES_PORT is provided', () => {
    const dialect = createPostgresDialect();
    expect(dialect.pool.port).toBe(5432);
  });

  it('overrides port default with POSTGRES_PORT environment variable', () => {
    process.env.POSTGRES_PORT = '5000';
    const dialect = createPostgresDialect();
    expect(dialect.pool.port).toBe(5000);
  });

  it('overrides POSTGRES_PORT with explicit port config parameter', () => {
    process.env.POSTGRES_PORT = '5000';
    const dialect = createPostgresDialect({ port: 6000 });
    expect(dialect.pool.port).toBe(6000);
  });

  // Max thread pool tests
  it('sets maxThreadPool to 10 by default when no config or POSTGRES_MAX_THREADPOOL is provided', () => {
    const dialect = createPostgresDialect();
    expect(dialect.pool.max).toBe(10);
  });

  it('overrides maxThreadPool default with POSTGRES_MAX_THREADPOOL environment variable', () => {
    process.env.POSTGRES_MAX_THREADPOOL = '20';
    const dialect = createPostgresDialect();
    expect(dialect.pool.max).toBe(20);
  });

  it('overrides POSTGRES_MAX_THREADPOOL with explicit maxThreadPool config parameter', () => {
    process.env.POSTGRES_MAX_THREADPOOL = '20';
    const dialect = createPostgresDialect({ maxThreadPool: 30 });
    expect(dialect.pool.max).toBe(30);
  });
});
