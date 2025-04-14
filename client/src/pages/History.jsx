import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import config from '../config';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(config.apiUrl('/api/history'));
      // Sort history by date (newest first)
      const sortedHistory = response.data.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setHistory(sortedHistory);
      setError(null);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryEntry = async (id, e) => {
    e.stopPropagation(); // Prevent opening the details when clicking delete
    
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }
    
    try {
      await axios.delete(config.apiUrl(`/api/history/${id}`));
      // Remove entry from local state
      setHistory(history.filter(entry => entry.id !== id));
      if (selectedEntry && selectedEntry.id === id) {
        setSelectedEntry(null);
      }
    } catch (err) {
      console.error('Error deleting history entry:', err);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <Link to="/" className="back-link">
          <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Home
        </Link>
        <h1 className="history-title">Your Fashion History</h1>
      </div>

      <div className="history-content">
        {loading ? (
          <div className="history-loading">
            <div className="loading-spinner"></div>
            <p>Loading your fashion history...</p>
          </div>
        ) : error ? (
          <div className="history-error">
            <p>{error}</p>
            <button onClick={fetchHistory} className="retry-button">Try Again</button>
          </div>
        ) : history.length === 0 ? (
          <div className="history-empty">
            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <p>You don't have any fashion analysis history yet.</p>
            <Link to="/analyze" className="analyze-link">
              Analyze Your First Outfit
            </Link>
          </div>
        ) : (
          <div className="history-layout">
            <div className="history-list">
              <h2 className="list-title">Previous Analyses</h2>
              {history.map(entry => (
                <motion.div 
                  key={entry.id}
                  className={`history-item ${selectedEntry?.id === entry.id ? 'active' : ''}`}
                  onClick={() => setSelectedEntry(entry)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="item-thumb-container">
                    <img 
                      src={config.imageUrl(entry.imagePath)} 
                      alt="Outfit thumbnail" 
                      className="item-thumb"
                    />
                  </div>
                  <div className="item-info">
                    <div className="item-score">
                      Score: <span className="score-value">{entry.score}/10</span>
                    </div>
                    <div className="item-date">{formatDate(entry.date)}</div>
                  </div>
                  <button 
                    className="delete-button" 
                    onClick={(e) => deleteHistoryEntry(entry.id, e)}
                    aria-label="Delete entry"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>

            {selectedEntry ? (
              <motion.div 
                className="history-details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={selectedEntry.id}
              >
                <div className="details-header">
                  <h2 className="details-title">Fashion Analysis Details</h2>
                  <div className="details-date">{formatDate(selectedEntry.date)}</div>
                </div>
                
                <div className="details-content">
                  <div className="details-image-container">
                    <img 
                      src={config.imageUrl(selectedEntry.imagePath)} 
                      alt="Analyzed outfit" 
                      className="details-image"
                    />
                    <div className="details-score-badge">
                      {selectedEntry.score}
                    </div>
                  </div>
                  
                  <div className="details-feedback">
                    {selectedEntry.categoryScores && (
                      <div className="category-scores">
                        <h3 className="category-scores-title">Score Breakdown</h3>
                        <div className="score-bars">
                          <div className="score-bar-item">
                            <div className="score-bar-label">Style</div>
                            <div className="score-bar-container">
                              <div 
                                className="score-bar" 
                                style={{width: `${selectedEntry.categoryScores.style * 10}%`}}
                              >
                                <span className="score-bar-value">{selectedEntry.categoryScores.style}</span>
                              </div>
                            </div>
                          </div>
                          <div className="score-bar-item">
                            <div className="score-bar-label">Color</div>
                            <div className="score-bar-container">
                              <div 
                                className="score-bar" 
                                style={{width: `${selectedEntry.categoryScores.colorCoordination * 10}%`}}
                              >
                                <span className="score-bar-value">{selectedEntry.categoryScores.colorCoordination}</span>
                              </div>
                            </div>
                          </div>
                          <div className="score-bar-item">
                            <div className="score-bar-label">Fit</div>
                            <div className="score-bar-container">
                              <div 
                                className="score-bar" 
                                style={{width: `${selectedEntry.categoryScores.fit * 10}%`}}
                              >
                                <span className="score-bar-value">{selectedEntry.categoryScores.fit}</span>
                              </div>
                            </div>
                          </div>
                          <div className="score-bar-item">
                            <div className="score-bar-label">Accessories</div>
                            <div className="score-bar-container">
                              <div 
                                className="score-bar" 
                                style={{width: `${selectedEntry.categoryScores.accessories * 10}%`}}
                              >
                                <span className="score-bar-value">{selectedEntry.categoryScores.accessories}</span>
                              </div>
                            </div>
                          </div>
                          <div className="score-bar-item">
                            <div className="score-bar-label">Occasion</div>
                            <div className="score-bar-container">
                              <div 
                                className="score-bar" 
                                style={{width: `${selectedEntry.categoryScores.occasionAppropriateness * 10}%`}}
                              >
                                <span className="score-bar-value">{selectedEntry.categoryScores.occasionAppropriateness}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="feedback-section">
                      <h3 className="feedback-heading">Style</h3>
                      <p className="feedback-text">{selectedEntry.feedback.style}</p>
                    </div>
                    
                    <div className="feedback-section">
                      <h3 className="feedback-heading">Color Coordination</h3>
                      <p className="feedback-text">{selectedEntry.feedback.colorCoordination}</p>
                    </div>
                    
                    <div className="feedback-section">
                      <h3 className="feedback-heading">Fit</h3>
                      <p className="feedback-text">{selectedEntry.feedback.fit}</p>
                    </div>
                    
                    <div className="recommendations-section">
                      <h3 className="recommendations-heading">Recommendations</h3>
                      <ul className="recommendations-list">
                        {selectedEntry.recommendations.map((rec, index) => (
                          <li key={index} className="recommendation-item">
                            <svg className="recommendation-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="details-actions">
                  <Link to="/analyze" className="action-button">
                    Analyze Another Outfit
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="no-selection-message">
                <p>Select an item from the list to view details</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History; 