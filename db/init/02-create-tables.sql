-- Table creation script for TASK table in IA_DB database
-- This script creates the TASK table with all required fields

USE IA_DB;

-- Create TASK table
CREATE TABLE IF NOT EXISTS TASK (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX idx_task_completed ON TASK(completed);
CREATE INDEX idx_task_created_at ON TASK(created_at);

-- Insert some sample data for testing
INSERT INTO TASK (title, description, completed) VALUES
('Setup MySQL Database', 'Configure MySQL container with Docker Compose', TRUE),
('Create CRUD API', 'Implement Express.js CRUD operations for Task table', FALSE),
('Write Tests', 'Create comprehensive tests for all CRUD operations', FALSE),
('Documentation', 'Write README.md with setup and usage instructions', FALSE);

-- Log successful table creation
SELECT 'TASK table created successfully!' as message;
SELECT COUNT(*) as 'Sample records inserted' FROM TASK;
