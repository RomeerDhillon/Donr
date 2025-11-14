/**
 * Matching Algorithm Service
 * Finds nearby distributors for new donations
 */

const { db } = require('../config/firebase');
const { calculateDistance } = require('./geocoding');

const MATCHING_RADIUS_MILES = 10; // Configurable radius

/**
 * Find nearby distributors for a donation
 * @param {number} lat - Donation latitude
 * @param {number} lng - Donation longitude
 * @param {string} foodType - Type of food (optional filter)
 * @returns {Promise<Array>} Array of matching distributor user objects
 */
const findNearbyDistributors = async (lat, lng, foodType = null) => {
  try {
    // Get all active distributors
    const distributorsSnapshot = await db
      .collection('users')
      .where('role', '==', 'distributor')
      .get();

    const nearbyDistributors = [];

    distributorsSnapshot.forEach((doc) => {
      const distributor = doc.data();
      const distributorLocation = distributor.location;

      if (!distributorLocation || !distributorLocation.lat || !distributorLocation.lng) {
        return; // Skip distributors without location
      }

      const distance = calculateDistance(
        lat,
        lng,
        distributorLocation.lat,
        distributorLocation.lng
      );

      if (distance <= MATCHING_RADIUS_MILES) {
        nearbyDistributors.push({
          id: doc.id,
          ...distributor,
          distance: parseFloat(distance.toFixed(2)),
        });
      }
    });

    // Sort by distance (closest first)
    nearbyDistributors.sort((a, b) => a.distance - b.distance);

    return nearbyDistributors;
  } catch (error) {
    console.error('Error finding nearby distributors:', error);
    throw error;
  }
};

/**
 * Find nearby available donations for acceptors/distributors
 * @param {number} lat - User latitude
 * @param {number} lng - User longitude
 * @param {number} radiusMiles - Search radius in miles
 * @returns {Promise<Array>} Array of nearby donation objects
 */
const findNearbyDonations = async (lat, lng, radiusMiles = 10) => {
  try {
    const donationsSnapshot = await db
      .collection('donations')
      .where('status', '==', 'available')
      .get();

    const nearbyDonations = [];

    donationsSnapshot.forEach((doc) => {
      const donation = doc.data();
      const donationLocation = donation.location;

      if (!donationLocation || !donationLocation.lat || !donationLocation.lng) {
        return;
      }

      const distance = calculateDistance(
        lat,
        lng,
        donationLocation.lat,
        donationLocation.lng
      );

      if (distance <= radiusMiles) {
        nearbyDonations.push({
          id: doc.id,
          ...donation,
          distance: parseFloat(distance.toFixed(2)),
        });
      }
    });

    // Sort by distance and expiration date (soonest expiring first)
    nearbyDonations.sort((a, b) => {
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      return a.expirationDate.toMillis() - b.expirationDate.toMillis();
    });

    return nearbyDonations;
  } catch (error) {
    console.error('Error finding nearby donations:', error);
    throw error;
  }
};

module.exports = {
  findNearbyDistributors,
  findNearbyDonations,
  MATCHING_RADIUS_MILES,
};

