import { createContext, useContext, useState, useEffect } from 'react';

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fashionscoreToken'));
  const [loading, setLoading] = useState(true);
  const [uploadCount, setUploadCount] = useState(0);

  // Initialize - check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/auth-status', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const data = await response.json();
          
          if (data.isAuthenticated && data.user) {
            setUser(data.user);
            // Fetch user's upload count
            fetchUploadCount();
          } else {
            // Token is invalid or expired
            logout();
          }
        } catch (error) {
          console.error('Auth check error:', error);
          logout();
        }
      }
      
      setLoading(false);
    };
    
    checkAuthStatus();
  }, [token]);
  
  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Save token to localStorage
      localStorage.setItem('fashionscoreToken', data.token);
      
      // Update state
      setToken(data.token);
      setUser(data.user);
      
      // Fetch user's upload count
      fetchUploadCount();
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Register function
  const register = async (email, password, name) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Save token to localStorage
      localStorage.setItem('fashionscoreToken', data.token);
      
      // Update state
      setToken(data.token);
      setUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
  
  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('fashionscoreToken');
    
    // Update state
    setToken(null);
    setUser(null);
    setUploadCount(0);
  };
  
  // Fetch user's upload count
  const fetchUploadCount = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/users/upload-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUploadCount(data.count);
      }
    } catch (error) {
      console.error('Fetch upload count error:', error);
    }
  };
  
  // Track a new outfit upload
  const trackUpload = async (imagePath, score, feedback) => {
    if (!token || !user) return null;
    
    try {
      // Increment upload count immediately for better user experience
      setUploadCount(prev => prev + 1);
      
      // Save the upload to the database
      if (imagePath && score) {
        await fetch('http://localhost:5000/api/users/track-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ imagePath, score, feedback })
        });
      }
      
      return true;
    } catch (error) {
      console.error('Track upload error:', error);
      // Revert the count increment on error
      setUploadCount(prev => Math.max(0, prev - 1));
      return false;
    }
  };
  
  // Check if user needs to login (upload count >= 3 for non-logged in users)
  const checkUploadLimit = (count = 3) => {
    if (user) {
      // Logged in users have no limit
      return { limitReached: false };
    }
    
    // For anonymous users, check the limit in localStorage
    const anonUploads = parseInt(localStorage.getItem('anonUploads') || '0');
    
    if (anonUploads >= count) {
      return { limitReached: true, currentCount: anonUploads };
    }
    
    return { limitReached: false, currentCount: anonUploads };
  };
  
  // Track anonymous upload
  const trackAnonymousUpload = () => {
    const currentCount = parseInt(localStorage.getItem('anonUploads') || '0');
    localStorage.setItem('anonUploads', (currentCount + 1).toString());
    return currentCount + 1;
  };
  
  // Delete the account
  const deleteAccount = async (reason = '') => {
    if (!token || !user) {
      return { success: false, message: 'User not logged in' };
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/users/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }
      
      // Logout after successful deletion
      logout();
      
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, message: error.message };
    }
  };
  
  // Auth context value
  const value = {
    user,
    token,
    loading,
    uploadCount,
    login,
    register,
    logout,
    deleteAccount,
    trackUpload,
    checkUploadLimit,
    trackAnonymousUpload,
    isAuthenticated: !!user
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 