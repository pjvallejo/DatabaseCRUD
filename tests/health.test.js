/**
 * Health and general API tests
 */

const request = require('supertest');
const app = require('../src/index');

describe('Health and General API Tests', () => {
    
    describe('GET /health', () => {
        test('should return health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
            expect(response.body).toHaveProperty('database');
            expect(response.body).toHaveProperty('version');
        });
    });

    describe('GET /', () => {
        test('should return API information', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Task Management API');
            expect(response.body).toHaveProperty('version');
            expect(response.body).toHaveProperty('endpoints');
        });
    });

    describe('404 Handler', () => {
        test('should return 404 for non-existent endpoints', async () => {
            const response = await request(app)
                .get('/non-existent-endpoint')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Endpoint not found');
            expect(response.body.path).toBe('/non-existent-endpoint');
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid JSON in request body', async () => {
            const response = await request(app)
                .post('/api/tasks')
                .set('Content-Type', 'application/json')
                .send('invalid-json')
                .expect(400);
        });
    });
});
