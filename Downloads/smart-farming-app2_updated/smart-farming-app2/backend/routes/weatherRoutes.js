import express from 'express';
import protect from '../middleware/auth.js';
import { getCurrentWeather, getForecastWeather } from '../services/weatherService.js';

const router = express.Router();

// GET /api/weather/current?lat=...&lon=...
router.get('/current', protect, async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return res.status(400).json({ message: 'lat and lon query parameters are required (numbers).' });
  }

  try {
    const data = await getCurrentWeather(lat, lon);
    res.json({ weather: data });
  } catch (error) {
    console.error('Weather current error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch current weather.' });
  }
});

// GET /api/weather/forecast?lat=...&lon=...&points=8
router.get('/forecast', protect, async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  const points = req.query.points ? parseInt(req.query.points, 10) : 8;

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return res.status(400).json({ message: 'lat and lon query parameters are required (numbers).' });
  }

  try {
    const data = await getForecastWeather(lat, lon, points);
    res.json({ forecast: data });
  } catch (error) {
    console.error('Weather forecast error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch forecast weather.' });
  }
});

export default router;
