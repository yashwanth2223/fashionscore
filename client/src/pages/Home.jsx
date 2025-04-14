import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

const Home = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="home-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="home-header"
      >
        <h1 className="home-title">
          Fashion<span className="accent-text">Score</span>
        </h1>
        <p className="home-description">
          Get instant AI-powered feedback on your outfit with style analysis, color coordination rating, and personalized recommendations.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="cta-container"
      >
        <Link 
          to="/analyze"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="cta-link"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary cta-button"
          >
            Analyze Your Outfit
          </motion.button>
        </Link>

        {isHovered && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="cta-tooltip"
          >
            Upload a photo to get your fashion score!
          </motion.p>
        )}
        
        <Link to="/history" className="history-link">
          View your fashion history
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="features-container"
      >
        <div className="feature-card">
          <h3 className="feature-title">Style Analysis</h3>
          <p className="feature-description">Get detailed feedback on your overall style and fashion choices</p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Color Coordination</h3>
          <p className="feature-description">Learn how well your colors work together and what might improve</p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Personalized Tips</h3>
          <p className="feature-description">Receive custom recommendations to enhance your look</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Home; 