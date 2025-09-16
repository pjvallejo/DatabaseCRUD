/**
 * Task model - Database operations for TASK table
 * This module provides CRUD operations for Task entities
 */

const { getPool } = require('../config/database');

/**
 * Helper function to convert MySQL boolean values to JavaScript booleans
 * @param {Object} task - Task object from database
 * @returns {Object} Task object with converted boolean values
 */
const convertBooleanFields = (task) => {
    if (!task) return task;
    
    return {
        ...task,
        completed: Boolean(task.completed)
    };
};

/**
 * Helper function to convert array of tasks
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Array with converted boolean values
 */
const convertTaskArray = (tasks) => {
    return tasks.map(convertBooleanFields);
};

/**
 * Task model class
 */
class Task {
    /**
     * Get all tasks
     * @param {Object} filters - Optional filters (completed, limit, offset)
     * @returns {Promise<Array>} Array of tasks
     */
    static async getAll(filters = {}) {
        try {
            const pool = getPool();
            let query = 'SELECT * FROM TASK';
            const params = [];

            // Add WHERE conditions if filters are provided
            const conditions = [];
            if (filters.completed !== undefined) {
                conditions.push('completed = ?');
                params.push(filters.completed === true ? 1 : 0);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            // Add ORDER BY
            query += ' ORDER BY created_at DESC';

            // Add LIMIT and OFFSET if provided (using string concatenation to avoid prepared statement issues)
            if (filters.limit && filters.limit > 0) {
                const limitValue = parseInt(filters.limit);
                if (limitValue > 0 && limitValue <= 100) { // Additional safety check
                    query += ` LIMIT ${limitValue}`;
                }
            }

            if (filters.offset && filters.offset >= 0) {
                const offsetValue = parseInt(filters.offset);
                if (offsetValue >= 0) { // Additional safety check
                    query += ` OFFSET ${offsetValue}`;
                }
            }

            const [rows] = await pool.execute(query, params);
            return convertTaskArray(rows);
        } catch (error) {
            console.error('Error getting all tasks:', error);
            throw error;
        }
    }

    /**
     * Get task by ID
     * @param {number} id - Task ID
     * @returns {Promise<Object|null>} Task object or null if not found
     */
    static async getById(id) {
        try {
            const pool = getPool();
            const query = 'SELECT * FROM TASK WHERE id = ?';
            const [rows] = await pool.execute(query, [id]);
            
            return rows.length > 0 ? convertBooleanFields(rows[0]) : null;
        } catch (error) {
            console.error('Error getting task by ID:', error);
            throw error;
        }
    }

    /**
     * Create a new task
     * @param {Object} taskData - Task data {title, description, completed}
     * @returns {Promise<Object>} Created task with ID
     */
    static async create(taskData) {
        try {
            const pool = getPool();
            const { title, description, completed = false } = taskData;
            
            // Handle undefined values
            const safeTitle = title || '';
            const safeDescription = description || null;
            const safeCompleted = completed === true ? 1 : 0;
            
            const query = `
                INSERT INTO TASK (title, description, completed) 
                VALUES (?, ?, ?)
            `;
            
            const [result] = await pool.execute(query, [safeTitle, safeDescription, safeCompleted]);
            
            // Return the created task
            return await this.getById(result.insertId);
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }

    /**
     * Update an existing task
     * @param {number} id - Task ID
     * @param {Object} taskData - Task data to update
     * @returns {Promise<Object|null>} Updated task or null if not found
     */
    static async update(id, taskData) {
        try {
            const pool = getPool();
            
            // Check if task exists
            const existingTask = await this.getById(id);
            if (!existingTask) {
                return null;
            }

            const { title, description, completed } = taskData;
            const updates = [];
            const params = [];

            // Build dynamic update query
            if (title !== undefined) {
                updates.push('title = ?');
                params.push(title.trim());
            }
            if (description !== undefined) {
                updates.push('description = ?');
                params.push(description ? description.trim() : null);
            }
            if (completed !== undefined) {
                updates.push('completed = ?');
                params.push(completed === true ? 1 : 0);
            }

            if (updates.length === 0) {
                return existingTask; // No updates needed
            }

            // Add updated_at timestamp
            updates.push('updated_at = CURRENT_TIMESTAMP');
            params.push(id);

            const query = `UPDATE TASK SET ${updates.join(', ')} WHERE id = ?`;
            await pool.execute(query, params);

            // Return the updated task
            return await this.getById(id);
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }

    /**
     * Delete a task
     * @param {number} id - Task ID
     * @returns {Promise<boolean>} true if deleted, false if not found
     */
    static async delete(id) {
        try {
            const pool = getPool();
            
            // Check if task exists
            const existingTask = await this.getById(id);
            if (!existingTask) {
                return false;
            }

            const query = 'DELETE FROM TASK WHERE id = ?';
            await pool.execute(query, [id]);
            
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }

    /**
     * Get tasks count
     * @param {Object} filters - Optional filters (completed)
     * @returns {Promise<number>} Number of tasks
     */
    static async getCount(filters = {}) {
        try {
            const pool = getPool();
            let query = 'SELECT COUNT(*) as count FROM TASK';
            const params = [];

            if (filters.completed !== undefined) {
                query += ' WHERE completed = ?';
                params.push(filters.completed === true ? 1 : 0);
            }

            const [rows] = await pool.execute(query, params);
            return rows[0].count;
        } catch (error) {
            console.error('Error getting tasks count:', error);
            throw error;
        }
    }

    /**
     * Mark task as completed
     * @param {number} id - Task ID
     * @returns {Promise<Object|null>} Updated task or null if not found
     */
    static async markAsCompleted(id) {
        return await this.update(id, { completed: true });
    }

    /**
     * Mark task as pending
     * @param {number} id - Task ID
     * @returns {Promise<Object|null>} Updated task or null if not found
     */
    static async markAsPending(id) {
        return await this.update(id, { completed: false });
    }
}

module.exports = Task;
