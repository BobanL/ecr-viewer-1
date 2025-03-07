// Kysely ORM Connection Client


export const db = {
    selectFrom: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue([]), // Return an empty array or mock data
};
