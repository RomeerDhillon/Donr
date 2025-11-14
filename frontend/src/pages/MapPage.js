import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../contexts/UserContext';
import MarkerInfoModal from '../components/MarkerInfoModal';
import './MapPage.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const defaultCenter = [40.7128, -74.0060]; // [lat, lng] format for Leaflet

// Component to handle map center updates
const MapCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// Custom marker icon creator
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const MapPage = ({ mode = 'default' }) => {
  const { user } = useUser();
  const [center, setCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [centers, setCenters] = useState([]);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({
    showOpenNow: false,
    maxDistance: null,
    centerType: null,
  });
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(10);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude];
          setUserLocation(location);
          setCenter(location);
          setZoom(12);
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Determine what markers to show based on role
  const getVisibleMarkers = useCallback(() => {
    let visibleMarkers = [];

    // Determine role-based visibility
    if (!user?.role) {
      return [];
    }

    const role = user.role;

    // Donators see centers
    if (role === 'donator') {
      centers.forEach((center) => {
        if (filters.centerType && center.centerType !== filters.centerType) {
          return;
        }
        visibleMarkers.push({
          ...center,
          type: 'center',
          position: [center.lat, center.lng],
        });
      });
    }

    // Acceptors see centers
    if (role === 'acceptor') {
      centers.forEach((center) => {
        if (filters.centerType && center.centerType !== filters.centerType) {
          return;
        }
        visibleMarkers.push({
          ...center,
          type: 'center',
          position: [center.lat, center.lng],
        });
      });
    }

    // Distributors see donations and requests
    if (role === 'distributor') {
      donations.forEach((donation) => {
        if (donation.status === 'available' || donation.status === 'claimed') {
          const location = donation.location || { lat: donation.lat, lng: donation.lng };
          if (location && location.lat && location.lng) {
            visibleMarkers.push({
              ...donation,
              type: 'donation',
              lat: location.lat,
              lng: location.lng,
              position: [location.lat, location.lng],
              donorName: donation.donorName || 'Anonymous',
            });
          }
        }
      });
      
      requests.forEach((request) => {
        if (request.status === 'pending' || !request.status) {
          if (request.lat && request.lng) {
            visibleMarkers.push({
              ...request,
              type: 'request',
              position: [request.lat, request.lng],
            });
          }
        }
      });
    }

    // Filter by distance if user location is available and maxDistance is set
    if (filters.maxDistance && userLocation) {
      visibleMarkers = visibleMarkers.filter((marker) => {
        const [markerLat, markerLng] = marker.position || [marker.lat, marker.lng];
        if (!markerLat || !markerLng) return false;
        
        const distance = calculateDistance(
          userLocation[0],
          userLocation[1],
          markerLat,
          markerLng
        );
        return distance <= filters.maxDistance;
      });
    }

    return visibleMarkers;
  }, [user, centers, donations, requests, filters, userLocation]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return Infinity;
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }, []);

  // Set up Firestore listeners with proper error handling and fallback to polling
  useEffect(() => {
    if (!db) {
      console.error('Firestore database not initialized');
      setLoading(false);
      return;
    }

    let isMounted = true;
    let listenersActive = false;
    setLoading(true);
    const unsubscribes = [];
    let pollingInterval = null;

    console.log('🗺️ Setting up Firestore listeners for map data...');

    // Helper function to safely unsubscribe
    const safeUnsubscribe = (unsubscribe) => {
      try {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      } catch (error) {
        // Silently ignore unsubscribe errors
        console.warn('Warning: Error unsubscribing Firestore listener:', error);
      }
    };

    // Helper function to process snapshot data
    const processSnapshot = (snapshot, dataType) => {
      if (!isMounted) return null;
      
      try {
        const dataArray = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (dataType === 'centers') {
            if (data && data.lat && data.lng) {
              dataArray.push({
                id: doc.id,
                ...data,
              });
            }
          } else if (dataType === 'donations') {
            const location = data?.location || { lat: data?.lat, lng: data?.lng };
            if (location && location.lat && location.lng) {
              dataArray.push({
                id: doc.id,
                ...data,
                lat: location.lat,
                lng: location.lng,
              });
            }
          } else if (dataType === 'requests') {
            if (data && data.lat && data.lng) {
              dataArray.push({
                id: doc.id,
                ...data,
              });
            }
          }
        });
        return dataArray;
      } catch (error) {
        console.error(`Error processing ${dataType} snapshot:`, error);
        return null;
      }
    };

    // Fallback: Use polling if real-time listeners fail
    const setupPolling = () => {
      if (pollingInterval) return;
      
      console.log('🔄 Setting up polling fallback for map data...');
      const pollData = async () => {
        if (!isMounted) return;
        
        try {
          // Poll centers
          const centersSnapshot = await getDocs(collection(db, 'centers'));
          const centersData = processSnapshot(centersSnapshot, 'centers');
          if (centersData && isMounted) {
            setCenters(centersData);
            setLoading(false);
          }

          // Poll donations
          const donationsSnapshot = await getDocs(collection(db, 'donations'));
          const donationsData = processSnapshot(donationsSnapshot, 'donations');
          if (donationsData && isMounted) {
            setDonations(donationsData);
          }

          // Poll requests
          const requestsSnapshot = await getDocs(collection(db, 'requests'));
          const requestsData = processSnapshot(requestsSnapshot, 'requests');
          if (requestsData && isMounted) {
            setRequests(requestsData);
          }
        } catch (error) {
          console.error('Error polling Firestore data:', error);
        }
      };

      // Poll immediately and then every 5 seconds
      pollData();
      pollingInterval = setInterval(pollData, 5000);
    };

    // Try to set up real-time listeners with error recovery
    const setupListeners = () => {
      if (listenersActive) return;
      
      try {
        // Listen to centers
        const centersQuery = collection(db, 'centers');
        const unsubscribeCenters = onSnapshot(
          centersQuery,
          (snapshot) => {
            if (!isMounted) return;
            const centersData = processSnapshot(snapshot, 'centers');
            if (centersData !== null) {
              setCenters(centersData);
              setLoading(false);
            }
          },
          (error) => {
            // On error, fall back to polling
            console.warn('Centers listener error, using polling fallback:', error);
            if (!listenersActive) {
              setupPolling();
            }
          }
        );
        unsubscribes.push(unsubscribeCenters);

        // Listen to donations
        const donationsQuery = collection(db, 'donations');
        const unsubscribeDonations = onSnapshot(
          donationsQuery,
          (snapshot) => {
            if (!isMounted) return;
            const donationsData = processSnapshot(snapshot, 'donations');
            if (donationsData !== null) {
              setDonations(donationsData);
            }
          },
          (error) => {
            console.warn('Donations listener error:', error);
            // Continue with other listeners even if this one fails
          }
        );
        unsubscribes.push(unsubscribeDonations);

        // Listen to requests
        const requestsQuery = collection(db, 'requests');
        const unsubscribeRequests = onSnapshot(
          requestsQuery,
          (snapshot) => {
            if (!isMounted) return;
            const requestsData = processSnapshot(snapshot, 'requests');
            if (requestsData !== null) {
              setRequests(requestsData);
            }
          },
          (error) => {
            console.warn('Requests listener error:', error);
            // Continue with other listeners even if this one fails
          }
        );
        unsubscribes.push(unsubscribeRequests);

        listenersActive = true;
        console.log('✅ Firestore listeners set up successfully');
      } catch (error) {
        console.error('Error setting up Firestore listeners:', error);
        // Fall back to polling if listener setup fails
        setupPolling();
      }
    };

    // Add a small delay before setting up listeners to ensure Firestore is fully initialized
    const setupTimer = setTimeout(() => {
      setupListeners();
    }, 100);

    return () => {
      isMounted = false;
      listenersActive = false;
      clearTimeout(setupTimer);
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      unsubscribes.forEach((unsubscribe) => safeUnsubscribe(unsubscribe));
      console.log('🗺️ Firestore listeners cleaned up');
    };
  }, [db]);

  const visibleMarkers = useMemo(() => getVisibleMarkers(), [getVisibleMarkers]);

  const getMarkerIcon = (type) => {
    if (type === 'center') {
      return createCustomIcon('#4285F4'); // Blue
    }
    if (type === 'donation') {
      return createCustomIcon('#EA4335'); // Red
    }
    if (type === 'request') {
      return createCustomIcon('#FBBC05'); // Orange/Yellow
    }
    return createCustomIcon('#34A853'); // Green for user location
  };

  const handleMarkerClick = (marker) => {
    // Convert position array back to object for modal
    const markerData = {
      ...marker,
      lat: marker.position?.[0] || marker.lat,
      lng: marker.position?.[1] || marker.lng,
    };
    setSelectedMarker(markerData);
  };

  const handleModalUpdate = () => {
    // Refresh data will happen automatically via Firestore listeners
    setSelectedMarker(null);
  };

  const getMapTitle = () => {
    if (!user?.role) return 'Donr Map';
    if (user.role === 'donator') return 'Find Food Centers';
    if (user.role === 'acceptor') return 'Find Nearby Food Centers';
    if (user.role === 'distributor') return 'Distribution Map';
    return 'Donr Map';
  };

  // Auto-stop loading after 5 seconds to prevent indefinite loading state
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>{getMapTitle()}</h1>
        <div className="map-filters">
          {user?.role === 'donator' || user?.role === 'acceptor' ? (
            <>
              <select
                value={filters.centerType || ''}
                onChange={(e) => setFilters({ ...filters, centerType: e.target.value || null })}
                className="filter-select"
              >
                <option value="">All Types</option>
                <option value="food bank">Food Bank</option>
                <option value="pantry">Pantry</option>
                <option value="shelter">Shelter</option>
                <option value="distribution center">Distribution Center</option>
              </select>
              {userLocation && (
                <select
                  value={filters.maxDistance || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, maxDistance: e.target.value ? parseInt(e.target.value) : null })
                  }
                  className="filter-select"
                >
                  <option value="">All Distances</option>
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                  <option value="25">Within 25 km</option>
                  <option value="50">Within 50 km</option>
                </select>
              )}
            </>
          ) : null}
          {user?.role === 'distributor' && userLocation && (
            <select
              value={filters.maxDistance || ''}
              onChange={(e) =>
                setFilters({ ...filters, maxDistance: e.target.value ? parseInt(e.target.value) : null })
              }
              className="filter-select"
            >
              <option value="">All Distances</option>
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km</option>
              <option value="50">Within 50 km</option>
            </select>
          )}
        </div>
      </div>

      <div className="map-container-wrapper">
        {loading && centers.length === 0 && donations.length === 0 && requests.length === 0 && (
          <div className="map-loading-overlay">
            <div className="map-loading">Loading map data...</div>
          </div>
        )}
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%', minHeight: '500px' }}
          scrollWheelZoom={true}
          key={`map-${center[0]}-${center[1]}-${zoom}`}
        >
          <MapCenter center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            minZoom={2}
          />
          
          {/* User location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={createCustomIcon('#34A853')}
              eventHandlers={{
                click: () => {
                  setSelectedMarker({
                    type: 'user',
                    lat: userLocation[0],
                    lng: userLocation[1],
                    name: 'Your Location',
                  });
                },
              }}
            >
              <Popup>Your Location</Popup>
            </Marker>
          )}

          {/* Other markers */}
          {visibleMarkers.map((marker) => {
            const position = marker.position || [marker.lat, marker.lng];
            
            if (!position || !position[0] || !position[1]) {
              return null;
            }
            
            const title = marker.name || marker.foodType || `${marker.type} marker`;
            
            return (
              <Marker
                key={`${marker.type}-${marker.id}`}
                position={position}
                icon={getMarkerIcon(marker.type)}
                eventHandlers={{
                  click: () => handleMarkerClick(marker),
                }}
              >
                <Popup>
                  <div>
                    <strong>{title}</strong>
                    {marker.address && <p>{marker.address}</p>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Marker Info Modal */}
      {selectedMarker && (
        <MarkerInfoModal
          marker={selectedMarker}
          onClose={() => setSelectedMarker(null)}
          onUpdate={handleModalUpdate}
        />
      )}

      {/* Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#34A853' }}></span>
          <span>Your Location</span>
        </div>
        {(user?.role === 'donator' || user?.role === 'acceptor') && (
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#4285F4' }}></span>
            <span>Food Centers</span>
          </div>
        )}
        {user?.role === 'distributor' && (
          <>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#EA4335' }}></span>
              <span>Donations</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#FBBC05' }}></span>
              <span>Requests</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MapPage;
