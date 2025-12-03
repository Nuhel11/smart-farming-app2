import express from 'express';
import pool from './db.js';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
const app = express();
const port = 5000; // Use port 5000 for the backend API

const allowedOrigins = ['http://localhost:5173']; // CODE_MERGER

const corsOptions = {
  orgin:(orgin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());


// Basic Route for testing
app.get('/', (req, res) => {
  res.send('Smart Farming Backend API Running!');
});
app.use('/api', userRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/recommendation', recommendationRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});