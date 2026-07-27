/**
 * Root Jest configuration — projects mode, so each Node workspace
 * (frontend/, backend/*, mobile/, packages/*) gets its own test
 * environment/transform while `npx jest` at the root runs everything.
 * See docs/14_Testing_Strategy.md#test-types--tooling and
 * tests/README.md#test-naming-conventions.
 */
module.exports = {
  projects: [
    "<rootDir>/frontend/jest.config.js",
    "<rootDir>/backend/*/jest.config.js",
    "<rootDir>/mobile/jest.config.js",
  ],
  coverageDirectory: "<rootDir>/coverage",
  collectCoverageFrom: [
    "**/src/**/*.{ts,tsx}",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/*.d.ts",
  ],
  // Per-service coverage floors are enforced in each workspace's own
  // jest.config.js (docs/14_Testing_Strategy.md#coverage-targets); this is
  // the repo-wide floor applied when running the aggregate root command.
  coverageThreshold: {
    global: { branches: 70, functions: 70, lines: 70, statements: 70 },
  },
};
