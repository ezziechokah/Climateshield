// ESLint 9 flat config shared by every TypeScript/JavaScript package in the
// monorepo (frontend/, backend/*, mobile/, packages/*). Service-specific
// overrides (e.g., React-only rules for frontend/) extend this file via
// their own eslint.config.js importing `baseConfig` — see
// docs/17_Coding_Standards.md#typescript--nodejs-standards.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export const baseConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { import: importPlugin },
    rules: {
      // Correctness
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',

      // TypeScript strictness (docs/17_Coding_Standards.md: no `any` without justification)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'off', // enabled per-package once tsconfig `project` is wired

      // Import hygiene
      'import/no-duplicates': 'error',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  {
    // Test files may use console/any more freely
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', 'tests/**/*.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // NestJS files that carry decorators. With `emitDecoratorMetadata` (enabled in
    // tsconfig.base.json), TypeScript emits `design:paramtypes` referencing the
    // *runtime value* of each constructor parameter's type — which is how Nest's DI
    // container resolves dependencies. `consistent-type-imports` sees such an import
    // as type-only and rewrites it to `import type`, erasing the emit and breaking
    // injection at runtime. The build and unit tests still pass (they construct
    // providers by hand), so the failure only surfaces when the app actually boots.
    // Not worth that trap for an import-style preference.
    files: [
      '**/*.controller.ts',
      '**/*.service.ts',
      '**/*.module.ts',
      '**/*.guard.ts',
      '**/*.gateway.ts',
      '**/*.filter.ts',
      '**/*.interceptor.ts',
      '**/entities/*.ts',
      '**/dto/*.ts',
    ],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
  {
    // CommonJS tooling config (jest.config.js, etc.). `no-undef` is already off for
    // TS via typescript-eslint, but plain .js files still need the CJS/Node globals
    // declared or every `module.exports` reads as an undefined identifier.
    files: ['**/*.cjs', '**/jest.config.js', '**/*.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: 'writable',
        require: 'readonly',
        exports: 'writable',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
      },
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      'sdk/**',
      'mock-data/**',
    ],
  },
  // Must be last: disables any ESLint rule that would conflict with Prettier formatting.
  prettierConfig,
];

export default baseConfig;
