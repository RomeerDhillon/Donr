/**
 * Donations Routes
 * Defines all donation-related API endpoints
 */

const express = require('express');
const router = express.Router();
const {
  createDonation,
  getDonations,
  claimDonation,
  markAsDistributed,
} = require('../controllers/donationsController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Create donation (Donator only)
router.post('/', verifyToken, checkRole(['donator']), createDonation);

// Get nearby donations (Distributor/Acceptor) - Also allow all authenticated users to view donations
router.get('/', verifyToken, getDonations);

// Claim donation (Distributor only)
router.put('/:id/claim', verifyToken, checkRole(['distributor']), claimDonation);

// Mark as distributed (Distributor only)
router.put('/:id/distribute', verifyToken, checkRole(['distributor']), markAsDistributed);

module.exports = router;

