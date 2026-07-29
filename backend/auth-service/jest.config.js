/** Jest config for @climateshield/auth-service — see docs/14_Testing_Strategy.md#test-types--tooling. */
module.exports = {
  displayName: 'auth-service',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/entities/**',
    '!src/**/dto/**',
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 85, lines: 90, statements: 90 },
  },
  setupFiles: ['reflect-metadata'],
};
