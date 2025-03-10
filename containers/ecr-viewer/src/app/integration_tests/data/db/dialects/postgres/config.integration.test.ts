import { createPostgresDialect } from '../../../../../data/db/dialects/postgres/config';
import { Kysely } from 'kysely';

describe('createPostgresDialect Integration', () => {
  it('successfully connects to PostgreSQL and executes a query', async () => {
    // Set environment variables for a test database
    process.env.POSTGRES_HOST = 'localhost';
    process.env.POSTGRES_DATABASE = 'postgres';
    process.env.POSTGRES_USER = 'postgres';
    process.env.POSTGRES_PASSWORD = 'yourPassword'; // Replace with your actual password
    process.env.POSTGRES_PORT = '5432';

    const dialect = createPostgresDialect();
    const db = new Kysely<any>({ dialect });

    // Execute a simple query to verify connection
    const result = await db.selectFrom('pg_database').select('datname').execute();
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((db: any) => db.datname === 'postgres')).toBe(true);

    // Cleanup
    await db.destroy();
  }, 10000); // Increase timeout if needed
});
