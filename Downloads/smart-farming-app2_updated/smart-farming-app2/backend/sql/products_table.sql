-- Products table for the Smart Farming Web Application
-- Run this in your MySQL client (Workbench / phpMyAdmin / CLI).

CREATE TABLE IF NOT EXISTS Products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Optional: sample rows
-- INSERT INTO Products (name, category, price, stock, description) VALUES
-- ('Neem Oil', 'Pesticide', 12.99, 40, 'Organic neem-based pesticide for common pests.'),
-- ('NPK 20-20-20', 'Fertilizer', 25.50, 80, 'Balanced NPK fertilizer for general crop growth.'),
-- ('Soil pH Kit', 'Tools', 9.99, 120, 'Simple field kit for measuring soil pH.');
