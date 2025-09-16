/**
 * Test setup file
 * This file sets up the test environment and utilities
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_NAME = 'IA_DB';
process.env.DB_USER = 'appuser';
process.env.DB_PASSWORD = 'apppassword';
process.env.PORT = '3001';

const { initializePool, testConnection, closePool } = require('../src/config/database');

// Setup before all tests
beforeAll(async () => {
    console.log('🧪 Setting up test environment...');
    
    // Initialize database connection for tests
    initializePool();
    
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
        throw new Error('Failed to connect to test database');
    }
    
    console.log('✅ Test database connected');
});

// Cleanup after all tests
afterAll(async () => {
    console.log('🧹 Cleaning up test environment...');
    await closePool();
    console.log('✅ Test cleanup completed');
});

// Increase timeout for database operations
jest.setTimeout(30000);
