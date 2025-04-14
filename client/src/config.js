// Configuration for the application
const config = {
  // API base URL - production URL for backend server
  apiBaseUrl: 'https://fashionscore.onrender.com',
  
  // Function to get the full URL for API endpoints
  apiUrl: (endpoint) => `${config.apiBaseUrl}${endpoint}`,
  
  // Function to get the full URL for images
  imageUrl: (path) => `${config.apiBaseUrl}${path}`
};

export default config; 