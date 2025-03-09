// jest.config.ts
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  modulePathIgnorePatterns: ['<rootDir>/.next'],
  moduleNameMapper: {
    '^mssql$': '<rootDir>/src/app/tests/__mocks__/mssql.js',
    '^tedious$': '<rootDir>/src/app/tests/__mocks__/mssql.js',
    '^kysely$': '<rootDir>/src/app/tests/__mocks__/kysely.ts', // Mock Kysely
    '^@/app/data/db/base$': '<rootDir>/src/app/tests/__mocks__/db.ts', // Mock db import
  },
  testPathIgnorePatterns: ['<rootDir>/e2e', '<rootDir>/integration/'],
  collectCoverage: true,
};

module.exports = createJestConfig(customJestConfig);
