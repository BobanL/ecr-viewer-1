// import { CompiledQuery, Kysely } from 'kysely';

// // Interface for the mock query builder to ensure type safety
// interface MockQueryBuilder {
//   selectFrom: jest.Mock<MockQueryBuilder, [string]>;
//   leftJoin: jest.Mock<MockQueryBuilder, [string, string, string]>;
//   select: jest.Mock<MockQueryBuilder, [string[] | string]>;
//   where: jest.Mock<MockQueryBuilder, [string | ((eb: any) => any), string | undefined, any]>;
//   groupBy: jest.Mock<MockQueryBuilder, [string | string[]]>;
//   orderBy: jest.Mock<MockQueryBuilder, [string | string[], string | undefined]>;
//   offset: jest.Mock<MockQueryBuilder, [number]>;
//   limit: jest.Mock<MockQueryBuilder, [number]>;
//   execute: jest.Mock<any>;
//   compile: jest.Mock<CompiledQuery>;
// }

// // Factory function to create a customizable mock query builder
// export function createMockQueryBuilder(options: {
//   executeResult?: any;
//   dialect?: 'mssql' | 'postgres';
// } = {}): MockQueryBuilder {
//   const { executeResult = [], dialect = 'postgres' } = options;

//   let sqlParts: string[] = [];
//   let selects: string[] = [];
//   let joins: string[] = [];
//   let wheres: string[] = [];
//   let groupBy: string[] = [];
//   let orderBy: string[] = [];
//   let offset: number | null = null;
//   let limit: number | null = null;

//   const builder: MockQueryBuilder = {
//     selectFrom: jest.fn((table) => {
//       sqlParts.push(`FROM ${table}`);
//       return builder;
//     }),
//     leftJoin: jest.fn((table, leftCol, rightCol) => {
//       joins.push(`LEFT JOIN ${table} ON ${leftCol} = ${rightCol}`);
//       return builder;
//     }),
//     select: jest.fn((columns) => {
//       selects = Array.isArray(columns)
//         ? columns.map((col) => (typeof col === 'string' ? col : col.sql))
//         : [columns];
//       return builder;
//     }),
//     where: jest.fn((column, op, value) => {
//       if (typeof column === 'function') {
//         // Simulate expression builder (e.g., eb.or)
//         wheres.push('MOCK_WHERE_FUNCTION');
//       } else if (op && value !== undefined) {
//         wheres.push(`${column} ${op} ${JSON.stringify(value)}`);
//       }
//       return builder;
//     }),
//     groupBy: jest.fn((columns) => {
//       groupBy = Array.isArray(columns) ? columns : [columns];
//       return builder;
//     }),
//     orderBy: jest.fn((column, direction) => {
//       const cols = Array.isArray(column) ? column : [column];
//       orderBy = cols.map((col) => `${col} ${direction || 'ASC'}`);
//       return builder;
//     }),
//     offset: jest.fn((n) => {
//       offset = n;
//       return builder;
//     }),
//     limit: jest.fn((n) => {
//       limit = n;
//       return builder;
//     }),
//     execute: jest.fn().mockResolvedValue(executeResult),
//     compile: jest.fn(() => {
//       const pagination = dialect === 'mssql'
//         ? `${offset !== null ? `OFFSET ${offset} ROWS` : ''} ${limit !== null ? `FETCH NEXT ${limit} ROWS ONLY` : ''}`
//         : `${limit !== null ? `LIMIT ${limit}` : ''} ${offset !== null ? `OFFSET ${offset}` : ''}`;

//       const sql = [
//         `SELECT ${selects.join(', ')}`,
//         ...sqlParts,
//         ...joins,
//         wheres.length ? `WHERE ${wheres.join(' AND ')}` : '',
//         groupBy.length ? `GROUP BY ${groupBy.join(', ')}` : '',
//         orderBy.length ? `ORDER BY ${orderBy.join(', ')}` : '',
//         pagination,
//       ]
//         .filter(Boolean)
//         .join(' ');
//       return { sql, parameters: [] } as CompiledQuery;
//     }),
//   };

//   return builder;
// }

// export function createMockKysely() {
//   const mockDb = {
//     transaction: jest.fn().mockReturnValue({
//       execute: jest.fn(async (fn: (trx: any) => Promise<void>) => {
//         const mockTrx = {
//           insertInto: jest.fn().mockReturnThis(),
//           values: jest.fn().mockReturnThis(),
//           execute: jest.fn().mockResolvedValue({}),
//         };
//         await fn(mockTrx);
//         return { insertId: 'mock-id' };
//       }),
//     }),
//     insertInto: jest.fn().mockReturnThis(),
//     values: jest.fn().mockReturnThis(),
//     execute: jest.fn().mockResolvedValue({}),
//   };
//   return mockDb as unknown as jest.Mocked<Kysely<any>>;
// }

// export function setupKyselyMock(mockDb: jest.Mocked<Kysely<any>>) {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
//   jest.doMock('@/app/data/db/base', () => ({
//     db: mockDb,
//   }));
// }
