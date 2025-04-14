import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// More detailed CORS configuration
app.use(cors({
  origin: '*', // Allow all origins (for testing)
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add OPTIONS handler for preflight requests
app.options('*', cors());

app.use(bodyParser.json());

// Add an error tracking middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory for storing history data
const historyDir = path.join(__dirname, 'history');
if (!fs.existsSync(historyDir)) {
  fs.mkdirSync(historyDir, { recursive: true });
}

// Path to the history JSON file
const historyFilePath = path.join(historyDir, 'history.json');

// Initialize history file if it doesn't exist
if (!fs.existsSync(historyFilePath)) {
  fs.writeFileSync(historyFilePath, JSON.stringify([]));
}

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Configure storage for history images
const historyImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const historyImagesDir = path.join(__dirname, 'public', 'history-images');
    if (!fs.existsSync(historyImagesDir)) {
      fs.mkdirSync(historyImagesDir, { recursive: true });
    }
    cb(null, historyImagesDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ storage: storage });

// Function to encode the image to base64
function fileToGenerativePart(filePath, mimeType) {
  const fileBuffer = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: fileBuffer.toString("base64"),
      mimeType: mimeType,
    },
  };
}

// Helper function to read history data
function getHistory() {
  try {
    const historyData = fs.readFileSync(historyFilePath, 'utf8');
    return JSON.parse(historyData);
  } catch (error) {
    console.error('Error reading history file:', error);
    return [];
  }
}

