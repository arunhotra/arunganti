module.exports = {
  // Use jsdom environment to simulate browser
  testEnvironment: 'jsdom',

  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'script.js',
    'twitterizer.js',
    'giveaway.js',
    'morning.js',
    'workers/totp.js',
    '!node_modules/**',
    '!coverage/**'
  ],

  // Coverage thresholds (optional - enforce minimum coverage)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true
};
