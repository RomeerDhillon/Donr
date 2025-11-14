import React, { useEffect, useState } from 'react';
import api from '../config/api';
import './DonationListPage.css';

const DonationListPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const response = await api.get('/donations');
      setDonations(response.data);
    } catch (error) {
      console.error('Error loading donations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading donations...</div>;
  }

  return (
    <div className="donation-list-container">
      <div className="donation-list-header">
        <h1>All Donations</h1>
      </div>
      <div className="donation-list">
        {donations.length === 0 ? (
          <p>No donations available</p>
        ) : (
          donations.map((donation) => (
            <div key={donation.id} className="donation-card">
              <h3>{donation.foodType}</h3>
              <p>Quantity: {donation.quantity}</p>
              <p>Status: {donation.status}</p>
              {donation.address && <p>Address: {donation.address}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DonationListPage;

