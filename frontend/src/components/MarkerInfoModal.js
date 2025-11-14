import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import './MarkerInfoModal.css';

const MarkerInfoModal = ({ marker, onClose, onUpdate }) => {
  const { user } = useUser();
  const navigate = useNavigate();

  if (!marker) return null;

  const handleGetDirections = () => {
    const lat = marker.lat || marker.position?.[0] || marker.position?.lat || marker.location?.lat;
    const lng = marker.lng || marker.position?.[1] || marker.position?.lng || marker.location?.lng;
    
    if (!lat || !lng) {
      alert('Location information not available');
      return;
    }
    
    // OpenStreetMap routing (uses OpenRouteService or Google Maps as fallback)
    const url = `https://www.openstreetmap.org/directions?to=${lat},${lng}`;
    // Alternative: Use Google Maps if preferred
    // const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleDonateHere = () => {
    const centerData = {
      name: marker.name,
      address: marker.address,
      lat: marker.lat || marker.position?.[0] || marker.position?.lat,
      lng: marker.lng || marker.position?.[1] || marker.position?.lng,
    };
    navigate('/donations/create', { state: { center: centerData } });
  };

  const handleRequestFood = async () => {
    try {
      const lat = marker.lat || marker.position?.[0] || marker.position?.lat || marker.location?.lat;
      const lng = marker.lng || marker.position?.[1] || marker.position?.lng || marker.location?.lng;
      
      if (!lat || !lng) {
        alert('Location information not available');
        return;
      }
      
      await api.post('/requests', {
        foodType: 'General',
        urgency: 'normal',
        lat: lat,
        lng: lng,
        address: marker.address || marker.name || '',
      });
      alert('Food request created successfully!');
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error creating request:', error);
      alert(error.response?.data?.error || 'Failed to create request. Please try again.');
    }
  };

  const handleAcceptDonation = async () => {
    try {
      if (marker.type === 'donation') {
        await api.put(`/donations/${marker.id}/claim`);
        alert('Donation claimed successfully!');
      } else if (marker.type === 'request') {
        await api.put(`/requests/${marker.id}/status`, { status: 'accepted' });
        alert('Request accepted!');
      }
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error accepting:', error);
      alert(error.response?.data?.error || 'Failed to process. Please try again.');
    }
  };

  const handleRejectDonation = async () => {
    if (!window.confirm('Are you sure you want to reject this donation?')) return;
    
    try {
      if (marker.type === 'request') {
        await api.put(`/requests/${marker.id}/status`, { status: 'cancelled' });
        alert('Request cancelled.');
      } else {
        // For donations, we might need a reject endpoint
        alert('Rejection functionality not yet implemented for donations.');
      }
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Failed to reject. Please try again.');
    }
  };

  const renderContent = () => {
    // Center marker
    if (marker.type === 'center') {
      const lat = marker.lat || marker.position?.[0] || marker.position?.lat;
      const lng = marker.lng || marker.position?.[1] || marker.position?.lng;
      
      return (
        <>
          <h3>{marker.name}</h3>
          <p><strong>Address:</strong> {marker.address || 'Address not available'}</p>
          {marker.centerType && <p><strong>Type:</strong> {marker.centerType}</p>}
          {marker.hours && <p><strong>Hours:</strong> {marker.hours}</p>}
          {marker.phone && <p><strong>Phone:</strong> {marker.phone}</p>}
          {marker.capacity && <p><strong>Capacity:</strong> {marker.capacity}</p>}
          {lat && lng && (
            <p><strong>Location:</strong> {lat.toFixed(6)}, {lng.toFixed(6)}</p>
          )}
          
          <div className="modal-actions">
            {lat && lng && (
              <button onClick={handleGetDirections} className="modal-button primary">
                Get Directions
              </button>
            )}
            {user?.role === 'donator' && (
              <button onClick={handleDonateHere} className="modal-button secondary">
                Donate Here
              </button>
            )}
            {user?.role === 'acceptor' && (
              <button onClick={handleRequestFood} className="modal-button secondary">
                Request Food
              </button>
            )}
          </div>
        </>
      );
    }

    // Donation marker
    if (marker.type === 'donation') {
      const lat = marker.lat || marker.position?.[0] || marker.position?.lat || marker.location?.lat;
      const lng = marker.lng || marker.position?.[1] || marker.position?.lng || marker.location?.lng;
      
      return (
        <>
          <h3>Donation Available</h3>
          <p><strong>Food Type:</strong> {marker.foodType}</p>
          <p><strong>Quantity:</strong> {marker.quantity}</p>
          {marker.donorName && <p><strong>From:</strong> {marker.donorName}</p>}
          {marker.address && <p><strong>Address:</strong> {marker.address}</p>}
          <p><strong>Status:</strong> <span className={`status-${marker.status}`}>{marker.status}</span></p>
          
          <div className="modal-actions">
            {lat && lng && (
              <button onClick={handleGetDirections} className="modal-button primary">
                Get Directions
              </button>
            )}
            {user?.role === 'distributor' && marker.status === 'available' && (
              <>
                <button onClick={handleAcceptDonation} className="modal-button success">
                  Claim Donation
                </button>
              </>
            )}
          </div>
        </>
      );
    }

    // Request marker
    if (marker.type === 'request') {
      const lat = marker.lat || marker.position?.[0] || marker.position?.lat;
      const lng = marker.lng || marker.position?.[1] || marker.position?.lng;
      
      return (
        <>
          <h3>Food Request</h3>
          <p><strong>Food Type:</strong> {marker.foodType}</p>
          <p><strong>Urgency:</strong> <span className={`urgency-${marker.urgency || 'normal'}`}>{marker.urgency || 'normal'}</span></p>
          {marker.address && <p><strong>Address:</strong> {marker.address}</p>}
          <p><strong>Status:</strong> <span className={`status-${marker.status || 'pending'}`}>{marker.status || 'pending'}</span></p>
          
          <div className="modal-actions">
            {lat && lng && (
              <button onClick={handleGetDirections} className="modal-button primary">
                Get Directions
              </button>
            )}
            {user?.role === 'distributor' && (marker.status === 'pending' || !marker.status) && (
              <button onClick={handleAcceptDonation} className="modal-button success">
                Fulfill Request
              </button>
            )}
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {renderContent()}
      </div>
    </div>
  );
};

export default MarkerInfoModal;

