import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js'; // Import the database pool
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import protect from '../middleware/auth.js';

dotenv.config();
const router = express.Router();

// Route: POST /api/register
// Purpose: Register a new user (farmer)
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // 1. Input Validation
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide username, email, and password.' });
    }

    try {
        // 2. Hash Password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Default role is 'farmer'
        const role = 'farmer'; 

        // 3. Insert User into Database
        const query = `
            INSERT INTO Users (username, email, password_hash, role) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [username, email, passwordHash, role]);
        
        // 4. Respond to Frontend
        res.status(201).json({ 
            message: 'User registered successfully!', 
            userId: result.insertId,
            username: username
        });

    } catch (error) {
        // Handle MySQL errors (e.g., duplicate email/username)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email or Username already exists.' });
        }
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});
// Route: POST /api/login
// Purpose: Authenticate user and issue a JWT
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 1. Input Validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // 2. Find User by Email
        const [rows] = await pool.execute('SELECT * FROM Users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Authentication failed. Invalid email or password.' });
        }

        // 3. Compare Password
        // Compare the submitted password with the hashed password from the database
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Authentication failed. Invalid email or password.' });
        }

        // 4. Generate JWT Token
        // The token payload contains identifying, non-sensitive data
        const payload = {
            userId: user.user_id,
            username: user.username,
            role: user.role
        };
        
        // Sign the token with the secret key, set to expire in 1 day
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        // 5. Send Token to Frontend
        res.status(200).json({ 
            message: 'Login successful!',
            token: token,
            userId: user.user_id,
            username: user.username,
            role: user.role
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

//Route: GET /api/profile
//Purpose: Get user profile (PROTECTED)
router.get('/profile', protect, (req, res) => {
    res.json({
        message: 'Welcome to your protected profile!',
        data: req.user
    });
});

router.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Users');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error fetching users.' });
    }
});

export default router;