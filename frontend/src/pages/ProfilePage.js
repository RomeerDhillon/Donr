import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import api from '../config/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, firebaseUser, loading: userLoading, refreshUser } = useUser();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  if (userLoading) {
    return <div className="loading">Loading profile...</div>;
  }

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await api.put('/users/me', { name });
      console.log('Profile updated:', response.data);
      // Refresh user data from context
      refreshUser();
      setName(name);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Profile</h1>
        <div className="profile-info">
          <div className="profile-field">
            <label>Email:</label>
            <p className="profile-value">
              {firebaseUser?.email || user?.email || 'Not available'}
            </p>
          </div>
          <div className="profile-field">
            <label>User ID:</label>
            <p className="profile-value" style={{ fontSize: '12px', wordBreak: 'break-all' }}>
              {firebaseUser?.uid || user?.id || 'Not available'}
            </p>
          </div>
          <div className="profile-field">
            <label>Role:</label>
            <div className="role-badge-container">
              {user?.role ? (
                <span className={`role-badge role-${user.role}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              ) : (
                <div>
                  <span className="role-badge role-unknown" style={{ marginBottom: '8px', display: 'block' }}>
                    Not set
                  </span>
                  <p className="profile-value" style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                    Role should be set during registration. If missing, please contact support.
                  </p>
                </div>
              )}
            </div>
          </div>
          {user?.location && (
            <div className="profile-field">
              <label>Location:</label>
              <p className="profile-value">
                {user.location.address || `${user.location.lat}, ${user.location.lng}`}
              </p>
            </div>
          )}
          {!user?.location && (
            <div className="profile-field">
              <label>Location:</label>
              <p className="profile-value" style={{ color: '#999', fontStyle: 'italic' }}>
                Not set
              </p>
            </div>
          )}
          {user?.createdAt && (
            <div className="profile-field">
              <label>Member Since:</label>
              <p className="profile-value">
                {user.createdAt.toDate ? 
                  new Date(user.createdAt.toDate()).toLocaleDateString() : 
                  user.createdAt._seconds ? 
                  new Date(user.createdAt._seconds * 1000).toLocaleDateString() :
                  typeof user.createdAt === 'string' ?
                  new Date(user.createdAt).toLocaleDateString() :
                  'Not available'}
              </p>
            </div>
          )}
          {firebaseUser?.metadata?.creationTime && (
            <div className="profile-field">
              <label>Account Created:</label>
              <p className="profile-value">
                {new Date(firebaseUser.metadata.creationTime).toLocaleDateString()}
              </p>
            </div>
          )}
          {firebaseUser?.metadata?.lastSignInTime && (
            <div className="profile-field">
              <label>Last Sign In:</label>
              <p className="profile-value">
                {new Date(firebaseUser.metadata.lastSignInTime).toLocaleDateString()}
              </p>
            </div>
          )}
          <form onSubmit={handleUpdateName} className="profile-form">
            <div className="profile-field">
              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="profile-input"
              />
            </div>
            {error && error.trim() !== '' && <div className="error-message">{error}</div>}
            <button
              type="submit"
              disabled={saving}
              className="profile-button"
            >
              {saving ? 'Saving...' : 'Update Name'}
            </button>
          </form>
        </div>
        <button
          onClick={() => navigate('/home')}
          className="back-button"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;

