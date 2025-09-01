module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/models/**',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  testTimeout: 10000,
  detectOpenHandles: true,
  forceExit: true
};