-- =====================================================
-- Smart Farming Application Database Schema
-- =====================================================
-- This script creates the database and all required tables
-- Run this after creating the database user and setting password
-- =====================================================

-- Create database (run this first, or create it manually)
CREATE DATABASE IF NOT EXISTS smart_farming_db;
USE smart_farming_db;

-- =====================================================
-- Table: Users
-- Purpose: Store user account information
-- =====================================================
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('farmer', 'admin') DEFAULT 'farmer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: Fields
-- Purpose: Store field/location information for each user
-- =====================================================
CREATE TABLE IF NOT EXISTS Fields (
    field_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    area_sq_m DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: Soil_Data
-- Purpose: Store soil test results for each field
-- =====================================================
CREATE TABLE IF NOT EXISTS Soil_Data (
    soil_id INT AUTO_INCREMENT PRIMARY KEY,
    field_id INT NOT NULL,
    test_date DATE NOT NULL,
    nitrogen_ppm DECIMAL(10, 2),
    phosphorus_ppm DECIMAL(10, 2),
    potassium_ppm DECIMAL(10, 2),
    ph_level DECIMAL(4, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (field_id) REFERENCES Fields(field_id) ON DELETE CASCADE,
    INDEX idx_field_id (field_id),
    INDEX idx_test_date (test_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: Crop_Master
-- Purpose: Store optimal nutrient requirements for different crops
-- =====================================================
CREATE TABLE IF NOT EXISTS Crop_Master (
    crop_id INT AUTO_INCREMENT PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL UNIQUE,
    optimal_N DECIMAL(10, 2) NOT NULL COMMENT 'Optimal Nitrogen in ppm',
    optimal_P DECIMAL(10, 2) NOT NULL COMMENT 'Optimal Phosphorus in ppm',
    optimal_K DECIMAL(10, 2) NOT NULL COMMENT 'Optimal Potassium in ppm',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_crop_name (crop_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: Recommendations
-- Purpose: Store crop and nutrition recommendations
-- =====================================================
CREATE TABLE IF NOT EXISTS Recommendations (
    rec_id INT AUTO_INCREMENT PRIMARY KEY,
    field_id INT NOT NULL,
    rec_type ENUM('crop', 'nutrition') NOT NULL,
    recommended_item VARCHAR(100) NOT NULL,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (field_id) REFERENCES Fields(field_id) ON DELETE CASCADE,
    INDEX idx_field_id (field_id),
    INDEX idx_rec_type (rec_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Insert Sample Crop Data
-- =====================================================
INSERT INTO Crop_Master (crop_name, optimal_N, optimal_P, optimal_K, description) VALUES
('Wheat', 120.00, 40.00, 60.00, 'Common wheat crop requiring balanced nutrients'),
('Maize', 150.00, 50.00, 80.00, 'Corn crop requiring higher nitrogen'),
('Rice', 100.00, 30.00, 50.00, 'Rice crop with moderate nutrient requirements'),
('Sugarcane', 180.00, 60.00, 100.00, 'Sugarcane requiring high nutrients'),
('Lentil', 80.00, 25.00, 40.00, 'Legume crop with lower nitrogen needs')
ON DUPLICATE KEY UPDATE 
    optimal_N = VALUES(optimal_N),
    optimal_P = VALUES(optimal_P),
    optimal_K = VALUES(optimal_K);

-- =====================================================
-- Table: SKUs
-- Purpose: Store SKU information (pesticides, fertilizers, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS SKUs (
    sku_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    short_description TEXT,
    long_description TEXT,
    price_usd DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) COMMENT 'e.g., pesticide, fertilizer, seeds, tools',
    sku_code VARCHAR(50) UNIQUE COMMENT 'Unique SKU code',
    images JSON COMMENT 'Array of S3 image URLs',
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_sku_code (sku_code),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Database Setup Complete
-- =====================================================

