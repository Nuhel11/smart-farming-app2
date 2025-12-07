import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.OWM_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetches current weather data for a specific location using coordinates.
 * @param {number} lat - Latitude of the location.
 * @param {number} lon - Longitude of the location.
 * @returns {object} - An object containing normalized weather data (Temp, Humidity, Rainfall).
 */
export async function getCurrentWeather(lat, lon) {
    if (!API_KEY) {
        throw new Error("OpenWeatherMap API Key is missing.");
    }

    try {
        // We use the 'weather' endpoint for current data.
        // units=metric provides temperature in Celsius.
        const response = await axios.get(BASE_URL, {
            params: {
                lat: lat,
                lon: lon,
                appid: API_KEY,
                units: 'metric' 
            }
        });

        const weatherData = response.data;
        
        // OpenWeatherMap reports rainfall data under the 'rain' object, usually in the '1h' or '3h' key.
        // It might not always be present, so we default it to 0.
        const rainfall_mm = weatherData.rain ? (weatherData.rain['1h'] || 0) : 0;

        // Normalize the data structure to match our ML model input requirements
        const normalizedData = {
            temperature_c: weatherData.main.temp,
            humidity_percent: weatherData.main.humidity,
            rainfall_mm: rainfall_mm,
            // Include wind speed or pressure if your ML model uses it
        };

        return normalizedData;

    } catch (error) {
        console.error("Error fetching weather data:", error.response?.data?.message || error.message);
        throw new Error('Failed to retrieve current weather data.');
    }
}