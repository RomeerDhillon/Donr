import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import api from '../config/api';
import './HomePage.css';

const HomePage = () => {
  const { user, loading: userLoading } = useUser();
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && (user.role === 'distributor' || user.role === 'acceptor')) {
      loadDonations();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDonations = async () => {
    try {
      setLoadingDonations(true);
      const response = await api.get('/donations');
      // Handle both response formats
      const donationsData = response.data.data || response.data;
      setDonations(Array.isArray(donationsData) ? donationsData : []);
    } catch (error) {
      console.error('Error loading donations:', error);
    } finally {
      setLoadingDonations(false);
    }
  };

  if (userLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-container">
      <main className="home-main">
        <div className="welcome-section">
          <h2>
            {user?.name 
              ? `Hello, ${user.name.split(' ')[0]}!` 
              : user?.email
              ? `Hello, ${user.email.split('@')[0]}!`
              : 'Hello!'}
          </h2>
          {user?.role && (
            <div className="role-badge">
              <span className="role-label">Role:</span>
              <span className={`role-value role-${user.role}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          )}
          {!user?.role && user && (
            <div className="role-badge">
              <span className="role-label">Role:</span>
              <span className="role-value role-unknown">
                Not set
              </span>
            </div>
          )}
        </div>

        {(() => {
          if (!user) {
            return (
              <div className="action-section">
                <p>Loading user data...</p>
              </div>
            );
          }
          
          if (user.role === 'donator') {
            return (
              <div className="action-section">
                <button
                  onClick={() => navigate('/donations/create')}
                  className="action-button primary"
                >
                  Create Donation
                </button>
                <button
                  onClick={() => navigate('/donations')}
                  className="action-button"
                >
                  View All Donations
                </button>
              </div>
            );
          }
          
          if (user.role === 'distributor' || user.role === 'acceptor') {
            return (
              <div className="donations-section">
                <h3>Available Donations</h3>
                {donations.length === 0 ? (
                  <p>No donations available</p>
                ) : (
                  <div className="donations-list">
                    {donations.map((donation) => (
                      <div key={donation.id} className="donation-card">
                        <h4>{donation.foodType}</h4>
                        <p>Quantity: {donation.quantity}</p>
                        <p>Status: {donation.status}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => navigate('/donations')}
                  className="action-button"
                  style={{ marginTop: '20px' }}
                >
                  View All Donations
                </button>
              </div>
            );
          }
          
          return (
            <div className="action-section">
              <p>Please wait while your profile is being loaded...</p>
            </div>
          );
        })()}
      </main>
    </div>
  );
};

export default HomePage;

