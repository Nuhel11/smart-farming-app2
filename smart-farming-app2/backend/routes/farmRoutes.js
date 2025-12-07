import express from 'express';
import pool from '../db.js';
import protect from '../middleware/auth.js'; // Import the protection middleware

const router = express.Router();

// ----------------------------------------------------------------
// Helper function to sanitize inputs (convert empty strings to null for DB)
// This is critical to prevent "Out of range" errors when inserting empty strings into DECIMAL columns.
// ----------------------------------------------------------------
const sanitizeInput = (value) => {
    // Check for null, undefined, or empty string.
    if (value === null || value === undefined || value === '') {
        return null;
    }
    // Attempt to convert to a float for numbers, keeping strings otherwise.
    const floatValue = parseFloat(value);
    return isNaN(floatValue) ? value : floatValue;
};


// ----------------------------------------------------------------
// Route 1: POST /api/farm/field
// Purpose: Register a new field and its initial soil data (PROTECTED)
// ----------------------------------------------------------------
router.post('/field', protect, async (req, res) => {
    const userId = req.user.userId;
    
    // Deconstruct and sanitize data immediately
    const field_name = sanitizeInput(req.body.field_name);
    const latitude = sanitizeInput(req.body.latitude);
    const longitude = sanitizeInput(req.body.longitude);
    const area_sq_m = sanitizeInput(req.body.area_sq_m);
    
    const nitrogen_ppm = sanitizeInput(req.body.nitrogen_ppm);
    const phosphorus_ppm = sanitizeInput(req.body.phosphorus_ppm);
    const potassium_ppm = sanitizeInput(req.body.potassium_ppm);
    const ph_level = sanitizeInput(req.body.ph_level);

    // Basic Input Validation for REQUIRED fields (Must be present AND convertible to non-null numeric values)
    if (!field_name || latitude === null || longitude === null || nitrogen_ppm === null || ph_level === null) {
        return res.status(400).json({ message: 'Missing required field data: Name, Lat/Long, N, or pH.' });
    }

    // Use a transaction to ensure both inserts succeed or both fail
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Insert into Fields Table
        const fieldQuery = `
            INSERT INTO Fields (user_id, field_name, latitude, longitude, area_sq_m)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [fieldResult] = await connection.execute(fieldQuery, [
            userId, field_name, latitude, longitude, area_sq_m
        ]);
        const fieldId = fieldResult.insertId;

        // 2. Insert into Soil_Data Table
        const soilQuery = `
            INSERT INTO Soil_Data (field_id, test_date, nitrogen_ppm, phosphorus_ppm, potassium_ppm, ph_level)
            VALUES (?, CURDATE(), ?, ?, ?, ?)
        `;
        await connection.execute(soilQuery, [
            fieldId, nitrogen_ppm, phosphorus_ppm, potassium_ppm, ph_level
        ]);

        await connection.commit(); // Commit if both inserts were successful

        res.status(201).json({
            message: 'Field and initial soil data recorded successfully!',
            fieldId: fieldId
        });

    } catch (error) {
        await connection.rollback(); // Rollback if any insert failed
        console.error('Field/Soil Data Submission Error:', error);
        res.status(500).json({ message: 'Server error during data submission.' });
    } finally {
        connection.release();
    }
});


// ----------------------------------------------------------------
// Route 2: GET /api/farm/fields
// Purpose: Fetch all fields and their latest soil data for the current user (PROTECTED)
// ----------------------------------------------------------------
router.get('/fields', protect, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Query to get all fields for the user, and the latest soil test results for each.
        // We join Fields (f) with Soil_Data (s) and use a subquery to filter only the LATEST soil entry (most recent test_date)
        const query = `
            SELECT 
                f.field_id, 
                f.field_name, 
                f.latitude, 
                f.longitude, 
                s.ph_level,
                s.nitrogen_ppm,
                s.phosphorus_ppm,
                s.potassium_ppm,
                s.test_date
            FROM Fields f
            JOIN Soil_Data s ON f.field_id = s.field_id
            WHERE f.user_id = ?
            AND s.soil_id = (
                SELECT soil_id FROM Soil_Data WHERE field_id = f.field_id ORDER BY test_date DESC LIMIT 1
            )
            ORDER BY f.field_id DESC;
        `;
        
        const [fields] = await pool.execute(query, [userId]);

        res.status(200).json({ fields });

    } catch (error) {
        console.error('Fetch Fields Error:', error);
        res.status(500).json({ message: 'Server error while fetching field data.' });
    }
});


export default router;