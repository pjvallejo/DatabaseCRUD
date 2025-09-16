/**
 * Jest configuration for testing
 */

module.exports = {
    // Test environment
    testEnvironment: 'node',
    
    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    
    // Test file patterns
    testMatch: [
        '<rootDir>/tests/**/*.test.js',
        '<rootDir>/tests/**/*.spec.js'
    ],
    
    // Coverage configuration
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/index.js', // Exclude main entry point
        '!**/node_modules/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    
    // Test timeout
    testTimeout: 30000,
    
    // Verbose output
    verbose: true,
    
    // Clear mocks between tests
    clearMocks: true,
    
    // Exit process when tests are done
    forceExit: true,
    
    // Detect open handles
    detectOpenHandles: true
};
