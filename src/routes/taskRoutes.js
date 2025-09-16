/**
 * Task routes - Express routes for CRUD operations on Task table
 * This module defines REST API endpoints for Task management
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Task = require('../models/Task');

const router = express.Router();

/**
 * Helper function to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors: errors.array()
        });
    }
    next();
};

/**
 * GET /api/tasks - Get all tasks with optional filters
 */
router.get('/', [
    query('completed').optional().isBoolean().withMessage('completed must be a boolean'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('offset must be 0 or greater'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { completed, limit, offset } = req.query;
        const filters = {};

        if (completed !== undefined) {
            filters.completed = completed === 'true';
        }
        if (limit !== undefined) filters.limit = parseInt(limit);
        if (offset !== undefined) filters.offset = parseInt(offset);

        const tasks = await Task.getAll(filters);
        const totalCount = await Task.getCount(filters);

        res.json({
            success: true,
            data: tasks,
            meta: {
                total: totalCount,
                count: tasks.length,
                limit: filters.limit || null,
                offset: filters.offset || 0
            }
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

/**
 * GET /api/tasks/stats - Get task statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const totalTasks = await Task.getCount();
        const completedTasks = await Task.getCount({ completed: true });
        const pendingTasks = await Task.getCount({ completed: false });

        res.json({
            success: true,
            data: {
                total: totalTasks,
                completed: completedTasks,
                pending: pendingTasks,
                completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0
            }
        });
    } catch (error) {
        console.error('Error fetching task statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

/**
 * GET /api/tasks/:id - Get a specific task by ID
 */
router.get('/:id', [
    param('id').isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
    handleValidationErrors
], async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const task = await Task.getById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

/**
 * POST /api/tasks - Create a new task
 */
router.post('/', [
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 255 })
        .withMessage('Title must not exceed 255 characters'),
    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    body('completed')
        .optional()
        .isBoolean()
        .withMessage('Completed must be a boolean'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { title, description, completed } = req.body;
        const taskData = {
            title: title.trim(),
            description: description ? description.trim() : null,
            completed: completed || false
        };

        const newTask = await Task.create(taskData);

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: newTask
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

/**
 * PUT /api/tasks/:id - Update an existing task
 */
router.put('/:id', [
    param('id').isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
    body('title')
        .optional()
        .notEmpty()
        .withMessage('Title cannot be empty')
        .isLength({ max: 255 })
        .withMessage('Title must not exceed 255 characters'),
    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    body('completed')
        .optional()
        .isBoolean()
        .withMessage('Completed must be a boolean'),
    handleValidationErrors
], async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const { title, description, completed } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description ? description.trim() : null;
        if (completed !== undefined) updateData.completed = completed;

        const updatedTask = await Task.update(taskId, updateData);

        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: updatedTask
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

/**
 * PATCH /api/tasks/:id/complete - Mark task as completed
 */
router.patch('/:id/complete', [
    param('id').isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
    handleValidationErrors
], async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const updatedTask = await Task.markAsCompleted(taskId);

        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task marked as completed',
            data: updatedTask
        });
    } catch (error) {
        console.error('Error completing task:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

/**
 * PATCH /api/tasks/:id/pending - Mark task as pending
 */
router.patch('/:id/pending', [
    param('id').isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
    handleValidationErrors
], async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const updatedTask = await Task.markAsPending(taskId);

        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task marked as pending',
            data: updatedTask
        });
    } catch (error) {
        console.error('Error marking task as pending:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

/**
 * DELETE /api/tasks/:id - Delete a task
 */
router.delete('/:id', [
    param('id').isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
    handleValidationErrors
], async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const deleted = await Task.delete(taskId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

module.exports = router;