// Helper function to save history data
function saveHistory(historyData) {
  try {
    fs.writeFileSync(historyFilePath, JSON.stringify(historyData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving history file:', error);
    return false;
  }
}

// Serve static files from public directory
app.use('/images', express.static(path.join(__dirname, 'public', 'history-images')));

// Google Generative AI setup
let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  console.log("Google Generative AI initialized successfully");
} catch (error) {
  console.error("Error initializing Google Generative AI:", error);
}

// Endpoint to analyze fashion
app.post('/api/analyze-fashion', upload.single('image'), async (req, res) => {
  console.log("Analyze fashion request received");
  
  try {
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log("File uploaded:", req.file.path);

    if (!genAI) {
      console.log("AI service not initialized");
      return res.status(500).json({ error: 'AI service not initialized' });
    }

    console.log("Creating AI model instance");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const imagePath = req.file.path;
    const prompt = `
      Analyze this outfit image and provide a detailed fashion assessment.
      
      SCORING CRITERIA:
      - Style: Evaluate trend alignment, outfit coherence, and personal expression (0-10)
      - Color Coordination: Assess color harmony, contrast, and seasonal appropriateness (0-10)
      - Fit: Evaluate how well the clothes fit the person's body type (0-10)
      - Accessories: Rate the selection and coordination of accessories (0-10)
      - Occasion Appropriateness: Determine if the outfit is suitable for its likely context (0-10)
      
      CALCULATE THE OVERALL SCORE:
      - Calculate a weighted average of the above scores (Style 30%, Color 25%, Fit 25%, Accessories 10%, Occasion 10%)
      - Be critical and objective in your assessment
      - Ensure your scores are varied and accurately reflect the quality of the outfit (use the full 1-10 range)
      - Do not default to a score of 7 - use precise scoring based on the specific outfit qualities
      - For truly exceptional outfits, scores of 9-10 should be rare
      - For poor outfits, don't hesitate to give scores of 1-4
      
      DETAILED FEEDBACK:
      Provide specific, constructive feedback for each category and clear recommendations for improvement.
      
      FORMAT YOUR RESPONSE AS CLEAN JSON WITHOUT ANY MARKDOWN FORMATTING, CODE BLOCKS, OR EXTRA TEXT.
      USE THIS EXACT STRUCTURE:
      {
        "score": number,
        "categoryScores": {
          "style": number,
          "colorCoordination": number,
          "fit": number,
          "accessories": number,
          "occasionAppropriateness": number
        },
        "feedback": {
          "style": "string",
          "colorCoordination": "string",
          "fit": "string"
        },
        "recommendations": ["string", "string", "string"]
      }
      
      DO NOT include any markdown formatting like \`\`\`json or \`\`\` around your response.
    `;

    console.log("Preparing image for AI");
    const imagePart = fileToGenerativePart(imagePath, req.file.mimetype);
    
    console.log("Sending request to AI model");
    try {
      const result = await model.generateContent([prompt, imagePart]);
      
      console.log("Received response from AI model");
      const response = await result.response;
      const text = response.text();
      console.log("AI response text:", text);
      
      // Try to parse the response as JSON
      try {
        // Clean the text to handle cases where AI returns markdown code blocks
        let cleanedText = text;
        
        // Remove markdown code block indicators if present
        if (cleanedText.includes('```json')) {
          cleanedText = cleanedText.replace(/```json\n|\n```/g, '');
        } else if (cleanedText.includes('```')) {
          cleanedText = cleanedText.replace(/```\n|\n```/g, '');
        }
        
        // Trim any extra whitespace
        cleanedText = cleanedText.trim();
        
        console.log("Cleaned text:", cleanedText);
        
        const jsonResponse = JSON.parse(cleanedText);
        console.log("Parsed JSON response");
        
        // Save the image to the history-images directory
        const historyImagesDir = path.join(__dirname, 'public', 'history-images');
        if (!fs.existsSync(historyImagesDir)) {
          fs.mkdirSync(historyImagesDir, { recursive: true });
        }
        
        const ext = path.extname(req.file.originalname);
        const imageId = uuidv4();
        const imageFileName = `${imageId}${ext}`;
        const historyImagePath = path.join(historyImagesDir, imageFileName);
        
        // Copy the image file
        fs.copyFileSync(imagePath, historyImagePath);
        console.log("Image saved to history");
        
        // Add to history
        const historyEntry = {
          id: imageId,
          date: new Date().toISOString(),
          imagePath: `/images/${imageFileName}`,
          ...jsonResponse
        };
        
        const history = getHistory();
        history.push(historyEntry);
        saveHistory(history);
        console.log("History updated");
        
        // Delete the uploaded file from temporary storage
        fs.unlinkSync(imagePath);
        
        console.log("Sending successful response to client");
        return res.json({
          ...jsonResponse,
          id: imageId
        });
      } catch (jsonError) {
        console.error("Error parsing AI response as JSON:", jsonError);
        console.error("Raw text:", text);
        
        // Delete the temporary file
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
        
        // If parsing fails, return the raw text
        return res.status(500).json({ 
          raw: text,
          error: "The AI response could not be parsed into the expected format",
          details: jsonError.message
        });
      }
    } catch (aiError) {
      console.error("Error from AI model:", aiError);
      
      // Delete the temporary file
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      return res.status(500).json({ 
        error: "Error from AI model", 
        details: aiError.message || "Unknown AI error" 
      });
    }
  } catch (error) {
    console.error('Error analyzing fashion:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze fashion',
      details: error.message || "Unknown error",
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// Add a simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working correctly' });
});

// Get all history entries
app.get('/api/history', (req, res) => {
  try {
    const history = getHistory();
    return res.json(history);
  } catch (error) {
    console.error('Error retrieving history:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve history',
      details: error.message
    });
  }
});

// Get single history entry by ID
app.get('/api/history/:id', (req, res) => {
  try {
    const { id } = req.params;
    const history = getHistory();
    const entry = history.find(item => item.id === id);
    
    if (!entry) {
      return res.status(404).json({ error: 'History entry not found' });
    }
    
    return res.json(entry);
  } catch (error) {
    console.error('Error retrieving history entry:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve history entry',
      details: error.message
    });
  }
});

// Delete a history entry
app.delete('/api/history/:id', (req, res) => {
  try {
    const { id } = req.params;
    const history = getHistory();
    const entryIndex = history.findIndex(item => item.id === id);
    
    if (entryIndex === -1) {
      return res.status(404).json({ error: 'History entry not found' });
    }
    
    // Get the entry to delete its image
    const entry = history[entryIndex];
    
    // Delete the image file if it exists
    if (entry.imagePath) {
      const imagePath = path.join(__dirname, 'public', entry.imagePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Remove from history array
    history.splice(entryIndex, 1);
    saveHistory(history);
    
    return res.json({ success: true, message: 'History entry deleted' });
  } catch (error) {
    console.error('Error deleting history entry:', error);
    return res.status(500).json({ 
      error: 'Failed to delete history entry',
      details: error.message
    });
  }
});

// Healthcheck route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    aiInitialized: !!genAI,
    apiKey: process.env.GOOGLE_API_KEY ? 'configured' : 'missing'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Server error', 
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 