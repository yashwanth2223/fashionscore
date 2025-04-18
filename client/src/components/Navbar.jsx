import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthModal from './auth/AuthModal';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const openLoginModal = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };
  
  const openSignupModal = () => {
    setAuthModalMode('signup');
    setAuthModalOpen(true);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const handleProfileClick = () => {
    navigate('/profile');
    setDropdownOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="navbar"
      >
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <span className="logo-text">
              Fashion<span className="logo-accent">Score</span>
            </span>
          </Link>
          
          <div className="navbar-links">
            <NavLink to="/" label="Home" isActive={location.pathname === '/'} />
            <NavLink to="/analyze" label="Analyze" isActive={location.pathname === '/analyze'} />
            <NavLink to="/history" label="History" isActive={location.pathname === '/history'} />
          </div>
          
          <div className="navbar-auth">
            {isAuthenticated ? (
              <div className="user-menu" ref={dropdownRef}>
                <button 
                  className="profile-icon" 
                  onClick={toggleDropdown}
                  aria-label="User menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-user-info">
                      <span className="dropdown-greeting">Hello, {user?.name || 'User'}</span>
                      <span className="dropdown-email">{user?.email}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleProfileClick} className="dropdown-item">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      View Profile
                    </button>
                    <button onClick={handleLogout} className="dropdown-item">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="auth-btn login-btn"
                  onClick={openLoginModal}
                >
                  Login
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="auth-btn signup-btn"
                  onClick={openSignupModal}
                >
                  Sign Up
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.nav>
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authModalMode}
      />
    </>
  );
};

const NavLink = ({ to, label, isActive }) => {
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
      >
        {label}
      </motion.div>
    </Link>
  );
};

export default Navbar; 