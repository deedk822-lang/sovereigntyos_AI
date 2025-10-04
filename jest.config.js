/**
 * @file Jest configuration for the SovereigntyOS AI Lab application.
 * This file configures the Jest testing framework, including presets,
 * test environment, coverage settings, and module resolution.
 * @see https://jestjs.io/docs/configuration
 * @type {import('jest').Config}
 */
module.exports = {
  /**
   * A preset that is used as a base for Jest's configuration.
   * `ts-jest` provides out-of-the-box TypeScript support.
   * @type {string}
   */
  preset: 'ts-jest',

  /**
   * The test environment that will be used for testing.
   * `jsdom` provides a browser-like environment for testing React components.
   * @type {string}
   */
  testEnvironment: 'jsdom',

  /**
   * The root directories that Jest should scan for tests and modules within.
   * @type {string[]}
   */
  roots: ['<rootDir>/src', '<rootDir>/tests'],

  /**
   * The glob patterns Jest uses to detect test files.
   * @type {string[]}
   */
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],

  /**
   * A map from regular expressions to paths to transformers.
   * `ts-jest` is used to transform TypeScript files into JavaScript.
   * @type {object}
   */
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },

  /**
   * An array of glob patterns indicating a set of files for which coverage information should be collected.
   * @type {string[]}
   */
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx', // Exclude the main entry point
    '!**/node_modules/**'
  ],

  /**
   * The directory where Jest should output its coverage files.
   * @type {string}
   */
  coverageDirectory: 'coverage',

  /**
   * A list of reporter names that Jest uses when writing coverage reports.
   * @type {string[]}
   */
  coverageReporters: [
    'text', // Outputs a summary to the console
    'lcov', // Generates an lcov.info file, used by services like Coveralls
    'html'  // Generates an HTML report in the coverage directory
  ],

  /**
   * A list of paths to modules that run some code to configure or set up the testing framework before each test file in the suite is executed.
   * @type {string[]}
   */
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  /**
   * A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module.
   * This is used to resolve path aliases like `@/` to the `src/` directory.
   * @type {object}
   */
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  /**
   * The default timeout of a test in milliseconds.
   * @type {number}
   */
  testTimeout: 10000,

  /**
   * Indicates whether each individual test should be reported during the run.
   * @type {boolean}
   */
  verbose: true,

  /**
   * Whether to collect coverage information while running tests.
   * @type {boolean}
   */
  collectCoverage: true,

  /**
   * An object that specifies minimum threshold enforcement for coverage results.
   * Thresholds can be specified as global, per-file, or per-directory.
   * @type {object}
   */
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};