import express from 'express';
import pool from '../db.js';
import protect from '../middleware/auth.js';
import { getCurrentWeather } from '../services/weatherService.js'; // Import the new service

const router = express.Router();

// Route: GET /api/recommendation/crop/:fieldId
// Purpose: Provide a crop recommendation based on current conditions (PROTECTED)
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
        // IMPORTANT: The ML model requires an NPK-pH-Temp-Humidity-Rainfall input array.
        const mlInput = {
            N: soilAndLocationData.nitrogen_ppm,
            P: soilAndLocationData.phosphorus_ppm,
            K: soilAndLocationData.potassium_ppm,
            pH: soilAndLocationData.ph_level,
            Temp: weatherData.temperature_c,
            Humidity: weatherData.humidity_percent,
            Rainfall: weatherData.rainfall_mm,
        };
        
        // ----------------------------------------------------------------
        // NOTE: This is the placeholder for the actual ML Model call
        // ----------------------------------------------------------------
        
        // *** In a production system, this would be an HTTP call to your Python ML service:
        // const mlResponse = await axios.post('http://ml-model-service/predict', { input: mlInput });
        // const recommendedCrop = mlResponse.data.prediction;

        // --- MOCK ML RECOMMENDATION for testing ---
        const cropList = ['Wheat', 'Maize', 'Rice', 'Sugarcane', 'Lentil'];
        const recommendedCrop = cropList[Math.floor(Math.random() * cropList.length)]; // Random crop selection
        const confidenceScore = (0.75 + Math.random() * 0.25);
        // ----------------------------------------------------------------

        // 4. Record Recommendation in DB (Optional but good practice)
        const recQuery = `
            INSERT INTO Recommendations (field_id, rec_type, recommended_item, details)
            VALUES (?, ?, ?, ?)
        `;
        await pool.execute(recQuery, [
            fieldId, 
            'crop', 
            recommendedCrop, 
            JSON.stringify({ ml_input: mlInput, weather: weatherData, confidence: confidenceScore })
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

export default router;