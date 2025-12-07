# Database Setup Guide

## Step 1: Install MySQL (if not already installed)

### On macOS using Homebrew:
```bash
brew install mysql
brew services start mysql
```

## Step 2: Secure MySQL and Set Root Password

### Option A: Use MySQL's secure installation (recommended)
```bash
mysql_secure_installation
```

This will guide you through:
- Setting root password
- Removing anonymous users
- Disabling remote root login
- Removing test database

### Option B: Set password directly
```bash
mysql -u root
```

Then in MySQL prompt:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_password_here';
FLUSH PRIVILEGES;
EXIT;
```

## Step 3: Update .env File

Edit the `.env` file in the backend directory and update:
```
DB_PASSWORD=your_actual_mysql_password
```

Replace `your_actual_mysql_password` with the password you set in Step 2.

## Step 4: Create Database and Tables

Run the SQL schema file:

```bash
mysql -u root -p < database_schema.sql
```

Or manually:
```bash
mysql -u root -p
```

Then in MySQL prompt:
```sql
source database_schema.sql;
```

Or copy-paste the contents of `database_schema.sql` into the MySQL prompt.

## Step 5: Verify Database Setup

```bash
mysql -u root -p -e "USE smart_farming_db; SHOW TABLES;"
```

You should see:
- Users
- Fields
- Soil_Data
- Crop_Master
- Recommendations

## Quick Commands Reference

### Start MySQL Service:
```bash
brew services start mysql
# or
mysql.server start
```

### Stop MySQL Service:
```bash
brew services stop mysql
# or
mysql.server stop
```

### Connect to MySQL:
```bash
mysql -u root -p
```

### Check MySQL Status:
```bash
brew services list | grep mysql
```

## Troubleshooting

### If MySQL is not installed:
```bash
brew install mysql
```

### If you forgot the root password:
1. Stop MySQL: `brew services stop mysql`
2. Start MySQL in safe mode: `mysqld_safe --skip-grant-tables`
3. Connect: `mysql -u root`
4. Reset password (see Step 2 Option B above)
5. Restart MySQL normally

### Connection Issues:
- Make sure MySQL is running: `brew services list | grep mysql`
- Check if port 3306 is available: `lsof -i :3306`
- Verify credentials in `.env` file match your MySQL setup

