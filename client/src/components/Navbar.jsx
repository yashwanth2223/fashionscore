import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
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
      </div>
    </motion.nav>
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