import express from 'express';
import User from '../models/userModel.js';
import { generateToken, verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Register user
    const user = await User.register(email, password, name);
    
    // Generate token
    const token = generateToken(user.id);
    
    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration route error:', error);
    
    // Check for duplicate email error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Login user
    const user = await User.login(email, password);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    res.status(200).json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get user profile (protected route)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    // User is already attached to req by middleware
    res.status(200).json({
      user: req.user
    });
  } catch (error) {
    console.error('Profile route error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// Get user's outfit uploads
router.get('/outfits', verifyToken, async (req, res) => {
  try {
    const outfits = await User.getUserOutfits(req.user.id);
    
    res.status(200).json({
      outfits
    });
  } catch (error) {
    console.error('Get outfits route error:', error);
    res.status(500).json({ message: 'Failed to fetch outfits', error: error.message });
  }
});

// Get user's upload count
router.get('/upload-count', verifyToken, async (req, res) => {
  try {
    const count = await User.getUploadCount(req.user.id);
    
    res.status(200).json({
      count
    });
  } catch (error) {
    console.error('Get upload count route error:', error);
    res.status(500).json({ message: 'Failed to fetch upload count', error: error.message });
  }
});

// Delete user account
router.delete('/account', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    
    // Delete the account
    await User.deleteAccount(req.user.id, reason);
    
    res.status(200).json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account route error:', error);
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
});

export default router; 