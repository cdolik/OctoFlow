/** @type {import('jest').Config} */
module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
    '**/integration/**/*.+(ts|tsx|js)',
    '**/e2e/**/*.+(ts|tsx|js)',
    '**/property/**/*.+(ts|tsx|js)',
    '**/stress/**/*.+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts']
    },
    {
      displayName: 'integration',
      testMatch: ['**/integration/**/*.test.(ts|tsx|js)'],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
      testTimeout: 10000
    },
    {
      displayName: 'property',
      testMatch: ['**/property/**/*.test.(ts|tsx|js)'],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
      testTimeout: 30000
    },
    {
      displayName: 'stress',
      testMatch: ['**/stress/**/*.test.(ts|tsx|js)'],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
      testTimeout: 60000
    },
    {
      displayName: 'e2e',
      testMatch: ['**/e2e/**/*.test.(ts|tsx|js)'],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
      testTimeout: 30000
    }
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/types/**',
    '!src/**/*.d.ts',
    '!src/mocks/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};