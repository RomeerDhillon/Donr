/**
 * Donations Controller
 * Handles all donation-related API operations
 */

const { db } = require('../config/firebase');
const { addressToCoordinates } = require('../services/geocoding');
const { findNearbyDistributors } = require('../services/matching');
const { notifyDistributorsAboutDonation } = require('../services/notifications');
const admin = require('firebase-admin');

/**
 * Create a new donation (Donator only)
 * POST /donations
 */
const createDonation = async (req, res, next) => {
  try {
    const { foodType, quantity, expirationDate, address, location } = req.body;
    const donatorId = req.user.uid;

    // Validate required fields
    if (!foodType || !quantity || !expirationDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: foodType, quantity, expirationDate',
      });
    }

    // Validate expiration date is not in the past
    const expiration = admin.firestore.Timestamp.fromDate(new Date(expirationDate));
    const now = admin.firestore.Timestamp.now();
    if (expiration.toMillis() < now.toMillis()) {
      return res.status(400).json({
        success: false,
        error: 'Expiration date cannot be in the past',
      });
    }

    // Get location coordinates
    let donationLocation;
    if (location && location.lat && location.lng) {
      donationLocation = { lat: location.lat, lng: location.lng };
    } else if (address) {
      donationLocation = await addressToCoordinates(address);
    } else {
      // Use donator's location as fallback
      const donatorDoc = await db.collection('users').doc(donatorId).get();
      if (!donatorDoc.exists || !donatorDoc.data().location) {
        return res.status(400).json({
          success: false,
          error: 'Location or address required',
        });
      }
      donationLocation = donatorDoc.data().location;
    }

    // Get user's name for donor name
    const userDoc = await db.collection('users').doc(donatorId).get();
    const donorName = userDoc.exists ? (userDoc.data().name || 'Anonymous') : 'Anonymous';

    // Create donation document
    const donationData = {
      donatorId,
      donorName,
      foodType,
      quantity,
      expirationDate: expiration,
      status: 'available',
      location: donationLocation,
      lat: donationLocation.lat,
      lng: donationLocation.lng,
      address: address || null,
      createdAt: admin.firestore.Timestamp.now(),
    };

    const donationRef = await db.collection('donations').add(donationData);
    const donationId = donationRef.id;

    // Find nearby distributors and notify them
    try {
      const nearbyDistributors = await findNearbyDistributors(
        donationLocation.lat,
        donationLocation.lng,
        foodType
      );

      if (nearbyDistributors.length > 0) {
        const distributorIds = nearbyDistributors.map((d) => d.id);
        await notifyDistributorsAboutDonation(distributorIds, donationId, foodType);
      }
    } catch (matchingError) {
      console.error('Error in matching/notification process:', matchingError);
      // Don't fail the donation creation if matching fails
    }

    res.status(201).json({
      success: true,
      data: {
        id: donationId,
        ...donationData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get nearby donations (Distributor/Acceptor)
 * GET /donations?lat=...&lng=...&radius=...
 */
const getDonations = async (req, res, next) => {
  try {
    const { lat, lng, radius } = req.query;
    const userRole = req.user.role;

    // Get user's location if not provided
    let userLat, userLng;
    if (lat && lng) {
      userLat = parseFloat(lat);
      userLng = parseFloat(lng);
    } else {
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      if (!userDoc.exists || !userDoc.data().location) {
        return res.status(400).json({
          success: false,
          error: 'Location required. Provide lat/lng or set user location.',
        });
      }
      const userLocation = userDoc.data().location;
      userLat = userLocation.lat;
      userLng = userLocation.lng;
    }

    const searchRadius = radius ? parseFloat(radius) : 10;

    // Use matching service to find nearby donations
    const { findNearbyDonations } = require('../services/matching');
    const donations = await findNearbyDonations(userLat, userLng, searchRadius);

    // Filter expired donations
    const now = admin.firestore.Timestamp.now();
    const validDonations = donations.filter((donation) => {
      return donation.expirationDate.toMillis() > now.toMillis();
    });

    res.json({
      success: true,
      data: validDonations,
      count: validDonations.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Claim a donation (Distributor only)
 * PUT /donations/:id/claim
 */
const claimDonation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const distributorId = req.user.uid;

    const donationRef = db.collection('donations').doc(id);
    const donationDoc = await donationRef.get();

    if (!donationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found',
      });
    }

    const donationData = donationDoc.data();

    if (donationData.status !== 'available') {
      return res.status(400).json({
        success: false,
        error: `Donation is already ${donationData.status}`,
      });
    }

    // Check if donation is expired
    const now = admin.firestore.Timestamp.now();
    if (donationData.expirationDate.toMillis() < now.toMillis()) {
      return res.status(400).json({
        success: false,
        error: 'Donation has expired',
      });
    }

    // Update donation status
    await donationRef.update({
      status: 'claimed',
      distributorId,
      claimedAt: admin.firestore.Timestamp.now(),
    });

    res.json({
      success: true,
      data: {
        id,
        status: 'claimed',
        distributorId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark donation as distributed (Distributor only)
 * PUT /donations/:id/distribute
 */
const markAsDistributed = async (req, res, next) => {
  try {
    const { id } = req.params;
    const distributorId = req.user.uid;

    const donationRef = db.collection('donations').doc(id);
    const donationDoc = await donationRef.get();

    if (!donationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found',
      });
    }

    const donationData = donationDoc.data();

    if (donationData.distributorId !== distributorId) {
      return res.status(403).json({
        success: false,
        error: 'Only the claiming distributor can mark as distributed',
      });
    }

    if (donationData.status !== 'claimed') {
      return res.status(400).json({
        success: false,
        error: 'Donation must be claimed before distribution',
      });
    }

    // Update donation status
    await donationRef.update({
      status: 'distributed',
      distributedAt: admin.firestore.Timestamp.now(),
    });

    // Notify donator
    try {
      const { notifyDonatorAboutDistribution } = require('../services/notifications');
      await notifyDonatorAboutDistribution(donationData.donatorId, id);
    } catch (notifError) {
      console.error('Error notifying donator:', notifError);
    }

    res.json({
      success: true,
      data: {
        id,
        status: 'distributed',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonation,
  getDonations,
  claimDonation,
  markAsDistributed,
};

