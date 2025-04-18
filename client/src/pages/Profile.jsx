import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, token, isAuthenticated, logout, deleteAccount } = useAuth();
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated && !loading) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, loading]);
  
  useEffect(() => {
    // Fetch user's outfits
    const fetchOutfits = async () => {
      try {
        if (!token) return;
        
        const response = await fetch('http://localhost:5000/api/users/outfits', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setOutfits(data.outfits);
        }
      } catch (error) {
        console.error('Fetch outfits error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOutfits();
  }, [token]);
  
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setDeleteError('');
      
      const result = await deleteAccount(deleteReason);
      
      if (result.success) {
        // Account deleted successfully, user will be redirected due to logout
        navigate('/');
      } else {
        setDeleteError(result.message);
      }
    } catch (error) {
      setDeleteError('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };
  
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteReason('');
    setDeleteError('');
  };
  
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <motion.div 
      className="profile-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="profile-header">
        <h1>Your Profile</h1>
        <div className="profile-actions">
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
          <button className="delete-account-btn" onClick={openDeleteModal}>
            Delete Account
          </button>
        </div>
      </div>
      
      <div className="profile-info card">
        <h2>Account Information</h2>
        <div className="info-group">
          <label>Name</label>
          <p>{user?.name || 'Not provided'}</p>
        </div>
        <div className="info-group">
          <label>Email</label>
          <p>{user?.email}</p>
        </div>
        <div className="info-group">
          <label>Member Since</label>
          <p>{new Date(user?.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="outfit-history">
        <h2>Your Outfit History</h2>
        
        {loading ? (
          <p className="loading-text">Loading your outfits...</p>
        ) : outfits.length > 0 ? (
          <div className="outfits-grid">
            {outfits.map((outfit) => (
              <div key={outfit.id} className="outfit-card card">
                <div className="outfit-image">
                  <img src={outfit.image_path} alt="Outfit" />
                </div>
                <div className="outfit-details">
                  <div className="outfit-score">
                    <span className="score-label">Score:</span>
                    <span className="score-value">{outfit.score.toFixed(1)}</span>
                  </div>
                  <div className="outfit-date">
                    {new Date(outfit.created_at).toLocaleDateString()}
                  </div>
                </div>
                {outfit.feedback && (
                  <div className="outfit-feedback">
                    <h4>Feedback:</h4>
                    <p>{outfit.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-outfits card">
            <p>You haven't uploaded any outfits yet.</p>
            <button 
              className="analyze-btn btn-primary"
              onClick={() => navigate('/analyze')}
            >
              Analyze Your First Outfit
            </button>
          </div>
        )}
      </div>
      
      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3 className="delete-modal-title">Delete Your Account</h3>
            <p className="delete-modal-message">
              Are you sure you want to delete your account? This action cannot be undone.
              All your data will be permanently removed.
            </p>
            
            <div className="delete-modal-form">
              <label htmlFor="deleteReason">
                Please tell us why you're leaving (optional):
              </label>
              <textarea 
                id="deleteReason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Your feedback helps us improve our service"
                rows={3}
              />
              
              {deleteError && (
                <div className="delete-error">
                  {deleteError}
                </div>
              )}
              
              <div className="delete-modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-delete-btn"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Profile; 