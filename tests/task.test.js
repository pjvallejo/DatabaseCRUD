/**
 * Task API tests
 * Comprehensive tests for all CRUD operations
 */

const request = require('supertest');
const app = require('../src/index');
const Task = require('../src/models/Task');

describe('Task API Tests', () => {
    let createdTaskId;
    
    // Clean up test data after each test to avoid interference
    afterEach(async () => {
        // Clean any test tasks created in the current test
        if (createdTaskId) {
            try {
                await Task.delete(createdTaskId);
            } catch (error) {
                // Task might already be deleted, ignore error
            }
            createdTaskId = null;
        }
    });

    describe('GET /api/tasks', () => {
        test('should get all tasks with success response', async () => {
            const response = await request(app)
                .get('/api/tasks')
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('meta');
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('should filter tasks by completion status', async () => {
            // Create test tasks
            const completedTask = await Task.create({
                title: '[TEST] Completed Task',
                description: 'Test completed task',
                completed: true
            });
            
            const pendingTask = await Task.create({
                title: '[TEST] Pending Task',
                description: 'Test pending task',
                completed: false
            });

            // Test completed tasks filter
            const completedResponse = await request(app)
                .get('/api/tasks?completed=true')
                .expect(200);

            expect(completedResponse.body.success).toBe(true);
            const completedTasks = completedResponse.body.data.filter(t => 
                t.title.includes('[TEST]')
            );
            expect(completedTasks.every(task => task.completed)).toBe(true);

            // Test pending tasks filter
            const pendingResponse = await request(app)
                .get('/api/tasks?completed=false')
                .expect(200);

            expect(pendingResponse.body.success).toBe(true);
            const pendingTasks = pendingResponse.body.data.filter(t => 
                t.title.includes('[TEST]')
            );
            expect(pendingTasks.every(task => !task.completed)).toBe(true);

            // Cleanup
            await Task.delete(completedTask.id);
            await Task.delete(pendingTask.id);
        });

        test('should handle pagination with limit and offset', async () => {
            const response = await request(app)
                .get('/api/tasks?limit=2&offset=0')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeLessThanOrEqual(2);
            expect(response.body.meta).toHaveProperty('limit', 2);
            expect(response.body.meta).toHaveProperty('offset', 0);
        });
    });

    describe('POST /api/tasks', () => {
        test('should create a new task with valid data', async () => {
            const taskData = {
                title: '[TEST] New Task',
                description: 'This is a test task',
                completed: false
            };

            const response = await request(app)
                .post('/api/tasks')
                .send(taskData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Task created successfully');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.title).toBe(taskData.title);
            expect(response.body.data.description).toBe(taskData.description);
            expect(response.body.data.completed).toBe(taskData.completed);

            createdTaskId = response.body.data.id;
        });

        test('should create task with minimal data (only title)', async () => {
            const taskData = {
                title: '[TEST] Minimal Task'
            };

            const response = await request(app)
                .post('/api/tasks')
                .send(taskData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe(taskData.title);
            expect(response.body.data.completed).toBe(false);
            expect(response.body.data.description).toBeNull();

            // Cleanup
            await Task.delete(response.body.data.id);
        });

        test('should fail to create task without title', async () => {
            const taskData = {
                description: 'Task without title'
            };

            const response = await request(app)
                .post('/api/tasks')
                .send(taskData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation errors');
            expect(response.body.errors).toBeDefined();
        });

        test('should fail to create task with invalid data types', async () => {
            const taskData = {
                title: '[TEST] Invalid Task',
                completed: 'not-a-boolean'
            };

            const response = await request(app)
                .post('/api/tasks')
                .send(taskData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation errors');
        });
    });

    describe('GET /api/tasks/:id', () => {
        test('should get a specific task by ID', async () => {
            // Create a task for this test
            const task = await Task.create({
                title: '[TEST] Specific Task',
                description: 'Task for ID test'
            });
            const taskId = task.id;

            const response = await request(app)
                .get(`/api/tasks/${taskId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id', taskId);
            expect(response.body.data.title).toContain('[TEST]');
            
            // Clean up
            await Task.delete(taskId);
        });

        test('should return 404 for non-existent task', async () => {
            const response = await request(app)
                .get('/api/tasks/99999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Task not found');
        });

        test('should return 400 for invalid task ID', async () => {
            const response = await request(app)
                .get('/api/tasks/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation errors');
        });
    });

    describe('PUT /api/tasks/:id', () => {
        test('should update an existing task', async () => {
            const task = await Task.create({
                title: '[TEST] Update Task',
                description: 'Original description'
            });
            const taskId = task.id;

            const updateData = {
                title: '[TEST] Updated Task',
                description: 'Updated description',
                completed: true
            };

            const response = await request(app)
                .put(`/api/tasks/${taskId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Task updated successfully');
            expect(response.body.data.title).toBe(updateData.title);
            expect(response.body.data.description).toBe(updateData.description);
            expect(response.body.data.completed).toBe(updateData.completed);
            
            // Clean up
            await Task.delete(taskId);
        });

        test('should partially update task (only some fields)', async () => {
            const task = await Task.create({
                title: '[TEST] Partial Update Task',
                description: 'Original description'
            });
            const taskId = task.id;

            const updateData = {
                completed: true
            };

            const response = await request(app)
                .put(`/api/tasks/${taskId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.completed).toBe(true);
            // Title and description should remain unchanged
            expect(response.body.data.title).toContain('[TEST]');
            
            // Clean up
            await Task.delete(taskId);
        });

        test('should return 404 when updating non-existent task', async () => {
            const updateData = {
                title: 'Updated Title'
            };

            const response = await request(app)
                .put('/api/tasks/99999')
                .send(updateData)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Task not found');
        });
    });

    describe('PATCH /api/tasks/:id/complete', () => {
        test('should mark task as completed', async () => {
            const task = await Task.create({
                title: '[TEST] Complete Task',
                completed: false
            });
            const taskId = task.id;

            const response = await request(app)
                .patch(`/api/tasks/${taskId}/complete`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Task marked as completed');
            expect(response.body.data.completed).toBe(true);
            
            // Clean up
            await Task.delete(taskId);
        });
    });

    describe('PATCH /api/tasks/:id/pending', () => {
        test('should mark task as pending', async () => {
            const task = await Task.create({
                title: '[TEST] Pending Task',
                completed: true
            });
            const taskId = task.id;

            const response = await request(app)
                .patch(`/api/tasks/${taskId}/pending`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Task marked as pending');
            expect(response.body.data.completed).toBe(false);
            
            // Clean up
            await Task.delete(taskId);
        });
    });

    describe('DELETE /api/tasks/:id', () => {
        test('should delete an existing task', async () => {
            const task = await Task.create({
                title: '[TEST] Delete Task'
            });
            const taskId = task.id;

            const response = await request(app)
                .delete(`/api/tasks/${taskId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Task deleted successfully');

            // Verify task is deleted
            const getResponse = await request(app)
                .get(`/api/tasks/${taskId}`)
                .expect(404);
        });

        test('should return 404 when deleting non-existent task', async () => {
            const response = await request(app)
                .delete('/api/tasks/99999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Task not found');
        });
    });

    describe('GET /api/tasks/stats', () => {
        test('should get task statistics', async () => {
            // Create test tasks with known states
            const task1 = await Task.create({
                title: '[TEST] Stats Task 1',
                completed: true
            });
            const task2 = await Task.create({
                title: '[TEST] Stats Task 2',
                completed: false
            });

            const response = await request(app)
                .get('/api/tasks/stats')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('total');
            expect(response.body.data).toHaveProperty('completed');
            expect(response.body.data).toHaveProperty('pending');
            expect(response.body.data).toHaveProperty('completionRate');
            
            expect(typeof response.body.data.total).toBe('number');
            expect(typeof response.body.data.completed).toBe('number');
            expect(typeof response.body.data.pending).toBe('number');

            // Cleanup
            await Task.delete(task1.id);
            await Task.delete(task2.id);
        });
    });

    // Cleanup after all tests
    afterAll(async () => {
        // Clean any remaining test tasks
        const allTasks = await Task.getAll();
        for (const task of allTasks) {
            if (task.title.includes('[TEST]')) {
                await Task.delete(task.id);
            }
        }
    });
});
