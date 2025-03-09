import { loadDialect } from '../../../../../src/app/data/db/dialects/registry';

describe('Supported Dialects', () => {
    it('should support postgres dialect', async () => {
        const dialect = await loadDialect('postgres');
        expect(dialect).toBeDefined();
    });

    it('should support mssql dialect', async () => {
        const dialect = await loadDialect('mssql');
        expect(dialect).toBeDefined();
    });

    it('should throw an error for unsupported dialects', async () => {
        await expect(loadDialect('mysql')).rejects.toThrow();
        await expect(loadDialect('sqlite')).rejects.toThrow();
    });
});
