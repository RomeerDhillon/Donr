/**
 * Geocoding Service
 * Handles address to coordinates conversion using OpenStreetMap Nominatim API (free, no API key required)
 * Falls back to Google Maps API if GOOGLE_MAPS_API_KEY is provided
 */

const axios = require('axios');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const USE_GOOGLE = !!GOOGLE_MAPS_API_KEY;

/**
 * Convert address to latitude/longitude coordinates
 * Uses OpenStreetMap Nominatim (free) or Google Maps API if key is provided
 * @param {string} address - Address string
 * @returns {Promise<{lat: number, lng: number}>} Coordinates object
 */
const addressToCoordinates = async (address) => {
  try {
    if (USE_GOOGLE) {
      // Use Google Maps Geocoding API if key is available
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: address,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
        };
      } else {
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }
    } else {
      // Use OpenStreetMap Nominatim API (free, no API key required)
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: address,
            format: 'json',
            limit: 1,
          },
          headers: {
            'User-Agent': 'Donr-App/1.0', // Required by Nominatim
          },
        }
      );

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon),
        };
      } else {
        throw new Error('Address not found');
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

/**
 * Convert coordinates to address (reverse geocoding)
 * Uses OpenStreetMap Nominatim (free) or Google Maps API if key is provided
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} Formatted address string
 */
const coordinatesToAddress = async (lat, lng) => {
  try {
    if (USE_GOOGLE) {
      // Use Google Maps Reverse Geocoding API if key is available
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${lat},${lng}`,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      } else {
        throw new Error(`Reverse geocoding failed: ${response.data.status}`);
      }
    } else {
      // Use OpenStreetMap Nominatim API (free, no API key required)
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          params: {
            lat: lat,
            lon: lng,
            format: 'json',
          },
          headers: {
            'User-Agent': 'Donr-App/1.0', // Required by Nominatim
          },
        }
      );

      if (response.data && response.data.display_name) {
        return response.data.display_name;
      } else {
        throw new Error('Address not found for coordinates');
      }
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};

/**
 * Calculate distance between two coordinates (in miles)
 * @param {number} lat1 - First latitude
 * @param {number} lng1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lng2 - Second longitude
 * @returns {number} Distance in miles
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

module.exports = {
  addressToCoordinates,
  coordinatesToAddress,
  calculateDistance,
};

