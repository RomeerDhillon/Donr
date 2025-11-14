import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import './DonationFormPage.css';

const DonationFormPage = () => {
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foodType || !quantity || !expirationDate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/donations', {
        foodType,
        quantity,
        expirationDate: new Date(expirationDate).toISOString(),
        address: address || undefined,
      });
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donation-form-container">
      <div className="donation-form-card">
        <h1>Create Donation</h1>
        <form onSubmit={handleSubmit} className="donation-form">
          {error && <div className="error-message">{error}</div>}

          <input
            type="text"
            placeholder="Food Type *"
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            className="donation-input"
            required
          />

          <input
            type="text"
            placeholder="Quantity *"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="donation-input"
            required
          />

          <input
            type="date"
            placeholder="Expiration Date *"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="donation-input"
            required
          />

          <textarea
            placeholder="Address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="donation-textarea"
            rows="3"
          />

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Creating...' : 'Create Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationFormPage;

