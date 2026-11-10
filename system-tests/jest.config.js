/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: __dirname,
  globalSetup: '<rootDir>/jest.global-setup.ts',
  testMatch: ['**/*.spec.ts'],
  testTimeout: 240_000,
  moduleNameMapper: {
    '^@qshelter/nest-auth$': '<rootDir>/../node_modules/@qshelter/nest-auth',
  },
};
