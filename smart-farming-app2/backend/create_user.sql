-- =====================================================
-- Create MySQL User for Smart Farming Application
-- =====================================================
-- Run this as root user: mysql -u root -p < create_user.sql
-- =====================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS smart_farming_db;

-- Create user (change 'smartfarm_user' and 'smartfarm_password' to your preferred values)
CREATE USER IF NOT EXISTS 'smartfarm_user'@'localhost' IDENTIFIED BY 'smartfarm_password';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON smart_farming_db.* TO 'smartfarm_user'@'localhost';

-- Apply the changes
FLUSH PRIVILEGES;

-- Show the user was created
SELECT User, Host FROM mysql.user WHERE User = 'smartfarm_user';

-- =====================================================
-- After running this, update your .env file:
-- DB_USER=smartfarm_user
-- DB_PASSWORD=smartfarm_password
-- =====================================================

