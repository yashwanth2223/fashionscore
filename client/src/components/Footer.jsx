import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3 className="footer-title">
              Fashion<span className="footer-title-accent">Score</span>
            </h3>
            <p className="footer-text">
              Get AI-powered feedback on your outfits and improve your fashion sense.
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="footer-link">
                  Analyze Your Outfit
                </Link>
              </li>
              <li>
                <Link to="/history" className="footer-link">
                  View Fashion History
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">About</h4>
            <p className="footer-text">
              FashionScore uses advanced AI to provide objective feedback on your
              fashion choices, helping you look your best every day.
            </p>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="footer-copyright"
        >
          <p>&copy; {new Date().getFullYear()} FashionScore. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 