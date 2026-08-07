/* eslint-disable */
const { readFileSync } = require('fs')

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(
  readFileSync(`${__dirname}/.spec.swcrc`, 'utf-8')
);

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false;

module.exports = {
  displayName: '@nestjs-playground/fundamentals-integration',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  // Only DB-backed integration/e2e specs live here, kept out of the plain
  // unit run (jest.config.cts) since they need postgres_test up on 5433.
  testMatch: ['**/*.spec-e2e.ts'],
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest-e2e/coverage'
};
