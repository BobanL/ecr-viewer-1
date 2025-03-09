// db/base.test.ts
import { createDatabase } from './base';
import { Kysely } from 'kysely';

// Mock the kysely module
jest.mock('kysely', () => {
  return {
    Kysely: jest.fn().mockImplementation(() => ({
      selectFrom: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue([]),
    })),
    MssqlDialect: jest.fn(),
    PostgresDialect: jest.fn(),
  };
});

jest.mock('./dialects/connection', () => ({
  createMssqlDialect: jest.fn(() => ({ /* mock dialect */ })),
  createPostgresDialect: jest.fn(() => ({ /* mock dialect */ })),
}));

describe('createDatabase', () => {
  it('creates a Kysely instance for MSSQL and core schema', async () => {
    const db = await createDatabase({
      dialect: 'mssql',
      schema: 'core',
      connection: { host: 'localhost' },
    });

    expect(Kysely).toHaveBeenCalledWith({
      dialect: expect.anything(), // Mocked dialect instance
    });
    expect(db.selectFrom).toBeDefined();
  });

  it('constructs a query correctly', async () => {
    const db = await createDatabase({
      dialect: 'postgres',
      schema: 'extended',
      connection: { host: 'localhost' },
    });

    await db.selectFrom('ecr_data').select('first_name').where('eICR_ID', '=', '123').execute();

    expect(db.selectFrom).toHaveBeenCalledWith('ecr_data');
    expect(db.select).toHaveBeenCalledWith('first_name');
    expect(db.where).toHaveBeenCalledWith('eICR_ID', '=', '123');
    expect(db.execute).toHaveBeenCalled();
  });
});
