import { loadDialect } from '../../../data/db/dialects/registry';

describe('Dialect Registry', () => {
    it('should load mssql dialect', async () => {
        const mssqlDialect = await loadDialect('mssql');
        expect(mssqlDialect).toBeDefined();
    });

    it('should load postgres dialect', async () => {
        const postgresDialect = await loadDialect('postgres');
        expect(postgresDialect).toBeDefined();
    });

    it('should throw an error for unsupported dialect', async () => {
        await expect(loadDialect('unsupported' as any)).rejects.toThrow('Unsupported dialect: unsupported');
    });
});
