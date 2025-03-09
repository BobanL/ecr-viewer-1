// app/services/listEcrDataService.test.ts
describe('listEcrData', () => {
  const combinations = [
    { schema: 'core', dialect: 'postgres' },
    { schema: 'core', dialect: 'mssql' },
    { schema: 'extended', dialect: 'postgres' },
    { schema: 'extended', dialect: 'mssql' },
  ];

  combinations.forEach(({ schema, dialect }) => {
    describe(`${schema} schema on ${dialect}`, () => {
      const mockDb = createMockKysely({ dialect });
      setupKyselyMock(mockDb);

      beforeEach(() => {
        process.env.METADATA_DATABASE_SCHEMA = schema;
        mockDb.execute.mockResolvedValue(
          schema === 'core'
            ? [{ eICR_ID: '1', patient_name_first: 'John', patient_name_last: 'Doe', conditions: ['Flu'] }]
            : [{ eICR_ID: '1', first_name: 'John', last_name: 'Doe', conditions: 'Flu' }]
        );
      });

      it('generates correct SQL', async () => {
        const result = await listEcrData(/* params */);
        const queryBuilder = (mockDb.selectFrom as jest.Mock).mock.results[0].value;
        const compiled = queryBuilder.compile();
        expect(compiled.sql).toContain('ecr_viewer.ecr_data');
        expect(result).toHaveLength(1);
      });
    });
  });
});
