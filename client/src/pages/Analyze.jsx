import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import config from '../config';
import './Analyze.css';

const Analyze = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/api/analyze-fashion', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      console.error('Error analyzing fashion:', err);
      setError(err.response?.data?.error || 'Failed to analyze fashion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="analyze-container">
      <Link to="/" className="back-link">
        <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Home
      </Link>

      <div className="analyze-content">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="analyze-title"
        >
          Get Your Fashion Score
        </motion.h1>

        <div className="analyze-card">
          {!result ? (
            <div className="upload-section">
              <div 
                className="dropzone"
                onClick={() => fileInputRef.current.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {preview ? (
                  <div className="preview-container">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="image-preview"
                    />
                    <p className="dropzone-hint">Click or drag to change the selected image</p>
                  </div>
                ) : (
                  <div className="empty-dropzone">
                    <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <p className="dropzone-text">Click to select or drag and drop your outfit image here</p>
                    <p className="dropzone-formats">Supported formats: JPG, PNG</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png"
                  className="file-input"
                />
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="button-container">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  disabled={!selectedFile || loading}
                  className={`analyze-button ${!selectedFile ? 'analyze-button-disabled' : ''} ${loading ? 'analyze-button-loading' : ''}`}
                >
                  {loading ? (
                    <div className="loading-indicator">
                      <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </div>
                  ) : (
                    'Analyze My Outfit'
                  )}
                </motion.button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="results-section"
            >
              <div className="results-layout">
                <div className="results-image-container">
                  <img 
                    src={preview} 
                    alt="Analyzed outfit" 
                    className="results-image"
                  />
                </div>
                <div className="results-content">
                  <div className="score-display">
                    <h2 className="score-title">Your Fashion Score:</h2>
                    <div className="score-badge">
                      {result.score}
                    </div>
                  </div>

                  {result.categoryScores && (
                    <div className="category-scores">
                      <h3 className="category-scores-title">Category Breakdown</h3>
                      <div className="score-bars">
                        <div className="score-bar-item">
                          <div className="score-bar-label">Style</div>
                          <div className="score-bar-container">
                            <div 
                              className="score-bar" 
                              style={{width: `${result.categoryScores.style * 10}%`}}
                            >
                              <span className="score-bar-value">{result.categoryScores.style}</span>
                            </div>
                          </div>
                        </div>
                        <div className="score-bar-item">
                          <div className="score-bar-label">Color</div>
                          <div className="score-bar-container">
                            <div 
                              className="score-bar" 
                              style={{width: `${result.categoryScores.colorCoordination * 10}%`}}
                            >
                              <span className="score-bar-value">{result.categoryScores.colorCoordination}</span>
                            </div>
                          </div>
                        </div>
                        <div className="score-bar-item">
                          <div className="score-bar-label">Fit</div>
                          <div className="score-bar-container">
                            <div 
                              className="score-bar" 
                              style={{width: `${result.categoryScores.fit * 10}%`}}
                            >
                              <span className="score-bar-value">{result.categoryScores.fit}</span>
                            </div>
                          </div>
                        </div>
                        <div className="score-bar-item">
                          <div className="score-bar-label">Accessories</div>
                          <div className="score-bar-container">
                            <div 
                              className="score-bar" 
                              style={{width: `${result.categoryScores.accessories * 10}%`}}
                            >
                              <span className="score-bar-value">{result.categoryScores.accessories}</span>
                            </div>
                          </div>
                        </div>
                        <div className="score-bar-item">
                          <div className="score-bar-label">Occasion</div>
                          <div className="score-bar-container">
                            <div 
                              className="score-bar" 
                              style={{width: `${result.categoryScores.occasionAppropriateness * 10}%`}}
                            >
                              <span className="score-bar-value">{result.categoryScores.occasionAppropriateness}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="feedback-sections">
                    <div className="feedback-item">
                      <h3 className="feedback-title">Style Feedback</h3>
                      <p className="feedback-text">{result.feedback.style}</p>
                    </div>
                    <div className="feedback-item">
                      <h3 className="feedback-title">Color Coordination</h3>
                      <p className="feedback-text">{result.feedback.colorCoordination}</p>
                    </div>
                    <div className="feedback-item">
                      <h3 className="feedback-title">Fit Assessment</h3>
                      <p className="feedback-text">{result.feedback.fit}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="recommendations-section">
                <h3 className="recommendations-title">Recommendations</h3>
                <ul className="recommendations-list">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index} className="recommendation-item">
                      <svg className="recommendation-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span className="recommendation-text">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="reset-container">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetAnalysis}
                  className="reset-button"
                >
                  Analyze Another Outfit
                </motion.button>
                <Link to="/history" className="history-link">
                  View All Results
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyze; 
