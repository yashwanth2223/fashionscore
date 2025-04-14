import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Enable CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 