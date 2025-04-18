import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeDatabase, testDatabaseConnection } from './db/db.js';
import userRoutes from './routes/userRoutes.js';
import { optionalAuth, verifyToken } from './middleware/authMiddleware.js';
import User from './models/userModel.js';

// Load environment variables
dotenv.config();

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
initializeDatabase();

// Create Express app
const app = express();

// Enable CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// Serve static files from public directory with authentication
// Replace the old static route with a proper authenticated endpoint
app.get('/images/:imageName', verifyToken, async (req, res) => {
  try {
    const { imageName } = req.params;
    const userId = req.user.id;
    
    // Get user's outfits to verify ownership of the image
    const outfits = await User.getUserOutfits(userId);
    
    // Check if the requested image belongs to the user
    const validImage = outfits.some(outfit => {
      try {
        // Extract just the filename from the image_path stored in DB
        // Handle both full URLs and relative paths
        const storedImagePath = outfit.image_path || '';
        const storedImageName = path.basename(storedImagePath);
        return storedImageName === imageName;
      } catch (err) {
        console.error('Error parsing image path:', err);
        return false;
      }
    });
    
    if (!validImage) {
      return res.status(403).json({ error: 'Access denied to this image' });
    }
    
    // Serve the image file if ownership is verified
    const fullImagePath = path.join(__dirname, 'public', 'history-images', imageName);
    
    // Check if file exists
    if (!fs.existsSync(fullImagePath)) {
      console.error(`Image not found at path: ${fullImagePath}`);
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Serve the file
    res.sendFile(fullImagePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res.status(500).json({ error: 'Failed to serve image' });
      }
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return res.status(500).json({ 
      error: 'Failed to serve image',
      details: error.message
    });
  }
});

// Fallback static file route for images (only used in development or if main route fails)
// This should only be enabled in development environment
if (process.env.NODE_ENV === 'development') {
  app.use('/static-images', express.static(path.join(__dirname, 'public', 'history-images')));
}

// API routes
app.use('/api/users', userRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'FashionScore API is running!' });
});

// Verification route for deployment health check
app.get('/api/verify', (req, res) => {
  // Return basic info about the server environment
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    nodeVersion: process.version,
    uptime: process.uptime()
  });
});

// Database verification endpoint
app.get('/api/db-verify', async (req, res) => {
  try {
    // Test the database connection
    const dbStatus = await testDatabaseConnection();
    
    // Return the database status
    res.json({
      ...dbStatus,
      timestamp: new Date().toISOString(),
      configuredHost: process.env.DB_HOST || 'localhost',
      configuredUser: process.env.DB_USER || 'root',
      configuredDatabase: process.env.DB_NAME || 'fashionscore'
    });
  } catch (error) {
    console.error('Database verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Protected route example
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Route to check if user is logged in and get upload count
app.get('/api/auth-status', optionalAuth, async (req, res) => {
  res.json({
    isAuthenticated: !!req.user,
    user: req.user
  });
});

// Get user's history (protected - only shows current user's history)
app.get('/api/user-history', verifyToken, async (req, res) => {
  try {
    const outfits = await User.getUserOutfits(req.user.id);
    
    // Format the outfits to match the expected format in the frontend
    const formattedOutfits = outfits.map(outfit => ({
      id: outfit.id.toString(),
      date: outfit.created_at,
      imagePath: outfit.image_path,
      score: parseFloat(outfit.score) || 0,
      feedback: outfit.feedback ? JSON.parse(outfit.feedback) : {},
      categoryScores: outfit.feedback ? JSON.parse(outfit.feedback).categoryScores || {} : {},
      recommendations: outfit.feedback ? JSON.parse(outfit.feedback).recommendations || [] : []
    }));
    
    return res.json(formattedOutfits);
  } catch (error) {
    console.error('Error retrieving user history:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve history',
      details: error.message
    });
  }
});

// Get single history entry by ID (protected - only if it belongs to the user)
app.get('/api/user-history/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get the outfit directly with the new method that ensures it belongs to the user
    const outfit = await User.getSingleOutfit(id, userId);
    
    if (!outfit) {
      return res.status(404).json({ error: 'History entry not found or does not belong to you' });
    }
    
    // Format the outfit to match the expected format in the frontend
    const formattedOutfit = {
      id: outfit.id.toString(),
      date: outfit.created_at,
      imagePath: outfit.image_path,
      score: parseFloat(outfit.score) || 0,
      feedback: outfit.feedback ? JSON.parse(outfit.feedback) : {},
      categoryScores: outfit.feedback ? JSON.parse(outfit.feedback).categoryScores || {} : {},
      recommendations: outfit.feedback ? JSON.parse(outfit.feedback).recommendations || [] : []
    };
    
    return res.json(formattedOutfit);
  } catch (error) {
    console.error('Error retrieving user history entry:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve history entry',
      details: error.message
    });
  }
});

// Delete a history entry (protected - only if it belongs to the user)
app.delete('/api/user-history/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // First check if this outfit belongs to the user
    const outfit = await User.getSingleOutfit(id, userId);
    
    if (!outfit) {
      return res.status(404).json({ error: 'History entry not found or does not belong to you' });
    }
    
    // Delete the outfit from the database
    await User.deleteOutfit(id, userId);
    
    return res.json({ success: true, message: 'History entry deleted' });
  } catch (error) {
    console.error('Error deleting history entry:', error);
    return res.status(500).json({ 
      error: 'Failed to delete history entry',
      details: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 