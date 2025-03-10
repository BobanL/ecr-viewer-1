import { createMssqlDialect } from '../../../../../data/db/dialects/mssql/config';
import { Kysely } from 'kysely';

describe('createMssqlDialect Integration', () => {
  it('successfully connects to MSSQL and executes a query', async () => {
    // Set environment variables for a test database
    process.env.SQL_SERVER_HOST = 'localhost';
    process.env.SQL_SERVER_DATABASE = 'master';
    process.env.SQL_SERVER_USER = 'sa';
    process.env.SQL_SERVER_PASSWORD = 'yourStrong(!)Password'; // Replace with your password
    process.env.SQL_SERVER_PORT = '1433';

    const dialect = createMssqlDialect();
    const db = new Kysely<any>({ dialect });

    // Execute a simple query to verify connection
    const result = await db.selectFrom('sys.databases').select('name').execute();
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((db: any) => db.name === 'master')).toBe(true);

    // Cleanup
    await db.destroy();
  }, 10000); // Increase timeout if needed
});
