import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.OWM_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

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

/**
 * Fetches forecast weather data (5-day / 3-hour) for a specific location.
 * Returns the next N forecast points (default 8 = ~24 hours).
 * @param {number} lat
 * @param {number} lon
 * @param {number} points
 */
export async function getForecastWeather(lat, lon, points = 8) {
    if (!API_KEY) {
        throw new Error("OpenWeatherMap API Key is missing.");
    }

    try {
        const response = await axios.get(FORECAST_URL, {
            params: {
                lat: lat,
                lon: lon,
                appid: API_KEY,
                units: 'metric'
            }
        });

        const list = Array.isArray(response.data?.list) ? response.data.list : [];
        const sliced = list.slice(0, Math.max(1, Math.min(points, list.length)));

        const normalized = sliced.map((item) => {
            const rainfall_mm = item.rain ? (item.rain['3h'] || 0) : 0;
            return {
                dt: item.dt,
                time_text: item.dt_txt,
                temperature_c: item.main?.temp,
                humidity_percent: item.main?.humidity,
                rainfall_mm,
                wind_mps: item.wind?.speed,
                condition: item.weather?.[0]?.main,
                condition_desc: item.weather?.[0]?.description,
            };
        });

        return {
            city: response.data?.city?.name,
            country: response.data?.city?.country,
            points: normalized
        };
    } catch (error) {
        console.error("Error fetching forecast weather data:", error.response?.data?.message || error.message);
        throw new Error('Failed to retrieve forecast weather data.');
    }
}