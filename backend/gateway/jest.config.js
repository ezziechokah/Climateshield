/** Jest config for @climateshield/gateway — see docs/14_Testing_Strategy.md#test-types--tooling.
 * Default `npm test` runs entirely against in-memory fakes / local stub HTTP
 * servers (no Docker, no real Redis/Kafka) per backend/gateway/README.md.
 * Tests that exercise a real Redis/Kafka are gated behind `TESTCONTAINERS=1`
 * (see src/modules/rate-limiting/redis-rate-limit-store.integration.spec.ts).
 */
module.exports = {
  displayName: 'gateway',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: { branches: 75, functions: 80, lines: 80, statements: 80 },
  },
  // Guards against leaked Redis/socket.io/Kafka handles keeping the process
  // alive — a hanging suite fails loudly here rather than needing --detectOpenHandles.
  forceExit: false,
  testTimeout: 15000,
};
