import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS configuration - simplified
app.use(cors());

// Body parser middleware
app.use(bodyParser.json());

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create public/history-images directory if it doesn't exist
const historyImagesDir = path.join(__dirname, 'public', 'history-images');
if (!fs.existsSync(historyImagesDir)) {
  fs.mkdirSync(historyImagesDir, { recursive: true });
}

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'public', 'history-images')));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// History - just returns an empty array for now
app.get('/api/history', (req, res) => {
  res.json([]);
});

// Export the app for use in other files
export default app; 