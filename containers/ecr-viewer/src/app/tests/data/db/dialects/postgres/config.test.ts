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
    // Reset environment variables before each test
    delete process.env.POSTGRES_HOST;
    delete process.env.POSTGRES_DATABASE;
    delete process.env.POSTGRES_USER;
    delete process.env.POSTGRES_PASSWORD;
    delete process.env.POSTGRES_PORT;
    delete process.env.POSTGRES_MAX_THREADPOOL;
  });

  it('uses default values when no environment variables or config are provided', () => {
    const dialect = createPostgresDialect();
    expect(PostgresDialect).toHaveBeenCalledWith(
      expect.objectContaining({
        pool: expect.objectContaining({
          host: 'localhost',
          database: 'ecr_viewer_db',
          port: 5432,
          max: 10,
          user: undefined,
          password: undefined,
        }),
      })
    );
  });

  it('overrides defaults with environment variables', () => {
    process.env.POSTGRES_HOST = 'test-host';
    process.env.POSTGRES_DATABASE = 'test-db';
    process.env.POSTGRES_USER = 'test-user';
    process.env.POSTGRES_PASSWORD = 'test-pass';
    process.env.POSTGRES_PORT = '5000';
    process.env.POSTGRES_MAX_THREADPOOL = '20';

    const dialect = createPostgresDialect();
    const poolConfig = dialect.pool;
    expect(poolConfig.host).toBe('test-host');
    expect(poolConfig.database).toBe('test-db');
    expect(poolConfig.user).toBe('test-user');
    expect(poolConfig.password).toBe('test-pass');
    expect(poolConfig.port).toBe(5000);
    expect(poolConfig.max).toBe(20);
  });

  it('overrides environment variables with provided config', () => {
    process.env.POSTGRES_HOST = 'env-host';
    process.env.POSTGRES_PORT = '7000';
    const configOverride = { host: 'override-host', port: 6000 };
    const dialect = createPostgresDialect(configOverride);
    const poolConfig = dialect.pool;
    expect(poolConfig.host).toBe('override-host');
    expect(poolConfig.port).toBe(6000);
  });

  it('handles missing user and password gracefully', () => {
    process.env.POSTGRES_USER = undefined;
    process.env.POSTGRES_PASSWORD = undefined;
    const dialect = createPostgresDialect();
    const poolConfig = dialect.pool;
    expect(poolConfig.user).toBeUndefined();
    expect(poolConfig.password).toBeUndefined();
  });
});
