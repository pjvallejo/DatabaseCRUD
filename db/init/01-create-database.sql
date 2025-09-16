-- Database creation script for IA_DB
-- This script will be automatically executed when the MySQL container starts

-- Create the database if it doesn't exist (though docker-compose already creates it)
CREATE DATABASE IF NOT EXISTS IA_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE IA_DB;

-- Grant privileges to the application user
GRANT ALL PRIVILEGES ON IA_DB.* TO 'appuser'@'%';
FLUSH PRIVILEGES;

-- Log successful database creation
SELECT 'IA_DB database created successfully!' as message;
