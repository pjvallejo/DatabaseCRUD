/**
 * Database configuration and connection setup
 * This module handles MySQL database connection using mysql2 library
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'appuser',
    password: process.env.DB_PASSWORD || 'apppassword',
    database: process.env.DB_NAME || 'IA_DB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
let pool;

/**
 * Initialize database connection pool
 */
const initializePool = () => {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('✅ Database connection pool created successfully');
        return pool;
    } catch (error) {
        console.error('❌ Error creating database connection pool:', error);
        throw error;
    }
};

/**
 * Get database connection pool
 * @returns {Object} MySQL connection pool
 */
const getPool = () => {
    if (!pool) {
        initializePool();
    }
    return pool;
};

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection test result
 */
const testConnection = async () => {
    try {
        const connection = await getPool().getConnection();
        await connection.execute('SELECT 1');
        connection.release();
        console.log('✅ Database connection test successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection test failed:', error);
        return false;
    }
};

/**
 * Close database connection pool
 */
const closePool = async () => {
    try {
        if (pool) {
            await pool.end();
            console.log('✅ Database connection pool closed successfully');
        }
    } catch (error) {
        console.error('❌ Error closing database connection pool:', error);
    }
};

module.exports = {
    initializePool,
    getPool,
    testConnection,
    closePool,
    dbConfig
};
