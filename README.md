# FashionScore

FashionScore is an AI-powered web application that analyzes outfit images and provides instant feedback on your fashion choices. Using Google's Gemini Pro Vision AI model, it scores your outfit, offers insights on style, color coordination, and fit, and provides personalized recommendations to improve your look.

## Features

- **Upload & Analyze**: Take a photo or upload an image of your outfit
- **Fashion Score**: Get an objective rating of your outfit out of 10
- **Detailed Feedback**: Receive specific insights on style, color coordination, and fit
- **Personalized Recommendations**: Get actionable suggestions to improve your look
- **Responsive Design**: Works on mobile, tablet, and desktop

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Tailwind CSS for styling
- Framer Motion for animations
- Axios for API requests

### Backend
- Express.js server
- Google Generative AI (Gemini Pro Vision) for image analysis
- Multer for file uploads

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- Google API key with access to Gemini Pro Vision

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Backend Setup
1. Create a `.env` file in the server directory with:
```
PORT=5000
GOOGLE_API_KEY=your_google_api_key_here
```

2. Install dependencies and start server:
```bash
cd server
npm install
npm run dev
```

## Usage
1. Navigate to the home page
2. Click "Analyze Your Outfit"
3. Upload an image of your outfit
4. View your fashion score and detailed feedback

## License
MIT

## Acknowledgements
- Google Generative AI for providing the image analysis capabilities
- React and Tailwind CSS communities for their excellent documentation 