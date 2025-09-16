/**
 * Main application file - Express server setup
 * This file initializes the Express server and sets up all middleware and routes
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { initializePool, testConnection, closePool } = require('./config/database');
const taskRoutes = require('./routes/taskRoutes');

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-production-domain.com'] 
        : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dbConnected = await testConnection();
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: dbConnected ? 'Connected' : 'Disconnected',
            version: '1.0.0'
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            database: 'Disconnected',
            error: error.message
        });
    }
});

// API Routes
app.use('/api/tasks', taskRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Task Management API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            tasks: '/api/tasks',
            documentation: 'See README.md for complete API documentation'
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Global error handler
app.use((error, req, res, next) => {
    // Don't log expected client errors in test environment
    const isTestEnv = process.env.NODE_ENV === 'test';
    const isJSONParseError = error.type === 'entity.parse.failed';
    const isValidationError = error.status && error.status < 500;
    
    const shouldLog = !isTestEnv && (!isJSONParseError && !isValidationError);
    
    if (shouldLog) {
        console.error('Global error handler:', error);
    }
    
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.stack : 'Something went wrong'
    });
});

/**
 * Start the server
 */
const startServer = async () => {
    try {
        // Initialize database connection
        console.log('🔌 Initializing database connection...');
        initializePool();
        
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Please check your database configuration.');
            console.error('Make sure MySQL container is running: docker-compose up -d');
            process.exit(1);
        }
        
        // Start Express server
        const server = app.listen(PORT, () => {
            console.log('🚀 Server started successfully!');
            console.log(`📍 Server running on http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('📚 API Endpoints:');
            console.log('   GET    /health           - Health check');
            console.log('   GET    /api/tasks        - Get all tasks');
            console.log('   GET    /api/tasks/:id    - Get task by ID');
            console.log('   POST   /api/tasks        - Create new task');
            console.log('   PUT    /api/tasks/:id    - Update task');
            console.log('   DELETE /api/tasks/:id    - Delete task');
            console.log('   PATCH  /api/tasks/:id/complete - Mark as completed');
            console.log('   PATCH  /api/tasks/:id/pending  - Mark as pending');
            console.log('   GET    /api/tasks/stats  - Get task statistics');
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
            
            server.close(async () => {
                console.log('🔌 Express server closed');
                await closePool();
                console.log('👋 Graceful shutdown completed');
                process.exit(0);
            });

            // Force close after 10 seconds
            setTimeout(() => {
                console.error('⚠️  Force shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        // Handle process signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server only if this file is run directly
if (require.main === module) {
    startServer();
}

// Export app for testing
module.exports = app;
