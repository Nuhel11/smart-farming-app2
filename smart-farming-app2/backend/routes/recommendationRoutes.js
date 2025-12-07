import express from 'express';
import pool from '../db.js';
import protect from '../middleware/auth.js';
import { getCurrentWeather } from '../services/weatherService.js';
import axios from 'axios'; // NEW IMPORT for making HTTP calls to the ML server

// Define the URL for your external Python ML microservice (running on port 8080)
const ML_SERVICE_URL = 'http://localhost:8080/predict'; 

const router = express.Router();

// Helper function to safely convert values to Float, since MySQL output can be stringified.
const toFloat = (value) => {
    // Ensure the value exists before trying to parse it
    if (value === null || value === undefined) return null; 
    
    // Attempt to parse the value to a float
    const num = parseFloat(value);
    
    // If conversion results in NaN, return null or handle as error. Since these are required ML inputs, we'll return the number or null.
    return isNaN(num) ? null : num;
};

// ----------------------------------------------------------------
// Route 1: GET /api/recommendation/crop/:fieldId
// Purpose: Provide a crop recommendation based on current conditions (PROTECTED)
// ----------------------------------------------------------------
router.get('/crop/:fieldId', protect, async (req, res) => {
    const { fieldId } = req.params;
    const userId = req.user.userId;

    try {
        // 1. Fetch Field and latest Soil Data from DB
        const [fieldRows] = await pool.execute(
            `SELECT f.latitude, f.longitude, s.nitrogen_ppm, s.phosphorus_ppm, s.potassium_ppm, s.ph_level 
             FROM Fields f
             JOIN Soil_Data s ON f.field_id = s.field_id
             WHERE f.field_id = ? AND f.user_id = ?
             ORDER BY s.test_date DESC LIMIT 1`,
            [fieldId, userId]
        );

        if (fieldRows.length === 0) {
            return res.status(404).json({ message: "Field or corresponding soil data not found for this user." });
        }

        const soilAndLocationData = fieldRows[0];
        
        // 2. Fetch Real-time Weather Data
        const weatherData = await getCurrentWeather(
            soilAndLocationData.latitude, 
            soilAndLocationData.longitude
        );

        // 3. Prepare ML Input Data
        // CRITICAL FIX: Ensure all values sent to Python are explicit numbers (floats)
        const mlInput = {
            N: toFloat(soilAndLocationData.nitrogen_ppm),
            P: toFloat(soilAndLocationData.phosphorus_ppm),
            K: toFloat(soilAndLocationData.potassium_ppm),
            pH: toFloat(soilAndLocationData.ph_level),
            Temp: toFloat(weatherData.temperature_c),
            Humidity: toFloat(weatherData.humidity_percent),
            Rainfall: toFloat(weatherData.rainfall_mm),
        };

        // Input validation before sending to ML service
        if (Object.values(mlInput).some(v => v === null)) {
             console.error('ML Input Missing or Invalid Data:', mlInput);
             return res.status(400).json({ message: "Invalid or missing numerical data required for ML prediction." });
        }
        
        // ----------------------------------------------------------------
        // REAL ML MODEL CALL INTEGRATION
        // ----------------------------------------------------------------
        
        let recommendedCrop;
        let confidenceScore;

        try {
            // Send the combined data (Soil + Weather) to the external Python ML service
            const mlResponse = await axios.post(ML_SERVICE_URL, mlInput);
            
            recommendedCrop = mlResponse.data.recommended_crop;
            confidenceScore = mlResponse.data.confidence || 0.8; // Use 0.8 if confidence is not provided
            
            console.log(`ML Prediction received: ${recommendedCrop} (Confidence: ${confidenceScore})`);

        } catch (mlError) {
            console.error('External ML Service Error:', mlError.message);
            
            // Fallback if the ML service is down or fails to respond
            recommendedCrop = "Fallback Crop (ML Service Down)";
            confidenceScore = 0.5;
        }

        // ----------------------------------------------------------------

        // 4. Record Recommendation in DB
        const recQuery = `
            INSERT INTO Recommendations (field_id, rec_type, recommended_item, details)
            VALUES (?, ?, ?, ?)
        `;
        await pool.execute(recQuery, [
            fieldId, 
            'crop', 
            recommendedCrop, 
            JSON.stringify({ 
                type: 'crop', 
                ml_input: mlInput, 
                weather: weatherData, 
                confidence: confidenceScore 
            })
        ]);


        // 5. Send the Recommendation back to the user
        res.status(200).json({
            message: 'Crop recommendation generated successfully.',
            recommended_crop: recommendedCrop,
            confidence: confidenceScore,
            input_data: mlInput,
            source: 'ML Model & Live Weather'
        });

    } catch (error) {
        console.error('Crop Recommendation Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});


// ... (The rest of recommendationRoutes.js remains unchanged)
// ----------------------------------------------------------------
// Route 2: POST /api/recommendation/nutrition (Existing)
// ----------------------------------------------------------------
router.post('/nutrition', protect, async (req, res) => {
    const userId = req.user.userId;

    const { fieldId, cropName } = req.body;

    if (!fieldId || !cropName) {
        return res.status(400).json({ message: 'Missing fieldId and cropName for nutrition recommendation.' });
    }

    try {
        // 1. Fetch Field's Soil Data
        const [soilRows] = await pool.execute(
            `SELECT s.nitrogen_ppm, s.phosphorus_ppm, s.potassium_ppm
             FROM Fields f
             JOIN Soil_Data s ON f.field_id = s.field_id
             WHERE f.field_id = ? AND f.user_id = ?
             ORDER BY s.test_date DESC LIMIT 1`,
            [fieldId, userId]
        );

        if (soilRows.length === 0) {
            return res.status(404).json({ message: "Latest soil data not found for this field." });
        }
        const currentSoil = soilRows[0];
        
        // 2. Fetch Target Crop's Optimal Nutrient Requirements
        const [cropRows] = await pool.execute(
            `SELECT optimal_N, optimal_P, optimal_K FROM Crop_Master WHERE crop_name = ?`,
            [cropName]
        );

        if (cropRows.length === 0) {
            return res.status(404).json({ message: `Optimal requirements for crop '${cropName}' not found.` });
        }
        const optimalNutrients = cropRows[0];
        
        // 3. Calculate Deficiency (N, P, K)
        const deficiency = {
            N: optimalNutrients.optimal_N - currentSoil.nitrogen_ppm,
            P: optimalNutrients.optimal_P - currentSoil.phosphorus_ppm,
            K: optimalNutrients.optimal_K - currentSoil.potassium_ppm,
        };

        // 4. Determine Fertilizer Recommendation Text
        let recommendationText = `Nutrient recommendation for ${cropName} in field ID ${fieldId}: \n`;
        const requiredFertilizers = {};
        
        if (deficiency.N > 0) {
            recommendationText += `Nitrogen (N) is deficient by ${deficiency.N.toFixed(2)} ppm. Apply a high-Nitrogen fertilizer. \n`;
            requiredFertilizers.N = deficiency.N.toFixed(2);
        } else if (deficiency.N < 0) {
            recommendationText += `Nitrogen (N) is in surplus by ${Math.abs(deficiency.N).toFixed(2)} ppm. Avoid N-heavy fertilizers. \n`;
        }

        if (deficiency.P > 0) {
            recommendationText += `Phosphorus (P) is deficient by ${deficiency.P.toFixed(2)} ppm. Apply DAP or superphosphate. \n`;
            requiredFertilizers.P = deficiency.P.toFixed(2);
        } else if (deficiency.P < 0) {
            recommendationText += `Phosphorus (P) is in surplus by ${Math.abs(deficiency.P).toFixed(2)} ppm. \n`;
        }
        
        if (deficiency.K > 0) {
            recommendationText += `Potassium (K) is deficient by ${deficiency.K.toFixed(2)} ppm. Apply Muriate of Potash (MOP). \n`;
            requiredFertilizers.K = deficiency.K.toFixed(2);
        } else if (deficiency.K < 0) {
            recommendationText += `Potassium (K) is in surplus by ${Math.abs(deficiency.K).toFixed(2)} ppm. \n`;
        }

        // If no major deficiencies
        if (deficiency.N <= 0 && deficiency.P <= 0 && deficiency.K <= 0) {
             recommendationText = `Soil nutrients are well-balanced for ${cropName}. Minimal fertilization needed.`;
        }
        
        // 5. Record Recommendation in DB
        const recQuery = `
            INSERT INTO Recommendations (field_id, rec_type, recommended_item, details)
            VALUES (?, ?, ?, ?)
        `;
        await pool.execute(recQuery, [
            fieldId, 
            'nutrition', 
            cropName, 
            JSON.stringify({ 
                type: 'nutrition',
                deficiency: deficiency, 
                required: requiredFertilizers,
                current_soil: currentSoil,
                optimal_crop: optimalNutrients
            })
        ]);

        // 6. Send the Recommendation back to the user
        res.status(200).json({
            message: recommendationText,
            deficiencies: deficiency,
            current_soil: currentSoil,
            optimal_crop: optimalNutrients
        });

    } catch (error) {
        console.error('Nutrition Recommendation Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});


// ----------------------------------------------------------------
// Route 3: DELETE /api/recommendation/all (Existing)
// ----------------------------------------------------------------
router.delete('/all', protect, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Find all fields belonging to the user
        const [fieldRows] = await pool.execute(
            `SELECT field_id FROM Fields WHERE user_id = ?`,
            [userId]
        );

        if (fieldRows.length === 0) {
            return res.status(200).json({ message: "No fields found, no history to delete." });
        }

        const fieldIds = fieldRows.map(row => row.field_id);
        
        // Delete all recommendations linked to the user's fields
        const deleteQuery = `
            DELETE FROM Recommendations WHERE field_id IN (?)
        `;

        await pool.execute(deleteQuery, [fieldIds]);

        res.status(200).json({
            message: `Successfully deleted all recommendation history for ${fieldIds.length} fields.`
        });

    } catch (error) {
        console.error('Delete Recommendation History Error:', error.message);
        res.status(500).json({ message: 'Server error during history deletion.' });
    }
});

// ----------------------------------------------------------------
// NEW ROUTE 4: DELETE /api/recommendation/field/:fieldId (Existing)
// ----------------------------------------------------------------
router.delete('/field/:fieldId', protect, async (req, res) => {
    const { fieldId } = req.params;
    const userId = req.user.userId;

    try {
        // Verify the field belongs to the user and find the ID of the most recent recommendation
        const [recRows] = await pool.execute(
            `SELECT rec_id FROM Recommendations r
             JOIN Fields f ON r.field_id = f.field_id
             WHERE f.user_id = ? AND f.field_id = ?
             ORDER BY r.rec_date DESC LIMIT 1`,
            [userId, fieldId]
        );

        if (recRows.length === 0) {
            return res.status(200).json({ message: "No recent recommendation found for this field." });
        }

        const recIdToDelete = recRows[0].rec_id;

        // Delete the single most recent recommendation
        const [result] = await pool.execute(
            `DELETE FROM Recommendations WHERE rec_id = ?`,
            [recIdToDelete]
        );

        if (result.affectedRows === 0) {
             return res.status(404).json({ message: "Recommendation not found or already deleted." });
        }

        res.status(200).json({
            message: `Successfully deleted the most recent recommendation for field ${fieldId}.`,
            recId: recIdToDelete
        });

    } catch (error) {
        console.error('Delete Latest Recommendation Error:', error.message);
        res.status(500).json({ message: 'Server error during specific history deletion.' });
    }
});


export default router;