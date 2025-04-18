import { useState, useEffect } from 'react';
import Login from './Login';
import Signup from './Signup';
import './Auth.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  
  // Update mode when initialMode prop changes
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);
  
  if (!isOpen) return null;
  
  const handleModeSwitch = (newMode) => {
    setMode(newMode === 'login' ? 'login' : 'signup');
  };
  
  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div 
        className="auth-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        
        {mode === 'login' ? (
          <Login 
            onClose={onClose} 
            switchMode={() => handleModeSwitch('signup')} 
          />
        ) : (
          <Signup 
            onClose={onClose} 
            switchMode={() => handleModeSwitch('login')} 
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal; 