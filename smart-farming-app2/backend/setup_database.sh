#!/bin/bash

# Smart Farming Database Setup Script
# This script helps you set up the MySQL database

echo "========================================="
echo "Smart Farming Database Setup"
echo "========================================="
echo ""

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed."
    echo "Install it using: brew install mysql"
    exit 1
fi

echo "✓ MySQL is installed"
echo ""

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "⚠️  MySQL is not running. Attempting to start..."
    brew services start mysql 2>/dev/null || mysql.server start 2>/dev/null || {
        echo "❌ Could not start MySQL. Please start it manually."
        exit 1
    }
    sleep 2
fi

echo "✓ MySQL is running"
echo ""

# Prompt for MySQL root password
read -sp "Enter MySQL root password (press Enter if no password): " MYSQL_PASSWORD
echo ""

# Test connection
if [ -z "$MYSQL_PASSWORD" ]; then
    mysql -u root -e "SELECT 1" &> /dev/null
else
    mysql -u root -p"$MYSQL_PASSWORD" -e "SELECT 1" &> /dev/null
fi

if [ $? -ne 0 ]; then
    echo "❌ Could not connect to MySQL. Please check your password."
    exit 1
fi

echo "✓ Connected to MySQL"
echo ""

# Run the schema file
echo "Creating database and tables..."
if [ -z "$MYSQL_PASSWORD" ]; then
    mysql -u root < database_schema.sql
else
    mysql -u root -p"$MYSQL_PASSWORD" < database_schema.sql
fi

if [ $? -eq 0 ]; then
    echo "✓ Database and tables created successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update your .env file with the MySQL root password"
    echo "2. Run: npm start (in the backend directory)"
else
    echo "❌ Error creating database. Please check the error messages above."
    exit 1
fi

echo ""
echo "========================================="
echo "Setup complete!"
echo "========================================="

